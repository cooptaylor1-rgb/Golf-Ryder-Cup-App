-- Migration: Add scoring_events table for background sync
-- Description: Creates the missing scoring_events table referenced by the sync API
-- Author: Database Audit
-- Date: January 2026

-- ============================================
-- CREATE SCORING_EVENTS TABLE
-- ============================================
-- This table stores scoring events from offline clients for synchronization.
-- Events are pushed from Background Sync API and processed to update hole_results.

CREATE TABLE
IF NOT EXISTS scoring_events
(
    id UUID PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches
(id) ON
DELETE CASCADE,
    event_type TEXT
NOT NULL,
    hole_number INTEGER CHECK
(hole_number >= 1 AND hole_number <= 18),
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW
(),
    device_id TEXT,
    processed BOOLEAN DEFAULT FALSE
);

-- Indexes for common query patterns
CREATE INDEX
IF NOT EXISTS idx_scoring_events_match_id
ON scoring_events
(match_id);

CREATE INDEX
IF NOT EXISTS idx_scoring_events_created_at
ON scoring_events
(created_at DESC);

-- Partial index for finding unprocessed events
CREATE INDEX
IF NOT EXISTS idx_scoring_events_unprocessed
ON scoring_events
(match_id)
WHERE processed = FALSE;

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE scoring_events ENABLE ROW LEVEL SECURITY;

-- Policies (permissive - server uses service role)
CREATE POLICY "scoring_events_select_all"
ON scoring_events FOR
SELECT USING (true);

CREATE POLICY "scoring_events_insert_all"
ON scoring_events FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "scoring_events_update_all"
ON scoring_events FOR
UPDATE USING (true);

CREATE POLICY "scoring_events_delete_all"
ON scoring_events FOR
DELETE USING (true);

-- ============================================
-- ROLLBACK
-- ============================================
-- To rollback this migration:
-- DROP TABLE IF EXISTS scoring_events;
