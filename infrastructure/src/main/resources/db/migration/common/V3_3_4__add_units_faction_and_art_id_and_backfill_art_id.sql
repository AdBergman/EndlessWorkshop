ALTER TABLE units
    ADD COLUMN IF NOT EXISTS art_id VARCHAR(255);

ALTER TABLE units
    ADD COLUMN IF NOT EXISTS faction VARCHAR(64);

ALTER TABLE units
    ADD COLUMN IF NOT EXISTS is_major_faction BOOLEAN NOT NULL DEFAULT TRUE;

-- --------------------------------------------------
-- Backfill art_id (temporary manual mapping)
-- --------------------------------------------------

UPDATE units SET art_id = 'herald'   WHERE display_name = 'Champion';
UPDATE units SET art_id = 'herald'   WHERE display_name = 'Clarion';
UPDATE units SET art_id = 'herald'   WHERE display_name = 'Commander';
UPDATE units SET art_id = 'stalwart' WHERE display_name = 'Consul''s Guard';
UPDATE units SET art_id = 'wrath'    WHERE display_name = 'Devastating Wrath';
UPDATE units SET art_id = 'stalwart' WHERE display_name = 'Eldritch Knight';
UPDATE units SET art_id = 'stalwart' WHERE display_name = 'Fallen Knight';
UPDATE units SET art_id = 'wrath'    WHERE display_name = 'Fire of the Gods';
UPDATE units SET art_id = 'herald'   WHERE display_name = 'Herald of the Faith';
UPDATE units SET art_id = 'wrath'    WHERE display_name = 'Magnified Wrath';
UPDATE units SET art_id = 'stalwart' WHERE display_name = 'Merciless Knight';
UPDATE units SET art_id = 'herald'   WHERE display_name = 'Protector';
UPDATE units SET art_id = 'wrath'    WHERE display_name = 'Skeptics'' Bane';
UPDATE units SET art_id = 'stalwart' WHERE display_name = 'Stalwart';
UPDATE units SET art_id = 'wrath'    WHERE display_name = 'Wrath Bearer';