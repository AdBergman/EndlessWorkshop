-- rename join table
ALTER TABLE IF EXISTS tech_entity_factions RENAME TO tech_faction;

-- rename join column (only if it exists with the old name)
ALTER TABLE IF EXISTS tech_faction RENAME COLUMN tech_entity_id TO tech_id;

-- drop rules table (since we don't persist rules anymore)
DROP TABLE IF EXISTS tech_trait_prereq;