ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_terrain_constraint VARCHAR(120);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_terrain_type_keys TEXT;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_terrain_can_build_on_wasteland BOOLEAN;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_terrain_can_build_on_mud BOOLEAN;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_river_constraint VARCHAR(120);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_point_of_interest_constraint VARCHAR(120);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_point_of_interest_keys TEXT;

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_terrain_constraint VARCHAR(120);

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_terrain_type_keys TEXT;

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_terrain_can_build_on_wasteland BOOLEAN;

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_terrain_can_build_on_mud BOOLEAN;

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_river_constraint VARCHAR(120);

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_point_of_interest_constraint VARCHAR(120);

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_point_of_interest_keys TEXT;
