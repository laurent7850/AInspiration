/*
  # Create opportunities table for CRM pipeline

  1. New Table
    - `opportunities` - Store sales opportunities
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, not null)
      - `company_id` (uuid, references companies, nullable)
      - `contact_id` (uuid, references contacts, nullable)
      - `product_id` (uuid, references products, nullable)
      - `stage` (text, not null)
      - `estimated_value` (numeric, nullable)
      - `close_date` (date, nullable)
      - `description` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can manage their own opportunities

  3. Performance
    - Indexes on user_id, stage, company_id
*/

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  stage text NOT NULL CHECK (stage IN ('Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu')),
  estimated_value numeric,
  close_date date,
  description text,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' AND policyname = 'Users can view their own opportunities'
  ) THEN
    CREATE POLICY "Users can view their own opportunities"
      ON opportunities
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' AND policyname = 'Users can create their own opportunities'
  ) THEN
    CREATE POLICY "Users can create their own opportunities"
      ON opportunities
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' AND policyname = 'Users can update their own opportunities'
  ) THEN
    CREATE POLICY "Users can update their own opportunities"
      ON opportunities
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' AND policyname = 'Users can delete their own opportunities'
  ) THEN
    CREATE POLICY "Users can delete their own opportunities"
      ON opportunities
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_product_id ON opportunities(product_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
