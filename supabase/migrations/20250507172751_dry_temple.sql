/*
  # Task management table with proper relationships

  1. New Tables/Columns
    - `tasks` table with relations to opportunities, contacts, and companies
    - Support for explicit foreign keys to related entities
    - Backward compatibility with generic related_to fields

  2. Security
    - Row Level Security (RLS) for proper data isolation
    - Policies for authenticated users

  3. Performance
    - Indexes on frequently queried columns
    - Optimized relationships for joins
*/

-- Check if tasks table exists
DO $$ 
BEGIN
  -- Create tasks table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tasks') THEN
    CREATE TABLE tasks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text,
      due_date timestamp with time zone,
      priority text NOT NULL DEFAULT 'medium'::text CHECK (priority IN ('low', 'medium', 'high')),
      status text NOT NULL DEFAULT 'not_started'::text CHECK (status IN ('not_started', 'in_progress', 'completed', 'waiting', 'deferred')),
      completed boolean NOT NULL DEFAULT false,
      completed_at timestamp with time zone,
      -- Generic relationship fields (keep for backward compatibility)
      related_to_type text CHECK (related_to_type IN ('opportunity', 'contact', 'company')),
      related_to uuid,
      -- New explicit foreign key fields
      opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
      contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
      company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Enable RLS
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

    -- Create trigger for updated_at
    CREATE TRIGGER update_tasks_updated_at
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Create policy for user access
    CREATE POLICY "Allow users to manage their own tasks"
      ON tasks
      FOR ALL
      TO public
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

  -- If table exists, check if we need to add the new columns
  ELSE
    -- Add opportunity_id if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'opportunity_id'
    ) THEN
      ALTER TABLE tasks ADD COLUMN opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL;
    END IF;
    
    -- Add contact_id if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'contact_id'
    ) THEN
      ALTER TABLE tasks ADD COLUMN contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
    
    -- Add company_id if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'company_id'
    ) THEN
      ALTER TABLE tasks ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- Create trigger for updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_tasks_updated_at'
  ) THEN
    CREATE TRIGGER update_tasks_updated_at
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Ensure RLS is enabled
  ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

  -- Create policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Allow users to manage their own tasks'
  ) THEN
    CREATE POLICY "Allow users to manage their own tasks"
      ON tasks
      FOR ALL
      TO public
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for better performance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_user_id') THEN
    CREATE INDEX idx_tasks_user_id ON tasks(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_opportunity_id') THEN
    CREATE INDEX idx_tasks_opportunity_id ON tasks(opportunity_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_contact_id') THEN
    CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_company_id') THEN
    CREATE INDEX idx_tasks_company_id ON tasks(company_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_related_to') THEN
    CREATE INDEX idx_tasks_related_to ON tasks(related_to_type, related_to);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_due_date') THEN
    CREATE INDEX idx_tasks_due_date ON tasks(due_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_completed') THEN
    CREATE INDEX idx_tasks_completed ON tasks(completed);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Data migration: update opportunity_id based on related_to
DO $$
BEGIN
  UPDATE tasks
  SET opportunity_id = related_to
  WHERE related_to_type = 'opportunity' 
    AND related_to IS NOT NULL
    AND opportunity_id IS NULL;
  
  UPDATE tasks
  SET contact_id = related_to
  WHERE related_to_type = 'contact' 
    AND related_to IS NOT NULL
    AND contact_id IS NULL;
  
  UPDATE tasks
  SET company_id = related_to
  WHERE related_to_type = 'company' 
    AND related_to IS NOT NULL
    AND company_id IS NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;