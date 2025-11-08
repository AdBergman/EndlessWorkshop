-- ==========================================
-- V3_1_7__add_minor_unit_evolutions.sql
-- ==========================================
-- This migration links minor faction units across their evolutionary tiers:
-- Base -> Mighty, Mighty -> Elite.
-- Each minor faction only has one unit line (same name pattern).

-- ==========================================
-- === T1 -> T2 (Base -> Mighty Base) ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT base.id, 'Mighty ' || base.name AS target_unit_name
FROM unit_specialization base
WHERE base.faction IN (
                       'Ametrine', 'Blackhammers', 'Daughters of Bor', 'Green Scions', 'Foundlings',
                       'Gorogs', 'Hoy and Ladhran', 'Hydracorns', 'Noquensii', 'Ochlings',
                       'Oneiroi', 'Sollusk', 'Consortium', 'Unseeing Seers', 'Xavius'
    )
  AND EXISTS (
    SELECT 1
    FROM unit_specialization next
    WHERE next.name = 'Mighty ' || base.name
      AND next.faction = base.faction
)
ON CONFLICT DO NOTHING;

-- ==========================================
-- === T2 -> T3 (Mighty Base -> Elite Base) ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT mid.id, 'Elite ' || base.name AS target_unit_name
FROM unit_specialization mid
         JOIN unit_specialization base
              ON mid.name = 'Mighty ' || base.name
                  AND mid.faction = base.faction
WHERE mid.faction IN (
                      'Ametrine', 'Blackhammers', 'Daughters of Bor', 'Green Scions', 'Foundlings',
                      'Gorogs', 'Hoy and Ladhran', 'Hydracorns', 'Noquensii', 'Ochlings',
                      'Oneiroi', 'Sollusk', 'Consortium', 'Unseeing Seers', 'Xavius'
    )
  AND EXISTS (
    SELECT 1
    FROM unit_specialization elite
    WHERE elite.name = 'Elite ' || base.name
      AND elite.faction = base.faction
)
ON CONFLICT DO NOTHING;

-- ==========================================
-- === Notes ===
-- - Prevents duplicates via ON CONFLICT.
-- - Automatically detects valid evolution chains based on naming.
-- - Ignores missing tiers (if a faction only has T1/T2, it won’t break).
-- ==========================================
