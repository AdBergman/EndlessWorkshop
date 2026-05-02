export type FeaturedEntityKind = "tech" | "unit";

type FeaturedEntityBase = {
    entryKey: string;
    name: string;
    seoDescription: string;
    overview: string;
    ctaPath: string;
    ctaLabel: string;
};

export type FeaturedTechSnapshot = FeaturedEntityBase & {
    kind: "tech";
    era: number;
    techType: string;
    factions: string[];
    unlocks: string[];
    effects: string[];
};

export type FeaturedUnitSnapshot = FeaturedEntityBase & {
    kind: "unit";
    faction: string;
    tier: number;
    unitType: string;
    requiredTechnology: string;
    upgradeFrom: string | null;
    health: string;
    damage: string;
    defense: string;
    movement: string;
    cost: string;
    upkeep: string;
    skills: string[];
};

export type FeaturedEntitySnapshot = FeaturedTechSnapshot | FeaturedUnitSnapshot;

export type FeaturedEntityAllowlistEntry = {
    kind: FeaturedEntityKind;
    entryKey: string;
};

export const FEATURED_ENTITY_ALLOWLIST: FeaturedEntityAllowlistEntry[] = [
    { kind: "tech", entryKey: "stonework" },
    { kind: "tech", entryKey: "workshop" },
    { kind: "tech", entryKey: "scientific-charter" },
    { kind: "tech", entryKey: "markets" },
    { kind: "tech", entryKey: "composite-materials" },
    { kind: "tech", entryKey: "sacred-vow" },
    { kind: "unit", entryKey: "sentinel" },
    { kind: "unit", entryKey: "herald-of-the-faith" },
    { kind: "unit", entryKey: "dust-lord" },
    { kind: "unit", entryKey: "dread-duke" },
    { kind: "unit", entryKey: "wrath-bearer" },
    { kind: "unit", entryKey: "scales-of-justice" },
];

export const FEATURED_TECH_SNAPSHOTS: FeaturedTechSnapshot[] = [
    {
        kind: "tech",
        entryKey: "stonework",
        name: "Stonework",
        seoDescription:
            "Stonework is an Endless Legend 2 era 1 defense technology that unlocks the Keep district and early capital fortification planning.",
        overview:
            "Stonework is a foundational defensive technology for early Endless Legend 2 openings, giving players a straightforward way to strengthen their capital before wider expansion pressure begins.",
        era: 1,
        techType: "Defense",
        factions: ["Aspects", "Kin", "Lords", "Necrophages", "Tahuk"],
        unlocks: ["District: Keep"],
        effects: ["+100 Fortification on Capital"],
        ctaPath: "/tech?faction=kin&tech=stonework",
        ctaLabel: "Open Stonework in the interactive tech planner",
    },
    {
        kind: "tech",
        entryKey: "workshop",
        name: "Workshop",
        seoDescription:
            "Workshop is an Endless Legend 2 era 1 economy technology that unlocks Works districts and early forest-clearing utility.",
        overview:
            "Workshop is one of the early economy pivots in Endless Legend 2, pairing production-focused district access with a practical terrain action that can shape early city layouts.",
        era: 1,
        techType: "Economy",
        factions: ["Aspects", "Kin", "Lords", "Necrophages", "Tahuk"],
        unlocks: ["District: Works", "Action: Remove Forest"],
        effects: [],
        ctaPath: "/tech?faction=kin&tech=workshop",
        ctaLabel: "Open Workshop in the interactive tech planner",
    },
    {
        kind: "tech",
        entryKey: "scientific-charter",
        name: "Scientific Charter",
        seoDescription:
            "Scientific Charter is an Endless Legend 2 era 1 discovery technology that unlocks Laboratories and improves curiosity rewards.",
        overview:
            "Scientific Charter supports early research tempo by opening Laboratory access while also improving the value players get from curiosity exploration.",
        era: 1,
        techType: "Discovery",
        factions: ["Aspects", "Kin", "Lords", "Necrophages", "Tahuk"],
        unlocks: ["District: Laboratory", "Improves the rewards from Curiosities"],
        effects: [],
        ctaPath: "/tech?faction=kin&tech=scientific-charter",
        ctaLabel: "Open Scientific Charter in the interactive tech planner",
    },
    {
        kind: "tech",
        entryKey: "markets",
        name: "Markets",
        seoDescription:
            "Markets is an Endless Legend 2 era 2 economy technology that unlocks Trading Posts, Dirt Roads, and faster road traversal.",
        overview:
            "Markets is a useful mid-early economy breakpoint for players who want stronger trade infrastructure and smoother map movement between developed road networks.",
        era: 2,
        techType: "Economy",
        factions: ["Aspects", "Kin", "Lords", "Necrophages", "Tahuk"],
        unlocks: ["District: Trading Post", "Traders' Trails: Dirt Roads"],
        effects: ["1 Movement Points max to cross a road Tile"],
        ctaPath: "/tech?faction=kin&tech=markets",
        ctaLabel: "Open Markets in the interactive tech planner",
    },
    {
        kind: "tech",
        entryKey: "composite-materials",
        name: "Composite Materials",
        seoDescription:
            "Composite Materials is a Kin era 3 defense technology in Endless Legend 2 that unlocks four midline unit specializations.",
        overview:
            "Composite Materials is a Kin-specific military technology that branches into several unit specializations, making it a strong planning checkpoint for roster upgrades.",
        era: 3,
        techType: "Defense",
        factions: ["Kin"],
        unlocks: [
            "Unit Specialization: Heavy Archer",
            "Unit Specialization: Bloodletter",
            "Unit Specialization: Clarion",
            "Unit Specialization: Protector",
        ],
        effects: [],
        ctaPath: "/tech?faction=kin&tech=composite-materials",
        ctaLabel: "Open Composite Materials in the interactive tech planner",
    },
    {
        kind: "tech",
        entryKey: "sacred-vow",
        name: "Sacred Vow",
        seoDescription:
            "Sacred Vow is a Lords era 5 defense technology in Endless Legend 2 that unlocks four late-game flying and palanquin specializations.",
        overview:
            "Sacred Vow is a late-game Lords technology that feeds directly into several top-end specializations, making it a natural SEO landing page for players researching Lords finishers.",
        era: 5,
        techType: "Defense",
        factions: ["Lords"],
        unlocks: [
            "Unit Specialization: Ancient Palanquin",
            "Unit Specialization: Soulsapping Palanquin",
            "Unit Specialization: Blood Tyrant",
            "Unit Specialization: Dread Duke",
        ],
        effects: [],
        ctaPath: "/tech?faction=lords&tech=sacred-vow",
        ctaLabel: "Open Sacred Vow in the interactive tech planner",
    },
];

export const FEATURED_UNIT_SNAPSHOTS: FeaturedUnitSnapshot[] = [
    {
        kind: "unit",
        entryKey: "sentinel",
        name: "Sentinel",
        seoDescription:
            "Sentinel is a Kin cavalry unit in Endless Legend 2 with early mobility, tier 1 access, and the Aware skill.",
        overview:
            "Sentinel is an early Kin cavalry option that offers scouting-friendly movement and a clean upgrade path into later mounted branches.",
        faction: "Kin",
        tier: 1,
        unitType: "Cavalry",
        requiredTechnology: "Starting roster",
        upgradeFrom: null,
        health: "120",
        damage: "30-40",
        defense: "5",
        movement: "4",
        cost: "80",
        upkeep: "4",
        skills: ["Aware"],
        ctaPath: "/units?faction=kin&unitKey=sentinel",
        ctaLabel: "Open Sentinel in the interactive unit explorer",
    },
    {
        kind: "unit",
        entryKey: "herald-of-the-faith",
        name: "Herald of the Faith",
        seoDescription:
            "Herald of the Faith is a Kin cavalry unit in Endless Legend 2 with strong defenses, aura support, and era 3 access.",
        overview:
            "Herald of the Faith brings a sturdier cavalry profile to the Kin roster and acts as a support-minded branch point for later Clarion and Protector upgrades.",
        faction: "Kin",
        tier: 1,
        unitType: "Cavalry",
        requiredTechnology: "Era 3",
        upgradeFrom: null,
        health: "170",
        damage: "42-56",
        defense: "15",
        movement: "4",
        cost: "300",
        upkeep: "15",
        skills: ["Defense Expert I", "Defensive Aura I"],
        ctaPath: "/units?faction=kin&unitKey=herald-of-the-faith",
        ctaLabel: "Open Herald of the Faith in the interactive unit explorer",
    },
    {
        kind: "unit",
        entryKey: "dust-lord",
        name: "Dust Lord",
        seoDescription:
            "Dust Lord is a Lords flying unit in Endless Legend 2 with Terror, high mobility, and era 3 access.",
        overview:
            "Dust Lord is a flexible Lords flying unit that reaches the board at era 3 and anchors several later specialization lines for aggressive map pressure.",
        faction: "Lords",
        tier: 1,
        unitType: "Flying",
        requiredTechnology: "Era 3",
        upgradeFrom: null,
        health: "250",
        damage: "45-60",
        defense: "10",
        movement: "4",
        cost: "450",
        upkeep: "15",
        skills: ["Flying", "Terror"],
        ctaPath: "/units?faction=lords&unitKey=dust-lord",
        ctaLabel: "Open Dust Lord in the interactive unit explorer",
    },
    {
        kind: "unit",
        entryKey: "dread-duke",
        name: "Dread Duke",
        seoDescription:
            "Dread Duke is a Lords tier 3 flying unit in Endless Legend 2 unlocked by Sacred Vow and upgraded from Dread Lord.",
        overview:
            "Dread Duke is one of the Lords late-game flying finishers, combining tier 3 scaling with a clear research and upgrade dependency chain.",
        faction: "Lords",
        tier: 3,
        unitType: "Flying",
        requiredTechnology: "Sacred Vow",
        upgradeFrom: "Dread Lord",
        health: "300",
        damage: "75-90",
        defense: "10",
        movement: "4",
        cost: "20 Eradione",
        upkeep: "30",
        skills: ["Flying", "Terror I", "Leeching Strike II"],
        ctaPath: "/units?faction=lords&unitKey=dread-duke",
        ctaLabel: "Open Dread Duke in the interactive unit explorer",
    },
    {
        kind: "unit",
        entryKey: "wrath-bearer",
        name: "Wrath Bearer",
        seoDescription:
            "Wrath Bearer is a Tahuk ranged unit in Endless Legend 2 with Breaching Attack and era 3 access.",
        overview:
            "Wrath Bearer gives the Tahuk roster a hard-hitting ranged option that arrives at era 3 and later feeds into stronger specialist branches.",
        faction: "Tahuk",
        tier: 1,
        unitType: "Ranged",
        requiredTechnology: "Era 3",
        upgradeFrom: null,
        health: "200",
        damage: "60-75",
        defense: "10",
        movement: "3",
        cost: "450",
        upkeep: "30",
        skills: ["Ranged IV", "Breaching Attack"],
        ctaPath: "/units?faction=tahuk&unitKey=wrath-bearer",
        ctaLabel: "Open Wrath Bearer in the interactive unit explorer",
    },
    {
        kind: "unit",
        entryKey: "scales-of-justice",
        name: "Scales of Justice",
        seoDescription:
            "Scales of Justice is an Aspects tier 3 flying unit in Endless Legend 2 unlocked by Harmonized Chorus and upgraded from Shadowscale.",
        overview:
            "Scales of Justice is a high-tier Aspects flying unit that rewards players who commit to the Harmonized Chorus line and its later evolution path.",
        faction: "Aspects",
        tier: 3,
        unitType: "Flying",
        requiredTechnology: "Harmonized Chorus",
        upgradeFrom: "Shadowscale",
        health: "400",
        damage: "55-70",
        defense: "25",
        movement: "3",
        cost: "20 Eradione",
        upkeep: "15",
        skills: ["Run Through I"],
        ctaPath: "/units?faction=aspects&unitKey=scales-of-justice",
        ctaLabel: "Open Scales of Justice in the interactive unit explorer",
    },
];
