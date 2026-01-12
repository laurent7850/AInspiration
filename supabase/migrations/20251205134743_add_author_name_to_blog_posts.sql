/*
  # Add author_name column to blog_posts

  1. Changes
    - Add author_name column to blog_posts table
    - Make author_id nullable since we'll use author_name instead
    - Update existing post to have author_name
  
  2. Notes
    - This allows storing author names directly without needing a separate authors table
*/

-- Add author_name column
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_name text;

-- Make author_id nullable
ALTER TABLE blog_posts 
ALTER COLUMN author_id DROP NOT NULL;

-- Update existing posts if any
UPDATE blog_posts 
SET author_name = 'AInspiration Team'
WHERE author_name IS NULL;
