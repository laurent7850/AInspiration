/*
  # Mise à jour du schéma avec vérification des objets existants

  1. Tables
    - Vérification et création de `users` si nécessaire
    - Vérification et création de `audit_requests` si nécessaire
  
  2. Sécurité
    - Activation RLS si nécessaire
    - Création des politiques avec vérification préalable
*/

-- Création sécurisée de la table users
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      company text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Création sécurisée de la table audit_requests
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_requests') THEN
    CREATE TABLE audit_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id),
      company_size text NOT NULL,
      industry text NOT NULL,
      message text,
      status text DEFAULT 'pending',
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Activation RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes si elles existent
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Users can insert own data" ON users;
  DROP POLICY IF EXISTS "Users can read own audit requests" ON audit_requests;
  DROP POLICY IF EXISTS "Users can create audit requests" ON audit_requests;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Création des nouvelles politiques
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

CREATE POLICY "Users can read own audit requests" 
  ON audit_requests FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create audit requests" 
  ON audit_requests FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());