-- =====================================================
-- AInspiration CRM Demo Data Seed
-- =====================================================

-- Demo user (password: Demo2026!)
-- bcrypt hash generated for 'Demo2026!'
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'demo@ainspiration.eu', '$2b$10$TtT9Hf/L9oaizfaD2xUIa.6ITGVIMAUaDi11KTvXPubanBwf7xd1q', 'Utilisateur Demo', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- =====================================================
-- Companies (12 entreprises belges/françaises réalistes)
-- =====================================================
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
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Contacts (20 contacts liés aux entreprises)
-- =====================================================
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
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Products (8 services/produits AInspiration)
-- =====================================================
INSERT INTO products (id, name, description, price, currency, category, status) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Audit IA Gratuit', 'Analyse complète de vos processus et recommandations d''automatisation. Livré en 24h.', 0.00, 'EUR', 'Audit', 'active'),
  ('e0000000-0000-0000-0000-000000000002', 'Chatbot IA 24/7', 'Assistant virtuel intelligent pour votre site web. Répond à vos clients 24h/24.', 299.00, 'EUR', 'Automatisation', 'active'),
  ('e0000000-0000-0000-0000-000000000003', 'Automatisation Marketing', 'Création de contenu IA, newsletters automatisées, planning réseaux sociaux.', 499.00, 'EUR', 'Marketing', 'active'),
  ('e0000000-0000-0000-0000-000000000004', 'CRM Intelligent', 'CRM avec scoring de leads IA, suivi pipeline et prédictions de vente.', 199.00, 'EUR', 'CRM', 'active'),
  ('e0000000-0000-0000-0000-000000000005', 'Formation IA Équipe', 'Formation sur mesure pour vos équipes. De l''initiation à l''expertise.', 1500.00, 'EUR', 'Formation', 'active'),
  ('e0000000-0000-0000-0000-000000000006', 'Analyse de Données IA', 'Tableaux de bord intelligents et insights automatiques sur vos données.', 399.00, 'EUR', 'Analyse', 'active'),
  ('e0000000-0000-0000-0000-000000000007', 'Pack PME Starter', 'Chatbot + CRM + Automatisation marketing. Offre combinée.', 799.00, 'EUR', 'Pack', 'active'),
  ('e0000000-0000-0000-0000-000000000008', 'Pack PME Premium', 'Toutes nos solutions + formation + support prioritaire 12 mois.', 2499.00, 'EUR', 'Pack', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Opportunities (15 opportunités à différents stades)
-- =====================================================
INSERT INTO opportunities (id, name, company_id, contact_id, value, currency, status, probability, expected_close_date, notes, owner_id) VALUES
  -- WON (3)
  ('f0000000-0000-0000-0000-000000000001', 'Chatbot réservations Brasserie', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 299.00, 'EUR', 'won', 100, '2026-01-15', 'Déployé et opérationnel. Client très satisfait.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002', 'Pack contenu IA Pixel Studio', 'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000009', 499.00, 'EUR', 'won', 100, '2025-12-20', 'Client ambassadeur. Renouvellement prévu.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000003', 'Newsletter IA BioShop', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000008', 499.00, 'EUR', 'won', 100, '2026-02-10', 'Taux d''ouverture passé de 15% à 38%.', 'a0000000-0000-0000-0000-000000000001'),

  -- NEGOTIATION (3)
  ('f0000000-0000-0000-0000-000000000004', 'Pack PME Premium TechWave', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 2499.00, 'EUR', 'negotiation', 70, '2026-04-15', 'Négociation sur la durée d''engagement. CTO convaincu.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000005', 'Optimisation routes IA Transport', 'c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', 4990.00, 'EUR', 'negotiation', 60, '2026-05-01', 'POC réussi sur 5 camions. Négociation pour la flotte complète.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000006', 'Formation IA Cabinet Martin', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000006', 1500.00, 'EUR', 'negotiation', 65, '2026-04-30', 'Formation 2 jours pour 12 collaborateurs. Budget validé en interne.', 'a0000000-0000-0000-0000-000000000001'),

  -- PROPOSITION (4)
  ('f0000000-0000-0000-0000-000000000007', 'CRM + Chatbot Dupont Immo', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 799.00, 'EUR', 'proposition', 50, '2026-05-15', 'Proposition envoyée. Attend retour de la directrice.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000008', 'Rétention IA Fitness Premium', 'c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000014', 399.00, 'EUR', 'proposition', 45, '2026-05-20', 'Analyse churn envoyée. Résultats impressionnants.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000009', 'Automatisation docs Cabinet Moreau', 'c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000015', 799.00, 'EUR', 'proposition', 55, '2026-04-25', 'Démo réalisée. Très intéressé par la génération de contrats.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000010', 'Chatbot vétérinaire Collines', 'c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000012', 299.00, 'EUR', 'proposition', 40, '2026-06-01', 'Proposition RDV en ligne + rappels automatiques.', 'a0000000-0000-0000-0000-000000000001'),

  -- QUALIFICATION (3)
  ('f0000000-0000-0000-0000-000000000011', 'Pack Starter Green Garden', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 799.00, 'EUR', 'qualification', 25, '2026-06-15', 'Premier RDV positif. Audit en cours.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000012', 'E-commerce IA Chocolaterie', 'c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000013', 499.00, 'EUR', 'qualification', 20, '2026-07-01', 'Intéressé par recommandations produits IA.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000013', 'Coaching IA Isabelle Fontaine', NULL, 'd0000000-0000-0000-0000-000000000016', 199.00, 'EUR', 'qualification', 30, '2026-05-30', 'Indépendante. CRM simple + automatisation.', 'a0000000-0000-0000-0000-000000000001'),

  -- LOST (2)
  ('f0000000-0000-0000-0000-000000000014', 'Analyse données BioShop (avancée)', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000019', 399.00, 'EUR', 'lost', 0, '2026-02-28', 'Budget insuffisant cette année. À relancer en 2027.', 'a0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000015', 'Chatbot Julien Renard', NULL, 'd0000000-0000-0000-0000-000000000017', 299.00, 'EUR', 'lost', 0, '2026-03-01', 'A choisi un concurrent moins cher. Qualité inférieure.', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Tasks (12 tâches variées)
-- =====================================================
INSERT INTO tasks (id, title, description, due_date, priority, status, company_id, contact_id, opportunity_id, assigned_to) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Préparer démo CRM pour TechWave', 'Personnaliser la démo avec leurs données métier. Inclure scoring leads.', '2026-03-20 10:00:00+01', 'high', 'in_progress', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Envoyer contrat Transport Lefebvre', 'Contrat pour déploiement flotte complète (30 camions).', '2026-03-22 14:00:00+01', 'high', 'pending', 'c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Relancer Marie Dupont (Immo)', 'Relancer pour retour sur proposition CRM + Chatbot.', '2026-03-19 09:00:00+01', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'Audit IA Green Garden', 'Réaliser l''audit gratuit pour Lucas. Focus: planning et devis.', '2026-03-25 11:00:00+01', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000005', 'Préparer formation Cabinet Martin', 'Support de formation IA pour comptables. 2 jours.', '2026-04-10 09:00:00+02', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000006', 'Suivi mensuel Brasserie du Hainaut', 'Call mensuel de suivi. Vérifier stats chatbot et satisfaction.', '2026-03-28 15:00:00+01', 'low', 'pending', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000007', 'Rapport ROI Pixel Studio', 'Générer le rapport trimestriel de performance contenu IA.', '2026-03-31 16:00:00+02', 'low', 'in_progress', 'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000008', 'Configurer chatbot Vétérinaire', 'Configurer les flux RDV et rappels pour la clinique.', '2026-04-05 10:00:00+02', 'medium', 'pending', NULL, 'd0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000009', 'Appeler Sarah Dewaele (Fitness)', 'Discuter résultats analyse churn et prochaines étapes.', '2026-03-18 11:00:00+01', 'high', 'completed', 'c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000010', 'Mise à jour newsletter BioShop', 'Optimiser les templates avec les nouvelles données de vente.', '2026-03-21 14:00:00+01', 'low', 'completed', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000011', 'Envoyer proposition Chocolaterie', 'Proposition recommandations produits IA pour e-commerce.', '2026-03-24 10:00:00+01', 'medium', 'pending', 'c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000012', 'Webinar IA pour PME - Mars 2026', 'Organiser le webinar mensuel. Thème: automatisation service client.', '2026-03-27 09:00:00+01', 'high', 'in_progress', NULL, NULL, NULL, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Contact Messages (5 messages du formulaire)
-- =====================================================
INSERT INTO contact_messages (id, name, email, company, phone, subject, message, source, status) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Marc Janssen', 'marc.janssen@example.be', 'Janssen & Co', '+32 476 11 22 33', 'Demande d''information IA', 'Bonjour, je suis intéressé par vos solutions d''automatisation pour mon entreprise de 15 personnes. Pouvez-vous me recontacter ?', 'website', 'new'),
  ('a1000000-0000-0000-0000-000000000002', 'Laura Devos', 'laura.devos@startup.be', 'StartupBE', '+32 488 33 44 55', 'Chatbot pour e-commerce', 'Nous cherchons un chatbot intelligent pour notre boutique en ligne. Budget: environ 300€/mois. Quelles sont vos options ?', 'website', 'read'),
  ('a1000000-0000-0000-0000-000000000003', 'Michel Peeters', 'michel@peeters-bouw.be', 'Peeters Construction', '+32 479 55 66 77', 'Automatisation devis', 'Est-il possible d''automatiser la création de devis dans le secteur de la construction ? Nous en faisons environ 50 par mois.', 'website', 'replied'),
  ('a1000000-0000-0000-0000-000000000004', 'Claire Dumont', 'claire.dumont@gmail.com', NULL, '+33 6 99 88 77 66', 'Formation IA individuelle', 'Je suis freelance en marketing digital et j''aimerais me former à l''IA. Proposez-vous des formations individuelles ?', 'website', 'new'),
  ('a1000000-0000-0000-0000-000000000005', 'David Hermans', 'david@hermans-transport.be', 'Hermans Transport', '+32 495 77 88 99', 'Partenariat logistique IA', 'Suite à votre article sur l''optimisation de routes par IA, nous aimerions en discuter pour notre flotte de 12 véhicules.', 'website', 'new')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Activities (recent activity feed)
-- =====================================================
INSERT INTO activities (id, user_id, type, description, entity_type, entity_id, created_at) VALUES
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'opportunity_won', 'Opportunité gagnée: Newsletter IA BioShop (499€)', 'opportunity', 'f0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'contact_created', 'Nouveau contact: Céline Rousseau (Freelance marketing)', 'contact', 'd0000000-0000-0000-0000-000000000020', NOW() - INTERVAL '4 days'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'opportunity_updated', 'Opportunité avancée en négociation: Pack PME Premium TechWave', 'opportunity', 'f0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '3 days'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'task_completed', 'Tâche terminée: Appeler Sarah Dewaele (Fitness)', 'task', 'b0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '2 days'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'company_created', 'Nouvelle entreprise: Cabinet Avocat Moreau', 'company', 'c0000000-0000-0000-0000-000000000012', NOW() - INTERVAL '2 days'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'opportunity_created', 'Nouvelle opportunité: Automatisation docs Cabinet Moreau (799€)', 'opportunity', 'f0000000-0000-0000-0000-000000000009', NOW() - INTERVAL '1 day'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'task_created', 'Nouvelle tâche: Webinar IA pour PME - Mars 2026', 'task', 'b0000000-0000-0000-0000-000000000012', NOW() - INTERVAL '12 hours'),
  (uuid_generate_v4(), 'a0000000-0000-0000-0000-000000000001', 'contact_updated', 'Contact mis à jour: Sophie Leclercq (TechWave)', 'contact', 'd0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;
