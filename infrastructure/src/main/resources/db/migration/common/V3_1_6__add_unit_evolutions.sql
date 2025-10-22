-- ==========================================
-- Create table for multiple "upgrades_to" entries
-- ==========================================
CREATE TABLE IF NOT EXISTS unit_evolutions_to
(
    unit_id          BIGINT REFERENCES unit_specialization (id),
    target_unit_name VARCHAR(255),
    CONSTRAINT uq_unit_evolution UNIQUE (unit_id, target_unit_name),
    CONSTRAINT fk_unit_specialization FOREIGN KEY (unit_id)
        REFERENCES unit_specialization (id)
        ON DELETE CASCADE
);

-- ==========================================
-- === JUGGERNAUT LINE ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Architect'
FROM unit_specialization
WHERE name = 'Chosen';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Greatsword'
FROM unit_specialization
WHERE name = 'Architect';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Vanguard''s Sword'
FROM unit_specialization
WHERE name = 'Greatsword';

-- ==========================================
-- === RANGED LINE ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Heavy Archer'
FROM unit_specialization
WHERE name = 'Archer';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Bloodletter'
FROM unit_specialization
WHERE name = 'Archer';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Bowmaster'
FROM unit_specialization
WHERE name = 'Heavy Archer';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Executor'
FROM unit_specialization
WHERE name = 'Bloodletter';

-- ==========================================
-- === INFANTRY LINE ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Defender'
FROM unit_specialization
WHERE name = 'Legionary';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Warden'
FROM unit_specialization
WHERE name = 'Legionary';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Guardian'
FROM unit_specialization
WHERE name = 'Defender';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Custodian'
FROM unit_specialization
WHERE name = 'Warden';

-- ==========================================
-- === CAVALRY LINE 1 (Herald path) ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Protector'
FROM unit_specialization
WHERE name = 'Herald of the Faith';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Clarion'
FROM unit_specialization
WHERE name = 'Herald of the Faith';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Champion'
FROM unit_specialization
WHERE name = 'Protector';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Commander'
FROM unit_specialization
WHERE name = 'Clarion';

-- ==========================================
-- === CAVALRY LINE 2 (Sentinel path) ===
-- ==========================================
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Harrier'
FROM unit_specialization
WHERE name = 'Sentinel';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Explorer'
FROM unit_specialization
WHERE name = 'Sentinel';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Harasser'
FROM unit_specialization
WHERE name = 'Harrier';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Pathfinder'
FROM unit_specialization
WHERE name = 'Explorer';
