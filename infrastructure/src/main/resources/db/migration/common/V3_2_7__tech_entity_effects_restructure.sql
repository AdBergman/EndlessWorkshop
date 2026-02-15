CREATE TABLE IF NOT EXISTS tech_effect_lines (
                                                 tech_id BIGINT NOT NULL,
                                                 effect_line VARCHAR(255) NOT NULL
);

INSERT INTO tech_effect_lines (tech_id, effect_line)
SELECT tech_entity_id, effects
FROM tech_entity_effects;

DROP TABLE tech_entity_effects;