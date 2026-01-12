/*
  # Add Multilingual Support to Blog System
  
  ## Overview
  This migration adds full bilingual support (French/English) to the blog system.
  
  ## Changes Made
  
  1. **Blog Posts Table - Language Support**
     - Add `language` column (defaults to 'fr')
     - Add `title_en` column for English titles
     - Add `content_en` column for English content
     - Add `excerpt_en` column for English excerpts
     - Add `slug_en` column for English URLs
     - Create indexes for language-based queries
  
  2. **Blog Comments Table - Language Support**
     - Add `language` column to track comment language
  
  3. **Performance**
     - Add composite indexes for (language, published_at)
     - Add composite indexes for (language, category)
     - Optimize queries for multilingual content retrieval
  
  ## Important Notes
  - Existing blog posts remain in French (language='fr')
  - English translations can be added via admin interface
  - Blog queries should filter by language preference
  - Comments are linked to posts but track their own language
*/

-- Add language support to blog_posts table
DO $$
BEGIN
  -- Add language column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'language'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN language text DEFAULT 'fr' NOT NULL CHECK (language IN ('fr', 'en'));
  END IF;

  -- Add English title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN title_en text;
  END IF;

  -- Add English content column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'content_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_en text;
  END IF;

  -- Add English excerpt column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'excerpt_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN excerpt_en text;
  END IF;

  -- Add English slug column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'slug_en'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN slug_en text UNIQUE;
  END IF;
END $$;

-- Add language support to blog_comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_comments' AND column_name = 'language'
  ) THEN
    ALTER TABLE blog_comments ADD COLUMN language text DEFAULT 'fr' NOT NULL CHECK (language IN ('fr', 'en'));
  END IF;
END $$;

-- Create performance indexes for multilingual queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_language_published ON blog_posts(language, published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_language_category ON blog_posts(language, category) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_language_featured ON blog_posts(language, featured) WHERE published = true AND featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_comments_language ON blog_comments(language, created_at DESC);