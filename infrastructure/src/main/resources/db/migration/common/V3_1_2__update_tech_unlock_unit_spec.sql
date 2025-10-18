-- 1️⃣ Insert missing TECH_UNLOCKS links
INSERT INTO TECH_UNLOCKS (TECH_ENTITY_ID, UNLOCKS_ID)
SELECT t.id AS tech_entity_id, tu.id AS unlock_id
FROM TECH t
         JOIN TECH_UNLOCK tu ON tu.TECH_ID = t.id
WHERE tu.UNIT_SPECIALIZATION_ID IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM TECH_UNLOCKS tul
    WHERE tul.UNLOCKS_ID = tu.id
);

-- 2️⃣ Populate unlock_text for unit specialization unlocks
UPDATE tech_unlock tu
SET unlock_text = (
    SELECT 'Unit Specialization: ' || us.name
    FROM "unit_specialization" us
    WHERE tu.unit_specialization_id = us.id
)
WHERE tu.unit_specialization_id IS NOT NULL
  AND tu.unlock_text IS NULL;
