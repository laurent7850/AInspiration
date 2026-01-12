/*
  # Update contacts table to properly relate to companies

  1. Changes:
    - Add company_id foreign key relationship to contacts table
    - Update contacts to associate with companies via foreign key
    - Add an index for more efficient lookups

  2. Benefits:
    - Proper database relationship between contacts and companies
    - Foreign key ensures data integrity
    - Improved query performance
*/

-- Check if contacts table has company_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'company_id'
  ) THEN
    -- If not, add the column with foreign key constraint
    ALTER TABLE contacts ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
  ELSE
    -- If exists but doesn't have foreign key, add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'contacts' 
      AND ccu.column_name = 'company_id'
    ) THEN
      -- Drop column and recreate with correct foreign key
      ALTER TABLE contacts DROP COLUMN company_id;
      ALTER TABLE contacts ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- Create index on company_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_contacts_company_id'
  ) THEN
    CREATE INDEX idx_contacts_company_id ON contacts(company_id);
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Contacts table does not exist. Please create it first.';
END $$;