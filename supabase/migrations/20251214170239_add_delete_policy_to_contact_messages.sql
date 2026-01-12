/*
  # Add DELETE policy to contact_messages table

  1. Security
    - Add policy to allow authenticated users to delete contact messages
*/

-- Only authenticated users can delete messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contact_messages' 
    AND policyname = 'Authenticated users can delete contact messages'
  ) THEN
    CREATE POLICY "Authenticated users can delete contact messages"
      ON contact_messages
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;
