/*
  # Create contacts table for CRM

  1. New Table
    - `contacts` - Store contact information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text, nullable)
      - `position` (text, nullable)
      - `company_id` (uuid, references companies, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can manage their own contacts

  3. Performance
    - Indexes on user_id, email, company_id
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' AND policyname = 'Users can view their own contacts'
  ) THEN
    CREATE POLICY "Users can view their own contacts"
      ON contacts
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
    WHERE tablename = 'contacts' AND policyname = 'Users can create their own contacts'
  ) THEN
    CREATE POLICY "Users can create their own contacts"
      ON contacts
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
    WHERE tablename = 'contacts' AND policyname = 'Users can update their own contacts'
  ) THEN
    CREATE POLICY "Users can update their own contacts"
      ON contacts
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
    WHERE tablename = 'contacts' AND policyname = 'Users can delete their own contacts'
  ) THEN
    CREATE POLICY "Users can delete their own contacts"
      ON contacts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
