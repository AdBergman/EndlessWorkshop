-- V3_x_x__tech_factions_rename_and_drop_rules.sql

-- 1) Create the new join table (if not already present)
CREATE TABLE IF NOT EXISTS tech_faction (
                                            tech_id BIGINT NOT NULL,
                                            faction VARCHAR(255) NOT NULL
);

-- 2) Copy rows across (avoid duplicates if rerun)
INSERT INTO tech_faction (tech_id, faction)
SELECT t.tech_entity_id, t.faction
FROM tech_entity_factions t
WHERE NOT EXISTS (
    SELECT 1
    FROM tech_faction tf
    WHERE tf.tech_id = t.tech_entity_id
      AND tf.faction = t.faction
);

-- 3) Drop old table
DROP TABLE IF EXISTS tech_entity_factions;

-- 4) We decided not to persist prereq rules
DROP TABLE IF EXISTS tech_trait_prereq;