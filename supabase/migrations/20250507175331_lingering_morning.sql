/*
  # Create companies table

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, not null, unique)
      - `address` (text, nullable)
      - `website` (text, nullable)
      - `created_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on companies table
    - Create policies for authenticated users
  
  3. Performance
    - Add indexes for commonly queried fields
*/

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  website text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add unique constraint on company name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_company_name'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT unique_company_name UNIQUE (name);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
  -- Policy for read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Allow authenticated read access'
  ) THEN
    CREATE POLICY "Allow authenticated read access" 
      ON companies FOR SELECT 
      TO public 
      USING (role() = 'authenticated');
  END IF;

  -- Policy for insert access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Allow authenticated insert access'
  ) THEN
    CREATE POLICY "Allow authenticated insert access" 
      ON companies FOR INSERT 
      TO public 
      WITH CHECK (role() = 'authenticated');
  END IF;

  -- Policy for update access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Allow authenticated update access'
  ) THEN
    CREATE POLICY "Allow authenticated update access" 
      ON companies FOR UPDATE 
      TO public 
      USING (role() = 'authenticated')
      WITH CHECK (role() = 'authenticated');
  END IF;

  -- Policy for delete access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'companies' AND policyname = 'Allow authenticated delete access'
  ) THEN
    CREATE POLICY "Allow authenticated delete access" 
      ON companies FOR DELETE 
      TO public 
      USING (role() = 'authenticated');
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create indexes for better performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_companies_name'
  ) THEN
    CREATE INDEX idx_companies_name ON companies (name);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Add a comment to explain the purpose of the table
COMMENT ON TABLE companies IS 'Stocke les informations sur les entreprises clientes et prospects.';