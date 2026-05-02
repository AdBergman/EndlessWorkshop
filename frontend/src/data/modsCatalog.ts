export interface ModScreenshot {
    src: string;
    alt: string;
    caption?: string;
}

export interface ModEntry {
    name: string;
    description: string;
    detail: string;
    releaseUrl?: string;
    screenshots?: ModScreenshot[];
}

export interface ModPackEntry extends ModEntry {
    version: string;
    releaseUrl: string;
    includes: string[];
    highlights: string[];
}

export interface InstallRequirement {
    label: string;
    value: string;
}

export interface InstallGuide {
    requirementLabel: string;
    requirementValue: string;
    requirementUrl: string;
    steps: string[];
    notes: string[];
}

export const featuredPack: ModPackEntry = {
    name: "EL2 Essentials Pack",
    version: "v1.0.0",
    description:
        "A small bundle of mods that smooth out rough edges in Endless Legend 2 without changing what the game fundamentally is.",
    detail:
        "Built as a curated starting point for players who want a cleaner, more practical EL2 experience without turning the game into a different ruleset.",
    includes: ["WorldGen", "BulkTrade", "SyntheticHarmony"],
    highlights: [
        "Curated pack with three focused quality-of-life improvements",
        "Designed to stay close to the base game feel",
        "Fast install path once BepInEx is in place",
    ],
    releaseUrl: "https://github.com/AdBergman/EL2Mods/releases/tag/essentials-pack-v1.0.0",
};

export const includedMods: ModEntry[] = [
    {
        name: "WorldGen",
        description: "More varied map generation with slightly larger worlds and persistent late-monsoon water.",
        detail:
            "WorldGen adds more map variety, nudges map size upward a bit, and keeps water in play after the final monsoon so the late game remains closer to the world the match built toward.",
    },
    {
        name: "BulkTrade",
        description: "Shift + Click trades 10x and Ctrl + Click trades 50x.",
        detail:
            "BulkTrade removes repetitive market clicking by adding higher-volume buy and sell shortcuts, making common trading flows much faster without changing the underlying economy.",
    },
    {
        name: "SyntheticHarmony",
        description: "Stabilizes approval so AI factions stay more competitive.",
        detail:
            "SyntheticHarmony helps AI factions avoid approval collapse, which keeps them more functional and competitive deeper into the match without rewriting their broader behavior.",
    },
];

export const standaloneMods: ModEntry[] = [
    {
        name: "Quest Recovery",
        description: "Single-player recovery tool for stuck major faction quest steps.",
        detail:
            "A targeted recovery utility for salvaging blocked campaign progress in single-player saves. It is meant as a support tool rather than part of the default Essentials experience.",
        releaseUrl: "https://github.com/AdBergman/EL2Mods/releases/tag/v1.1.0",
    },
    {
        name: "End Game Report",
        description: "Exports a victory-screen JSON report for upload to Endless Workshop Summary.",
        detail:
            "Creates a structured end-of-run report you can feed back into Endless Workshop for summary analysis and sharing. Best treated as a companion utility rather than a gameplay mod.",
        releaseUrl: "https://github.com/AdBergman/EL2StatsMod/releases/tag/v1.1.0",
    },
];

export const installGuide: InstallGuide = {
    requirementLabel: "Requires",
    requirementValue: "BepInEx 5.x Windows x64",
    requirementUrl: "https://github.com/BepInEx/BepInEx/releases",
    steps: [
        "Download BepInEx 5.x Windows x64.",
        "Extract it into your Endless Legend 2 install folder.",
        "Launch the game once to generate the BepInEx folders.",
        "Extract the mod or modpack zip into the same folder as ENDLESS Legend 2.exe.",
    ],
    notes: [
        "The Essentials Pack is the recommended starting point.",
        "GitHub release pages have the full release notes for each download.",
    ],
};

export const packStats: InstallRequirement[] = [
    { label: "Release", value: featuredPack.version },
    { label: "Includes", value: "3 focused mods" },
    { label: "Target", value: "Base-game friendly" },
];
