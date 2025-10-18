
-- 2️⃣ Populate unlock_text for district unlocks
UPDATE tech_unlock tu
SET unlock_text = (
    SELECT 'District: ' || d.name
    FROM "districts" d
    WHERE tu.district_id = d.id
)
WHERE tu.district_id IS NOT NULL
  AND tu.unlock_text IS NULL;



-- 2️⃣ Populate unlock_text for improvement unlocks
UPDATE tech_unlock tu
SET unlock_text = (
    SELECT 'Improvement: ' || i.name
    FROM "improvements" i
    WHERE tu.improvement_id = i.id
)
WHERE tu.improvement_id IS NOT NULL
  AND tu.unlock_text IS NULL;
