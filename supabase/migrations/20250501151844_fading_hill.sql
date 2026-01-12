/*
  # Newsletter subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on the table
    - Allow anyone to insert to the table
    - Only admins/authenticated users can read
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can subscribe)
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON newsletter_subscribers 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy for reading (only authenticated users)
CREATE POLICY "Only authenticated users can view subscribers" 
  ON newsletter_subscribers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Add timestamp for when email was verified (for future use)
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- Add a status column for managing subscription status
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';