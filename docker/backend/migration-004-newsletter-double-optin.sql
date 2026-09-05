-- Migration 004 — newsletter double opt-in (RGPD art. 7: proof of consent)
-- Applied manually on the production database (docker exec ainspiration-postgres psql ...).
-- Idempotent: safe to re-run.
--
-- New status 'pending': the address was submitted but the confirmation link
-- has not been opened yet. Only 'subscribed' rows ever receive a newsletter.
-- Existing 'subscribed' rows are untouched (consent given before this change).

BEGIN;

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS confirm_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS confirm_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip TEXT;

ALTER TABLE newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_status_check;

ALTER TABLE newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_status_check
  CHECK (status IN ('pending', 'subscribed', 'unsubscribed', 'bounced'));

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
  ON newsletter_subscribers (status);

COMMIT;
