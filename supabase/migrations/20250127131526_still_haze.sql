/*
  # Schéma initial pour AInspiration

  1. Tables
    - `users` : Stockage des utilisateurs
      - `id` (uuid, clé primaire)
      - `email` (text, unique)
      - `name` (text)
      - `company` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `audit_requests` : Demandes d'audit
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère)
      - `company_size` (text)
      - `industry` (text)
      - `message` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques de sécurité pour l'accès authentifié
*/

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table audit_requests
CREATE TABLE IF NOT EXISTS audit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  company_size text NOT NULL,
  industry text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Users can read own data" 
  ON users FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" 
  ON users FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Politiques pour audit_requests
CREATE POLICY "Users can read own audit requests" 
  ON audit_requests FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create audit requests" 
  ON audit_requests FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());