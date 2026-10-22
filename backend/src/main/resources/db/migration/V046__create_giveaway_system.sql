-- ==============================================================================
-- Migration V046: Manga Giveaway System with Lucky Numbers (100-999) & Smart Prize Allocation
-- ==============================================================================

CREATE TABLE IF NOT EXISTS giveaway_campaigns (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                VARCHAR(255) NOT NULL,
    slug                 VARCHAR(255) UNIQUE NOT NULL,
    description          TEXT,
    banner_url           VARCHAR(500),
    schedule_id          UUID REFERENCES release_schedules(id) ON DELETE SET NULL,
    prize_structure_type VARCHAR(20) NOT NULL DEFAULT 'TIERED', -- TIERED, FLAT
    status               VARCHAR(20) NOT NULL DEFAULT 'OPEN',   -- UPCOMING, OPEN, CLOSED, DRAWN
    start_date           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date             TIMESTAMP WITH TIME ZONE NOT NULL,
    draw_date            TIMESTAMP WITH TIME ZONE,
    winning_number       INTEGER,
    total_winners_count  INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS giveaway_prizes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   UUID NOT NULL REFERENCES giveaway_campaigns(id) ON DELETE CASCADE,
    prize_tier    VARCHAR(30) NOT NULL DEFAULT 'FIRST', -- FIRST, SECOND, THIRD, CONSOLATION, STANDARD
    prize_name    VARCHAR(255) NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id  UUID NOT NULL REFERENCES giveaway_campaigns(id) ON DELETE CASCADE,
    user_id      UUID,
    email        VARCHAR(255) NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    phone        VARCHAR(50) NOT NULL,
    lucky_number INTEGER NOT NULL CHECK (lucky_number >= 100 AND lucky_number <= 999),
    comment      TEXT,
    is_winner    BOOLEAN NOT NULL DEFAULT FALSE,
    prize_id     UUID REFERENCES giveaway_prizes(id) ON DELETE SET NULL,
    prize_rank   INTEGER,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_giveaway_campaign_email UNIQUE (campaign_id, email),
    CONSTRAINT uq_giveaway_campaign_phone UNIQUE (campaign_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_giveaway_campaigns_status ON giveaway_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_giveaway_campaigns_slug ON giveaway_campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_campaign ON giveaway_entries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_number ON giveaway_entries(campaign_id, lucky_number);
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_created ON giveaway_entries(campaign_id, created_at);
