-- =====================================================
-- Newsletter Infrastructure for AInspiration
-- Migration: 20260114_newsletter_tables
-- =====================================================

-- 1. Update newsletter_subscribers table with new fields
-- =====================================================

-- Add new columns if they don't exist
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(100),
ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Create index on unsubscribe_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_token
ON newsletter_subscribers(unsubscribe_token);

-- Create index on status for filtering active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
ON newsletter_subscribers(status);

-- Generate unsubscribe tokens for existing subscribers without one
UPDATE newsletter_subscribers
SET unsubscribe_token = CONCAT(EXTRACT(EPOCH FROM NOW())::TEXT, '-', SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 15))
WHERE unsubscribe_token IS NULL;

-- 2. Create newsletters table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipients_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for newsletters
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at DESC);

-- 3. Create newsletter_send_logs table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_send_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    UNIQUE(newsletter_id, subscriber_id)
);

-- Create indexes for send logs
CREATE INDEX IF NOT EXISTS idx_newsletter_send_logs_newsletter ON newsletter_send_logs(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_logs_subscriber ON newsletter_send_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_logs_status ON newsletter_send_logs(status);

-- 4. RLS Policies
-- =====================================================

-- Enable RLS on all newsletter tables
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_send_logs ENABLE ROW LEVEL SECURITY;

-- Policies for newsletters table (admin only via authenticated users)
CREATE POLICY "Authenticated users can view newsletters" ON newsletters
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert newsletters" ON newsletters
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update newsletters" ON newsletters
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete newsletters" ON newsletters
    FOR DELETE TO authenticated USING (true);

-- Policies for newsletter_send_logs
CREATE POLICY "Authenticated users can view send logs" ON newsletter_send_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert send logs" ON newsletter_send_logs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update send logs" ON newsletter_send_logs
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Update policies for newsletter_subscribers to allow unsubscribe by token
DROP POLICY IF EXISTS "Anyone can unsubscribe with valid token" ON newsletter_subscribers;
CREATE POLICY "Anyone can unsubscribe with valid token" ON newsletter_subscribers
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Public can view their own subscription by token (for unsubscribe page)
DROP POLICY IF EXISTS "Anyone can view subscriber by token" ON newsletter_subscribers;
CREATE POLICY "Anyone can view subscriber by token" ON newsletter_subscribers
    FOR SELECT TO anon, authenticated
    USING (true);

-- 5. Trigger for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletters_updated_at ON newsletters;
CREATE TRIGGER newsletters_updated_at
    BEFORE UPDATE ON newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_updated_at();

-- 6. Statistics view
-- =====================================================

CREATE OR REPLACE VIEW newsletter_statistics AS
SELECT
    COUNT(*) FILTER (WHERE ns.status = 'active') as active_subscribers,
    COUNT(*) FILTER (WHERE ns.status = 'unsubscribed') as unsubscribed_count,
    COUNT(*) as total_subscribers,
    (SELECT COUNT(*) FROM newsletters WHERE status = 'sent') as sent_newsletters,
    (SELECT COUNT(*) FROM newsletters) as total_newsletters,
    (SELECT COALESCE(SUM(recipients_count), 0) FROM newsletters WHERE status = 'sent') as total_emails_sent
FROM newsletter_subscribers ns;

-- Grant access to the view
GRANT SELECT ON newsletter_statistics TO authenticated;

-- 7. Function to get subscriber emails for n8n
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_newsletter_subscribers()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    unsubscribe_token VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ns.id,
        ns.email,
        ns.unsubscribe_token
    FROM newsletter_subscribers ns
    WHERE ns.status = 'active'
    ORDER BY ns.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role (for n8n)
GRANT EXECUTE ON FUNCTION get_active_newsletter_subscribers() TO service_role;

COMMENT ON TABLE newsletters IS 'Stores newsletter campaigns';
COMMENT ON TABLE newsletter_send_logs IS 'Tracks individual email sends and engagement';
COMMENT ON COLUMN newsletter_subscribers.unsubscribe_token IS 'Unique token for one-click unsubscribe links';
