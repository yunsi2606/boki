-- ==============================================================================
-- Migration V047: Add schedule_id to giveaway_prizes for per-prize manga link
-- ==============================================================================

ALTER TABLE giveaway_prizes
    ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES release_schedules(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_giveaway_prizes_schedule ON giveaway_prizes(schedule_id);
