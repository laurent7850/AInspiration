/*
  # Ajout des champs pour le formulaire d'audit

  1. Structure
    - Table `audit_requests` avec validation email
    - Champs pour le formulaire d'audit
    - Timestamps et statut
  
  2. Sécurité
    - RLS activé
    - Politiques pour lecture/écriture
    - Validation email
  
  3. Performance
    - Index sur les colonnes fréquemment utilisées
    - Trigger pour updated_at
*/

-- Suppression des objets existants pour éviter les conflits
DROP TABLE IF EXISTS audit_requests CASCADE;
DROP FUNCTION IF EXISTS update_audit_requests_updated_at CASCADE;

-- Création de la table audit_requests
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

-- Activation RLS
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;

-- Création des politiques
CREATE POLICY "Users can view their own audit requests"
  ON audit_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create audit requests"
  ON audit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour le trigger updated_at
CREATE FUNCTION update_audit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_audit_requests_updated_at
  BEFORE UPDATE ON audit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_requests_updated_at();

-- Index pour les performances
CREATE INDEX idx_audit_requests_user_id ON audit_requests(user_id);
CREATE INDEX idx_audit_requests_status ON audit_requests(status);
CREATE INDEX idx_audit_requests_created_at ON audit_requests(created_at);