-- =====================================================
-- Migration 005 : cloisonnement démo / données réelles
-- =====================================================
-- La migration 003 avait ajouté owner_id aux contacts, opportunités, tâches
-- et activités. Il manquait companies, products et contact_messages : ces
-- trois tables étaient lisibles par n'importe quel compte authentifié — dont
-- le compte démo, dont les identifiants sont publics.
--
-- Cette migration ajoute la colonne manquante, attribue l'existant, et
-- garantit que le compte démo n'est pas administrateur (ownerScope() renvoie
-- NULL pour un admin, ce qui annule tout le cloisonnement).
--
-- Idempotente : rejouable sans risque.
-- =====================================================

ALTER TABLE companies        ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE products         ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

DO $$
DECLARE
  admin_uuid UUID;
  demo_uuid  UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  SELECT id INTO admin_uuid FROM users WHERE email = 'admin@ainspiration.eu' LIMIT 1;
  IF admin_uuid IS NULL THEN
    SELECT id INTO admin_uuid FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  END IF;

  -- Tout ce qui existe déjà appartient à l'administrateur.
  IF admin_uuid IS NOT NULL THEN
    UPDATE companies        SET owner_id = admin_uuid WHERE owner_id IS NULL;
    UPDATE products         SET owner_id = admin_uuid WHERE owner_id IS NULL;
    UPDATE contact_messages SET owner_id = admin_uuid WHERE owner_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE id = demo_uuid) THEN
    -- Les lignes du jeu de démonstration appartiennent au compte démo.
    -- NB : les colonnes id sont de type uuid — la comparaison LIKE exige ::text.
    UPDATE companies        SET owner_id = demo_uuid WHERE id::text LIKE 'c0000000-%';
    UPDATE products         SET owner_id = demo_uuid WHERE id::text LIKE 'e0000000-%';
    UPDATE contact_messages SET owner_id = demo_uuid WHERE id::text LIKE 'a1000000-%';
    UPDATE contacts         SET owner_id = demo_uuid WHERE id::text LIKE 'd0000000-%';

    -- Le compte démo ne doit JAMAIS être administrateur.
    UPDATE users SET role = 'user' WHERE id = demo_uuid AND role = 'admin';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_owner        ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_owner         ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_owner ON contact_messages(owner_id);

-- =====================================================
-- Vérification après exécution : aucune des trois tables ne doit
-- contenir de ligne sans propriétaire.
--
--   SELECT 'companies' AS t, COUNT(*) FROM companies        WHERE owner_id IS NULL
--   UNION ALL SELECT 'products',  COUNT(*) FROM products         WHERE owner_id IS NULL
--   UNION ALL SELECT 'messages',  COUNT(*) FROM contact_messages WHERE owner_id IS NULL;
--
-- Et le compte démo ne doit pas être admin :
--   SELECT email, role FROM users WHERE id = 'a0000000-0000-0000-0000-000000000001';
-- =====================================================
