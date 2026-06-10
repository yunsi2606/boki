-- ============================================
-- V001: Users & OAuth Accounts
-- ============================================

-- Custom enum types
CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');

-- Users table
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255),
    display_name    VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(20),
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url      VARCHAR(500),
    role            user_role NOT NULL DEFAULT 'BUYER',
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),

    CONSTRAINT uk_users_email UNIQUE (email)
);

-- OAuth linked accounts
CREATE TABLE user_oauth_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    provider            VARCHAR(50) NOT NULL,
    provider_user_id    VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_oauth_provider_user UNIQUE (provider, provider_user_id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_oauth_user_id ON user_oauth_accounts(user_id);
CREATE INDEX idx_oauth_provider ON user_oauth_accounts(provider);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
