/*
  # Complete database schema for AInspiration

  1. New Tables
    - `users` - User profiles linked to auth.users
    - `audit_requests` - Business audit requests
    - `chat_conversations` - User chat history with IA

  2. Security
    - Enable RLS on all tables
    - Appropriate read/write policies for each table
    - Security policies for session-based access

  3. Indexes
    - Performance indexes on frequently queried columns
    - Support for efficient filtering and joins
*/

-- Clean up any existing objects
DO $$ 
BEGIN
  -- Drop tables if they exist (in reverse order of dependencies)
  DROP TABLE IF EXISTS chat_conversations CASCADE;
  DROP TABLE IF EXISTS audit_requests CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  
  -- Drop functions if they exist
  DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
  DROP FUNCTION IF EXISTS update_audit_requests_updated_at CASCADE;
  DROP FUNCTION IF EXISTS handle_new_user CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create updatable timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function for audit_requests updated_at
CREATE OR REPLACE FUNCTION update_audit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function for automatic user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, coalesce(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create users table with auth integration
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create audit_requests table
CREATE TABLE audit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_size text NOT NULL,
  industry text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT audit_requests_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS on audit_requests
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;

-- Create audit_requests policies
CREATE POLICY "Users can view their own audit requests"
  ON audit_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create audit requests"
  ON audit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create chat_conversations table
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on chat_conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create chat_conversations policies
CREATE POLICY "Sessions can read their own conversations"
  ON chat_conversations
  FOR SELECT
  TO anon
  USING (session_id = ((current_setting('request.headers')::json)->>'x-session-id'));

CREATE POLICY "Users can read their own chat conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create chat conversations"
  ON chat_conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create trigger for updated_at on users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on audit_requests
CREATE TRIGGER update_audit_requests_updated_at
  BEFORE UPDATE ON audit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_requests_updated_at();

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_requests_user_id ON audit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_requests_status ON audit_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_requests_created_at ON audit_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at);

-- Insert any existing users from auth.users not already in users table
INSERT INTO public.users (id, email, name)
SELECT id, email, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;