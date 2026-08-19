ALTER TABLE tech_prereq_key
    DROP CONSTRAINT IF EXISTS fk_tech_prereq_key_tech;

ALTER TABLE tech_prereq_key
    ADD CONSTRAINT fk_tech_prereq_key_tech
        FOREIGN KEY (tech_id) REFERENCES tech(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ix_tech_prereq_key_tech_id
    ON tech_prereq_key (tech_id);

CREATE INDEX IF NOT EXISTS ix_tech_prereq_key_prereq_tech_key
    ON tech_prereq_key (prereq_tech_key);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tech_prereq_key
    ON tech_prereq_key (tech_id, prereq_tech_key);

ALTER TABLE tech_exclusive_prereq_key
    DROP CONSTRAINT IF EXISTS fk_tech_exclusive_prereq_key_tech;

ALTER TABLE tech_exclusive_prereq_key
    ADD CONSTRAINT fk_tech_exclusive_prereq_key_tech
        FOREIGN KEY (tech_id) REFERENCES tech(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS ix_tech_exclusive_prereq_key_tech_id
    ON tech_exclusive_prereq_key (tech_id);

CREATE INDEX IF NOT EXISTS ix_tech_exclusive_prereq_key_exclusive_prereq_tech_key
    ON tech_exclusive_prereq_key (exclusive_prereq_tech_key);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tech_exclusive_prereq_key
    ON tech_exclusive_prereq_key (tech_id, exclusive_prereq_tech_key);
