-- V3_2_4__tech_backfill_tech_key.sql
-- Backfill tech.tech_key for existing legacy rows (one row per display name today).
-- Also fix known legacy name mismatches so joins match exporter display names.
-- Compatible with Postgres (prod) and H2 (local).

------------------------------------------------------------
-- 1) Fix legacy display names (so they match exporter output)
------------------------------------------------------------
update tech set name = 'Matriarch’s Rise' where name = 'Matriarch''s Rise';
update tech set name = 'Sages'' Blessing' where name = 'Sage''s Blessing';

------------------------------------------------------------
-- 2) Build mapping table display_name -> chosen tech_key
-- Rule: if multiple tech keys share a display_name, pick the one with the most
-- distinct FactionAffinity_* trait prereqs (ties: prefer Technology_*, then alphabetical).
------------------------------------------------------------
create table tech_key_backfill_map (
                                       display_name varchar(255) primary key,
                                       tech_key varchar(255) not null
);

insert into tech_key_backfill_map(display_name, tech_key) values
                                                              ('Accelerated Larvae', 'Necrophage_Technology_01'),
                                                              ('Anomanology', 'Technology_CampTerraformation_02'),
                                                              ('Aquadynamics', 'Technology_DistrictImprovement_Bridge_01'),
                                                              ('Arboreal Insights', 'Technology_ArmyTerraformation_01'),
                                                              ('Arcana of the Ancients', 'Technology_Science_00'),
                                                              ('Armor Design', 'Technology_DistrictImprovement_Military_05'),
                                                              ('Asceticism', 'Aspect_Technology_00'),
                                                              ('Auxiliary Forces', 'Technology_DistrictImprovement_Military_03'),
                                                              ('Banks', 'Technology_DistrictImprovement_CityCenter_01'),
                                                              ('Celestial Scrying', 'Mukag_Technology_02'),
                                                              ('Chitinous Plating', 'Necrophage_Technology_10'),
                                                              ('Choral Amplifier', 'Aspect_Technology_01'),
                                                              ('Citizenship', 'Technology_CityCenter_Cost_00'),
                                                              ('Civil Order', 'Technology_EmpirePlan_06'),
                                                              ('Civilization Optimizations', 'Technology_EmpirePlan_04'),
                                                              ('Collective Sacrifice', 'Technology_EmpirePlan_00'),
                                                              ('Collective Will', 'Technology_EmpirePlan_03'),
                                                              ('Commerce', 'Technology_DistrictImprovement_Money_02'),
                                                              ('Common Rights', 'Technology_EmpirePlan_01'),
                                                              ('Composite Materials', 'Technology_DistrictImprovement_Military_07'),
                                                              ('Conscription', 'Technology_Army_05'),
                                                              ('Coral Sensorium', 'Technology_EmpirePlan_07'),
                                                              ('Corrosive Saliva', 'Necrophage_Technology_00'),
                                                              ('Creed', 'LastLord_Technology_04'),
                                                              ('Cultivation', 'Technology_DistrictImprovement_Food_01'),
                                                              ('Cultural Education', 'Technology_EmpirePlan_09'),
                                                              ('Currency', 'Necrophage_Technology_05'),
                                                              ('Deciphering Stone', 'Technology_DistrictImprovement_Food_05'),
                                                              ('Dignitary Goodwill', 'Technology_EmpirePlan_05'),
                                                              ('Diplomat''s Manse', 'Technology_EmpirePlan_02'),
                                                              ('Digs', 'Technology_DistrictImprovement_Food_03'),
                                                              ('Dust Seismology', 'Technology_DistrictImprovement_Money_07'),
                                                              ('Dustlytics', 'Technology_DistrictImprovement_Money_05'),
                                                              ('Dustnomics', 'Technology_DistrictImprovement_Money_01'),
                                                              ('Dramatic Arts', 'Technology_DistrictImprovement_Money_06'),
                                                              ('Elite Focus', 'Technology_Army_10'),
                                                              ('Embassy', 'Technology_Diplomacy_01'),
                                                              ('Feudalism', 'Technology_Diplomacy_00'),
                                                              ('Fencing', 'Technology_District_Tier1_Food'),
                                                              ('Financial Literacy', 'Technology_DistrictImprovement_Money_00'),
                                                              ('Foreign Affairs', 'Technology_MinorFaction_Protectorate_00'),
                                                              ('Fungal Lab', 'Necrophage_Technology_02'),
                                                              ('Geology', 'Technology_DistrictImprovement_Food_00'),
                                                              ('Glorification', 'Aspect_Technology_06'),
                                                              ('Glory of Empire', 'Technology_DistrictImprovement_Money_08'),
                                                              ('Guilds', 'Technology_DistrictImprovement_Money_04'),
                                                              ('Harmonized Chorus', 'Technology_EmpirePlan_10'),
                                                              ('Highway Patrol', 'Technology_Army_09'),
                                                              ('Hive Guardian', 'Necrophage_Technology_Unit_Army_01'),
                                                              ('Hothouses', 'Technology_DistrictImprovement_Food_02'),
                                                              ('Hydrology', 'Technology_DistrictImprovement_Food_04'),
                                                              ('Hydromatic Laboratory', 'Technology_DistrictImprovement_Food_06'),
                                                              ('Imperial Bureaucracy', 'Technology_EmpirePlan_12'),
                                                              ('Inventors'' Endowments', 'Technology_DistrictImprovement_Money_09'),
                                                              ('Keystones', 'Necrophage_Technology_09'),
                                                              ('Land Management', 'Technology_DistrictImprovement_Food_08'),
                                                              ('Large-scale Demolition', 'Technology_DistrictImprovement_Money_10'),
                                                              ('Logistics', 'Technology_Army_03'),
                                                              ('Lords'' Discipline', 'LastLord_Technology_08'),
                                                              ('Lords'' Piety', 'LastLord_Technology_06'),
                                                              ('Markets', 'Technology_DistrictImprovement_Money_03'),
                                                              ('Materials Science', 'Technology_Army_08'),
                                                              ('Matriarch’s Rise', 'Necrophage_Technology_06'),
                                                              ('Meditative Routines', 'Aspect_Technology_03'),
                                                              ('Mercenaries', 'Technology_Army_06'),
                                                              ('Military Conditioning', 'Technology_Army_11'),
                                                              ('Military Engineering', 'Technology_Army_07'),
                                                              ('Penitent Shrine', 'LastLord_Technology_10'),
                                                              ('Persuasion', 'Technology_Diplomacy_02'),
                                                              ('Preservation', 'Technology_DistrictImprovement_Food_09'),
                                                              ('Public Works', 'Technology_CityCenter_Cost_01'),
                                                              ('Pyrometallurgy', 'Technology_DistrictImprovement_Military_06'),
                                                              ('Razor Mandibles', 'Necrophage_Technology_Unit_Army_00'),
                                                              ('Research Grants', 'Technology_DistrictImprovement_Science_04'),
                                                              ('Research Institute', 'Technology_DistrictImprovement_Science_05'),
                                                              ('Sacred Vow', 'LastLord_Technology_12'),
                                                              ('Saiadhan Inquisition', 'LastLord_Technology_14'),
                                                              ('Sages'' Blessing', 'Technology_Quest_00'),
                                                              ('Scavenging', 'Necrophage_Technology_04'),
                                                              ('Scientific Charter', 'Technology_DistrictImprovement_Science_00'),
                                                              ('Scientific Prizes', 'Technology_DistrictImprovement_Science_06'),
                                                              ('Seedbank', 'Technology_DistrictImprovement_Food_07'),
                                                              ('Sheredyn''s Creed', 'KinOfSheredyn_Technology_04'),
                                                              ('Shock Tactics', 'Technology_Army_12'),
                                                              ('Stonework', 'Technology_DistrictImprovement_Military_00'),
                                                              ('Standardization', 'Technology_DistrictImprovement_CityCenter_02'),
                                                              ('Stargazing', 'Technology_DistrictImprovement_Science_01'),
                                                              ('Statecraft', 'Technology_EmpirePlan_13'),
                                                              ('Stellar Astronomy', 'Technology_DistrictImprovement_Science_03'),
                                                              ('Stock Exchange', 'Technology_DistrictImprovement_Money_11'),
                                                              ('Supreme Fealty', 'LastLord_Technology_09'),
                                                              ('Synaptic Acceleration', 'Aspect_Technology_04'),
                                                              ('Thanatology', 'Necrophage_Technology_12'),
                                                              ('The Gaze of Garin', 'Technology_Army_00'),
                                                              ('The Hand of Garin', 'Technology_Diplomacy_03'),
                                                              ('The Nurture of Garin', 'Technology_DistrictImprovement_Food_10'),
                                                              ('The Strength of Garin', 'Technology_Army_01'),
                                                              ('The Wisdom of Garin', 'Technology_DistrictImprovement_Science_07'),
                                                              ('Tolls and Taxation', 'Technology_DistrictImprovement_Money_12'),
                                                              ('University', 'Technology_DistrictImprovement_Science_08'),
                                                              ('Urban Planning', 'Technology_EmpirePlan_14'),
                                                              ('Voice of the Masses', 'Technology_EmpirePlan_15'),
                                                              ('Workshop', 'Technology_District_Tier1_Industry'),
                                                              ('Zelevas'' Stamina', 'LastLord_Technology_15');

------------------------------------------------------------
-- 3) Backfill only rows that are missing tech_key
------------------------------------------------------------
update tech
set tech_key = (
    select m.tech_key
    from tech_key_backfill_map m
    where m.display_name = tech.name
)
where tech.tech_key is null
  and exists (select 1 from tech_key_backfill_map m where m.display_name = tech.name);

drop table tech_key_backfill_map;