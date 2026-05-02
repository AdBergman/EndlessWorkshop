import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isValidDisplayName } from "../lib/codex/codexValidation.ts";

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

type RawTechSnapshot = {
    name?: unknown;
    era?: unknown;
    type?: unknown;
    unlocks?: unknown;
    effects?: unknown;
    prereq?: unknown;
    factions?: unknown;
    hidden?: unknown;
};

type RawUnitSnapshot = {
    name?: unknown;
    tier?: unknown;
    type?: unknown;
    skills?: unknown;
    health?: unknown;
    damage?: unknown;
    defense?: unknown;
    movement?: unknown;
    cost?: unknown;
    upkeep?: unknown;
    requiredTechnology?: unknown;
    upgrade?: unknown;
    faction?: unknown;
    FactionType?: unknown;
    hidden?: unknown;
};

export type EntitySkipReason =
    | "hidden"
    | "invalid-display-name"
    | "placeholder-content"
    | "invalid-entry-key"
    | "insufficient-tech-content"
    | "insufficient-unit-content"
    | "minor-faction-unit"
    | "non-buildable-unit"
    | "missing-required-fields";

export type EntityGenerationSkip = {
    kind: FeaturedEntityKind;
    name: string;
    entryKey: string;
    reason: EntitySkipReason;
};

export type EntityGenerationReport = {
    rawCounts: {
        techs: number;
        units: number;
        total: number;
    };
    includedCounts: {
        techs: number;
        units: number;
        total: number;
    };
    excludedCounts: {
        techs: number;
        units: number;
        total: number;
    };
    skippedByReason: Record<string, number>;
    skippedEntries: EntityGenerationSkip[];
};

const MIN_TOTAL_PAGES = 100;
const MAX_TOTAL_PAGES = 300;
const MAX_TECH_PAGES = 140;
const MAX_UNIT_PAGES = 120;
const PLACEHOLDER_PATTERN = /(^%|\b(?:tbd|todo|placeholder|lorem ipsum|coming soon)\b|\[tbd\])/i;
const SAFE_ENTRY_KEY_PATTERN = /^[a-z0-9-]+$/;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = resolve(__dirname, "../../../app/src/main/resources/data");

function readSnapshotFile<T>(fileName: string): T {
    return JSON.parse(readFileSync(resolve(DATA_ROOT, fileName), "utf8")) as T;
}

function trimToNull(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
}

function toDisplayString(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Number.isInteger(value) ? String(value) : value.toFixed(1);
    }

    return trimToNull(value) ?? "";
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return value
        .map((entry) => trimToNull(entry))
        .filter((entry): entry is string => entry !== null);
}

function hasBalancedFormatting(value: string): boolean {
    const stack: string[] = [];
    const pairs = new Map<string, string>([
        [")", "("],
        ["]", "["],
        ["}", "{"],
    ]);

    for (const ch of value) {
        if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
        else if (pairs.has(ch)) {
            if (stack.pop() !== pairs.get(ch)) return false;
        }
    }

    return stack.length === 0;
}

function isMeaningfulText(value: string | null | undefined): value is string {
    const normalized = trimToNull(value);
    return (
        normalized !== null &&
        normalized.length >= 3 &&
        !PLACEHOLDER_PATTERN.test(normalized) &&
        hasBalancedFormatting(normalized)
    );
}

function isIndexableDisplayName(value: string | null | undefined): value is string {
    const normalized = trimToNull(value);
    return normalized !== null && isValidDisplayName(normalized) && isMeaningfulText(normalized);
}

function cleanMeaningfulTextList(value: unknown): string[] {
    return toStringArray(value).filter(isMeaningfulText);
}

function slugify(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/['’]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function isHidden(value: unknown): boolean {
    return value === true;
}

function formatFaction(raw: string): string {
    const normalized = raw.trim().toLowerCase();

    switch (normalized) {
        case "aspect":
        case "aspects":
            return "Aspects";
        case "kin":
            return "Kin";
        case "lords":
            return "Lords";
        case "necrophage":
        case "necrophages":
            return "Necrophages";
        case "tahuk":
        case "mukag":
            return "Tahuk";
        default:
            return raw
                .split(/[\s_]+/g)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join(" ");
    }
}

function formatFactionScope(factions: string[]): string {
    if (factions.length === 1) return `${factions[0]} `;
    return "";
}

function formatTechHighlights(unlocks: string[], effects: string[]): string {
    const parts: string[] = [];
    if (unlocks[0]) parts.push(`unlocks ${unlocks[0]}`);
    if (effects[0]) parts.push(effects[0]);
    return parts.join(" and ");
}

function buildTechSeoDescription(
    name: string,
    era: number,
    techType: string,
    factions: string[],
    unlocks: string[],
    effects: string[]
): string {
    const scope = formatFactionScope(factions);
    const highlights = formatTechHighlights(unlocks, effects);
    const suffix = highlights ? ` that ${highlights}` : "";

    return `${name} is ${scope}an Endless Legend 2 era ${era} ${techType.toLowerCase()} technology${suffix}.`;
}

function buildTechOverview(
    name: string,
    techType: string,
    factions: string[],
    unlocks: string[],
    effects: string[],
    prereq: string | null
): string {
    const sentences: string[] = [
        `${name} gives players a clear ${techType.toLowerCase()} planning breakpoint with ${unlocks.length} unlock${unlocks.length === 1 ? "" : "s"} and ${effects.length} direct effect${effects.length === 1 ? "" : "s"}.`,
    ];

    if (prereq) sentences.push(`It follows ${prereq} in the local snapshot tech flow.`);
    if (factions.length > 0 && factions.length < 5) {
        sentences.push(`This page is limited to ${factions.join(", ")} access instead of the full shared roster.`);
    }

    return sentences.join(" ");
}

function buildUnitSeoDescription(
    name: string,
    faction: string,
    tier: number,
    unitType: string,
    requiredTechnology: string,
    upgradeFrom: string | null,
    skills: string[]
): string {
    const fragments = [
        `${name} is a ${faction} tier ${tier} ${unitType.toLowerCase()} unit in Endless Legend 2`,
        requiredTechnology === "Starting roster"
            ? "with starting-roster access"
            : `unlocked by ${requiredTechnology}`,
    ];

    if (upgradeFrom) {
        fragments.push(`and upgraded from ${upgradeFrom}`);
    } else if (skills[0]) {
        fragments.push(`with ${skills[0]}`);
    }

    return `${fragments.join(" ")}.`;
}

function buildUnitOverview(
    name: string,
    faction: string,
    unitType: string,
    requiredTechnology: string,
    upgradeFrom: string | null,
    skills: string[]
): string {
    const sentences = [
        `${name} gives the ${faction} roster a ${unitType.toLowerCase()} option with ${skills.length} captured skill${skills.length === 1 ? "" : "s"} in the local snapshot.`,
    ];

    if (requiredTechnology !== "Starting roster") {
        sentences.push(`Its unlock path starts at ${requiredTechnology}.`);
    }

    if (upgradeFrom) {
        sentences.push(`The recorded evolution chain upgrades from ${upgradeFrom}.`);
    }

    return sentences.join(" ");
}

function techSelectionScore(snapshot: FeaturedTechSnapshot, prereq: string | null): number {
    return snapshot.unlocks.length * 3 + snapshot.effects.length * 2 + snapshot.factions.length * -1 + (prereq ? 1 : 0);
}

function unitSelectionScore(snapshot: FeaturedUnitSnapshot): number {
    return snapshot.skills.length * 2 + (snapshot.upgradeFrom ? 2 : 0) + (snapshot.requiredTechnology !== "Starting roster" ? 2 : 0) + snapshot.tier;
}

function pushSkip(
    skips: EntityGenerationSkip[],
    kind: FeaturedEntityKind,
    name: string | null | undefined,
    entryKey: string,
    reason: EntitySkipReason
): void {
    skips.push({
        kind,
        name: trimToNull(name) ?? "(missing name)",
        entryKey,
        reason,
    });
}

function buildTechCatalog(rawTechs: RawTechSnapshot[], skips: EntityGenerationSkip[]): FeaturedTechSnapshot[] {
    const candidates: Array<{ snapshot: FeaturedTechSnapshot; prereq: string | null }> = [];

    for (const raw of rawTechs) {
        const name = trimToNull(raw.name);
        const entryKey = slugify(name ?? "");

        if (isHidden(raw.hidden)) {
            pushSkip(skips, "tech", name, entryKey, "hidden");
            continue;
        }

        if (!isIndexableDisplayName(name)) {
            pushSkip(skips, "tech", name, entryKey, "invalid-display-name");
            continue;
        }

        if (!SAFE_ENTRY_KEY_PATTERN.test(entryKey)) {
            pushSkip(skips, "tech", name, entryKey, "invalid-entry-key");
            continue;
        }

        const era = toNumber(raw.era);
        const techType = trimToNull(raw.type);
        const unlocks = cleanMeaningfulTextList(raw.unlocks);
        const effects = cleanMeaningfulTextList(raw.effects);
        const prereq = trimToNull(raw.prereq);
        const factions = cleanMeaningfulTextList(raw.factions).map(formatFaction);
        const hasMeaningfulContent =
            unlocks.length > 0 &&
            (effects.length > 0 || unlocks.length > 1 || factions.length > 0 && factions.length < 5 || prereq !== null);

        if (era === null || !techType || factions.length === 0) {
            pushSkip(skips, "tech", name, entryKey, "missing-required-fields");
            continue;
        }

        if (!hasMeaningfulContent) {
            pushSkip(skips, "tech", name, entryKey, "insufficient-tech-content");
            continue;
        }

        const seoDescription = buildTechSeoDescription(name, era, techType, factions, unlocks, effects);
        const overview = buildTechOverview(name, techType, factions, unlocks, effects, prereq);

        if (!isMeaningfulText(seoDescription) || !isMeaningfulText(overview)) {
            pushSkip(skips, "tech", name, entryKey, "placeholder-content");
            continue;
        }

        candidates.push({
            prereq,
            snapshot: {
                kind: "tech",
                entryKey,
                name,
                seoDescription,
                overview,
                era,
                techType,
                factions,
                unlocks,
                effects,
                ctaPath: `/tech?faction=${factions[0].toLowerCase()}&tech=${entryKey}`,
                ctaLabel: `Open ${name} in the interactive tech planner`,
            },
        });
    }

    return candidates
        .sort((a, b) => {
            const scoreDiff = techSelectionScore(b.snapshot, b.prereq) - techSelectionScore(a.snapshot, a.prereq);
            if (scoreDiff !== 0) return scoreDiff;
            if (a.snapshot.era !== b.snapshot.era) return a.snapshot.era - b.snapshot.era;
            return a.snapshot.name.localeCompare(b.snapshot.name);
        })
        .slice(0, MAX_TECH_PAGES)
        .map((candidate) => candidate.snapshot);
}

function buildUnitCatalog(rawUnits: RawUnitSnapshot[], skips: EntityGenerationSkip[]): FeaturedUnitSnapshot[] {
    const candidates: FeaturedUnitSnapshot[] = [];

    for (const raw of rawUnits) {
        const name = trimToNull(raw.name);
        const entryKey = slugify(name ?? "");

        if (isHidden(raw.hidden)) {
            pushSkip(skips, "unit", name, entryKey, "hidden");
            continue;
        }

        if (!isIndexableDisplayName(name)) {
            pushSkip(skips, "unit", name, entryKey, "invalid-display-name");
            continue;
        }

        if (!SAFE_ENTRY_KEY_PATTERN.test(entryKey)) {
            pushSkip(skips, "unit", name, entryKey, "invalid-entry-key");
            continue;
        }

        if (trimToNull(raw.FactionType)?.toUpperCase() !== "MAJOR") {
            pushSkip(skips, "unit", name, entryKey, "minor-faction-unit");
            continue;
        }

        const tier = toNumber(raw.tier);
        const unitType = trimToNull(raw.type);
        const factionRaw = trimToNull(raw.faction);
        const faction = factionRaw ? formatFaction(factionRaw) : null;
        const skills = cleanMeaningfulTextList(raw.skills);
        const requiredTechnology = trimToNull(raw.requiredTechnology) ?? "Starting roster";
        const upgradeFrom = trimToNull(raw.upgrade);
        const cost = toDisplayString(raw.cost);
        const upkeep = toDisplayString(raw.upkeep);
        const health = toDisplayString(raw.health);
        const damage = toDisplayString(raw.damage);
        const defense = toDisplayString(raw.defense);
        const movement = toDisplayString(raw.movement);

        if (tier === null || !unitType || !faction || !cost || !upkeep || !health || !damage || !defense || !movement) {
            pushSkip(skips, "unit", name, entryKey, "missing-required-fields");
            continue;
        }

        if (cost === "0") {
            pushSkip(skips, "unit", name, entryKey, "non-buildable-unit");
            continue;
        }

        if (!upgradeFrom && requiredTechnology === "Starting roster" && skills.length === 0) {
            pushSkip(skips, "unit", name, entryKey, "insufficient-unit-content");
            continue;
        }

        const seoDescription = buildUnitSeoDescription(
            name,
            faction,
            tier,
            unitType,
            requiredTechnology,
            upgradeFrom,
            skills
        );
        const overview = buildUnitOverview(name, faction, unitType, requiredTechnology, upgradeFrom, skills);

        if (!isMeaningfulText(seoDescription) || !isMeaningfulText(overview)) {
            pushSkip(skips, "unit", name, entryKey, "placeholder-content");
            continue;
        }

        candidates.push({
            kind: "unit",
            entryKey,
            name,
            seoDescription,
            overview,
            faction,
            tier,
            unitType,
            requiredTechnology,
            upgradeFrom,
            health,
            damage,
            defense,
            movement,
            cost,
            upkeep,
            skills,
            ctaPath: `/units?faction=${faction.toLowerCase()}&unitKey=${entryKey}`,
            ctaLabel: `Open ${name} in the interactive unit explorer`,
        });
    }

    return candidates
        .sort((a, b) => {
            const scoreDiff = unitSelectionScore(b) - unitSelectionScore(a);
            if (scoreDiff !== 0) return scoreDiff;
            if (a.faction !== b.faction) return a.faction.localeCompare(b.faction);
            if (a.tier !== b.tier) return a.tier - b.tier;
            return a.name.localeCompare(b.name);
        })
        .slice(0, MAX_UNIT_PAGES)
        .map((candidate) => candidate);
}

function createGenerationReport(
    techs: FeaturedTechSnapshot[],
    units: FeaturedUnitSnapshot[],
    rawTechs: RawTechSnapshot[],
    rawUnits: RawUnitSnapshot[],
    skippedEntries: EntityGenerationSkip[]
): EntityGenerationReport {
    const skippedByReason = skippedEntries.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.reason] = (acc[entry.reason] ?? 0) + 1;
        return acc;
    }, {});

    return {
        rawCounts: {
            techs: rawTechs.length,
            units: rawUnits.length,
            total: rawTechs.length + rawUnits.length,
        },
        includedCounts: {
            techs: techs.length,
            units: units.length,
            total: techs.length + units.length,
        },
        excludedCounts: {
            techs: rawTechs.length - techs.length,
            units: rawUnits.length - units.length,
            total: rawTechs.length + rawUnits.length - techs.length - units.length,
        },
        skippedByReason,
        skippedEntries,
    };
}

function validateCoverageWindow(report: EntityGenerationReport): void {
    if (report.includedCounts.techs >= report.rawCounts.techs) {
        throw new Error("Tech entity selection reached the full tech corpus; tighten filters before generating.");
    }

    if (report.includedCounts.units >= report.rawCounts.units) {
        throw new Error("Unit entity selection reached the full unit corpus; tighten filters before generating.");
    }

    if (
        report.includedCounts.total < MIN_TOTAL_PAGES ||
        report.includedCounts.total > MAX_TOTAL_PAGES
    ) {
        throw new Error(
            `Generated entity count must stay between ${MIN_TOTAL_PAGES} and ${MAX_TOTAL_PAGES}; received ${report.includedCounts.total}.`
        );
    }
}

const RAW_TECH_SNAPSHOTS = readSnapshotFile<RawTechSnapshot[]>("techs.json");
const RAW_UNIT_SNAPSHOTS = readSnapshotFile<RawUnitSnapshot[]>("units.json");
const skippedEntries: EntityGenerationSkip[] = [];

export const FEATURED_TECH_SNAPSHOTS = buildTechCatalog(RAW_TECH_SNAPSHOTS, skippedEntries);
export const FEATURED_UNIT_SNAPSHOTS = buildUnitCatalog(RAW_UNIT_SNAPSHOTS, skippedEntries);
export const ENTITY_GENERATION_REPORT = createGenerationReport(
    FEATURED_TECH_SNAPSHOTS,
    FEATURED_UNIT_SNAPSHOTS,
    RAW_TECH_SNAPSHOTS,
    RAW_UNIT_SNAPSHOTS,
    skippedEntries
);

validateCoverageWindow(ENTITY_GENERATION_REPORT);
