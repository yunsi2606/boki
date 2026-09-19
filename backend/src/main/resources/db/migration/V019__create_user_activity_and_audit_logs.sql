-- ============================================================
-- V019: Create User Activities and Audit Logs Table
-- ============================================================

CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(30),
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    page_path VARCHAR(500),
    page_title VARCHAR(255),
    referrer_url VARCHAR(500),
    target_id VARCHAR(100),
    target_name VARCHAR(255),
    metadata_json TEXT,
    ip_address VARCHAR(64),
    user_agent TEXT,
    device_type VARCHAR(30) DEFAULT 'DESKTOP',
    browser VARCHAR(50),
    os VARCHAR(50),
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize high-frequency activity queries, timeline lookups, and funnel analytics
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_session_id ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_event_type ON user_activities(event_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_event_category ON user_activities(event_category);
CREATE INDEX IF NOT EXISTS idx_user_activities_target_id ON user_activities(target_id);
