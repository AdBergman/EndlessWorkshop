ALTER TABLE "unit_specialization" ADD COLUMN art_id VARCHAR(255);

UPDATE "unit_specialization"
SET art_id = 'herald'
WHERE "name" IN ('Herald of the Faith', 'Clarion', 'Protector', 'Commander', 'Champion');

UPDATE "unit_specialization"
SET art_id = 'wrath'
WHERE "name" IN (
               'Wrath Bearer',
               'Magnified Wrath',
               'Devastating Wrath',
               'Skeptics'' Bane',
               'Fire of the Gods'
    );

UPDATE "unit_specialization"
SET "art_id" = 'stalwart'
WHERE "name" IN (
                 'Stalwart',
                 'Fallen Knight',
                 'Merciless Knight',
                 'Eldritch Knight',
                 'Consul''s Guard'
    );