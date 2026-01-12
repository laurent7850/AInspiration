/*
  # Fix Security and Performance Issues
  
  ## Changes Made
  
  1. **Performance Improvements**
     - Add missing index on opportunities.contact_id foreign key
     - Optimize all RLS policies to use (select auth.uid()) instead of auth.uid()
       This prevents re-evaluation for each row, improving query performance at scale
  
  2. **Security Improvements**
     - Fix search_path for update_contact_messages_updated_at function
     - Resolve multiple permissive policies on blog_posts and blog_comments
  
  3. **Tables Updated**
     - opportunities: Add contact_id index
     - chat_conversations: Optimize RLS policy
     - contacts: Optimize 4 RLS policies (select, insert, update, delete)
     - opportunities: Optimize 4 RLS policies (select, insert, update, delete)
     - activities: Optimize 2 RLS policies (select, insert)
     - access_logs: Optimize 2 RLS policies (select, insert)
     - tasks: Optimize 4 RLS policies (select, insert, update, delete)
     - blog_posts: Remove duplicate permissive policy
     - blog_comments: Remove duplicate permissive policy
*/

-- 1. Add missing index on opportunities.contact_id
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);

-- 2. Fix function search path
DROP FUNCTION IF EXISTS update_contact_messages_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- 3. Optimize chat_conversations RLS policies
DROP POLICY IF EXISTS "Sessions can read their own conversations" ON chat_conversations;
CREATE POLICY "Sessions can read their own conversations"
  ON chat_conversations
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 4. Optimize contacts RLS policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
CREATE POLICY "Users can view their own contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own contacts" ON contacts;
CREATE POLICY "Users can create their own contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
CREATE POLICY "Users can update their own contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;
CREATE POLICY "Users can delete their own contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 5. Optimize opportunities RLS policies
DROP POLICY IF EXISTS "Users can view their own opportunities" ON opportunities;
CREATE POLICY "Users can view their own opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own opportunities" ON opportunities;
CREATE POLICY "Users can create their own opportunities"
  ON opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own opportunities" ON opportunities;
CREATE POLICY "Users can update their own opportunities"
  ON opportunities
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own opportunities" ON opportunities;
CREATE POLICY "Users can delete their own opportunities"
  ON opportunities
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 6. Optimize activities RLS policies
DROP POLICY IF EXISTS "Allow users to view their own activities" ON activities;
CREATE POLICY "Allow users to view their own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Allow users to create activities" ON activities;
CREATE POLICY "Allow users to create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 7. Optimize access_logs RLS policies
DROP POLICY IF EXISTS "Users can view their own access logs" ON access_logs;
CREATE POLICY "Users can view their own access logs"
  ON access_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own access logs" ON access_logs;
CREATE POLICY "Users can create their own access logs"
  ON access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 8. Optimize tasks RLS policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
CREATE POLICY "Users can create their own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 9. Fix multiple permissive policies on blog_posts
-- Remove the less restrictive "Anyone can view published posts" policy
-- Keep only "Authenticated users can view all posts" which is more permissive
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;

-- 10. Fix multiple permissive policies on blog_comments
-- Remove "Anyone can view approved comments" policy
-- Keep only "Authenticated users can view all comments"
DROP POLICY IF EXISTS "Anyone can view approved comments" ON blog_comments;