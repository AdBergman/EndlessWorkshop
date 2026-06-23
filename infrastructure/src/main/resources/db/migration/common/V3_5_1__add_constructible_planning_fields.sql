ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS unlock_technology_keys TEXT;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS level_up_target_district_key VARCHAR(255);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS level_up_required_adjacent_district_count INTEGER;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_neighbour_operator VARCHAR(120);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_neighbour_territory_constraint VARCHAR(120);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS placement_neighbour_ignore_cliff BOOLEAN;

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS unlock_technology_keys TEXT;

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_neighbour_operator VARCHAR(120);

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_neighbour_territory_constraint VARCHAR(120);

ALTER TABLE improvements
    ADD COLUMN IF NOT EXISTS placement_neighbour_ignore_cliff BOOLEAN;
