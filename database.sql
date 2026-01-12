-- Création de la table users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  company VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exemple d'insertion de données
INSERT INTO users (name, email, company) VALUES
  ('John Doe', 'john@example.com', 'ABC Corp'),
  ('Jane Smith', 'jane@example.com', 'XYZ Inc');