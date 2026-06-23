import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexHeroStatGroup = {
    key: string;
    label: string;
    lines: string[];
};

const HERO_CORE_STAT_ORDER: Array<{ key: string; pattern: RegExp }> = [
    { key: "damage", pattern: /\[Damage\]|\bDamage\b/i },
    { key: "health", pattern: /\[Health\]|\bHealth\b/i },
    { key: "defense", pattern: /\[Defense\]|\bDefense\b/i },
    { key: "armor", pattern: /\[Armor\]|\bArmor\b/i },
    { key: "movement", pattern: /\[MovementPoints\]|\bMovement\b/i },
    { key: "critical", pattern: /\[Focus\]|\bCritical\b/i },
    { key: "vision", pattern: /\[VisionRange\]|\bVision\b/i },
];

const HERO_ZERO_DEFENSE_LINE = "0 [Defense] Defense";
const HERO_DEFENSE_PATTERN = /\[Defense\]|\bDefense\b/i;

function isHeroEntry(entry: CodexEntry): boolean {
    return entry.exportKind.trim().toLowerCase() === "heroes";
}

function splitStatLines(lines: readonly string[]): string[] {
    return lines.flatMap((line) =>
        line
            .split(/\r?\n/)
            .map((value) => value.trim())
            .filter(Boolean)
    );
}

function statSortIndex(line: string): number {
    const index = HERO_CORE_STAT_ORDER.findIndex((item) => item.pattern.test(line));
    return index === -1 ? HERO_CORE_STAT_ORDER.length : index;
}

function sortCoreStats(lines: readonly string[]): string[] {
    return [...lines].sort((left, right) => statSortIndex(left) - statSortIndex(right));
}

function ensureComparableDefense(lines: readonly string[]): string[] {
    const hasBaseStat = lines.some((line) => !/\bper\b/i.test(line));
    if (!hasBaseStat || lines.some((line) => HERO_DEFENSE_PATTERN.test(line))) {
        return [...lines];
    }

    return [...lines, HERO_ZERO_DEFENSE_LINE];
}

export function getCodexHeroStatLines(entry: CodexEntry): string[] {
    if (!isHeroEntry(entry)) return [];

    const parsed = parseCodexStructuredDescription(entry);
    const statsSection = parsed.sections.find((section) =>
        section.label.trim().toLowerCase() === "stats"
    );

    return statsSection ? ensureComparableDefense(splitStatLines(statsSection.lines)) : [];
}

export function getCodexHeroStatGroups(entry: CodexEntry): CodexHeroStatGroup[] {
    const lines = getCodexHeroStatLines(entry);
    const baseStats = sortCoreStats(lines.filter((line) => !/\bper\b/i.test(line)));
    const scalingStats = lines.filter((line) => /\bper\b/i.test(line));
    const groups: CodexHeroStatGroup[] = [];

    if (baseStats.length > 0) {
        groups.push({ key: "base", label: "Base stats", lines: baseStats });
    }

    if (scalingStats.length > 0) {
        groups.push({ key: "scaling", label: "Scaling", lines: scalingStats });
    }

    return groups;
}
