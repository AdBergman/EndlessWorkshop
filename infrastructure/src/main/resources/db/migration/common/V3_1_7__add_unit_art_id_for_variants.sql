ALTER TABLE "unit_specialization" ADD COLUMN art_id VARCHAR(255);

UPDATE "unit_specialization"
SET art_id = 'herald'
WHERE "name" IN ('Herald of the Faith', 'Clarion', 'Protector', 'Commander', 'Champion');
