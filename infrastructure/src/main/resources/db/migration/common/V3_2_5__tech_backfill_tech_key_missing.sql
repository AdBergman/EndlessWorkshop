-- V3_2_5__tech_backfill_tech_key_missing.sql
-- Backfill tech.tech_key for legacy rows that were still NULL after V3_2_4.
-- Safe / idempotent: only updates rows where tech_key IS NULL.
-- Compatible with Postgres (prod) and H2 (local).

------------------------------------------------------------
-- Mass Psychology
------------------------------------------------------------
update tech
set tech_key = 'Technology_Influence_00'
where tech_key is null
  and name = 'Mass Psychology';

------------------------------------------------------------
-- Matriarch's Orison / Glory (handle both straight and curly apostrophes)
------------------------------------------------------------
update tech
set tech_key = 'Necrophage_Technology_DistrictImprovement_CityCenter_00'
where tech_key is null
  and name in ('Matriarch''s Orison', 'Matriarch’s Orison');

update tech
set tech_key = 'Necrophage_Technology_DistrictImprovement_CityCenter_02'
where tech_key is null
  and name in ('Matriarch''s Glory', 'Matriarch’s Glory');

------------------------------------------------------------
-- Sages' Insight / Vision / Wisdom (handle both straight and curly apostrophes)
------------------------------------------------------------
update tech
set tech_key = 'Mukag_Technology_Unit_Specialization_01'
where tech_key is null
  and name in ('Sages'' Wisdom', 'Sages’ Wisdom');

update tech
set tech_key = 'Mukag_Technology_Unit_Specialization_02'
where tech_key is null
  and name in ('Sages'' Insight', 'Sages’ Insight');

update tech
set tech_key = 'Mukag_Technology_Unit_Specialization_03'
where tech_key is null
  and name in ('Sages'' Vision', 'Sages’ Vision');
