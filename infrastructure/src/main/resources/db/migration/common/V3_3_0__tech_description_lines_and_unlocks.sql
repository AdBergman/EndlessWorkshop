-- V###__tech_description_lines_and_unlocks.sql
-- Works on PostgreSQL + H2
-- Assumption: after migration you will re-import techs, so we do NOT migrate old tech_effect_lines data.

-- 1) New canonical table for tech description lines
CREATE TABLE IF NOT EXISTS tech_description_lines (
                                                      tech_id     BIGINT        NOT NULL,
                                                      line_index  INT           NOT NULL,
                                                      line_text   VARCHAR(4000) NOT NULL,
                                                      CONSTRAINT pk_tech_description_lines PRIMARY KEY (tech_id, line_index),
                                                      CONSTRAINT fk_tech_description_lines_tech
                                                          FOREIGN KEY (tech_id) REFERENCES tech(id) ON DELETE CASCADE
);

-- Drop legacy table (we'll re-import techs so no need to migrate data)
DROP TABLE IF EXISTS tech_effect_lines;

-- 2) tech_unlocks: ordered shallow refs
CREATE TABLE IF NOT EXISTS tech_unlocks (
                                            tech_id      BIGINT       NOT NULL,
                                            order_index  INT          NOT NULL,
                                            unlock_type  VARCHAR(64)  NOT NULL,
                                            unlock_key   VARCHAR(255) NOT NULL,
                                            CONSTRAINT pk_tech_unlocks PRIMARY KEY (tech_id, order_index),
                                            CONSTRAINT fk_tech_unlocks_tech
                                                FOREIGN KEY (tech_id) REFERENCES tech(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_tech_unlocks_unlock_key
    ON tech_unlocks (unlock_key);