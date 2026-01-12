/*
  # Add TVA/VAT number to companies table
  
  1. New Columns
    - `tva_number` (text, nullable) - Store the company TVA/VAT number
  
  2. Benefits
    - Proper fiscal identification for companies
    - Support for tax-related features in the future
    - Compliance with business requirements
*/

-- Add TVA number column to companies table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'tva_number'
  ) THEN
    ALTER TABLE companies ADD COLUMN tva_number text;
  END IF;
END $$;

-- Add index for TVA number lookups (optional but recommended)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_companies_tva_number'
  ) THEN
    CREATE INDEX idx_companies_tva_number ON companies(tva_number);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN companies.tva_number IS 'Numéro de TVA/VAT de l''entreprise';