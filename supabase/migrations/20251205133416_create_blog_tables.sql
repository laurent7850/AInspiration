/*
  # Create blog system tables

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `excerpt` (text, optional)
      - `content` (text)
      - `image_url` (text, optional)
      - `author_id` (uuid, optional, foreign key to users)
      - `category` (text, optional)
      - `published` (boolean, default false)
      - `featured` (boolean, default false)
      - `read_time` (integer, optional - in minutes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `published_at` (timestamptz, optional)

    - `blog_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, optional)
      - `created_at` (timestamptz)

    - `blog_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to blog_posts)
      - `user_id` (uuid, optional, foreign key to users)
      - `name` (text, optional - for non-logged users)
      - `email` (text, optional - for non-logged users)
      - `content` (text)
      - `approved` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read published posts
    - Only authenticated users can create comments (auto-approved)
    - Anonymous can create comments (need approval)
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES users(id),
  category text,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  read_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id),
  name text,
  email text,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_guest CHECK (
    (user_id IS NOT NULL) OR (name IS NOT NULL AND email IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Policies for blog_posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authors can update own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Policies for blog_categories
CREATE POLICY "Anyone can view categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for blog_comments
CREATE POLICY "Anyone can view approved comments"
  ON blog_comments FOR SELECT
  USING (approved = true);

CREATE POLICY "Authenticated users can view all comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create auto-approved comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND approved = true);

CREATE POLICY "Anonymous can create comments for approval"
  ON blog_comments FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND approved = false);

CREATE POLICY "Users can update own comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(approved);

-- Add some default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Automatisation', 'automatisation', 'Articles sur l''automatisation des processus avec l''IA'),
  ('Innovation', 'innovation', 'Tendances et innovations en intelligence artificielle'),
  ('Cas d''usage', 'cas-usage', 'Exemples concrets d''utilisation de l''IA en entreprise'),
  ('Formation', 'formation', 'Guides et tutoriels pour maîtriser les outils IA'),
  ('Société', 'societe', 'Impact sociétal et éthique de l''intelligence artificielle')
ON CONFLICT (slug) DO NOTHING;
