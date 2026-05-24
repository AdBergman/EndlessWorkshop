ALTER TABLE quest_explorer_branches
    ADD COLUMN branch_step_order INTEGER;

ALTER TABLE quest_explorer_branches
    ADD COLUMN parent_branch_key VARCHAR(360);

ALTER TABLE quest_explorer_branches
    ADD COLUMN parent_choice_key VARCHAR(300);

ALTER TABLE quest_explorer_branches
    ADD COLUMN choice_group_key VARCHAR(360);

ALTER TABLE quest_explorer_branches
    ADD COLUMN convergence_group_key VARCHAR(360);

ALTER TABLE quest_explorer_branches
    ADD COLUMN section_role VARCHAR(80);

CREATE TABLE quest_explorer_branch_prerequisite_keys (
    branch_id BIGINT NOT NULL,
    key_order INTEGER NOT NULL,
    branch_key VARCHAR(360) NOT NULL,
    CONSTRAINT pk_quest_explorer_branch_prereq_keys PRIMARY KEY (branch_id, key_order),
    CONSTRAINT fk_quest_explorer_branch_prereq_keys
        FOREIGN KEY (branch_id) REFERENCES quest_explorer_branches(id) ON DELETE CASCADE
);

CREATE TABLE quest_explorer_branch_prerequisite_path (
    branch_id BIGINT NOT NULL,
    path_order INTEGER NOT NULL,
    branch_key VARCHAR(360) NOT NULL,
    CONSTRAINT pk_quest_explorer_branch_prereq_path PRIMARY KEY (branch_id, path_order),
    CONSTRAINT fk_quest_explorer_branch_prereq_path
        FOREIGN KEY (branch_id) REFERENCES quest_explorer_branches(id) ON DELETE CASCADE
);

CREATE INDEX idx_quest_explorer_branch_prereq_keys_branch ON quest_explorer_branch_prerequisite_keys(branch_id);
CREATE INDEX idx_quest_explorer_branch_prereq_path_branch ON quest_explorer_branch_prerequisite_path(branch_id);
CREATE INDEX idx_quest_explorer_branches_section_role ON quest_explorer_branches(section_role);
