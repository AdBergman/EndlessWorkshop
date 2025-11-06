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


-- ==========================================
-- TAHUK Evolution Chains
-- ==========================================

-- Initiate Branch
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Apprentice' FROM unit_specialization WHERE name = 'Initiate';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Vigil Keeper' FROM unit_specialization WHERE name = 'Initiate';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'True Guide' FROM unit_specialization WHERE name = 'Apprentice';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Vigil Master' FROM unit_specialization WHERE name = 'Vigil Keeper';

-- Devotee Branch
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Fanatic' FROM unit_specialization WHERE name = 'Devotee';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Illuminator' FROM unit_specialization WHERE name = 'Devotee';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Zealot' FROM unit_specialization WHERE name = 'Fanatic';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Lightbringer' FROM unit_specialization WHERE name = 'Illuminator';

-- Relic Keeper Branch
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Holy Keeper' FROM unit_specialization WHERE name = 'Relic Keeper';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Holy Smiter' FROM unit_specialization WHERE name = 'Relic Keeper';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Divine Protector' FROM unit_specialization WHERE name = 'Holy Keeper';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Divine Smiter' FROM unit_specialization WHERE name = 'Holy Smiter';

-- Wrath Bearer Branch
INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Magnified Wrath' FROM unit_specialization WHERE name = 'Wrath Bearer';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Skeptics'' Bane' FROM unit_specialization WHERE name = 'Wrath Bearer';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Devastating Wrath' FROM unit_specialization WHERE name = 'Magnified Wrath';

INSERT INTO unit_evolutions_to (unit_id, target_unit_name)
SELECT id, 'Fire of the Gods' FROM unit_specialization WHERE name = 'Skeptics'' Bane';


-- ==========================================
-- LAST LORDS Evolution Chains
-- ==========================================

-- Thrall Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Scavenger' FROM "unit_specialization" WHERE "name" = 'Thrall';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Fleetfoot' FROM "unit_specialization" WHERE "name" = 'Thrall';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Shadow Lord' FROM "unit_specialization" WHERE "name" = 'Scavenger';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Executioner' FROM "unit_specialization" WHERE "name" = 'Fleetfoot';


-- Stalwart Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Fallen Knight' FROM "unit_specialization" WHERE "name" = 'Stalwart';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Eldritch Knight' FROM "unit_specialization" WHERE "name" = 'Stalwart';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Merciless Knight' FROM "unit_specialization" WHERE "name" = 'Fallen Knight';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Consul''s Guard' FROM "unit_specialization" WHERE "name" = 'Eldritch Knight';


-- Palanquin Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Venerable Palanquin' FROM "unit_specialization" WHERE "name" = 'Palanquin of the Profane';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Leeching Palanquin' FROM "unit_specialization" WHERE "name" = 'Palanquin of the Profane';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Ancient Palanquin' FROM "unit_specialization" WHERE "name" = 'Venerable Palanquin';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Soulsapping Palanquin' FROM "unit_specialization" WHERE "name" = 'Leeching Palanquin';


-- Dust Lord Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Blood Master' FROM "unit_specialization" WHERE "name" = 'Dust Lord';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Dread Lord' FROM "unit_specialization" WHERE "name" = 'Dust Lord';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Blood Tyrant' FROM "unit_specialization" WHERE "name" = 'Blood Master';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Dread Duke' FROM "unit_specialization" WHERE "name" = 'Dread Lord';


-- ==========================================
-- ASPECT Evolution Chains
-- ==========================================

-- Envoy Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Crawler' FROM "unit_specialization" WHERE "name" = 'Envoy';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Surveyor' FROM "unit_specialization" WHERE "name" = 'Envoy';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Scraper' FROM "unit_specialization" WHERE "name" = 'Crawler';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Emissary' FROM "unit_specialization" WHERE "name" = 'Surveyor';


-- Sentry Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Stinger' FROM "unit_specialization" WHERE "name" = 'Sentry';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Resistor' FROM "unit_specialization" WHERE "name" = 'Sentry';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Pitiless Stinger' FROM "unit_specialization" WHERE "name" = 'Stinger';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Pitiless Resistor' FROM "unit_specialization" WHERE "name" = 'Resistor';


-- Observer Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Peacemaker' FROM "unit_specialization" WHERE "name" = 'Observer';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Guard of the Current' FROM "unit_specialization" WHERE "name" = 'Observer';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Arbiter' FROM "unit_specialization" WHERE "name" = 'Peacemaker';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Currentwalker' FROM "unit_specialization" WHERE "name" = 'Guard of the Current';


-- Skyscale Branch
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Brightscale' FROM "unit_specialization" WHERE "name" = 'Skyscale';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Shadowscale' FROM "unit_specialization" WHERE "name" = 'Skyscale';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Scales of Balance' FROM "unit_specialization" WHERE "name" = 'Brightscale';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Scales of Justice' FROM "unit_specialization" WHERE "name" = 'Shadowscale';


-- ==========================================
-- NECROPHAGE Evolution Chains (Larva excluded)
-- T2 treated as T1, T3 as T2, T4 as T3
-- ==========================================

-- Necrodrone branches
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Corpse Hunter' FROM "unit_specialization" WHERE "name" = 'Necrodrone';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Rusher' FROM "unit_specialization" WHERE "name" = 'Necrodrone';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Bloodseeker' FROM "unit_specialization" WHERE "name" = 'Corpse Hunter';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Hornet' FROM "unit_specialization" WHERE "name" = 'Rusher';


-- Spitter branches
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Corrupter' FROM "unit_specialization" WHERE "name" = 'Spitter';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Defiler' FROM "unit_specialization" WHERE "name" = 'Corrupter';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Infestor' FROM "unit_specialization" WHERE "name" = 'Corrupter';


-- Feeder branches
INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Soldier' FROM "unit_specialization" WHERE "name" = 'Feeder';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Behemoth' FROM "unit_specialization" WHERE "name" = 'Feeder';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Slicer' FROM "unit_specialization" WHERE "name" = 'Soldier';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Savage Behemoth' FROM "unit_specialization" WHERE "name" = 'Behemoth';

INSERT INTO "unit_evolutions_to" ("unit_id", "target_unit_name")
SELECT "id", 'Lurking Behemoth' FROM "unit_specialization" WHERE "name" = 'Behemoth';
