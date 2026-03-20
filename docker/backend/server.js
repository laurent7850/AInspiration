const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://n8n.srv767464.hstgr.cloud", "https://openrouter.ai"],
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

// Health check (before any auth middleware)
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/status', (req, res) => res.json({ status: 'running' }));

// ==================== AUTH MIDDLEWARE ====================

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch (e) { /* invalid token — continue without auth */ }
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.use(optionalAuth);

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    // Registration is disabled by default — set ALLOW_REGISTRATION=true to enable
    if (process.env.ALLOW_REGISTRATION !== 'true') {
      return res.status(403).json({ error: 'Registration is currently disabled. Contact admin.' });
    }

    const { email, password, name, company } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase and a number' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, created_at`,
      [id, email.toLowerCase(), password_hash, name || null, 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await pool.query(
      `INSERT INTO activities (id, user_id, type, description, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), user.id, 'user_registered', `Nouvel utilisateur: ${user.email}`, 'user', user.id]
    ).catch(() => {});

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not configured for password login' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password_hash, ...userData } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ==================== HELPERS ====================

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

// ==================== BLOG POSTS ====================

app.get('/api/blog-posts', async (req, res) => {
  try {
    const { language, status, category_id, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM blog_posts WHERE 1=1';
    const params = [];
    let pi = 1;
    if (language) { query += ` AND language = $${pi++}`; params.push(language); }
    if (status) { query += ` AND status = $${pi++}`; params.push(status); }
    if (category_id) { query += ` AND category_id = $${pi++}`; params.push(category_id); }
    query += ` ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-posts/slug/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-posts/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blog-posts', async (req, res) => {
  try {
    const { title, slug, excerpt, content, featured_image, category_id, status, language, author_name } = req.body;
    const id = uuidv4();
    const published_at = status === 'published' ? new Date() : null;
    const result = await pool.query(
      `INSERT INTO blog_posts (id, title, slug, excerpt, content, featured_image, category_id, status, published_at, language, author_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, title, slug, excerpt, content, featured_image, category_id, status || 'draft', published_at, language || 'en', author_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, featured_image, category_id, status, language, author_name } = req.body;
    const result = await pool.query(
      `UPDATE blog_posts SET title=$1, slug=$2, excerpt=$3, content=$4, featured_image=$5,
       category_id=$6, status=$7, language=$8, author_name=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [title, slug, excerpt, content, featured_image, category_id, status, language, author_name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/blog-posts/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blog-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMPANIES ====================

app.get('/api/companies', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await pool.query(
      'SELECT * FROM companies ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    const result = await pool.query(
      'SELECT * FROM companies WHERE name ILIKE $1 OR website ILIKE $1 ORDER BY name LIMIT 50',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM companies');
    const active = await pool.query("SELECT COUNT(*) FROM companies WHERE status = 'active'");
    const recent = await pool.query('SELECT * FROM companies ORDER BY created_at DESC LIMIT 5');
    res.json({
      totalCount: parseInt(total.rows[0].count),
      activeCount: parseInt(active.rows[0].count),
      recentAdditions: recent.rows
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, industry, website, address, city, country, phone, email, notes, status } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO companies (id, name, industry, website, address, city, country, phone, email, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, name, industry, website, address, city, country, phone, email, notes, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, website, address, city, country, phone, email, notes, status } = req.body;
    const result = await pool.query(
      `UPDATE companies SET name=$1, industry=$2, website=$3, address=$4, city=$5,
       country=$6, phone=$7, email=$8, notes=$9, status=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, industry, website, address, city, country, phone, email, notes, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM companies WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACTS (with company JOIN) ====================

app.get('/api/contacts', async (req, res) => {
  try {
    const { company_id, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT c.*, co.name AS company_name FROM contacts c LEFT JOIN companies co ON c.company_id = co.id';
    const params = [];
    let pi = 1;
    if (company_id) { query += ` WHERE c.company_id = $${pi++}`; params.push(company_id); }
    query += ` ORDER BY c.created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, co.name AS company_name FROM contacts c LEFT JOIN companies co ON c.company_id = co.id WHERE c.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, job_title, company_id, notes, status } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO contacts (id, first_name, last_name, email, phone, job_title, company_id, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, first_name, last_name, email, phone, job_title, company_id, notes, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, job_title, company_id, notes, status } = req.body;
    const result = await pool.query(
      `UPDATE contacts SET first_name=$1, last_name=$2, email=$3, phone=$4, job_title=$5,
       company_id=$6, notes=$7, status=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
      [first_name, last_name, email, phone, job_title, company_id, notes, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contacts WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCTS (with is_active mapping) ====================

app.get('/api/products', async (req, res) => {
  try {
    const { active_only, category, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let pi = 1;
    if (active_only === 'true') { query += ` AND status = 'active'`; }
    if (category) { query += ` AND category = $${pi++}`; params.push(category); }
    query += ` ORDER BY name LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/stats', async (req, res) => {
  try {
    const active = await pool.query("SELECT COUNT(*) FROM products WHERE status = 'active'");
    const total = await pool.query('SELECT COUNT(*) FROM products');
    const byCategory = await pool.query(
      `SELECT COALESCE(category, 'Uncategorized') as category, COUNT(*) as count, COALESCE(SUM(price), 0) as total_value
       FROM products GROUP BY category`
    );
    const categoryCounts = {};
    byCategory.rows.forEach(r => { categoryCounts[r.category] = { count: parseInt(r.count), totalValue: parseFloat(r.total_value) }; });
    res.json({ activeCount: parseInt(active.rows[0].count), totalCount: parseInt(total.rows[0].count), byCategory: categoryCounts });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, category, price, currency, is_active, status: rawStatus } = req.body;
    const id = uuidv4();
    const status = rawStatus || (is_active === false ? 'inactive' : 'active');
    const result = await pool.query(
      `INSERT INTO products (id, name, description, category, price, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, name, description, category, price, currency || 'EUR', status]
    );
    res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, currency, is_active, status: rawStatus } = req.body;
    const status = rawStatus || (is_active === false ? 'inactive' : is_active === true ? 'active' : undefined);
    const result = await pool.query(
      `UPDATE products SET name=COALESCE($1,name), description=COALESCE($2,description),
       category=COALESCE($3,category), price=COALESCE($4,price), currency=COALESCE($5,currency),
       status=COALESCE($6,status), updated_at=NOW() WHERE id=$7 RETURNING *`,
      [name, description, category, price, currency, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== OPPORTUNITIES (with JOINs + field mapping) ====================

const OPP_JOIN_QUERY = `
  SELECT o.*,
    co.name AS company_name,
    TRIM(CONCAT(ct.first_name, ' ', ct.last_name)) AS contact_name,
    p.name AS product_name
  FROM opportunities o
  LEFT JOIN companies co ON o.company_id = co.id
  LEFT JOIN contacts ct ON o.contact_id = ct.id
  LEFT JOIN products p ON o.product_id = p.id
`;

app.get('/api/opportunities', async (req, res) => {
  try {
    const { company_id, status, limit = 100, offset = 0 } = req.query;
    let query = OPP_JOIN_QUERY + ' WHERE 1=1';
    const params = [];
    let pi = 1;
    if (company_id) { query += ` AND o.company_id = $${pi++}`; params.push(company_id); }
    if (status) { query += ` AND o.status = $${pi++}`; params.push(status); }
    query += ` ORDER BY o.created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(mapOpportunity));
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const result = await pool.query(OPP_JOIN_QUERY + ' WHERE o.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/opportunities', async (req, res) => {
  try {
    const {
      name, company_id, contact_id, product_id,
      stage, status, estimated_value, value, close_date, expected_close_date,
      currency, probability, notes, user_id, owner_id
    } = req.body;
    const id = uuidv4();
    const dbStatus = stage || status || 'new';
    const dbValue = estimated_value ?? value ?? null;
    const dbCloseDate = close_date || expected_close_date || null;
    const dbOwnerId = user_id || owner_id || (req.user ? req.user.id : null);

    const result = await pool.query(
      `INSERT INTO opportunities (id, name, company_id, contact_id, product_id, value, currency, status, probability, expected_close_date, notes, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, name, company_id, contact_id, product_id, dbValue, currency || 'EUR', dbStatus, probability || 0, dbCloseDate, notes, dbOwnerId]
    );
    res.status(201).json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, company_id, contact_id, product_id,
      stage, status, estimated_value, value, close_date, expected_close_date,
      currency, probability, notes
    } = req.body;
    const dbStatus = stage || status;
    const dbValue = estimated_value ?? value;
    const dbCloseDate = close_date || expected_close_date;

    const result = await pool.query(
      `UPDATE opportunities SET
        name=COALESCE($1,name), company_id=$2, contact_id=$3, product_id=$4,
        value=COALESCE($5,value), currency=COALESCE($6,currency),
        status=COALESCE($7,status), probability=COALESCE($8,probability),
        expected_close_date=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, company_id, contact_id, product_id, dbValue, currency, dbStatus, probability, dbCloseDate, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(mapOpportunity(result.rows[0]));
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/opportunities/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM opportunities WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TASKS (with JOINs + field mapping) ====================

const TASK_JOIN_QUERY = `
  SELECT t.*,
    opp.name AS opportunity_name,
    TRIM(CONCAT(ct.first_name, ' ', ct.last_name)) AS contact_name,
    co.name AS company_name
  FROM tasks t
  LEFT JOIN opportunities opp ON t.opportunity_id = opp.id
  LEFT JOIN contacts ct ON t.contact_id = ct.id
  LEFT JOIN companies co ON t.company_id = co.id
`;

function enrichTask(row) {
  const t = mapTask(row);
  if (t.related_to_type === 'opportunity') t.related_to_name = row.opportunity_name;
  else if (t.related_to_type === 'contact') t.related_to_name = row.contact_name;
  else if (t.related_to_type === 'company') t.related_to_name = row.company_name;
  return t;
}

app.get('/api/tasks', async (req, res) => {
  try {
    const { status, priority, opportunity_id, contact_id, company_id, limit = 100, offset = 0 } = req.query;
    let query = TASK_JOIN_QUERY + ' WHERE 1=1';
    const params = [];
    let pi = 1;
    if (status) { query += ` AND t.status = $${pi++}`; params.push(status); }
    if (priority) { query += ` AND t.priority = $${pi++}`; params.push(priority); }
    if (opportunity_id) { query += ` AND t.opportunity_id = $${pi++}`; params.push(opportunity_id); }
    if (contact_id) { query += ` AND t.contact_id = $${pi++}`; params.push(contact_id); }
    if (company_id) { query += ` AND t.company_id = $${pi++}`; params.push(company_id); }
    query += ` ORDER BY t.due_date ASC NULLS LAST, t.priority DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(enrichTask));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query(TASK_JOIN_QUERY + ' WHERE t.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(enrichTask(result.rows[0]));
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, company_id, contact_id, opportunity_id, user_id, assigned_to } = req.body;
    const id = uuidv4();
    const dbAssignedTo = assigned_to || user_id || (req.user ? req.user.id : null);
    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, company_id, contact_id, opportunity_id, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, title, description, status || 'not_started', priority || 'medium', due_date, company_id, contact_id, opportunity_id, dbAssignedTo]
    );
    res.status(201).json(mapTask(result.rows[0]));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, completed_at, completed, company_id, contact_id, opportunity_id } = req.body;
    let finalStatus = status;
    let finalCompletedAt = completed_at;
    if (completed === true && finalStatus !== 'completed') { finalStatus = 'completed'; finalCompletedAt = finalCompletedAt || new Date().toISOString(); }
    else if (completed === false && status === 'completed') { finalStatus = 'not_started'; finalCompletedAt = null; }
    const result = await pool.query(
      `UPDATE tasks SET title=COALESCE($1,title), description=$2, status=COALESCE($3,status),
       priority=COALESCE($4,priority), due_date=$5, completed_at=$6,
       company_id=$7, contact_id=$8, opportunity_id=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [title, description, finalStatus, priority, due_date, finalCompletedAt, company_id, contact_id, opportunity_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(mapTask(result.rows[0]));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONTACT MESSAGES ====================

app.get('/api/contact-messages', async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    let pi = 1;
    if (status) { query += ` AND status = $${pi++}`; params.push(status); }
    if (search) {
      query += ` AND (name ILIKE $${pi} OR email ILIKE $${pi} OR company ILIKE $${pi} OR subject ILIKE $${pi} OR message ILIKE $${pi})`;
      params.push(`%${search}%`); pi++;
    }
    query += ` ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contact-messages/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT status, COUNT(*) as count FROM contact_messages GROUP BY status');
    const stats = { total: 0, new: 0, read: 0, replied: 0, archived: 0 };
    result.rows.forEach(r => { stats[r.status] = parseInt(r.count); stats.total += parseInt(r.count); });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching contact message stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contact-messages/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contact-messages', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, source } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO contact_messages (id, name, email, phone, company, subject, message, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, name, email, phone, company, subject, message, source || 'website']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contact-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await pool.query(
      'UPDATE contact_messages SET status=$1, notes=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contact-messages/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contact_messages WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ACCESS LOGS ====================

app.get('/api/access-logs', async (req, res) => {
  try {
    const { user_id, action, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM access_logs WHERE 1=1';
    const params = [];
    let pi = 1;
    if (user_id) { query += ` AND user_id = $${pi++}`; params.push(user_id); }
    if (action) { query += ` AND action = $${pi++}`; params.push(action); }
    query += ` ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/access-logs/stats', async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = user_id ? 'WHERE user_id = $1' : '';
    const p = user_id ? [user_id] : [];
    const total = await pool.query(`SELECT COUNT(*) FROM access_logs ${where}`, p);
    const byAction = await pool.query(`SELECT action, COUNT(*) as count FROM access_logs ${where} GROUP BY action ORDER BY count DESC`, p);
    const recent = await pool.query(`SELECT * FROM access_logs ${where} ORDER BY created_at DESC LIMIT 10`, p);
    res.json({ totalLogs: parseInt(total.rows[0].count), byAction: byAction.rows, recentLogs: recent.rows });
  } catch (error) {
    console.error('Error fetching access log stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/access-logs', async (req, res) => {
  try {
    const { action, ip_address, user_agent } = req.body;
    const id = uuidv4();
    const user_id = req.user ? req.user.id : null;
    const result = await pool.query(
      'INSERT INTO access_logs (id, user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, user_id, action, ip_address || req.ip, user_agent || req.headers['user-agent']]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating access log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ACTIVITIES ====================

app.get('/api/activities', async (req, res) => {
  try {
    const { entity_type, entity_id, enriched, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];
    let pi = 1;
    if (entity_type) { query += ` AND entity_type = $${pi++}`; params.push(entity_type); }
    if (entity_id) { query += ` AND entity_id = $${pi++}`; params.push(entity_id); }
    query += ` ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    let activities = result.rows;

    if (enriched === 'true' && activities.length > 0) {
      const cache = {};
      for (const act of activities) {
        if (!act.entity_type || !act.entity_id) continue;
        const key = `${act.entity_type}:${act.entity_id}`;
        if (cache[key] !== undefined) continue;
        try {
          let name = null;
          if (act.entity_type === 'opportunity') { const r = await pool.query('SELECT name FROM opportunities WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'contact') { const r = await pool.query("SELECT TRIM(CONCAT(first_name,' ',last_name)) AS name FROM contacts WHERE id=$1", [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'company') { const r = await pool.query('SELECT name FROM companies WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'product') { const r = await pool.query('SELECT name FROM products WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          else if (act.entity_type === 'task') { const r = await pool.query('SELECT title AS name FROM tasks WHERE id=$1', [act.entity_id]); name = r.rows[0]?.name; }
          cache[key] = name;
        } catch { cache[key] = null; }
      }
      activities = activities.map(a => ({ ...a, activity_type: a.type, related_to_type: a.entity_type, related_to: a.entity_id, entity_name: cache[`${a.entity_type}:${a.entity_id}`] || null }));
    } else {
      activities = activities.map(a => ({ ...a, activity_type: a.type, related_to_type: a.entity_type, related_to: a.entity_id }));
    }

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const { type, activity_type, description, entity_type, related_to_type, entity_id, related_to, metadata, user_id } = req.body;
    const id = uuidv4();
    const dbType = type || activity_type;
    const dbEntityType = entity_type || related_to_type;
    const dbEntityId = entity_id || related_to;
    const dbUserId = user_id || (req.user ? req.user.id : null);
    const result = await pool.query(
      'INSERT INTO activities (id, user_id, type, description, entity_type, entity_id, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, dbUserId, dbType, description, dbEntityType, dbEntityId, metadata ? JSON.stringify(metadata) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTER SUBSCRIBERS ====================

app.get('/api/newsletter-subscribers', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM newsletter_subscribers';
    const params = [];
    if (status) {
      const dbStatus = status === 'active' ? 'subscribed' : status;
      query += ' WHERE status = $1';
      params.push(dbStatus);
    }
    query += ` ORDER BY subscribed_at DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows.map(s => ({ ...s, status: s.status === 'subscribed' ? 'active' : s.status })));
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/newsletter-subscribers/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const result = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.json(null);
    const s = result.rows[0];
    res.json({ ...s, status: s.status === 'subscribed' ? 'active' : s.status });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/newsletter-subscribers/by-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    const result = await pool.query('SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = $1', [token]);
    if (result.rows.length === 0) return res.json(null);
    const s = result.rows[0];
    res.json({ ...s, status: s.status === 'subscribed' ? 'active' : s.status });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-subscribers', async (req, res) => {
  try {
    const { email, first_name, last_name, language, source } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].status === 'unsubscribed') {
        const result = await pool.query(
          `UPDATE newsletter_subscribers SET status='subscribed', subscribed_at=NOW(), unsubscribed_at=NULL, source=$1 WHERE email=$2 RETURNING *`,
          [source || 'website', normalizedEmail]
        );
        return res.json({ ...result.rows[0], status: 'active' });
      }
      const s = existing.rows[0];
      return res.json({ ...s, status: s.status === 'subscribed' ? 'active' : s.status });
    }
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (id, email, first_name, last_name, language, status, source, subscribed_at)
       VALUES ($1,$2,$3,$4,$5,'subscribed',$6,NOW()) RETURNING *`,
      [id, normalizedEmail, first_name, last_name, language || 'fr', source || 'website']
    );
    res.status(201).json({ ...result.rows[0], status: 'active' });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-subscribers/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;
    let query = `UPDATE newsletter_subscribers SET status='unsubscribed', unsubscribed_at=NOW() WHERE `;
    const params = [];
    if (token) { query += 'unsubscribe_token = $1'; params.push(token); }
    else if (email) { query += 'email = $1'; params.push(email.toLowerCase()); }
    else { return res.status(400).json({ error: 'Email or token required' }); }
    query += ' RETURNING *';
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/newsletter-subscribers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM newsletter_subscribers WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTERS ====================

app.get('/api/newsletters', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM newsletters';
    const params = [];
    if (status) { query += ' WHERE status = $1'; params.push(status); }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/newsletters/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletters', async (req, res) => {
  try {
    const { subject, content, html_content, language, status, scheduled_at } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO newsletters (id, subject, content, html_content, language, status, scheduled_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, subject, content, html_content, language || 'fr', status || 'draft', scheduled_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/newsletters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, html_content, status, scheduled_at, sent_at, recipients_count } = req.body;
    const result = await pool.query(
      `UPDATE newsletters SET subject=COALESCE($1,subject), content=COALESCE($2,content), html_content=$3,
       status=COALESCE($4,status), scheduled_at=$5, sent_at=$6, recipients_count=COALESCE($7,recipients_count), updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [subject, content, html_content, status, scheduled_at, sent_at, recipients_count, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/newsletters/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM newsletters WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Newsletter not found' });
    res.json({ message: 'Newsletter deleted' });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTER SEND LOGS ====================

app.get('/api/newsletter-send-logs', async (req, res) => {
  try {
    const { newsletter_id } = req.query;
    let query = 'SELECT l.*, s.email AS subscriber_email FROM newsletter_send_logs l LEFT JOIN newsletter_subscribers s ON l.subscriber_id = s.id';
    const params = [];
    if (newsletter_id) { query += ' WHERE l.newsletter_id = $1'; params.push(newsletter_id); }
    query += ' ORDER BY l.sent_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching send logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/newsletter-send-logs', async (req, res) => {
  try {
    const { newsletter_id, subscriber_id, status, error_message } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO newsletter_send_logs (id, newsletter_id, subscriber_id, status, sent_at, error_message) VALUES ($1,$2,$3,$4,NOW(),$5) RETURNING *',
      [id, newsletter_id, subscriber_id, status || 'sent', error_message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating send log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/newsletter-send-logs', async (req, res) => {
  try {
    const { newsletter_id, subscriber_id, ...updates } = req.body;
    const sets = []; const params = []; let pi = 1;
    for (const [k, v] of Object.entries(updates)) {
      if (['status', 'opened_at', 'clicked_at', 'error_message'].includes(k)) { sets.push(`${k}=$${pi++}`); params.push(v); }
    }
    if (!sets.length) return res.status(400).json({ error: 'No valid fields' });
    params.push(newsletter_id, subscriber_id);
    const result = await pool.query(`UPDATE newsletter_send_logs SET ${sets.join(',')} WHERE newsletter_id=$${pi++} AND subscriber_id=$${pi} RETURNING *`, params);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error updating send log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== NEWSLETTER STATS ====================

app.get('/api/newsletter-stats', async (req, res) => {
  try {
    const subs = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='subscribed') as active, COUNT(*) FILTER (WHERE status='unsubscribed') as unsubscribed FROM newsletter_subscribers`);
    const nl = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='sent') as sent FROM newsletters`);
    const s = subs.rows[0]; const n = nl.rows[0];
    res.json({
      totalSubscribers: parseInt(s.total), activeSubscribers: parseInt(s.active), unsubscribedCount: parseInt(s.unsubscribed),
      totalNewsletters: parseInt(n.total), sentNewsletters: parseInt(n.sent)
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== WEBHOOK PASSTHROUGH (n8n) ====================

const N8N_BASE = process.env.N8N_BASE || 'https://n8n.srv767464.hstgr.cloud/webhook';

app.post('/api/webhook/chat', webhookLimiter, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/ainspiration`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to n8n chat:', error.message);
    res.status(502).json({ message: 'Le chatbot est temporairement indisponible. Veuillez réessayer.' });
  }
});

app.post('/api/webhook/newsletter-send', webhookLimiter, requireAuth, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/newsletter-send`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to n8n newsletter-send:', error.message);
    res.status(502).json({ success: false, message: 'Erreur de connexion au service d\'envoi' });
  }
});

app.post('/api/webhook/newsletter-generate', webhookLimiter, requireAuth, async (req, res) => {
  try {
    const n8nUrl = `${N8N_BASE}/newsletter-generate`;
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error forwarding to n8n newsletter-generate:', error.message);
    res.status(502).json({ subject: '', content: '', error: 'Erreur de connexion au service de génération' });
  }
});

// ==================== LINKEDIN AUTO-PUBLISHING ====================

const linkedin = require('./linkedin');
const contentGenerator = require('./content-generator');

// LinkedIn OAuth — Connect
app.get('/api/linkedin/connect', requireAuth, (req, res) => {
  try {
    if (!process.env.LINKEDIN_CLIENT_ID) {
      return res.status(500).json({ error: 'LinkedIn not configured. Set LINKEDIN_CLIENT_ID.' });
    }
    const state = `ainspiration-${Date.now()}`;
    const url = linkedin.getAuthUrl(state);
    res.json({ url, state });
  } catch (error) {
    console.error('LinkedIn connect error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn OAuth — Callback
app.get('/api/linkedin/callback', async (req, res) => {
  try {
    const { code, error: oauthError } = req.query;
    if (oauthError) {
      return res.redirect('/?linkedin_error=' + encodeURIComponent(oauthError));
    }
    if (!code) {
      return res.redirect('/?linkedin_error=no_code');
    }

    const tokenData = await linkedin.exchangeCode(code);
    const profile = await linkedin.getProfile(tokenData.access_token);
    await linkedin.storeToken(
      pool,
      tokenData.access_token,
      tokenData.expires_in,
      tokenData.scope || 'openid profile w_member_social',
      profile.sub,
      { name: profile.name, email: profile.email, picture: profile.picture }
    );

    console.log(`[LinkedIn] Connected: ${profile.name} (${profile.sub})`);
    res.redirect('/?linkedin_connected=true');
  } catch (error) {
    console.error('LinkedIn callback error:', error.message);
    res.redirect('/?linkedin_error=' + encodeURIComponent(error.message));
  }
});

// LinkedIn — Connection status
app.get('/api/linkedin/status', requireAuth, async (req, res) => {
  try {
    const status = await linkedin.getConnectionStatus(pool);
    res.json(status);
  } catch (error) {
    res.json({ connected: false, error: error.message });
  }
});

// LinkedIn Posts — List
app.get('/api/linkedin/posts', requireAuth, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    let query = `SELECT * FROM linkedin_posts WHERE deleted_at IS NULL`;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    const countResult = await pool.query(`SELECT COUNT(*) FROM linkedin_posts WHERE deleted_at IS NULL`);
    res.json({ posts: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (error) {
    console.error('LinkedIn posts list error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Posts — Generate manually
app.post('/api/linkedin/posts/generate', requireAuth, async (req, res) => {
  try {
    const post = await contentGenerator.generatePost(pool);
    console.log(`[LinkedIn] Post generated: ${post.title} (${post.status})`);
    res.json(post);
  } catch (error) {
    console.error('LinkedIn generate error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Posts — Publish
app.post('/api/linkedin/posts/:id/publish', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const postResult = await pool.query(`SELECT * FROM linkedin_posts WHERE id = $1 AND deleted_at IS NULL`, [id]);
    if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = postResult.rows[0];
    if (post.status === 'published') return res.status(400).json({ error: 'Already published' });

    const result = await linkedin.publishPost(pool, post.content);

    await pool.query(`
      UPDATE linkedin_posts
      SET status = 'published', linkedin_post_id = $2, linkedin_post_url = $3, published_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id, result.postId, result.postUrl]);

    console.log(`[LinkedIn] Post published: ${id}`);
    res.json({ success: true, postId: result.postId, postUrl: result.postUrl });
  } catch (error) {
    console.error('LinkedIn publish error:', error.message);
    await pool.query(`UPDATE linkedin_posts SET status = 'failed', error_message = $2, updated_at = NOW() WHERE id = $1`, [req.params.id, error.message]).catch(() => {});
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Posts — Approve
app.post('/api/linkedin/posts/:id/approve', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`
      UPDATE linkedin_posts
      SET status = 'approved', approved_by = $2, approved_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `, [id, req.user?.email || 'admin']);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Posts — Edit
app.put('/api/linkedin/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title, hook, cta, hashtags, status } = req.body;
    const fields = [];
    const values = [id];
    let idx = 2;

    if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (hook !== undefined) { fields.push(`hook = $${idx++}`); values.push(hook); }
    if (cta !== undefined) { fields.push(`cta = $${idx++}`); values.push(cta); }
    if (hashtags !== undefined) { fields.push(`hashtags = $${idx++}`); values.push(hashtags); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    fields.push('updated_at = NOW()');

    await pool.query(`UPDATE linkedin_posts SET ${fields.join(', ')} WHERE id = $1 AND deleted_at IS NULL`, values);
    const result = await pool.query(`SELECT * FROM linkedin_posts WHERE id = $1`, [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Posts — Delete (soft)
app.delete('/api/linkedin/posts/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(`UPDATE linkedin_posts SET deleted_at = NOW() WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Settings — Get
app.get('/api/linkedin/settings', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT key, value FROM linkedin_settings`);
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Settings — Update
app.put('/api/linkedin/settings', requireAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
    await pool.query(`
      INSERT INTO linkedin_settings (key, value, updated_at) VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, JSON.stringify(value)]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn Webhook — n8n automated generate + publish
app.post('/api/webhook/linkedin-post', webhookLimiter, async (req, res) => {
  try {
    const webhookSecret = req.headers['x-webhook-secret'];
    if (!process.env.WEBHOOK_SECRET || !webhookSecret || webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    console.log('[LinkedIn Webhook] Generating weekly post...');
    const post = await contentGenerator.generatePost(pool);
    console.log(`[LinkedIn Webhook] Post generated: ${post.title} (status: ${post.status})`);

    // Check if auto-publish is enabled and post doesn't need review
    const configResult = await pool.query(`SELECT value FROM linkedin_settings WHERE key = 'linkedin_config'`);
    const config = configResult.rows[0]?.value || {};

    if (config.auto_publish && post.status !== 'review_pending') {
      try {
        const publishResult = await linkedin.publishPost(pool, post.content);
        await pool.query(`
          UPDATE linkedin_posts
          SET status = 'published', linkedin_post_id = $2, linkedin_post_url = $3, published_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [post.id, publishResult.postId, publishResult.postUrl]);
        console.log(`[LinkedIn Webhook] Auto-published: ${publishResult.postUrl}`);
        res.json({ success: true, postId: post.id, published: true, linkedinUrl: publishResult.postUrl });
      } catch (pubError) {
        console.error('[LinkedIn Webhook] Auto-publish failed:', pubError.message);
        await pool.query(`UPDATE linkedin_posts SET status = 'queued', error_message = $2 WHERE id = $1`, [post.id, pubError.message]);
        res.json({ success: true, postId: post.id, published: false, error: pubError.message });
      }
    } else {
      res.json({ success: true, postId: post.id, published: false, status: post.status });
    }
  } catch (error) {
    console.error('[LinkedIn Webhook] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATIC FILES + SPA FALLBACK ====================

const path = require('path');
const distPath = path.join(__dirname, 'dist');

// Serve static frontend files (if dist/ exists alongside server.js)
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|avif|ico|gif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.xml') || filePath.endsWith('.txt')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// 404 for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback: any non-API route serves index.html
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(distPath, 'index.html'));
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Secure server on ${PORT}`);
});
