-- ==============================================================================
-- Migration V048: Add edition_id to giveaway_prizes for specific manga variant link
-- ==============================================================================

ALTER TABLE giveaway_prizes
    ADD COLUMN IF NOT EXISTS edition_id UUID REFERENCES release_schedule_editions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_giveaway_prizes_edition ON giveaway_prizes(edition_id);
