ALTER TABLE units
    ADD COLUMN IF NOT EXISTS unit_class_display_name VARCHAR(255);
