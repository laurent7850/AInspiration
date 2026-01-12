/*
  # Add uniqueness constraint to contacts table per user
  
  1. Changes
    - Add a unique constraint to ensure each user can only have one contact with a given email
    - This prevents duplicate contacts with the same email address for a single user
    
  2. Benefits
    - Improves data integrity
    - Prevents duplicate entries
    - Makes search and filtering more reliable
*/

-- Add unique constraint for email per user_id
DO $$ 
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contacts_user_id_email_unique'
  ) THEN
    ALTER TABLE contacts 
    ADD CONSTRAINT contacts_user_id_email_unique 
    UNIQUE (user_id, email);
  END IF;
END $$;

-- Add a helper index to improve lookup by email
DO $$ 
BEGIN
  -- Check if the index already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contacts_email_lookup'
  ) THEN
    CREATE INDEX idx_contacts_email_lookup ON contacts(email, user_id);
  END IF;
END $$;

-- Add a functional index to support case-insensitive searches
DO $$ 
BEGIN
  -- Check if the index already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contacts_email_lower'
  ) THEN
    CREATE INDEX idx_contacts_email_lower ON contacts(lower(email));
  END IF;
END $$;

COMMENT ON CONSTRAINT contacts_user_id_email_unique ON contacts IS 'Ensures each user can only have one contact with a specific email address';