-- ==========================================
-- V3_2_1__add_skill_scaling_columns.sql
-- ==========================================
-- Adds linear scaling columns for hero/unit attributes:
--   - scaling_might
--   - scaling_resilience
--   - scaling_intuition
--   - scaling_determination
--
-- Compatible with both Postgres and H2.

ALTER TABLE unit_skills ADD COLUMN scaling_might INTEGER;
ALTER TABLE unit_skills ADD COLUMN scaling_resilience INTEGER;
ALTER TABLE unit_skills ADD COLUMN scaling_intuition INTEGER;
ALTER TABLE unit_skills ADD COLUMN scaling_determination INTEGER;