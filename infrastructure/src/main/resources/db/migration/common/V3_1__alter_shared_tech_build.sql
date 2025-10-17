-- V3__add_faction_to_shared_tech_builds.sql

-- Add 'faction' column using existing enum type
ALTER TABLE shared_tech_builds
    ADD COLUMN faction faction_type;

-- Optional: temporarily allow NULLs for migration
-- UPDATE existing rows to a default faction if desired
UPDATE shared_tech_builds
SET faction = 'KIN'
WHERE faction IS NULL;

-- (optional) enforce not null constraint after cleanup
ALTER TABLE shared_tech_builds
    ALTER COLUMN faction SET NOT NULL;
