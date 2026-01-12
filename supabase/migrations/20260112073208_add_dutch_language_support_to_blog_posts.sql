/*
  # Add Dutch language support to blog posts

  1. Changes
    - Update the language check constraint to include 'nl' (Dutch)
    - Allows blog posts to be created in French, English, and Dutch

  2. Security
    - No changes to RLS policies
*/

-- Drop the existing constraint
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_language_check;

-- Add the new constraint with Dutch support
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_language_check 
  CHECK (language = ANY (ARRAY['fr'::text, 'en'::text, 'nl'::text]));
