-- =============================================
-- Add 'tier' column to unit_specialization table
-- =============================================

ALTER TABLE unit_specialization
    ADD COLUMN tier INT DEFAULT 1;

-- =============================================
-- End of schema update
-- =============================================



-- =============================================
-- Update KIN unit stats: health, defense, damage, movement
-- =============================================

UPDATE unit_specialization SET health = 120, defense = 0, min_damage = 40, max_damage = 52, movement_points = 3 WHERE name = 'Archer';
UPDATE unit_specialization SET health = 160, defense = 5, min_damage = 40, max_damage = 52, movement_points = 3 WHERE name = 'Heavy Archer';
UPDATE unit_specialization SET health = 200, defense = 10, min_damage = 40, max_damage = 52, movement_points = 3 WHERE name = 'Bowmaster';
UPDATE unit_specialization SET health = 140, defense = 0, min_damage = 53, max_damage = 66, movement_points = 3 WHERE name = 'Bloodletter';
UPDATE unit_specialization SET health = 160, defense = 0, min_damage = 66, max_damage = 78, movement_points = 3 WHERE name = 'Executor';
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 35, max_damage = 50, movement_points = 3 WHERE name = 'Chosen';
UPDATE unit_specialization SET health = 200, defense = 15, min_damage = 40, max_damage = 55, movement_points = 3 WHERE name = 'Architect';
UPDATE unit_specialization SET health = 240, defense = 20, min_damage = 45, max_damage = 60, movement_points = 3 WHERE name = 'Greatsword';
UPDATE unit_specialization SET health = 280, defense = 25, min_damage = 50, max_damage = 65, movement_points = 3 WHERE name = 'Vanguard''s Sword';
UPDATE unit_specialization SET health = 170, defense = 15, min_damage = 42, max_damage = 56, movement_points = 4 WHERE name = 'Herald of the Faith';
UPDATE unit_specialization SET health = 220, defense = 20, min_damage = 42, max_damage = 56, movement_points = 4 WHERE name = 'Clarion';
UPDATE unit_specialization SET health = 270, defense = 25, min_damage = 42, max_damage = 56, movement_points = 4 WHERE name = 'Commander';
UPDATE unit_specialization SET health = 200, defense = 15, min_damage = 55, max_damage = 70, movement_points = 4 WHERE name = 'Protector';
UPDATE unit_specialization SET health = 230, defense = 15, min_damage = 68, max_damage = 82, movement_points = 4 WHERE name = 'Champion';
UPDATE unit_specialization SET health = 120, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Legionary';
UPDATE unit_specialization SET health = 140, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Defender';
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 55, max_damage = 65, movement_points = 3 WHERE name = 'Guardian';
UPDATE unit_specialization SET health = 160, defense = 15, min_damage = 40, max_damage = 50, movement_points = 3 WHERE name = 'Warden';
UPDATE unit_specialization SET health = 200, defense = 20, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Custodian';
UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 30, max_damage = 40, movement_points = 4 WHERE name = 'Sentinel';
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 30, max_damage = 40, movement_points = 4 WHERE name = 'Explorer';
UPDATE unit_specialization SET health = 200, defense = 15, min_damage = 30, max_damage = 40, movement_points = 4 WHERE name = 'Pathfinder';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 40, max_damage = 50, movement_points = 4 WHERE name = 'Harrier';
UPDATE unit_specialization SET health = 180, defense = 5, min_damage = 50, max_damage = 60, movement_points = 4 WHERE name = 'Harasser';

-- =============================================
-- End of Kin unit stat updates
-- =============================================


-- =============================================
-- Update LAST LORDS unit stats: health, defense, damage, movement
-- =============================================

UPDATE unit_specialization SET health = 150, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Palanquin of the Profane';
UPDATE unit_specialization SET health = 200, defense = 15, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Venerable Palanquin';
UPDATE unit_specialization SET health = 250, defense = 20, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Ancient Palanquin';
UPDATE unit_specialization SET health = 175, defense = 10, min_damage = 50, max_damage = 60, movement_points = 3 WHERE name = 'Leeching Palanquin';
UPDATE unit_specialization SET health = 200, defense = 10, min_damage = 55, max_damage = 65, movement_points = 3 WHERE name = 'Soulsapping Palanquin';

UPDATE unit_specialization SET health = 250, defense = 10, min_damage = 45, max_damage = 60, movement_points = 4 WHERE name = 'Dust Lord';
UPDATE unit_specialization SET health = 300, defense = 20, min_damage = 45, max_damage = 60, movement_points = 4 WHERE name = 'Blood Master';
UPDATE unit_specialization SET health = 350, defense = 30, min_damage = 45, max_damage = 60, movement_points = 4 WHERE name = 'Blood Tyrant';
UPDATE unit_specialization SET health = 275, defense = 10, min_damage = 60, max_damage = 75, movement_points = 4 WHERE name = 'Dread Lord';
UPDATE unit_specialization SET health = 300, defense = 10, min_damage = 75, max_damage = 90, movement_points = 4 WHERE name = 'Dread Duke';

UPDATE unit_specialization SET health = 120, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Stalwart';
UPDATE unit_specialization SET health = 160, defense = 15, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Fallen Knight';
UPDATE unit_specialization SET health = 200, defense = 20, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Merciless Knight';
UPDATE unit_specialization SET health = 140, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Eldritch Knight';
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 55, max_damage = 65, movement_points = 3 WHERE name = 'Consul''s Guard';

UPDATE unit_specialization SET health = 120, defense = 10, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Thrall';
UPDATE unit_specialization SET health = 150, defense = 15, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Scavenger';
UPDATE unit_specialization SET health = 180, defense = 20, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Shadow Lord';
UPDATE unit_specialization SET health = 140, defense = 10, min_damage = 38, max_damage = 48, movement_points = 3 WHERE name = 'Fleetfoot';
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 46, max_damage = 56, movement_points = 3 WHERE name = 'Executioner';

-- =============================================
-- End of Last Lords unit stat updates
-- =============================================



-- =============================================
-- Update TAHUK unit stats: health, defense, damage, movement
-- =============================================

UPDATE unit_specialization SET health = 130, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Devotee';
UPDATE unit_specialization SET health = 170, defense = 15, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Fanatic';
UPDATE unit_specialization SET health = 210, defense = 20, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Zealot';

UPDATE unit_specialization SET health = 150, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Illuminator';
UPDATE unit_specialization SET health = 170, defense = 10, min_damage = 55, max_damage = 65, movement_points = 3 WHERE name = 'Lightbringer';

UPDATE unit_specialization SET health = 200, defense = 10, min_damage = 60, max_damage = 75, movement_points = 3 WHERE name = 'Wrath Bearer';
UPDATE unit_specialization SET health = 230, defense = 10, min_damage = 70, max_damage = 85, movement_points = 3 WHERE name = 'Magnified Wrath';
UPDATE unit_specialization SET health = 260, defense = 10, min_damage = 80, max_damage = 95, movement_points = 3 WHERE name = 'Devastating Wrath';

UPDATE unit_specialization SET health = 250, defense = 10, min_damage = 60, max_damage = 75, movement_points = 3 WHERE name = 'Skeptics'' Bane';
UPDATE unit_specialization SET health = 300, defense = 10, min_damage = 60, max_damage = 75, movement_points = 3 WHERE name = 'Fire of the Gods';

UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Initiate';
UPDATE unit_specialization SET health = 150, defense = 8, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Apprentice';
UPDATE unit_specialization SET health = 180, defense = 11, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'True Guide';

UPDATE unit_specialization SET health = 135, defense = 5, min_damage = 38, max_damage = 46, movement_points = 3 WHERE name = 'Vigil Keeper';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 46, max_damage = 54, movement_points = 3 WHERE name = 'Vigil Master';

UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 40, max_damage = 50, movement_points = 3 WHERE name = 'Relic Keeper';
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 50, max_damage = 60, movement_points = 3 WHERE name = 'Holy Keeper';
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 60, max_damage = 70, movement_points = 3 WHERE name = 'Divine Protector';

UPDATE unit_specialization SET health = 150, defense = 10, min_damage = 40, max_damage = 50, movement_points = 3 WHERE name = 'Holy Smiter';
UPDATE unit_specialization SET health = 170, defense = 15, min_damage = 40, max_damage = 50, movement_points = 3 WHERE name = 'Divine Smiter';

-- =============================================
-- End of Tahuk unit stat updates
-- =============================================


-- =============================================
-- Update NECROPHAGE unit stats: health, defense, damage, movement
-- =============================================

UPDATE unit_specialization SET health = 300, defense = 20, min_damage = 50, max_damage = 65, movement_points = 3 WHERE name = 'Behemoth';
UPDATE unit_specialization SET health = 350, defense = 20, min_damage = 65, max_damage = 80, movement_points = 3 WHERE name = 'Savage Behemoth';
UPDATE unit_specialization SET health = 400, defense = 30, min_damage = 50, max_damage = 65, movement_points = 3 WHERE name = 'Lurking Behemoth';

UPDATE unit_specialization SET health = 105, defense = 10, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Necrodrone';
UPDATE unit_specialization SET health = 145, defense = 15, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Corpse Hunter';
UPDATE unit_specialization SET health = 185, defense = 20, min_damage = 40, max_damage = 50, movement_points = 3 WHERE name = 'Bloodseeker';

UPDATE unit_specialization SET health = 135, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3 WHERE name = 'Rusher';
UPDATE unit_specialization SET health = 165, defense = 10, min_damage = 55, max_damage = 65, movement_points = 3 WHERE name = 'Hornet';

UPDATE unit_specialization SET health = 85, defense = 0, min_damage = 37, max_damage = 47, movement_points = 3 WHERE name = 'Spitter';
UPDATE unit_specialization SET health = 125, defense = 0, min_damage = 47, max_damage = 57, movement_points = 3 WHERE name = 'Corrupter';
UPDATE unit_specialization SET health = 145, defense = 0, min_damage = 57, max_damage = 67, movement_points = 3 WHERE name = 'Infestor';
UPDATE unit_specialization SET health = 185, defense = 10, min_damage = 47, max_damage = 57, movement_points = 3 WHERE name = 'Defiler';

UPDATE unit_specialization SET health = 50, defense = 0, min_damage = 25, max_damage = 35, movement_points = 3 WHERE name = 'Larva';
UPDATE unit_specialization SET health = 85, defense = 0, min_damage = 37, max_damage = 47, movement_points = 3 WHERE name = 'Feeder';
UPDATE unit_specialization SET health = 135, defense = 0, min_damage = 45, max_damage = 60, movement_points = 3 WHERE name = 'Soldier';
UPDATE unit_specialization SET health = 185, defense = 0, min_damage = 55, max_damage = 70, movement_points = 3 WHERE name = 'Slicer';

-- =============================================
-- End of Necrophage unit stat updates
-- =============================================

-- =============================================
-- Update ASPECT unit stats: health, defense, damage, movement
-- =============================================

UPDATE unit_specialization SET health = 250, defense = 15, min_damage = 55, max_damage = 70, movement_points = 3 WHERE name = 'Skyscale';
UPDATE unit_specialization SET health = 275, defense = 15, min_damage = 65, max_damage = 80, movement_points = 3 WHERE name = 'Brightscale';
UPDATE unit_specialization SET health = 300, defense = 15, min_damage = 75, max_damage = 90, movement_points = 3 WHERE name = 'Scales of Balance';
UPDATE unit_specialization SET health = 325, defense = 20, min_damage = 55, max_damage = 70, movement_points = 3 WHERE name = 'Shadowscale';
UPDATE unit_specialization SET health = 400, defense = 25, min_damage = 55, max_damage = 70, movement_points = 3 WHERE name = 'Scales of Justice';

UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 35, max_damage = 45, movement_points = 3 WHERE name = 'Sentry';
UPDATE unit_specialization SET health = 150, defense = 8, min_damage = 38, max_damage = 48, movement_points = 3 WHERE name = 'Stinger';
UPDATE unit_specialization SET health = 180, defense = 11, min_damage = 41, max_damage = 51, movement_points = 3 WHERE name = 'Pitiless Stinger';
UPDATE unit_specialization SET health = 140, defense = 5, min_damage = 42, max_damage = 52, movement_points = 3 WHERE name = 'Resistor';
UPDATE unit_specialization SET health = 160, defense = 5, min_damage = 50, max_damage = 60, movement_points = 3 WHERE name = 'Pitiless Resistor';

UPDATE unit_specialization SET health = 120, defense = 10, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Envoy';
UPDATE unit_specialization SET health = 150, defense = 15, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Crawler';
UPDATE unit_specialization SET health = 180, defense = 20, min_damage = 30, max_damage = 40, movement_points = 3 WHERE name = 'Scraper';
UPDATE unit_specialization SET health = 135, defense = 10, min_damage = 36, max_damage = 46, movement_points = 3 WHERE name = 'Surveyor';
UPDATE unit_specialization SET health = 150, defense = 10, min_damage = 42, max_damage = 52, movement_points = 3 WHERE name = 'Emissary';

UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 50, max_damage = 65, movement_points = 4 WHERE name = 'Observer';
UPDATE unit_specialization SET health = 200, defense = 15, min_damage = 50, max_damage = 65, movement_points = 4 WHERE name = 'Peacemaker';
UPDATE unit_specialization SET health = 240, defense = 20, min_damage = 50, max_damage = 65, movement_points = 4 WHERE name = 'Arbiter';
UPDATE unit_specialization SET health = 180, defense = 10, min_damage = 60, max_damage = 75, movement_points = 4 WHERE name = 'Guard of the Current';
UPDATE unit_specialization SET health = 200, defense = 10, min_damage = 70, max_damage = 85, movement_points = 4 WHERE name = 'Currentwalker';

-- =============================================
-- End of Aspect unit stat updates
-- =============================================

-- =============================================
-- Update MINOR FACTION unit stats + add tier values
-- =============================================

-- Crushers
UPDATE unit_specialization SET health = 120, defense = 15, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Crusher';
UPDATE unit_specialization SET health = 150, defense = 20, min_damage = 35, max_damage = 45, movement_points = 3, tier = 2 WHERE name = 'Mighty Crusher';
UPDATE unit_specialization SET health = 180, defense = 25, min_damage = 35, max_damage = 45, movement_points = 3, tier = 3 WHERE name = 'Elite Crusher';

-- Warsmiths
UPDATE unit_specialization SET health = 120, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Warsmith';
UPDATE unit_specialization SET health = 150, defense = 10, min_damage = 40, max_damage = 50, movement_points = 3, tier = 2 WHERE name = 'Mighty Warsmith';
UPDATE unit_specialization SET health = 180, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3, tier = 3 WHERE name = 'Elite Warsmith';

-- Huntresses
UPDATE unit_specialization SET health = 110, defense = 5, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Huntress';
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 40, max_damage = 50, movement_points = 3, tier = 2 WHERE name = 'Mighty Huntress';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 45, max_damage = 55, movement_points = 3, tier = 3 WHERE name = 'Elite Huntress';

-- Occultists
UPDATE unit_specialization SET health = 100, defense = 5, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Occultist';
UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 45, max_damage = 55, movement_points = 3, tier = 2 WHERE name = 'Mighty Occultist';
UPDATE unit_specialization SET health = 140, defense = 5, min_damage = 55, max_damage = 65, movement_points = 3, tier = 3 WHERE name = 'Elite Occultist';

-- Rangers
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Ranger';
UPDATE unit_specialization SET health = 200, defense = 10, min_damage = 40, max_damage = 50, movement_points = 3, tier = 2 WHERE name = 'Mighty Ranger';
UPDATE unit_specialization SET health = 240, defense = 10, min_damage = 45, max_damage = 55, movement_points = 3, tier = 3 WHERE name = 'Elite Ranger';

-- Knifewings
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 30, max_damage = 40, movement_points = 3, tier = 1 WHERE name = 'Knifewing';
UPDATE unit_specialization SET health = 160, defense = 5, min_damage = 35, max_damage = 45, movement_points = 4, tier = 2 WHERE name = 'Mighty Knifewing';
UPDATE unit_specialization SET health = 190, defense = 5, min_damage = 40, max_damage = 50, movement_points = 3, tier = 3 WHERE name = 'Elite Knifewing';

-- Riders
UPDATE unit_specialization SET health = 130, defense = 10, min_damage = 30, max_damage = 40, movement_points = 3, tier = 1 WHERE name = 'Rider';
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3, tier = 2 WHERE name = 'Mighty Rider';
UPDATE unit_specialization SET health = 190, defense = 10, min_damage = 40, max_damage = 50, movement_points = 3, tier = 3 WHERE name = 'Elite Rider';

-- Chargers
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 30, max_damage = 40, movement_points = 4, tier = 1 WHERE name = 'Charger';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 40, max_damage = 50, movement_points = 4, tier = 2 WHERE name = 'Mighty Charger';
UPDATE unit_specialization SET health = 170, defense = 5, min_damage = 50, max_damage = 60, movement_points = 4, tier = 3 WHERE name = 'Elite Charger';

-- Harpers
UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Harper';
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 40, max_damage = 50, movement_points = 3, tier = 2 WHERE name = 'Mighty Harper';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 45, max_damage = 55, movement_points = 3, tier = 3 WHERE name = 'Elite Harper';

-- Raiders
UPDATE unit_specialization SET health = 90, defense = 5, min_damage = 40, max_damage = 50, movement_points = 3, tier = 1 WHERE name = 'Raider';
UPDATE unit_specialization SET health = 110, defense = 5, min_damage = 48, max_damage = 55, movement_points = 3, tier = 2 WHERE name = 'Mighty Raider';
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 55, max_damage = 63, movement_points = 3, tier = 3 WHERE name = 'Elite Raider';

-- Screechers
UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Screecher';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 43, max_damage = 51, movement_points = 3, tier = 2 WHERE name = 'Mighty Screecher';
UPDATE unit_specialization SET health = 180, defense = 5, min_damage = 51, max_damage = 58, movement_points = 3, tier = 3 WHERE name = 'Elite Screecher';

-- Imperial Pike
UPDATE unit_specialization SET health = 160, defense = 10, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Imperial Pike';
UPDATE unit_specialization SET health = 200, defense = 15, min_damage = 35, max_damage = 45, movement_points = 3, tier = 2 WHERE name = 'Mighty Imperial Pike';
UPDATE unit_specialization SET health = 240, defense = 20, min_damage = 35, max_damage = 45, movement_points = 3, tier = 3 WHERE name = 'Elite Imperial Pike';

-- Couriers
UPDATE unit_specialization SET health = 110, defense = 5, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Courier';
UPDATE unit_specialization SET health = 130, defense = 5, min_damage = 42, max_damage = 52, movement_points = 4, tier = 2 WHERE name = 'Mighty Courier';
UPDATE unit_specialization SET health = 150, defense = 5, min_damage = 50, max_damage = 60, movement_points = 4, tier = 3 WHERE name = 'Elite Courier';

-- Scholastics
UPDATE unit_specialization SET health = 120, defense = 5, min_damage = 38, max_damage = 48, movement_points = 3, tier = 1 WHERE name = 'Scholastic';
UPDATE unit_specialization SET health = 140, defense = 5, min_damage = 44, max_damage = 54, movement_points = 3, tier = 2 WHERE name = 'Mighty Scholastic';
UPDATE unit_specialization SET health = 160, defense = 5, min_damage = 50, max_damage = 60, movement_points = 3, tier = 3 WHERE name = 'Elite Scholastic';

-- Pantinels
UPDATE unit_specialization SET health = 150, defense = 15, min_damage = 35, max_damage = 45, movement_points = 3, tier = 1 WHERE name = 'Pantinel';
UPDATE unit_specialization SET health = 180, defense = 20, min_damage = 35, max_damage = 45, movement_points = 3, tier = 2 WHERE name = 'Mighty Pantinel';
UPDATE unit_specialization SET health = 210, defense = 25, min_damage = 35, max_damage = 45, movement_points = 3, tier = 3 WHERE name = 'Elite Pantinel';

-- =============================================
-- End of Minor Faction unit stat & tier updates
-- =============================================


-- =============================================
-- End of Minor Faction unit stat updates
-- =============================================