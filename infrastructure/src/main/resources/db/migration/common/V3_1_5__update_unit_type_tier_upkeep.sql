-- ==========================================================
-- Rename column upkeep_per_turn → upkeep
-- ==========================================================

ALTER TABLE unit_specialization
    RENAME COLUMN upkeep_per_turn TO upkeep;


-- ==========================================================
-- KIN FACTION — FULL UNIT TYPE / TIER / UPKEEP REBALANCE
-- ==========================================================

-- 🏹 RANGED LINE
UPDATE unit_specialization SET type = 'RANGED', tier = 1, upkeep = 10 WHERE name = 'Archer';
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 15 WHERE name = 'Heavy Archer';
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 15 WHERE name = 'Bloodletter';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 10 WHERE name = 'Bowmaster';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 10 WHERE name = 'Executor';

-- ⚔️ INFANTRY LINE
UPDATE unit_specialization SET type = 'INFANTRY', tier = 1, upkeep = 6 WHERE name = 'Legionary';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 10 WHERE name = 'Defender';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 10 WHERE name = 'Warden';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 15 WHERE name = 'Guardian';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 10 WHERE name = 'Custodian';

-- 🐎 CAVALRY LINE
UPDATE unit_specialization SET type = 'CAVALRY', tier = 1, upkeep = 4 WHERE name = 'Sentinel';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 2, upkeep = 6 WHERE name = 'Explorer';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 2, upkeep = 6 WHERE name = 'Harrier';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 3, upkeep = 10 WHERE name = 'Pathfinder';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 3, upkeep = 10 WHERE name = 'Harasser';

-- 🕊️ SUPPORT LINE
UPDATE unit_specialization SET type = 'CAVALRY', tier = 1, upkeep = 15 WHERE name = 'Herald of the Faith';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 2, upkeep = 15 WHERE name = 'Clarion';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 2, upkeep = 15 WHERE name = 'Protector';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 3, upkeep = 15 WHERE name = 'Commander';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 3, upkeep = 15 WHERE name = 'Champion';

-- ⚒️ CHOSEN (JUGGERNAUT) LINE
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 1, upkeep = 15 WHERE name = 'Chosen';
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 2, upkeep = 15 WHERE name = 'Architect';
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 3, upkeep = 15 WHERE name = 'Greatsword';
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 4, upkeep = 15 WHERE name = 'Vanguard''s Sword';

-- ==========================================================
-- LORDS FACTION — FULL UNIT TYPE / TIER / UPKEEP REBALANCE
-- ==========================================================

-- ⚔️ INFANTRY LINE 1 (Thrall → Scavenger → Shadow Lord)
UPDATE unit_specialization SET type = 'INFANTRY', tier = 1, upkeep = 4 WHERE name = 'Thrall';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 6 WHERE name = 'Scavenger';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 4 WHERE name = 'Shadow Lord';

-- ⚔️ INFANTRY LINE 2 (Thrall alt → Fleetfoot → Executioner)
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 6 WHERE name = 'Fleetfoot';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 4 WHERE name = 'Executioner';

-- ⚔️ INFANTRY LINE 3 (Stalwart → Fallen Knight → Merciless Knight)
UPDATE unit_specialization SET type = 'INFANTRY', tier = 1, upkeep = 6 WHERE name = 'Stalwart';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 10 WHERE name = 'Fallen Knight';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 15 WHERE name = 'Merciless Knight';

-- ⚔️ INFANTRY LINE 4 (Stalwart alt → Eldritch Knight → Consul's Guard)
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 10 WHERE name = 'Eldritch Knight';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 15 WHERE name = 'Consul''s Guard';

-- 💀 JUGGERNAUT_RANGED LINE (Palanquin → Venerable → Ancient)
UPDATE unit_specialization SET type = 'JUGGERNAUT_RANGED', tier = 1, upkeep = 10 WHERE name = 'Palanquin of the Profane';
UPDATE unit_specialization SET type = 'JUGGERNAUT_RANGED', tier = 2, upkeep = 15 WHERE name = 'Venerable Palanquin';
UPDATE unit_specialization SET type = 'JUGGERNAUT_RANGED', tier = 3, upkeep = 10 WHERE name = 'Ancient Palanquin';

-- 💀 JUGGERNAUT ALT LINE (Palanquin alt → Leeching → Soulsapping)
UPDATE unit_specialization SET type = 'JUGGERNAUT_RANGED', tier = 2, upkeep = 15 WHERE name = 'Leeching Palanquin';
UPDATE unit_specialization SET type = 'JUGGERNAUT_RANGED', tier = 3, upkeep = 10 WHERE name = 'Soulsapping Palanquin';

-- 🦇 FLYING LINE 1 (Dust Lord → Blood Master → Blood Tyrant)
UPDATE unit_specialization SET type = 'FLYING', tier = 1, upkeep = 15 WHERE name = 'Dust Lord';
UPDATE unit_specialization SET type = 'FLYING', tier = 2, upkeep = 20 WHERE name = 'Blood Master';
UPDATE unit_specialization SET type = 'FLYING', tier = 3, upkeep = 30 WHERE name = 'Blood Tyrant';

-- 🦇 FLYING LINE 2 (Dust Lord alt → Dread Lord → Dread Duke)
UPDATE unit_specialization SET type = 'FLYING', tier = 2, upkeep = 20 WHERE name = 'Dread Lord';
UPDATE unit_specialization SET type = 'FLYING', tier = 3, upkeep = 30 WHERE name = 'Dread Duke';

-- ==========================================================
-- TAHUK FACTION — FULL UNIT TYPE / TIER / UPKEEP REBALANCE
-- ==========================================================

-- 🐎 CAVALRY_RANGED LINE 1 (Initiate → Apprentice → True Guide)
UPDATE unit_specialization SET type = 'CAVALRY_RANGED', tier = 1, upkeep = 4 WHERE name = 'Initiate';
UPDATE unit_specialization SET type = 'CAVALRY_RANGED', tier = 2, upkeep = 4 WHERE name = 'Apprentice';
UPDATE unit_specialization SET type = 'CAVALRY_RANGED', tier = 3, upkeep = 4 WHERE name = 'True Guide';

-- 🐎 CAVALRY_RANGED LINE 2 (Initiate alt → Vigil Keeper → Vigil Master)
UPDATE unit_specialization SET type = 'CAVALRY_RANGED', tier = 2, upkeep = 4 WHERE name = 'Vigil Keeper';
UPDATE unit_specialization SET type = 'CAVALRY_RANGED', tier = 3, upkeep = 4 WHERE name = 'Vigil Master';

-- ⚔️ INFANTRY LINE 1 (Devotee → Fanatic → Zealot)
UPDATE unit_specialization SET type = 'INFANTRY', tier = 1, upkeep = 6 WHERE name = 'Devotee';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 6 WHERE name = 'Fanatic';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 6 WHERE name = 'Zealot';

-- ⚔️ INFANTRY LINE 2 (Devotee alt → Illuminator → Lightbringer)
UPDATE unit_specialization SET type = 'INFANTRY', tier = 2, upkeep = 6 WHERE name = 'Illuminator';
UPDATE unit_specialization SET type = 'INFANTRY', tier = 3, upkeep = 6 WHERE name = 'Lightbringer';

-- 🏹 RANGED LINE 1 (Relic Keeper → Holy Keeper → Divine Protector)
UPDATE unit_specialization SET type = 'RANGED', tier = 1, upkeep = 15 WHERE name = 'Relic Keeper';
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 15 WHERE name = 'Holy Keeper';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 15 WHERE name = 'Divine Protector';

-- 🏹 RANGED LINE 2 (Relic Keeper alt → Holy Smiter → Divine Smiter)
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 15 WHERE name = 'Holy Smiter';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 15 WHERE name = 'Divine Smiter';

-- 🔥 WRATH LINE 1 (Wrath Bearer → Magnified Wrath → Devastating Wrath)
UPDATE unit_specialization SET type = 'RANGED', tier = 1, upkeep = 30 WHERE name = 'Wrath Bearer';
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 30 WHERE name = 'Magnified Wrath';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 30 WHERE name = 'Devastating Wrath';

-- 🔥 WRATH LINE 2 (Wrath Bearer alt → Skeptics'' Bane → Fire of the Gods)
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 30 WHERE name = 'Skeptics'' Bane';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 30 WHERE name = 'Fire of the Gods';

-- 🎯 SPECIAL TIER 2 SUPPORT UNIT (Holy Protector)
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 15 WHERE name = 'Holy Protector';

-- ==========================================================
-- ASPECT FACTION — FULL UNIT TYPE / TIER / UPKEEP REBALANCE
-- ==========================================================

-- 🐜 SWARM LINE 1 (Envoy → Crawler → Scraper)
UPDATE unit_specialization SET type = 'SWARM', tier = 1, upkeep = 4 WHERE name = 'Envoy';
UPDATE unit_specialization SET type = 'SWARM', tier = 2, upkeep = 4 WHERE name = 'Crawler';
UPDATE unit_specialization SET type = 'SWARM', tier = 3, upkeep = 4 WHERE name = 'Scraper';

-- 🐜 SWARM LINE 2 (Envoy alt → Surveyor → Emissary)
UPDATE unit_specialization SET type = 'SWARM', tier = 2, upkeep = 4 WHERE name = 'Surveyor';
UPDATE unit_specialization SET type = 'SWARM', tier = 3, upkeep = 4 WHERE name = 'Emissary';

-- 🏹 RANGED LINE 1 (Sentry → Stinger → Pitiless Stinger)
UPDATE unit_specialization SET type = 'RANGED', tier = 1, upkeep = 6 WHERE name = 'Sentry';
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 6 WHERE name = 'Stinger';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 6 WHERE name = 'Pitiless Stinger';

-- 🏹 RANGED LINE 2 (Sentry alt → Resistor → Pitiless Resistor)
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 6 WHERE name = 'Resistor';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 6 WHERE name = 'Pitiless Resistor';

-- 🐎 CAVALRY LINE 1 (Observer → Peacemaker → Arbiter)
UPDATE unit_specialization SET type = 'CAVALRY', tier = 1, upkeep = 10 WHERE name = 'Observer';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 2, upkeep = 10 WHERE name = 'Peacemaker';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 3, upkeep = 10 WHERE name = 'Arbiter';

-- 🐎 CAVALRY LINE 2 (Observer alt → Guard of the Current → Currentwalker)
UPDATE unit_specialization SET type = 'CAVALRY', tier = 2, upkeep = 10 WHERE name = 'Guard of the Current';
UPDATE unit_specialization SET type = 'CAVALRY', tier = 3, upkeep = 10 WHERE name = 'Currentwalker';

-- 🕊️ FLYING LINE 1 (Skyscale → Brightscale → Scales of Balance)
UPDATE unit_specialization SET type = 'FLYING', tier = 1, upkeep = 15 WHERE name = 'Skyscale';
UPDATE unit_specialization SET type = 'FLYING', tier = 2, upkeep = 15 WHERE name = 'Brightscale';
UPDATE unit_specialization SET type = 'FLYING', tier = 3, upkeep = 15 WHERE name = 'Scales of Balance';

-- 🕊️ FLYING LINE 2 (Skyscale alt → Shadowscale → Scales of Justice)
UPDATE unit_specialization SET type = 'FLYING', tier = 2, upkeep = 15 WHERE name = 'Shadowscale';
UPDATE unit_specialization SET type = 'FLYING', tier = 3, upkeep = 15 WHERE name = 'Scales of Justice';

-- ==========================================================
-- NECROPHAGE FACTION — FULL TYPE / TIER / UPKEEP REBALANCE
-- ==========================================================
-- All tiers reduced by 1 (Larva starts at tier 0)
-- ==========================================================

-- 🪱 BASE FORM
UPDATE unit_specialization SET type = 'SWARM', tier = 0, upkeep = 4 WHERE name = 'Larva';

-- 🦋 FLYING LINE 1 (Larva → Necrodrone → Corpse Hunter → Bloodseeker)
UPDATE unit_specialization SET type = 'FLYING', tier = 1, upkeep = 6 WHERE name = 'Necrodrone';
UPDATE unit_specialization SET type = 'FLYING', tier = 2, upkeep = 10 WHERE name = 'Corpse Hunter';
UPDATE unit_specialization SET type = 'FLYING', tier = 3, upkeep = 15 WHERE name = 'Bloodseeker';

-- 🦋 FLYING LINE 2 (Larva alt → Necrodrone alt → Rusher → Hornet)
UPDATE unit_specialization SET type = 'FLYING', tier = 2, upkeep = 10 WHERE name = 'Rusher';
UPDATE unit_specialization SET type = 'FLYING', tier = 3, upkeep = 15 WHERE name = 'Hornet';

-- 🕷️ RANGED LINE 1 (Larva → Spitter → Corrupter → Defiler)
UPDATE unit_specialization SET type = 'RANGED', tier = 1, upkeep = 6 WHERE name = 'Spitter';
UPDATE unit_specialization SET type = 'RANGED', tier = 2, upkeep = 10 WHERE name = 'Corrupter';
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 15 WHERE name = 'Defiler';

-- 🕷️ RANGED LINE 2 (Spitter alt → Corrupter alt → Infestor)
UPDATE unit_specialization SET type = 'RANGED', tier = 3, upkeep = 15 WHERE name = 'Infestor';

-- 🐜 SWARM LINE 1 (Larva → Feeder → Soldier → Slicer)
UPDATE unit_specialization SET type = 'SWARM', tier = 1, upkeep = 6 WHERE name = 'Feeder';
UPDATE unit_specialization SET type = 'SWARM', tier = 2, upkeep = 10 WHERE name = 'Soldier';
UPDATE unit_specialization SET type = 'SWARM', tier = 3, upkeep = 15 WHERE name = 'Slicer';

-- 🦍 JUGGERNAUT LINE (Larva alt → Behemoth → Savage Behemoth → Lurking Behemoth)
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 2, upkeep = 15 WHERE name = 'Behemoth';
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 3, upkeep = 30 WHERE name = 'Savage Behemoth';
UPDATE unit_specialization SET type = 'JUGGERNAUT', tier = 3, upkeep = 30 WHERE name = 'Lurking Behemoth';



ALTER TABLE unit_specialization
    ALTER COLUMN tier SET NOT NULL;