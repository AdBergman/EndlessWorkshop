ALTER TABLE quest_explorer_branches
    ADD COLUMN revealed_by_branch_keys TEXT;

ALTER TABLE quest_explorer_branches
    ADD COLUMN revealed_by_choice_keys TEXT;

ALTER TABLE quest_explorer_branches
    ADD COLUMN revealed_by_branch_path_alternatives TEXT;

ALTER TABLE quest_explorer_objectives
    ADD COLUMN revealed_by_branch_keys TEXT;

ALTER TABLE quest_explorer_objectives
    ADD COLUMN revealed_by_choice_keys TEXT;

ALTER TABLE quest_explorer_objectives
    ADD COLUMN revealed_by_branch_path_alternatives TEXT;

ALTER TABLE quest_explorer_lore_sections
    ADD COLUMN revealed_by_branch_keys TEXT;

ALTER TABLE quest_explorer_lore_sections
    ADD COLUMN revealed_by_choice_keys TEXT;

ALTER TABLE quest_explorer_lore_sections
    ADD COLUMN revealed_by_branch_path_alternatives TEXT;
