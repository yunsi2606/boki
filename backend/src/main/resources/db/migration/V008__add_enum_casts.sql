-- ============================================
-- V008: Add implicit casts for PostgreSQL custom enums
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_cast JOIN pg_type ON pg_cast.casttarget = pg_type.oid WHERE typname = 'user_role') THEN
        CREATE CAST (varchar AS user_role) WITH INOUT AS IMPLICIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_cast JOIN pg_type ON pg_cast.casttarget = pg_type.oid WHERE typname = 'book_condition') THEN
        CREATE CAST (varchar AS book_condition) WITH INOUT AS IMPLICIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_cast JOIN pg_type ON pg_cast.casttarget = pg_type.oid WHERE typname = 'book_status') THEN
        CREATE CAST (varchar AS book_status) WITH INOUT AS IMPLICIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_cast JOIN pg_type ON pg_cast.casttarget = pg_type.oid WHERE typname = 'order_status') THEN
        CREATE CAST (varchar AS order_status) WITH INOUT AS IMPLICIT;
    END IF;
END $$;
