/*
  # Configuration finale de la table users

  1. Structure
    - Table users avec auth.uid() comme clé primaire
    - Champs email, name, company
    - Timestamps created_at et updated_at

  2. Sécurité
    - RLS activé
    - Politiques pour lecture/écriture authentifiée
    - Trigger pour updated_at

  3. Gestion des erreurs
    - Utilisation de blocs DO pour éviter les erreurs
    - Nettoyage sécurisé des objets existants
*/

-- Nettoyage sécurisé
DO $$ 
BEGIN
  -- Suppression des politiques existantes
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can insert own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  
  -- Suppression du trigger
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  
  -- Suppression de la fonction
  DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Suppression et recréation de la table
DROP TABLE IF EXISTS users CASCADE;

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Création de la table users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT users_id_auth_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Activation RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
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

-- Trigger pour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Création d'un trigger pour insérer automatiquement l'utilisateur après son inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Suppression du trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Création du trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();