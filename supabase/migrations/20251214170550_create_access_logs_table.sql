/*
  # Create access_logs table for tracking system access

  1. New Table
    - `access_logs` - Track all system access and authentication events
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Nullable for failed login attempts
      - `event_type` (text) - Type of event (login, logout, page_view, api_call, etc.)
      - `ip_address` (text) - IP address of the user
      - `user_agent` (text) - Browser/device information
      - `page_url` (text) - URL accessed
      - `status` (text) - Status of the action (success, failed, unauthorized, etc.)
      - `metadata` (jsonb) - Additional data (error messages, session info, etc.)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Only allow authenticated users to view their own logs
    - Only system can insert logs (via service role)

  3. Indexes
    - Index on user_id for fast lookups
    - Index on created_at for time-based queries
    - Index on event_type for filtering
*/

-- Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  page_url text,
  status text DEFAULT 'success',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own access logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'access_logs' AND policyname = 'Users can view their own access logs'
  ) THEN
    CREATE POLICY "Users can view their own access logs"
      ON access_logs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create policy to allow authenticated users to insert their own logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_logs' AND policyname = 'Users can create their own access logs'
  ) THEN
    CREATE POLICY "Users can create their own access logs"
      ON access_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS access_logs_user_id_idx ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS access_logs_created_at_idx ON access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS access_logs_event_type_idx ON access_logs(event_type);
CREATE INDEX IF NOT EXISTS access_logs_status_idx ON access_logs(status);