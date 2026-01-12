/*
  # Add public access to published blog posts

  1. Changes
    - Add policy to allow anonymous users to view published blog posts
    - This enables the public blog page to display articles without authentication

  2. Security
    - Only published posts are visible to the public
    - Unpublished posts remain restricted to authenticated users
*/

-- Allow anonymous users to view published blog posts
CREATE POLICY "Public can view published posts"
  ON blog_posts
  FOR SELECT
  TO anon
  USING (published = true);
