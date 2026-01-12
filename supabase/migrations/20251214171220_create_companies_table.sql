/*
  # Create companies table for CRM

  1. New Table
    - `companies` - Store company information
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `address` (text, nullable)
      - `website` (text, nullable)
      - `tva_number` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - All authenticated users can view, create, update, and delete companies

  3. Performance
    - Index on name for faster searches
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  website text,
  tva_number text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Authenticated users can view companies'
  ) THEN
    CREATE POLICY "Authenticated users can view companies"
      ON companies
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Authenticated users can create companies'
  ) THEN
    CREATE POLICY "Authenticated users can create companies"
      ON companies
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Authenticated users can update companies'
  ) THEN
    CREATE POLICY "Authenticated users can update companies"
      ON companies
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Authenticated users can delete companies'
  ) THEN
    CREATE POLICY "Authenticated users can delete companies"
      ON companies
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_tva_number ON companies(tva_number);
