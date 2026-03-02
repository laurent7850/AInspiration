-- Migration 001: Align schema with frontend types
-- Run this on the VPS PostgreSQL database

-- Add product_id to opportunities (referenced by frontend)
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Relax task status constraint to match frontend values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('not_started', 'in_progress', 'waiting', 'deferred', 'completed', 'pending', 'cancelled'));

-- Add html_content to newsletters (used by frontend)
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Index for product_id on opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_product ON opportunities(product_id);

-- Add password column to users for JWT auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
