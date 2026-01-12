/*
  # Create activities table for tracking CRM actions

  1. New Table
    - `activities` - Track user actions in the CRM
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `activity_type` (text) - Type of activity (e.g. opportunity_created, contact_updated)
      - `description` (text) - Human-readable description of the activity
      - `related_to_type` (text) - Type of entity this activity relates to
      - `related_to` (uuid) - ID of the related entity
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Allow users to see their own activities
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  related_to_type text CHECK (related_to_type IN ('opportunity', 'contact', 'company', 'task', 'product')),
  related_to uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'activities' AND policyname = 'Allow users to view their own activities'
  ) THEN
    CREATE POLICY "Allow users to view their own activities"
      ON activities
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create policy to allow users to create activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activities' AND policyname = 'Allow users to create activities'
  ) THEN
    CREATE POLICY "Allow users to create activities"
      ON activities
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_related_to_idx ON activities(related_to_type, related_to);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at);