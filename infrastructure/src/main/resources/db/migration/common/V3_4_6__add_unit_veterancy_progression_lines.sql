CREATE TABLE IF NOT EXISTS unit_veterancy_progression_lines (
                                                               unit_id BIGINT NOT NULL,
                                                               line_index INTEGER NOT NULL,
                                                               line TEXT NOT NULL,
                                                               CONSTRAINT pk_unit_veterancy_progression_lines PRIMARY KEY (unit_id, line_index),
                                                               CONSTRAINT fk_unit_veterancy_progression_lines_unit
                                                                   FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_unit_veterancy_progression_lines_unit_id
    ON unit_veterancy_progression_lines(unit_id);
