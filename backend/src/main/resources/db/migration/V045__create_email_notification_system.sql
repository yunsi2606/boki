-- ===================================================
-- V045: Create Release Schedule Email Notification System
-- ===================================================

-- 1. Table for email subscriptions (User & Guest opt-ins)
CREATE TABLE IF NOT EXISTS schedule_email_subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255) NOT NULL,
    user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    subscription_type VARCHAR(40) NOT NULL, -- SERIES, VOLUME, VAULT, DELAY_ALERT, WEEKLY_DIGEST
    target_id         VARCHAR(255),         -- seriesSlug, scheduleId, etc.
    target_name       VARCHAR(255),         -- Human readable name (e.g. Sói xanh của Mibu)
    unsubscribe_token VARCHAR(64) NOT NULL UNIQUE,
    active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_sub_target 
    ON schedule_email_subscriptions(email, subscription_type, COALESCE(target_id, ''));

CREATE INDEX IF NOT EXISTS idx_sub_email ON schedule_email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_sub_type_target ON schedule_email_subscriptions(subscription_type, target_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sub_unsub_token ON schedule_email_subscriptions(unsubscribe_token);

-- 2. Table for background email outbox jobs (Non-blocking queue with retry & idempotency)
CREATE TABLE IF NOT EXISTS email_outbox_jobs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email   VARCHAR(255) NOT NULL,
    subject           VARCHAR(500) NOT NULL,
    body_html         TEXT NOT NULL,
    body_text         TEXT NOT NULL,
    email_type        VARCHAR(50) NOT NULL, -- RELEASE_ALERT, DELAY_ALERT, DIGEST, CUSTOM_BROADCAST, TEST_EMAIL
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, SENDING, SENT, FAILED, BOUNCED
    retry_count       INTEGER NOT NULL DEFAULT 0,
    max_retries       INTEGER NOT NULL DEFAULT 3,
    error_message     TEXT,
    idempotency_key   VARCHAR(255) UNIQUE,
    unsubscribe_url   VARCHAR(500),
    scheduled_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sent_at           TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_pending 
    ON email_outbox_jobs(status, scheduled_at) WHERE status IN ('PENDING', 'SENDING');
CREATE INDEX IF NOT EXISTS idx_email_jobs_created ON email_outbox_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_jobs_recipient ON email_outbox_jobs(recipient_email);

-- 3. Table for Admin SMTP and Deliverability Configuration
CREATE TABLE IF NOT EXISTS email_smtp_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host                VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
    port                INTEGER NOT NULL DEFAULT 587,
    username            VARCHAR(255),
    password            VARCHAR(255),
    auth_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
    starttls_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    from_name           VARCHAR(255) NOT NULL DEFAULT 'Boki - Lịch Phát Hành',
    from_email          VARCHAR(255) NOT NULL DEFAULT 'notifications@bokistore.vn',
    reply_to            VARCHAR(255) DEFAULT 'support@bokistore.vn',
    max_rate_per_minute INTEGER NOT NULL DEFAULT 30,
    is_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed default initial SMTP configuration row if empty
INSERT INTO email_smtp_configs (id, host, port, username, password, auth_enabled, starttls_enabled, from_name, from_email, reply_to, max_rate_per_minute, is_enabled)
SELECT '99999999-9999-9999-9999-999999999001'::uuid, 'smtp.gmail.com', 587, 'notifications@bokistore.vn', '', TRUE, TRUE, 'Boki - Lịch Phát Hành', 'notifications@bokistore.vn', 'support@bokistore.vn', 30, FALSE
WHERE NOT EXISTS (SELECT 1 FROM email_smtp_configs LIMIT 1);
