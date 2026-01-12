/*
  # Correction de la table users et des politiques RLS

  1. Nettoyage
    - Suppression des tables existantes
    - Suppression des politiques et triggers

  2. Création
    - Table users avec auth.uid() comme clé primaire
    - Politiques RLS complètes
    - Trigger pour updated_at

  3. Sécurité
    - RLS activé par défaut
    - Politiques pour lecture/écriture authentifiée
*/

-- Nettoyage complet
DROP TABLE IF EXISTS audit_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Création de la fonction trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Création de la table users
DO $$ BEGIN
  CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    company text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Création des nouvelles politiques RLS
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Suppression de l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Création du trigger pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Création de la table audit_requests
DO $$ BEGIN
  CREATE TABLE audit_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    company_size text NOT NULL,
    industry text NOT NULL,
    message text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Activer RLS pour audit_requests
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can read own audit requests" ON audit_requests;
DROP POLICY IF EXISTS "Users can create audit requests" ON audit_requests;

-- Création des nouvelles politiques pour audit_requests
CREATE POLICY "Users can read own audit requests"
  ON audit_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create audit requests"
  ON audit_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());