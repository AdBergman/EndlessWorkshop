ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS tier INTEGER;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS constructible_level INTEGER;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS construction_cost TEXT;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS descriptor_keys TEXT;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS reference_keys TEXT;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS is_faction_specific BOOLEAN;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS is_variant BOOLEAN;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS is_player_facing BOOLEAN;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS level_up_valid_neighbour_descriptor_keys TEXT;

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS level_up_valid_neighbour_ui_mapper_key VARCHAR(255);

ALTER TABLE districts
    ADD COLUMN IF NOT EXISTS level_up_required_faction_trait_keys TEXT;
