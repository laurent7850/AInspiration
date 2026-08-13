-- =====================================================
-- Migration 003 : multi-tenant scoping (per-user ownership)
-- =====================================================
-- Adds owner_id to contacts (was missing).
-- Backfills NULL owners with admin@ainspiration.eu.
-- Adds indexes on ownership columns for filtering performance.
-- Idempotent : safe to re-run.
-- =====================================================

-- contacts: add owner_id column
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

-- Backfill all NULL owners with admin (handles contacts/opportunities/tasks/activities)
DO $$
DECLARE
  admin_uuid UUID;
BEGIN
  SELECT id INTO admin_uuid FROM users WHERE email = 'admin@ainspiration.eu' LIMIT 1;
  IF admin_uuid IS NULL THEN
    SELECT id INTO admin_uuid FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  END IF;
  IF admin_uuid IS NOT NULL THEN
    UPDATE contacts       SET owner_id     = admin_uuid WHERE owner_id     IS NULL;
    UPDATE opportunities  SET owner_id     = admin_uuid WHERE owner_id     IS NULL;
    UPDATE tasks          SET assigned_to  = admin_uuid WHERE assigned_to  IS NULL;
    UPDATE activities     SET user_id      = admin_uuid WHERE user_id      IS NULL;
  END IF;
END $$;

-- Indexes for owner-based filtering
CREATE INDEX IF NOT EXISTS idx_contacts_owner       ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner  ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned       ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_user      ON activities(user_id);
