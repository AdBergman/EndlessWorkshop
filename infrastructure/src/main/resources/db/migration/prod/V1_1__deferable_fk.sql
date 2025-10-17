-- ==============================
-- Make all foreign keys DEFERRABLE
-- ==============================

-- DISTRICT_ADJACENCY_BONUSES
ALTER TABLE district_adjacency_bonuses
    DROP CONSTRAINT fk_district_adj;
ALTER TABLE district_adjacency_bonuses
    ADD CONSTRAINT fk_district_adj
        FOREIGN KEY (district_id)
            REFERENCES districts(id)
            DEFERRABLE INITIALLY DEFERRED;

-- DISTRICT_INFO
ALTER TABLE district_info
    DROP CONSTRAINT fk_district_info;
ALTER TABLE district_info
    ADD CONSTRAINT fk_district_info
        FOREIGN KEY (district_id)
            REFERENCES districts(id)
            DEFERRABLE INITIALLY DEFERRED;

-- DISTRICT_TILE_BONUSES
ALTER TABLE district_tile_bonuses
    DROP CONSTRAINT fk_district_tile;
ALTER TABLE district_tile_bonuses
    ADD CONSTRAINT fk_district_tile
        FOREIGN KEY (district_id)
            REFERENCES districts(id)
            DEFERRABLE INITIALLY DEFERRED;

-- IMPROVEMENT_COSTS
ALTER TABLE improvement_costs
    DROP CONSTRAINT fk_improvement_cost;
ALTER TABLE improvement_costs
    ADD CONSTRAINT fk_improvement_cost
        FOREIGN KEY (improvement_id)
            REFERENCES improvements(id)
            DEFERRABLE INITIALLY DEFERRED;

-- IMPROVEMENT_EFFECTS
ALTER TABLE improvement_effects
    DROP CONSTRAINT fk_improvement_effect;
ALTER TABLE improvement_effects
    ADD CONSTRAINT fk_improvement_effect
        FOREIGN KEY (improvement_id)
            REFERENCES improvements(id)
            DEFERRABLE INITIALLY DEFERRED;

-- SHARED_TECH_BUILD_TECHS
ALTER TABLE shared_tech_build_techs
    DROP CONSTRAINT fk_shared_tech_build;
ALTER TABLE shared_tech_build_techs
    ADD CONSTRAINT fk_shared_tech_build
        FOREIGN KEY (build_id)
            REFERENCES shared_tech_builds(id)
            DEFERRABLE INITIALLY DEFERRED;

-- TECH
ALTER TABLE tech
    DROP CONSTRAINT fk_tech_prereq;
ALTER TABLE tech
    ADD CONSTRAINT fk_tech_prereq
        FOREIGN KEY (prereq_id)
            REFERENCES tech(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech
    DROP CONSTRAINT fk_tech_excludes;
ALTER TABLE tech
    ADD CONSTRAINT fk_tech_excludes
        FOREIGN KEY (excludes_id)
            REFERENCES tech(id)
            DEFERRABLE INITIALLY DEFERRED;

-- TECH_ENTITY_EFFECTS
ALTER TABLE tech_entity_effects
    DROP CONSTRAINT fk_tech_entity_effect;
ALTER TABLE tech_entity_effects
    ADD CONSTRAINT fk_tech_entity_effect
        FOREIGN KEY (tech_entity_id)
            REFERENCES tech(id)
            DEFERRABLE INITIALLY DEFERRED;

-- TECH_ENTITY_FACTIONS
ALTER TABLE tech_entity_factions
    DROP CONSTRAINT fk_tech_entity_faction;
ALTER TABLE tech_entity_factions
    ADD CONSTRAINT fk_tech_entity_faction
        FOREIGN KEY (tech_entity_id)
            REFERENCES tech(id)
            DEFERRABLE INITIALLY DEFERRED;

-- TECH_UNLOCK
ALTER TABLE tech_unlock
    DROP CONSTRAINT fk_tech_unlock_treaty;
ALTER TABLE tech_unlock
    ADD CONSTRAINT fk_tech_unlock_treaty
        FOREIGN KEY (treaty_id)
            REFERENCES treaty(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech_unlock
    DROP CONSTRAINT fk_tech_unlock_district;
ALTER TABLE tech_unlock
    ADD CONSTRAINT fk_tech_unlock_district
        FOREIGN KEY (district_id)
            REFERENCES districts(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech_unlock
    DROP CONSTRAINT fk_tech_unlock_tech;
ALTER TABLE tech_unlock
    ADD CONSTRAINT fk_tech_unlock_tech
        FOREIGN KEY (tech_id)
            REFERENCES tech(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech_unlock
    DROP CONSTRAINT fk_tech_unlock_unit;
ALTER TABLE tech_unlock
    ADD CONSTRAINT fk_tech_unlock_unit
        FOREIGN KEY (unit_specialization_id)
            REFERENCES unit_specialization(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech_unlock
    DROP CONSTRAINT fk_tech_unlock_improvement;
ALTER TABLE tech_unlock
    ADD CONSTRAINT fk_tech_unlock_improvement
        FOREIGN KEY (improvement_id)
            REFERENCES improvements(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech_unlock
    DROP CONSTRAINT fk_tech_unlock_convertor;
ALTER TABLE tech_unlock
    ADD CONSTRAINT fk_tech_unlock_convertor
        FOREIGN KEY (convertor_id)
            REFERENCES convertor(id)
            DEFERRABLE INITIALLY DEFERRED;

-- TECH_UNLOCKS
ALTER TABLE tech_unlocks
    DROP CONSTRAINT fk_tech_unlocks_tech;
ALTER TABLE tech_unlocks
    ADD CONSTRAINT fk_tech_unlocks_tech
        FOREIGN KEY (tech_entity_id)
            REFERENCES tech(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE tech_unlocks
    DROP CONSTRAINT fk_tech_unlocks_unlock;
ALTER TABLE tech_unlocks
    ADD CONSTRAINT fk_tech_unlocks_unlock
        FOREIGN KEY (unlocks_id)
            REFERENCES tech_unlock(id)
            DEFERRABLE INITIALLY DEFERRED;

-- UNIT_SPECIALIZATION_COSTS
ALTER TABLE unit_specialization_costs
    DROP CONSTRAINT fk_unit_specialization_cost;
ALTER TABLE unit_specialization_costs
    ADD CONSTRAINT fk_unit_specialization_cost
        FOREIGN KEY (unit_id)
            REFERENCES unit_specialization(id)
            DEFERRABLE INITIALLY DEFERRED;

-- UNIT_SPECIALIZATION_SKILLS
ALTER TABLE unit_specialization_skills
    DROP CONSTRAINT fk_unit_spec_skill_skill;
ALTER TABLE unit_specialization_skills
    ADD CONSTRAINT fk_unit_spec_skill_skill
        FOREIGN KEY (skill_id)
            REFERENCES unit_skills(id)
            DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE unit_specialization_skills
    DROP CONSTRAINT fk_unit_spec_skill_unit;
ALTER TABLE unit_specialization_skills
    ADD CONSTRAINT fk_unit_spec_skill_unit
        FOREIGN KEY (unit_id)
            REFERENCES unit_specialization(id)
            DEFERRABLE INITIALLY DEFERRED;
