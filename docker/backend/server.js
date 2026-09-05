const express = require('express');
const compression = require('compression');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
require('dotenv').config();

const app = express();
app.use(compression());
app.disable('x-powered-by');
app.set('trust proxy', 1); // Trust first proxy (Traefik)

// JWT Secret — MUST be set in production, no weak fallback
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// PostgreSQL connection — supports DATABASE_URL or individual vars
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      host: process.env.DB_HOST || 'postgres',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ainspiration',
      user: process.env.DB_USER || 'ainspiration',
      password: process.env.DB_PASSWORD || 'ainspiration_secret',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

// ==================== SECURITY MIDDLEWARE ====================

// Helmet — HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // No inline scripts are shipped (JSON-LD blocks are not executable and
      // GA is loaded through a src script from Analytics.tsx), so 'unsafe-inline'
      // was only widening the XSS surface. Removed 2026-09-05.
      scriptSrc: ["'self'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://n8n.srv767464.hstgr.cloud", "https://openrouter.ai"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // allow loading external images
}));

// CORS — restrict to known origins
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://ainspiration.eu,https://www.ainspiration.eu,https://ainspiration2026.netlify.app').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting — auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting — general API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting — webhooks (tighter)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Too many webhook calls.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// SECURITY: public form submissions (contact, audit, newsletter) get a strict
// per-IP hourly cap on top of the per-minute limiters — a script must not be
// able to fill contact_messages or burn n8n/LLM budget (baseline "Rate limiting").
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Trop de soumissions depuis cette adresse. Réessayez dans une heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// The chatbot legitimately sends several messages per session, but each one is
// a paid LLM call downstream — cap it per hour as well.
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  message: { message: 'Limite de messages atteinte pour cette heure. Réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// SECURITY: honeypot. Public forms render a hidden `website` field that humans
// never fill; bots do. A filled honeypot gets a fake success (so the bot does
// not adapt) and nothing is stored or forwarded.
const HONEYPOT_FIELD = 'website';
function rejectHoneypot(req, res, next) {
  const value = req.body && req.body[HONEYPOT_FIELD];
  if (typeof value === 'string' && value.trim() !== '') {
    console.warn(`[honeypot] dropped submission on ${req.path} from ${req.ip}`);
    return res.status(201).json({ success: true });
  }
  if (req.body && HONEYPOT_FIELD in req.body) delete req.body[HONEYPOT_FIELD];
  next();
}

// RGPD: public forms must carry an explicit, unchecked-by-default consent.
// The client blocks submission without it; the server enforces it too.
function requireConsent(req, res, next) {
  if (!req.body || req.body.consent !== true) {
    return res.status(400).json({ success: false, error: 'Consentement requis (case à cocher).' });
  }
  next();
}

// Apply general rate limit to all API routes
app.use('/api/', apiLimiter);

// Trust first proxy (Traefik) so rate-limiter sees real client IPs
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));

// ==================== DEMO AUTO-RESET ====================
const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';
const DEMO_EMAIL = 'demo@ainspiration.eu';
const DEMO_INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes
let lastDemoActivity = 0;
let demoResetInProgress = false;

async function resetDemoData() {
  if (demoResetInProgress) return;
  demoResetInProgress = true;
  try {
    console.log('[DEMO] Resetting demo data after inactivity...');
    // Delete all CRM data owned by or related to demo user, then re-seed
    await pool.query(`
      DELETE FROM activities WHERE user_id = $1;
      DELETE FROM tasks WHERE assigned_to = $1;
      DELETE FROM opportunities WHERE owner_id = $1;
      DELETE FROM contact_messages WHERE id IN (SELECT id FROM contact_messages WHERE source = 'website');
      DELETE FROM contacts WHERE id LIKE 'd0000000-%';
      DELETE FROM products WHERE id LIKE 'e0000000-%';
      DELETE FROM companies WHERE id LIKE 'c0000000-%';
    `, [DEMO_USER_ID]).catch(() => {});

    // Also clean up any user-created demo data (non-seed IDs)
    await pool.query(`DELETE FROM tasks WHERE assigned_to = $1`, [DEMO_USER_ID]).catch(() => {});
    await pool.query(`DELETE FROM opportunities WHERE owner_id = $1`, [DEMO_USER_ID]).catch(() => {});
    await pool.query(`DELETE FROM activities WHERE user_id = $1`, [DEMO_USER_ID]).catch(() => {});

    // Delete orphaned contacts/companies created during demo (not in seed)
    await pool.query(`DELETE FROM contacts WHERE id NOT LIKE 'd0000000-%' AND company_id IN (SELECT id FROM companies WHERE id NOT LIKE 'c0000000-%')`).catch(() => {});
    await pool.query(`DELETE FROM contacts WHERE id NOT LIKE 'd0000000-%'`).catch(() => {});
    await pool.query(`DELETE FROM companies WHERE id NOT LIKE 'c0000000-%'`).catch(() => {});
    await pool.query(`DELETE FROM products WHERE id NOT LIKE 'e0000000-%'`).catch(() => {});
    await pool.query(`DELETE FROM contact_messages WHERE id NOT LIKE 'a1000000-%'`).catch(() => {});

    // Re-seed companies
    await pool.query(`
      INSERT INTO companies (id, name, industry, website, address, city, country, phone, email, notes, status) VALUES
        ('c0000000-0000-0000-0000-000000000001', 'Brasserie du Hainaut', 'Restauration', 'https://brasserie-hainaut.be', 'Rue de la Station 12', 'Enghien', 'Belgique', '+32 2 395 12 34', 'contact@brasserie-hainaut.be', 'Client fidèle depuis 2024. Intéressé par automatisation réservations.', 'active'),
        ('c0000000-0000-0000-0000-000000000002', 'TechWave Solutions', 'IT & Services', 'https://techwave.be', 'Avenue Louise 54', 'Bruxelles', 'Belgique', '+32 2 511 45 67', 'info@techwave.be', 'PME tech, 25 employés. Besoin CRM + chatbot.', 'active'),
        ('c0000000-0000-0000-0000-000000000003', 'Maison Dupont Immobilier', 'Immobilier', 'https://dupont-immo.fr', '15 Rue de la Paix', 'Lille', 'France', '+33 3 20 45 67 89', 'contact@dupont-immo.fr', 'Agence immobilière, 8 agents. Veut automatiser le suivi client.', 'active'),
        ('c0000000-0000-0000-0000-000000000004', 'Green Garden SPRL', 'Jardinage & Paysage', 'https://greengarden.be', 'Chaussée de Bruxelles 89', 'Ath', 'Belgique', '+32 68 33 22 11', 'info@greengarden.be', 'Paysagiste. Intéressé par planning IA et devis automatiques.', 'active'),
        ('c0000000-0000-0000-0000-000000000005', 'Comptabilité Martin & Fils', 'Finance & Comptabilité', 'https://martin-compta.fr', '3 Place du Marché', 'Valenciennes', 'France', '+33 3 27 46 58 90', 'cabinet@martin-compta.fr', 'Cabinet comptable, 12 collaborateurs. Migration vers outils IA.', 'active'),
        ('c0000000-0000-0000-0000-000000000006', 'BioShop Wallonie', 'Commerce de détail', 'https://bioshop-wallonie.be', 'Grand Place 7', 'Mons', 'Belgique', '+32 65 35 78 90', 'hello@bioshop-wallonie.be', 'Magasin bio avec e-commerce. Veut chatbot + analyse ventes.', 'active'),
        ('c0000000-0000-0000-0000-000000000007', 'Studio Créatif Pixel', 'Marketing & Design', 'https://pixelstudio.be', 'Rue Neuve 42', 'Bruxelles', 'Belgique', '+32 2 223 45 67', 'bonjour@pixelstudio.be', 'Agence créative, 6 personnes. Utilise déjà nos outils de contenu IA.', 'active'),
        ('c0000000-0000-0000-0000-000000000008', 'Transport Lefebvre SA', 'Transport & Logistique', 'https://transport-lefebvre.fr', 'Zone industrielle Nord', 'Roubaix', 'France', '+33 3 20 98 76 54', 'direction@transport-lefebvre.fr', 'Flotte de 30 camions. Optimisation routes par IA.', 'active'),
        ('c0000000-0000-0000-0000-000000000009', 'Clinique Vétérinaire des Collines', 'Santé animale', 'https://vet-collines.be', 'Avenue des Alliés 23', 'Enghien', 'Belgique', '+32 2 395 88 99', 'rdv@vet-collines.be', 'Clinique vétérinaire. Automatisation prise de RDV et rappels.', 'active'),
        ('c0000000-0000-0000-0000-000000000010', 'Chocolaterie Belge Artisanale', 'Alimentaire', 'https://choco-belge.be', 'Rue du Midi 18', 'Bruxelles', 'Belgique', '+32 2 512 34 56', 'commandes@choco-belge.be', 'Artisan chocolatier avec boutique en ligne. Besoin newsletter IA.', 'active'),
        ('c0000000-0000-0000-0000-000000000011', 'Fitness Club Premium', 'Sport & Bien-être', 'https://fitnesspremium.be', 'Boulevard du Roi 5', 'Tournai', 'Belgique', '+32 69 22 33 44', 'info@fitnesspremium.be', 'Salle de sport, 800 membres. Rétention client par IA.', 'active'),
        ('c0000000-0000-0000-0000-000000000012', 'Cabinet Avocat Moreau', 'Juridique', 'https://moreau-avocats.fr', '28 Boulevard de la Liberté', 'Lille', 'France', '+33 3 20 54 32 10', 'secretariat@moreau-avocats.fr', 'Cabinet 4 avocats. Intéressé par automatisation documents.', 'active')
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, industry=EXCLUDED.industry, website=EXCLUDED.website, address=EXCLUDED.address, city=EXCLUDED.city, country=EXCLUDED.country, phone=EXCLUDED.phone, email=EXCLUDED.email, notes=EXCLUDED.notes, status=EXCLUDED.status;
    `);

    // Re-seed contacts
    await pool.query(`
      INSERT INTO contacts (id, company_id, first_name, last_name, email, phone, job_title, notes, status) VALUES
        ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Jean-Pierre', 'Vandenberghe', 'jp.vandenberghe@brasserie-hainaut.be', '+32 475 12 34 56', 'Gérant', 'Décideur principal. Très enthousiaste pour l''IA.', 'active'),
        ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Sophie', 'Leclercq', 'sophie@techwave.be', '+32 486 23 45 67', 'CEO', 'A assisté à notre webinar en janvier.', 'active'),
        ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Maxime', 'Dubois', 'maxime@techwave.be', '+32 479 34 56 78', 'CTO', 'Contact technique. Évalue nos solutions.', 'active'),
        ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Marie', 'Dupont', 'marie@dupont-immo.fr', '+33 6 12 34 56 78', 'Directrice', 'Très motivée. Veut un POC rapide.', 'active'),
        ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'Lucas', 'Henrard', 'lucas@greengarden.be', '+32 496 45 67 89', 'Fondateur', 'Rencontré au salon PME Mons 2025.', 'active'),
        ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'Philippe', 'Martin', 'philippe@martin-compta.fr', '+33 6 23 45 67 89', 'Associé gérant', 'Prudent mais intéressé. Demande des références.', 'active'),
        ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005', 'Camille', 'Bertrand', 'camille@martin-compta.fr', '+33 6 34 56 78 90', 'Responsable IT', 'Premier contact. Gère la transition numérique.', 'active'),
        ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000006', 'Nathalie', 'Claessens', 'nathalie@bioshop-wallonie.be', '+32 497 56 78 90', 'Gérante', 'Déjà cliente newsletter. Très satisfaite.', 'active'),
        ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000007', 'Antoine', 'De Smedt', 'antoine@pixelstudio.be', '+32 485 67 89 01', 'Directeur créatif', 'Ambassadeur. Nous recommande activement.', 'active'),
        ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000008', 'François', 'Lefebvre', 'francois@transport-lefebvre.fr', '+33 6 45 67 89 01', 'PDG', 'Gros potentiel. Fleet de 30 camions.', 'active'),
        ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000008', 'Élodie', 'Vasseur', 'elodie@transport-lefebvre.fr', '+33 6 56 78 90 12', 'Responsable logistique', 'Utilisatrice finale. Teste notre solution.', 'active'),
        ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000009', 'Dr. Anne', 'Vermeersch', 'anne@vet-collines.be', '+32 477 78 90 12', 'Vétérinaire associée', 'Contente du système de rappels SMS.', 'active'),
        ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000010', 'Pierre', 'Godiva', 'pierre@choco-belge.be', '+32 498 89 01 23', 'Maître chocolatier', 'Artisan passionné. Newsletter IA l''intéresse.', 'active'),
        ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000011', 'Sarah', 'Dewaele', 'sarah@fitnesspremium.be', '+32 476 90 12 34', 'Manager', 'Veut réduire le churn de 20%.', 'active'),
        ('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000012', 'Maître Thomas', 'Moreau', 'thomas@moreau-avocats.fr', '+33 6 67 89 01 23', 'Avocat associé', 'Besoin urgent d''automatisation docs.', 'active'),
        ('d0000000-0000-0000-0000-000000000016', NULL, 'Isabelle', 'Fontaine', 'isabelle.fontaine@gmail.com', '+32 495 11 22 33', 'Indépendante', 'Coach business. Prospect chaud via LinkedIn.', 'active'),
        ('d0000000-0000-0000-0000-000000000017', NULL, 'Julien', 'Renard', 'julien.renard@outlook.be', '+32 488 22 33 44', 'E-commerçant', 'Dropshipping. Cherche automatisation service client.', 'active'),
        ('d0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000001', 'Amélie', 'Petit', 'amelie@brasserie-hainaut.be', '+32 476 33 44 55', 'Responsable salle', 'Gère les réservations au quotidien.', 'active'),
        ('d0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000006', 'Thomas', 'Lambert', 'thomas@bioshop-wallonie.be', '+32 489 44 55 66', 'Responsable e-commerce', 'Technique. Gère le Shopify.', 'active'),
        ('d0000000-0000-0000-0000-000000000020', NULL, 'Céline', 'Rousseau', 'celine.rousseau@hotmail.fr', '+33 6 78 90 12 34', 'Freelance marketing', 'Rencontrée à un meetup IA Lille.', 'active')
      ON CONFLICT (id) DO UPDATE SET company_id=EXCLUDED.company_id, first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, email=EXCLUDED.email, phone=EXCLUDED.phone, job_title=EXCLUDED.job_title, notes=EXCLUDED.notes, status=EXCLUDED.status;
    `);

    // Assign demo contacts to demo user (multi-tenant scoping)
    await pool.query(`UPDATE contacts SET owner_id = $1 WHERE id LIKE 'd0000000-%'`, [DEMO_USER_ID]);

    // Re-seed products
    await pool.query(`
      INSERT INTO products (id, name, description, price, currency, category, status) VALUES
        ('e0000000-0000-0000-0000-000000000001', 'Audit IA Gratuit', 'Analyse complète de vos processus et recommandations d''automatisation.', 0.00, 'EUR', 'Audit', 'active'),
        ('e0000000-0000-0000-0000-000000000002', 'Chatbot IA 24/7', 'Assistant virtuel intelligent pour votre site web.', 299.00, 'EUR', 'Automatisation', 'active'),
        ('e0000000-0000-0000-0000-000000000003', 'Automatisation Marketing', 'Création de contenu IA, newsletters automatisées.', 499.00, 'EUR', 'Marketing', 'active'),
        ('e0000000-0000-0000-0000-000000000004', 'CRM Intelligent', 'CRM avec scoring de leads IA et prédictions.', 199.00, 'EUR', 'CRM', 'active'),
        ('e0000000-0000-0000-0000-000000000005', 'Formation IA Équipe', 'Formation sur mesure pour vos équipes.', 1500.00, 'EUR', 'Formation', 'active'),
        ('e0000000-0000-0000-0000-000000000006', 'Analyse de Données IA', 'Tableaux de bord intelligents et insights.', 399.00, 'EUR', 'Analyse', 'active'),
        ('e0000000-0000-0000-0000-000000000007', 'Pack PME Starter', 'Chatbot + CRM + Automatisation marketing.', 799.00, 'EUR', 'Pack', 'active'),
        ('e0000000-0000-0000-0000-000000000008', 'Pack PME Premium', 'Toutes nos solutions + formation + support 12 mois.', 2499.00, 'EUR', 'Pack', 'active')
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, price=EXCLUDED.price, category=EXCLUDED.category, status=EXCLUDED.status;
    `);

    // Re-seed opportunities
    await pool.query(`
      INSERT INTO opportunities (id, name, company_id, contact_id, value, currency, status, probability, expected_close_date, notes, owner_id) VALUES
        ('f0000000-0000-0000-0000-000000000001', 'Chatbot réservations Brasserie', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 299.00, 'EUR', 'won', 100, '2026-01-15', 'Déployé et opérationnel.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000002', 'Pack contenu IA Pixel Studio', 'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000009', 499.00, 'EUR', 'won', 100, '2025-12-20', 'Client ambassadeur.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000003', 'Newsletter IA BioShop', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000008', 499.00, 'EUR', 'won', 100, '2026-02-10', 'Taux d''ouverture passé de 15% à 38%.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000004', 'Pack PME Premium TechWave', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 2499.00, 'EUR', 'negotiation', 70, '2026-04-15', 'Négociation en cours. CTO convaincu.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000005', 'Optimisation routes IA Transport', 'c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', 4990.00, 'EUR', 'negotiation', 60, '2026-05-01', 'POC réussi sur 5 camions.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000006', 'Formation IA Cabinet Martin', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000006', 1500.00, 'EUR', 'negotiation', 65, '2026-04-30', 'Budget validé en interne.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000007', 'CRM + Chatbot Dupont Immo', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 799.00, 'EUR', 'proposition', 50, '2026-05-15', 'Proposition envoyée.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000008', 'Rétention IA Fitness Premium', 'c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000014', 399.00, 'EUR', 'proposition', 45, '2026-05-20', 'Analyse churn envoyée.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000009', 'Automatisation docs Cabinet Moreau', 'c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000015', 799.00, 'EUR', 'proposition', 55, '2026-04-25', 'Très intéressé par la génération de contrats.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000010', 'Chatbot vétérinaire Collines', 'c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000012', 299.00, 'EUR', 'proposition', 40, '2026-06-01', 'RDV en ligne + rappels automatiques.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000011', 'Pack Starter Green Garden', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 799.00, 'EUR', 'qualification', 25, '2026-06-15', 'Audit en cours.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000012', 'E-commerce IA Chocolaterie', 'c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000013', 499.00, 'EUR', 'qualification', 20, '2026-07-01', 'Recommandations produits IA.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000013', 'Coaching IA Isabelle Fontaine', NULL, 'd0000000-0000-0000-0000-000000000016', 199.00, 'EUR', 'qualification', 30, '2026-05-30', 'CRM simple + automatisation.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000014', 'Analyse données BioShop (avancée)', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000019', 399.00, 'EUR', 'lost', 0, '2026-02-28', 'Budget insuffisant. À relancer en 2027.', 'a0000000-0000-0000-0000-000000000001'),
        ('f0000000-0000-0000-0000-000000000015', 'Chatbot Julien Renard', NULL, 'd0000000-0000-0000-0000-000000000017', 299.00, 'EUR', 'lost', 0, '2026-03-01', 'A choisi un concurrent.', 'a0000000-0000-0000-0000-000000000001')
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, company_id=EXCLUDED.company_id, contact_id=EXCLUDED.contact_id, value=EXCLUDED.value, status=EXCLUDED.status, probability=EXCLUDED.probability, expected_close_date=EXCLUDED.expected_close_date, notes=EXCLUDED.notes, owner_id=EXCLUDED.owner_id;
    `);

    // Re-seed tasks
    await pool.query(`
      INSERT INTO tasks (id, title, description, due_date, priority, status, company_id, contact_id, opportunity_id, assigned_to) VALUES
        ('b0000000-0000-0000-0000-000000000001', 'Préparer démo CRM pour TechWave', 'Personnaliser la démo avec leurs données métier.', '2026-03-20 10:00:00+01', 'high', 'in_progress', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000002', 'Envoyer contrat Transport Lefebvre', 'Contrat pour déploiement flotte complète.', '2026-03-22 14:00:00+01', 'high', 'pending', 'c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000003', 'Relancer Marie Dupont (Immo)', 'Relancer pour retour sur proposition.', '2026-03-19 09:00:00+01', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000004', 'Audit IA Green Garden', 'Réaliser l''audit gratuit pour Lucas.', '2026-03-25 11:00:00+01', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000005', 'Préparer formation Cabinet Martin', 'Support de formation IA pour comptables.', '2026-04-10 09:00:00+02', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000006', 'Suivi mensuel Brasserie du Hainaut', 'Vérifier stats chatbot et satisfaction.', '2026-03-28 15:00:00+01', 'low', 'pending', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000007', 'Rapport ROI Pixel Studio', 'Rapport trimestriel de performance.', '2026-03-31 16:00:00+02', 'low', 'in_progress', 'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000008', 'Configurer chatbot Vétérinaire', 'Configurer les flux RDV et rappels.', '2026-04-05 10:00:00+02', 'medium', 'pending', NULL, 'd0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000009', 'Appeler Sarah Dewaele (Fitness)', 'Discuter résultats analyse churn.', '2026-03-18 11:00:00+01', 'high', 'completed', 'c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000010', 'Mise à jour newsletter BioShop', 'Optimiser les templates.', '2026-03-21 14:00:00+01', 'low', 'completed', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000011', 'Envoyer proposition Chocolaterie', 'Proposition recommandations produits IA.', '2026-03-24 10:00:00+01', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001'),
        ('b0000000-0000-0000-0000-000000000012', 'Webinar IA pour PME - Mars 2026', 'Thème: automatisation service client.', '2026-03-27 09:00:00+01', 'high', 'in_progress', NULL, NULL, NULL, 'a0000000-0000-0000-0000-000000000001')
      ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, due_date=EXCLUDED.due_date, priority=EXCLUDED.priority, status=EXCLUDED.status, company_id=EXCLUDED.company_id, contact_id=EXCLUDED.contact_id, opportunity_id=EXCLUDED.opportunity_id;
    `);

    // Re-seed contact messages
    await pool.query(`
      INSERT INTO contact_messages (id, name, email, company, phone, subject, message, source, status) VALUES
        ('a1000000-0000-0000-0000-000000000001', 'Marc Janssen', 'marc.janssen@example.be', 'Janssen & Co', '+32 476 11 22 33', 'Demande d''information IA', 'Bonjour, je suis intéressé par vos solutions d''automatisation.', 'website', 'new'),
        ('a1000000-0000-0000-0000-000000000002', 'Laura Devos', 'laura.devos@startup.be', 'StartupBE', '+32 488 33 44 55', 'Chatbot pour e-commerce', 'Nous cherchons un chatbot intelligent pour notre boutique en ligne.', 'website', 'read'),
        ('a1000000-0000-0000-0000-000000000003', 'Michel Peeters', 'michel@peeters-bouw.be', 'Peeters Construction', '+32 479 55 66 77', 'Automatisation devis', 'Est-il possible d''automatiser la création de devis ?', 'website', 'replied'),
        ('a1000000-0000-0000-0000-000000000004', 'Claire Dumont', 'claire.dumont@gmail.com', NULL, '+33 6 99 88 77 66', 'Formation IA individuelle', 'Proposez-vous des formations individuelles ?', 'website', 'new'),
        ('a1000000-0000-0000-0000-000000000005', 'David Hermans', 'david@hermans-transport.be', 'Hermans Transport', '+32 495 77 88 99', 'Partenariat logistique IA', 'Nous aimerions discuter d''optimisation de routes par IA.', 'website', 'new')
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, company=EXCLUDED.company, subject=EXCLUDED.subject, message=EXCLUDED.message, status=EXCLUDED.status;
    `);

    // Re-seed activities
    await pool.query(`
      INSERT INTO activities (id, user_id, type, description, entity_type, entity_id, created_at) VALUES
        (uuid_generate_v4(), $1, 'opportunity_won', 'Opportunité gagnée: Newsletter IA BioShop (499€)', 'opportunity', 'f0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days'),
        (uuid_generate_v4(), $1, 'contact_created', 'Nouveau contact: Céline Rousseau', 'contact', 'd0000000-0000-0000-0000-000000000020', NOW() - INTERVAL '4 days'),
        (uuid_generate_v4(), $1, 'opportunity_updated', 'Opportunité en négociation: Pack PME Premium TechWave', 'opportunity', 'f0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), $1, 'task_completed', 'Tâche terminée: Appeler Sarah Dewaele', 'task', 'b0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '2 days'),
        (uuid_generate_v4(), $1, 'company_created', 'Nouvelle entreprise: Cabinet Avocat Moreau', 'company', 'c0000000-0000-0000-0000-000000000012', NOW() - INTERVAL '2 days'),
        (uuid_generate_v4(), $1, 'opportunity_created', 'Nouvelle opportunité: Automatisation docs Moreau (799€)', 'opportunity', 'f0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '1 day'),
        (uuid_generate_v4(), $1, 'demo_reset', 'Données de démonstration réinitialisées', 'system', NULL, NOW())
    `, [DEMO_USER_ID]);

    console.log('[DEMO] Reset complete');
  } catch (err) {
    console.error('[DEMO] Reset error:', err.message);
  } finally {
    demoResetInProgress = false;
  }
}

// Middleware: track demo activity & auto-reset after inactivity
app.use((req, res, next) => {
  if (req.user && req.user.id === DEMO_USER_ID) {
    const now = Date.now();
    if (lastDemoActivity > 0 && (now - lastDemoActivity) > DEMO_INACTIVITY_MS) {
      // Inactivity detected — reset in background, don't block request
      resetDemoData();
    }
    lastDemoActivity = now;
  }
  next();
});

// ==================== BLOG SEED (auto-restore if empty) ====================
async function ensureBlogPosts() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM blog_posts');
    if (parseInt(rows[0].count) > 0) return;
    console.log('[BLOG] No posts found — seeding default articles...');
    const catRows = await pool.query('SELECT id, name FROM blog_categories');
    const catMap = {};
    catRows.rows.forEach(c => catMap[c.name] = c.id);

    const posts = [
      { title: "Comment l'IA transforme la gestion client des PME belges", slug: 'ia-gestion-client-pme-belges', excerpt: "Découvrez comment l'intelligence artificielle révolutionne la relation client pour les PME en Belgique.", content: "<h2>L'IA au service des PME</h2><p>Les PME belges font face à un défi de taille : offrir un service client de qualité tout en maîtrisant leurs coûts. L'intelligence artificielle apporte des solutions concrètes et accessibles.</p><h3>Chatbots intelligents</h3><p>Les chatbots alimentés par l'IA peuvent gérer jusqu'à 80% des demandes récurrentes, libérant vos équipes pour les tâches à forte valeur ajoutée.</p><h3>Analyse prédictive</h3><p>Grâce au machine learning, anticipez les besoins de vos clients avant même qu'ils ne les expriment.</p><h3>Automatisation du suivi</h3><p>L'IA automatise le suivi commercial, programme les rappels et priorise les opportunités les plus prometteuses.</p><h3>Résultats concrets</h3><p>Nos clients PME constatent en moyenne une augmentation de 35% de leur taux de conversion et une réduction de 50% du temps de réponse.</p>", cat: 'Automatisation' },
      { title: "5 cas d'usage concrets de l'IA pour les entreprises wallonnes", slug: '5-cas-usage-ia-entreprises-wallonnes', excerpt: "De la facturation automatisée aux assistants virtuels, voici 5 applications concrètes de l'IA en Wallonie.", content: "<h2>L'IA en action en Wallonie</h2><p>L'intelligence artificielle n'est plus réservée aux grandes entreprises.</p><h3>1. Facturation automatisée</h3><p>Thierry, gérant d'une brasserie à Hainaut, a automatisé sa facturation grâce à l'IA. Résultat : 10 heures gagnées par semaine.</p><h3>2. Chatbot de réservation</h3><p>Un restaurant namurois utilise un chatbot IA pour gérer ses réservations 24h/24.</p><h3>3. Analyse de données commerciales</h3><p>Un studio créatif liégeois a augmenté son chiffre d'affaires de 22% en 6 mois.</p><h3>4. Génération de contenu marketing</h3><p>Une agence immobilière bruxelloise génère automatiquement ses descriptions de biens et newsletters.</p><h3>5. Support client intelligent</h3><p>Un cabinet comptable utilise un assistant IA pour les questions fréquentes sur la TVA et les déclarations.</p>", cat: "Cas d'usage" },
      { title: "Guide complet : intégrer l'IA dans votre stratégie digitale", slug: 'guide-integrer-ia-strategie-digitale', excerpt: "Un guide étape par étape pour intégrer l'intelligence artificielle dans votre stratégie digitale.", content: "<h2>Votre feuille de route IA</h2><p>Intégrer l'IA ne se fait pas du jour au lendemain. Voici notre méthodologie en 5 étapes.</p><h3>Étape 1 : L'audit IA gratuit</h3><p>Nous analysons vos processus et identifions les opportunités d'automatisation.</p><h3>Étape 2 : Définir les priorités</h3><p>Nous priorisons selon le ratio impact/effort pour maximiser votre ROI.</p><h3>Étape 3 : Prototypage rapide</h3><p>En 2 à 4 semaines, nous développons un prototype fonctionnel.</p><h3>Étape 4 : Déploiement et formation</h3><p>La solution est déployée et vos équipes sont formées.</p><h3>Étape 5 : Optimisation continue</h3><p>L'IA s'améliore avec le temps grâce à l'analyse des performances.</p>", cat: 'Formation' },
      { title: "L'IA générative pour la création de contenu : mythes et réalités", slug: 'ia-generative-creation-contenu-mythes-realites', excerpt: "ChatGPT, Claude, Midjourney... Démêlons le vrai du faux pour une utilisation professionnelle efficace.", content: "<h2>Au-delà du buzz</h2><p>L'IA générative fait les gros titres depuis 2023. Que peut-elle réellement apporter ?</p><h3>Mythe 1 : L'IA va remplacer les rédacteurs</h3><p><strong>Réalité :</strong> L'IA est un outil d'augmentation qui accélère la production de 3x à 5x.</p><h3>Mythe 2 : Tout le contenu IA se ressemble</h3><p><strong>Réalité :</strong> Avec les bons prompts, le contenu peut être unique et refléter votre marque.</p><h3>Mythe 3 : C'est gratuit et instantané</h3><p><strong>Réalité :</strong> Les outils professionnels ont un coût et demandent de l'expertise.</p><h3>Notre recommandation</h3><p>Utilisez l'IA pour les premiers jets et la structuration. Laissez l'humain pour la validation et l'expertise métier.</p>", cat: 'Innovation' },
      { title: "CRM intelligent : pourquoi les PME doivent passer à l'IA en 2026", slug: 'crm-intelligent-pme-ia-2026', excerpt: "Un CRM classique ne suffit plus. Découvrez comment un CRM augmenté par l'IA peut transformer votre gestion commerciale.", content: "<h2>Le CRM traditionnel a atteint ses limites</h2><p>Vous utilisez encore un tableur Excel pour gérer vos clients ? En 2026, c'est comme conduire sans GPS.</p><h3>Scoring automatique des leads</h3><p>L'IA évalue chaque prospect et vous indique où concentrer vos efforts.</p><h3>Prédiction de churn</h3><p>Identifiez les clients à risque de départ avant qu'il ne soit trop tard.</p><h3>Rapports automatisés</h3><p>Le CRM intelligent génère automatiquement vos rapports avec des insights actionnables.</p><h3>Notre solution</h3><p>Chez AInspiration, nous avons développé un CRM intelligent spécialement conçu pour les PME belges.</p>", cat: 'Innovation' },
      { title: "Automatiser sa prospection LinkedIn avec l'IA", slug: 'automatiser-prospection-linkedin-ia', excerpt: "LinkedIn est le réseau B2B par excellence. Voici comment l'IA peut automatiser votre prospection.", content: "<h2>LinkedIn + IA = prospection surpuissante</h2><p>LinkedIn compte plus de 5 millions d'utilisateurs en Belgique.</p><h3>Génération de contenu</h3><p>L'IA crée des posts engageants adaptés à votre audience.</p><h3>Personnalisation des messages</h3><p>L'IA analyse le profil de chaque prospect et génère un message personnalisé.</p><h3>Analyse des performances</h3><p>L'IA optimise votre stratégie en continu en analysant vos métriques.</p><h3>Les limites à respecter</h3><p>Notre approche combine IA et intervention humaine pour rester dans les clous de LinkedIn.</p>", cat: 'Automatisation' }
    ];

    for (const p of posts) {
      await pool.query(
        `INSERT INTO blog_posts (id, title, slug, excerpt, content, category_id, status, published_at, language, author_name)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'published', NOW() - interval '1 day' * (random() * 30)::int, 'fr', 'Laurent Quintin')`,
        [p.title, p.slug, p.excerpt, p.content, catMap[p.cat] || null]
      );
    }
    console.log('[BLOG] Seeded', posts.length, 'articles');
  } catch (err) {
    console.error('[BLOG] Seed error:', err.message);
  }
}

// Run on startup
ensureBlogPosts();

// ==================== BLOG I18N SYNC (daily) ====================
const BLOG_SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const TARGET_LANGS = ['en', 'nl'];
const LANG_PAIRS = { en: 'fr|en', nl: 'fr|nl' };

async function translateText(text, langPair) {
  if (!text || !text.trim()) return text;
  // Split long texts into chunks (MyMemory limit ~500 chars for best quality)
  const MAX_CHUNK = 450;
  if (text.length <= MAX_CHUNK) {
    return await callMyMemory(text, langPair);
  }
  // Split HTML on block-level tags to preserve structure
  const parts = text.split(/(<\/(?:p|h[1-6]|li|div|blockquote|tr|td|th)>)/i);
  let chunk = '';
  const chunks = [];
  for (const part of parts) {
    if ((chunk + part).length > MAX_CHUNK && chunk) {
      chunks.push(chunk);
      chunk = part;
    } else {
      chunk += part;
    }
  }
  if (chunk) chunks.push(chunk);

  const translated = [];
  for (const c of chunks) {
    translated.push(await callMyMemory(c, langPair));
    // Rate limit: small delay between requests
    await new Promise(r => setTimeout(r, 300));
  }
  return translated.join('');
}

async function callMyMemory(text, langPair) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=contact@ainspiration.eu`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    console.warn('[I18N] MyMemory fallback — status:', data.responseStatus);
    return text;
  } catch (err) {
    console.error('[I18N] Translation error:', err.message);
    return text;
  }
}

function translatedSlug(slug, lang) {
  return `${slug}-${lang}`;
}

async function syncBlogTranslations() {
  try {
    // Get all French posts
    const { rows: frPosts } = await pool.query(
      "SELECT * FROM blog_posts WHERE language = 'fr' AND status = 'published'"
    );
    if (frPosts.length === 0) return;

    // Get all existing non-FR slugs for quick lookup
    const { rows: existing } = await pool.query(
      "SELECT slug, language FROM blog_posts WHERE language != 'fr'"
    );
    const existingSet = new Set(existing.map(r => `${r.slug}:${r.language}`));

    let created = 0;
    for (const post of frPosts) {
      for (const lang of TARGET_LANGS) {
        const targetSlug = translatedSlug(post.slug, lang);
        if (existingSet.has(`${targetSlug}:${lang}`)) continue;

        console.log(`[I18N] Translating "${post.title}" → ${lang}...`);
        const langPair = LANG_PAIRS[lang];

        const title = await translateText(post.title, langPair);
        const excerpt = post.excerpt ? await translateText(post.excerpt, langPair) : null;
        const content = await translateText(post.content, langPair);

        await pool.query(
          `INSERT INTO blog_posts (id, title, slug, excerpt, content, category_id, status, published_at, language, author_name, featured_image)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'published', $6, $7, $8, $9)`,
          [title, targetSlug, excerpt, content, post.category_id, post.published_at, lang, post.author_name, post.featured_image]
        );
        created++;
        console.log(`[I18N] Created ${lang} version: ${targetSlug}`);
      }
    }

    if (created > 0) {
      console.log(`[I18N] Sync complete — ${created} translations created`);
    }
  } catch (err) {
    console.error('[I18N] Sync error:', err.message);
  }
}

// Blog translations are produced by the n8n auto-blog workflow (OpenRouter,
// "Traduire EN/NL", fail-secure since 2026-09-01). This MyMemory sync was the
// original mechanism; left enabled it silently fills any EN/NL gap left by a
// failed n8n translation with a lower-quality machine translation, which is
// exactly what the fail-secure change was meant to prevent. Opt-in only.
if (process.env.BLOG_AUTO_TRANSLATE === 'true') {
  console.log('[I18N] MyMemory blog translation sync enabled (BLOG_AUTO_TRANSLATE=true)');
  setTimeout(() => syncBlogTranslations(), 10000);
  setInterval(syncBlogTranslations, BLOG_SYNC_INTERVAL);
}

// Health check (before any auth middleware)
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/status', (req, res) => res.json({ status: 'running' }));

// ==================== AUTH MIDDLEWARE ====================

// Reads JWT from httpOnly cookie (preferred) or Authorization header (legacy/transition).
function getTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// SECURITY: sessions must stay under 24h (baseline "Auth"); matches the JWT expiresIn.
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours, seconds
const COOKIE_SECURE = process.env.NODE_ENV === 'production';

function setAuthCookie(res, token) {
  const parts = [
    `auth_token=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${AUTH_COOKIE_MAX_AGE}`,
  ];
  if (COOKIE_SECURE) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAuthCookie(res) {
  const parts = ['auth_token=', 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (COOKIE_SECURE) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) { /* invalid token — continue without auth */ }
  }
  next();
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Returns null for admin (sees all rows), req.user.id otherwise.
// Use in WHERE clauses as: ($N::uuid IS NULL OR owner_col = $N)
function ownerScope(req) {
  return req.user && req.user.role === 'admin' ? null : (req.user ? req.user.id : null);
}

// ==================== INPUT VALIDATION (zod) ====================

// Body validation middleware. On failure: 400 with { error, details: [...] }.
// On success: req.body is replaced with the parsed (coerced/trimmed) value.
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => `${i.path.join('.') || 'body'}: ${i.message}`),
      });
    }
    req.body = result.data;
    next();
  };
}

// UUID param check — apply on routes with :id (or :slug for blog).
function validateUuidParam(name = 'id') {
  return (req, res, next) => {
    const v = req.params[name];
    if (!z.string().uuid().safeParse(v).success) {
      return res.status(400).json({ error: `Invalid ${name} format (UUID expected)` });
    }
    next();
  };
}

// Reusable building blocks
const zEmail = z.string().email().max(254).transform(s => s.toLowerCase().trim());
const zUuid = z.string().uuid();
const zUuidNullable = z.union([zUuid, z.literal(''), z.null()]).transform(v => v || null).optional().nullable();
const zShortText = (max) => z.string().max(max).transform(s => s.trim());
const zOptText = (max) => z.union([z.string().max(max), z.null(), z.literal('')]).transform(v => (v == null || v === '') ? null : v.trim()).optional().nullable();
const zPositiveNumber = z.union([z.number(), z.string()]).pipe(z.coerce.number().nonnegative());

const schemas = {
  authRegister: z.object({
    email: zEmail,
    password: z.string().min(8).max(200),
    name: zOptText(200),
    company: zOptText(200),
  }),
  authLogin: z.object({
    email: zEmail,
    password: z.string().min(1).max(200),
  }),
  contact: z.object({
    first_name: zShortText(100).refine(s => s.length >= 1, { message: 'first_name is required' }),
    last_name: zShortText(100).refine(s => s.length >= 1, { message: 'last_name is required' }),
    email: z.union([zEmail, z.literal(''), z.null()]).transform(v => v || null).optional().nullable(),
    phone: zOptText(30),
    job_title: zOptText(150),
    company_id: zUuidNullable,
    notes: zOptText(5000),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
  }),
  company: z.object({
    name: zShortText(200).refine(s => s.length >= 1, { message: 'name is required' }),
    industry: zOptText(150),
    website: zOptText(500),
    address: zOptText(500),
    city: zOptText(150),
    country: zOptText(100),
    phone: zOptText(30),
    email: z.union([zEmail, z.literal(''), z.null()]).transform(v => v || null).optional().nullable(),
    notes: zOptText(5000),
    status: z.enum(['active', 'inactive', 'lead', 'archived']).optional(),
  }),
  product: z.object({
    name: zShortText(200).refine(s => s.length >= 1, { message: 'name is required' }),
    description: zOptText(5000),
    category: zOptText(150),
    price: zPositiveNumber.optional().nullable(),
    currency: z.string().length(3).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    is_active: z.boolean().optional(),
  }),
  opportunity: z.object({
    name: zShortText(300).refine(s => s.length >= 1, { message: 'name is required' }),
    company_id: zUuidNullable,
    contact_id: zUuidNullable,
    product_id: zUuidNullable,
    stage: zOptText(50),
    status: zOptText(50),
    estimated_value: zPositiveNumber.optional().nullable(),
    value: zPositiveNumber.optional().nullable(),
    close_date: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    expected_close_date: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    currency: z.string().length(3).optional(),
    probability: z.coerce.number().min(0).max(100).optional(),
    notes: zOptText(5000),
    user_id: zUuidNullable,
    owner_id: zUuidNullable,
  }),
  task: z.object({
    title: zShortText(300).refine(s => s.length >= 1, { message: 'title is required' }),
    description: zOptText(5000),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'not_started']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    due_date: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    completed_at: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    completed: z.boolean().optional(),
    company_id: zUuidNullable,
    contact_id: zUuidNullable,
    opportunity_id: zUuidNullable,
    user_id: zUuidNullable,
    assigned_to: zUuidNullable,
  }),
  activity: z.object({
    type: zOptText(100),
    activity_type: zOptText(100),
    description: zOptText(2000),
    entity_type: zOptText(50),
    related_to_type: zOptText(50),
    entity_id: zUuidNullable,
    related_to: zUuidNullable,
    metadata: z.unknown().optional(),
    user_id: zUuidNullable,
  }),
  contactMessage: z.object({
    name: zShortText(200).refine(s => s.length >= 2, { message: 'Nom invalide (2-200 caractères)' }),
    email: zEmail,
    message: zShortText(5000).refine(s => s.length >= 10, { message: 'Message invalide (10-5000 caractères)' }),
    phone: zOptText(30),
    company: zOptText(200),
    subject: zOptText(300),
    source: zOptText(50),
    consent: z.literal(true),
    consentAt: zOptText(40),
  }),
  contactMessageUpdate: z.object({
    status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
    notes: zOptText(5000),
  }),
  newsletterSubscriber: z.object({
    email: zEmail,
    first_name: zOptText(100),
    last_name: zOptText(100),
    language: z.enum(['fr', 'en', 'nl', 'de']).optional(),
    source: zOptText(50),
  }),
  // SECURITY: token only. Accepting a bare email let anyone unsubscribe anyone.
  newsletterUnsubscribe: z.object({
    token: zShortText(200).refine(s => s.length >= 20, { message: 'Token required' }),
  }),
  newsletter: z.object({
    subject: zOptText(300),
    content: zOptText(100000),
    html_content: zOptText(200000),
    language: z.enum(['fr', 'en', 'nl', 'de']).optional(),
    status: z.enum(['draft', 'scheduled', 'sent', 'archived']).optional(),
    scheduled_at: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    sent_at: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    recipients_count: z.coerce.number().int().nonnegative().optional(),
  }),
  newsletterSendLog: z.object({
    newsletter_id: zUuid,
    subscriber_id: zUuid,
    status: zOptText(50),
    error_message: zOptText(2000),
    opened_at: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
    clicked_at: z.union([z.string(), z.null(), z.literal('')]).transform(v => v || null).optional().nullable(),
  }),
  accessLog: z.object({
    action: zShortText(100).refine(s => s.length >= 1, { message: 'action is required' }),
    ip_address: zOptText(45),
    user_agent: zOptText(500),
  }),
  blogPost: z.object({
    title: zOptText(500),
    slug: zShortText(300).refine(s => s.length >= 1, { message: 'slug is required' }),
    excerpt: zOptText(2000),
    content: zOptText(500000),
    featured_image: zOptText(1000),
    category_id: zUuidNullable,
    status: z.enum(['draft', 'published', 'archived']).optional(),
    language: z.enum(['fr', 'en', 'nl', 'de']).optional(),
    author_name: zOptText(200),
    // Aliases used by the n8n Auto Blog workflow (were silently stripped until
    // 2026-09-05, which is why 0/50 articles had an author, cover or category)
    author: zOptText(200),
    category: zOptText(100),
    image_url: zOptText(1000),
    meta_description: zOptText(300),
  }),
};

// ---- Blog helpers -----------------------------------------------------------
// Cover per category when the producer sends none. Unsplash free tier, the
// same source the Réalisations covers use; ids verified 2026-09-05.
const BLOG_COVERS = {
  automatisation: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&q=75&auto=format&fit=crop',
  innovation: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=75&auto=format&fit=crop',
  'cas-usage': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=75&auto=format&fit=crop',
  formation: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=75&auto=format&fit=crop',
  'case-study': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=75&auto=format&fit=crop',
};
const BLOG_DEFAULT_COVER = BLOG_COVERS.innovation;
const BLOG_DEFAULT_AUTHOR = 'Laurent Maréchal';

function blogCoverFor(categorySlug) {
  return BLOG_COVERS[categorySlug] || BLOG_DEFAULT_COVER;
}

// 200 words/minute, minimum 1.
function estimateReadTime(html) {
  const words = String(html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// The producer sends a category *slug* ('automatisation'); the table wants the id.
const blogCategoryCache = new Map();
async function resolveBlogCategory(slugOrId) {
  if (!slugOrId) return null;
  if (/^[0-9a-f-]{36}$/i.test(slugOrId)) return slugOrId;
  const key = String(slugOrId).toLowerCase().trim();
  if (blogCategoryCache.has(key)) return blogCategoryCache.get(key);
  const r = await pool.query('SELECT id FROM blog_categories WHERE slug = $1 OR lower(name) = $1', [key]);
  const id = r.rows[0] ? r.rows[0].id : null;
  blogCategoryCache.set(key, id);
  return id;
}

// API shape the frontend expects (image_url, category slug) on top of the row.
const BLOG_LIST_SQL = `SELECT p.*, c.slug AS category, c.name AS category_name FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id`;
function publicBlogRow(row) {
  return {
    ...row,
    image_url: row.featured_image || blogCoverFor(row.category),
    author_name: row.author_name || BLOG_DEFAULT_AUTHOR,
    read_time: row.read_time || estimateReadTime(row.content),
  };
}

// Convenience: PUT schemas accept any subset of fields
const updateSchemas = {
  contact: schemas.contact.partial(),
  company: schemas.company.partial(),
  product: schemas.product.partial(),
  opportunity: schemas.opportunity.partial(),
  task: schemas.task.partial(),
  newsletter: schemas.newsletter.partial(),
  blogPost: schemas.blogPost.partial(),
};

app.use(optionalAuth);

// ---- shared by several route modules (hoisted 2026-09-05) ----
const N8N_BASE = process.env.N8N_BASE || 'https://n8n.srv767464.hstgr.cloud/webhook';
const linkedin = require('./linkedin');
const contentGenerator = require('./content-generator');
function langPrefix(lang) { return lang === 'fr' ? '' : `/${lang}`; }

// ==================== HELPERS ====================

// SECURITY: access logs are written server-side only, with the IP Express
// derives from the trusted proxy — never from a value supplied by the client.
// Fire-and-forget: an audit-trail failure must not break login.
function recordAccessLog(req, userId, action) {
  pool.query(
    'INSERT INTO access_logs (id, user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5)',
    [uuidv4(), userId || null, action, req.ip || null, (req.headers['user-agent'] || '').slice(0, 500)]
  ).catch(err => console.error('Error recording access log:', err.message));
}

function mapOpportunity(row) {
  return {
    ...row,
    stage: row.status,
    estimated_value: row.value != null ? parseFloat(row.value) : null,
    close_date: row.expected_close_date,
    user_id: row.owner_id,
  };
}

function mapProduct(row) {
  return {
    ...row,
    is_active: row.status === 'active',
    price: row.price != null ? parseFloat(row.price) : null,
  };
}

function mapTask(row) {
  const t = {
    ...row,
    user_id: row.assigned_to,
    completed: row.status === 'completed',
  };
  if (row.opportunity_id) {
    t.related_to_type = 'opportunity';
    t.related_to = row.opportunity_id;
  } else if (row.contact_id) {
    t.related_to_type = 'contact';
    t.related_to = row.contact_id;
  } else if (row.company_id) {
    t.related_to_type = 'company';
    t.related_to = row.company_id;
  }
  return t;
}


// ==================== ROUTE MODULES ====================
// Shared context for the route modules (routes/*.js). Function declarations
// are hoisted, consts above are initialised: everything here exists by now.
// KEEP IN SYNC: a new top-level helper a route module needs must be added.
const ctx = {
  ALLOWED_ORIGINS,
  AUTH_COOKIE_MAX_AGE,
  BLOG_COVERS,
  BLOG_DEFAULT_AUTHOR,
  BLOG_DEFAULT_COVER,
  BLOG_LIST_SQL,
  BLOG_SYNC_INTERVAL,
  COOKIE_SECURE,
  DEMO_EMAIL,
  DEMO_INACTIVITY_MS,
  DEMO_USER_ID,
  HONEYPOT_FIELD,
  JWT_SECRET,
  LANG_PAIRS,
  N8N_BASE,
  Pool,
  TARGET_LANGS,
  apiLimiter,
  app,
  authLimiter,
  bcrypt,
  blogCategoryCache,
  blogCoverFor,
  callMyMemory,
  chatLimiter,
  clearAuthCookie,
  compression,
  contentGenerator,
  cors,
  demoResetInProgress,
  ensureBlogPosts,
  estimateReadTime,
  express,
  formLimiter,
  getTokenFromRequest,
  helmet,
  jwt,
  langPrefix,
  lastDemoActivity,
  linkedin,
  mapOpportunity,
  mapProduct,
  mapTask,
  optionalAuth,
  ownerScope,
  pool,
  publicBlogRow,
  rateLimit,
  recordAccessLog,
  rejectHoneypot,
  requireAuth,
  requireConsent,
  resetDemoData,
  resolveBlogCategory,
  schemas,
  setAuthCookie,
  syncBlogTranslations,
  translateText,
  translatedSlug,
  updateSchemas,
  uuidv4,
  validateBody,
  validateUuidParam,
  webhookLimiter,
  z,
  zEmail,
  zOptText,
  zPositiveNumber,
  zShortText,
  zUuid,
  zUuidNullable
};

// Registration order matters (specific routes before parametric ones, the
// SEO/SPA catch-all last) — same order as the former monolith.
require('./routes/auth')(ctx);
require('./routes/blog')(ctx);
require('./routes/crm')(ctx);
require('./routes/newsletter')(ctx);
require('./routes/webhooks')(ctx);
require('./routes/linkedin')(ctx);
require('./routes/seo')(ctx);

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Secure server on ${PORT}`);
});
