-- ===========================
-- WARNING: This will delete ALL your tables, sequences, and Flyway history
-- Only run on staging/dev, not production
-- ===========================

-- 1️⃣ Drop all tables in public schema
DO
$$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
    END
$$;

-- 2️⃣ Drop all sequences in public schema
DO
$$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
                EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequencename) || ' CASCADE';
            END LOOP;
    END
$$;

-- 3️⃣ Optionally, clear Flyway history if table exists
DO
$$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'flyway_schema_history') THEN
            DELETE FROM flyway_schema_history;
        END IF;
    END
$$;


-- ===========================
-- Drop all custom ENUM types
-- ===========================
DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'improvement_unique_type') THEN
            DROP TYPE improvement_unique_type CASCADE;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'strategic_type') THEN
            DROP TYPE strategic_type CASCADE;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
            DROP TYPE resource_type CASCADE;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tech_type') THEN
            DROP TYPE tech_type CASCADE;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'faction_type') THEN
            DROP TYPE faction_type CASCADE;
        END IF;

        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_specialization_type') THEN
            DROP TYPE unit_specialization_type CASCADE;
        END IF;
    END $$;

-- ✅ After running this:
-- - Your public schema is empty
-- - All sequences are reset
-- - Flyway will treat all migrations as pending
-- - IDs will start from 1 again
