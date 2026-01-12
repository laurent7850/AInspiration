/*
  # Ajout du pipeline commercial (opportunities)
  
  1. Structure
    - Type enum pour les étapes du pipeline
    - Table opportunities avec relations vers contacts, companies et products
    - Trigger pour updated_at

  2. Sécurité
    - RLS activé
    - Politique pour gérer ses propres opportunités
  
  3. Performance
    - Index sur les colonnes fréquemment utilisées
*/

-- Création du type enum pour les étapes de l'opportunité
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_stage') THEN
    CREATE TYPE opportunity_stage AS ENUM (
      'Qualification',
      'Proposition',
      'Négociation',
      'Gagné',
      'Perdu'
    );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Création de la table opportunities
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'opportunities') THEN
    CREATE TABLE opportunities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
      contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
      stage text NOT NULL CHECK (stage = ANY (ARRAY['Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu']::text[])),
      estimated_value numeric,
      close_date date,
      description text,
      created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
      updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      product_id uuid REFERENCES products(id) ON DELETE SET NULL
    );
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Activer RLS si ce n'est pas déjà fait
DO $$ 
BEGIN
  ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Vérifier si le trigger existe déjà avant de le créer
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_opportunities_updated_at'
    AND tgrelid = 'opportunities'::regclass
  ) THEN
    CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- Vérifier si la politique existe déjà avant de la créer
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'opportunities' 
    AND policyname = 'Allow users to manage their own opportunities'
  ) THEN
    CREATE POLICY "Allow users to manage their own opportunities"
      ON opportunities
      FOR ALL
      TO public
      USING (uid() = user_id)
      WITH CHECK (uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Créer des index pour améliorer les performances (s'ils n'existent pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_opportunities_user_id') THEN
    CREATE INDEX idx_opportunities_user_id ON opportunities(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_opportunities_company_id') THEN
    CREATE INDEX idx_opportunities_company_id ON opportunities(company_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_opportunities_product_id') THEN
    CREATE INDEX idx_opportunities_product_id ON opportunities(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_opportunities_stage') THEN
    CREATE INDEX idx_opportunities_stage ON opportunities(stage);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;