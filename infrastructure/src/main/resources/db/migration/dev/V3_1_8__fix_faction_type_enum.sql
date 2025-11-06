-- 1) Widen column so we can recreate the enum
ALTER TABLE "tech_entity_factions" ALTER COLUMN "faction" TYPE VARCHAR(32);

-- 2) Recreate the enum type with corrected values
DROP TYPE IF EXISTS "faction_type";
CREATE TYPE "faction_type" AS ENUM ('ASPECTS','KIN','LORDS','NECROPHAGES','TAHUK');

-- 3) Update data to new literals
UPDATE "tech_entity_factions"
SET "faction" = 'ASPECTS'
WHERE "faction" = 'ASPECT';

UPDATE "tech_entity_factions"
SET "faction" = 'NECROPHAGES'
WHERE "faction" = 'NECROPHAGE';

-- 4) Constrain column back to the enum
ALTER TABLE "tech_entity_factions" ALTER COLUMN "faction" TYPE "faction_type";