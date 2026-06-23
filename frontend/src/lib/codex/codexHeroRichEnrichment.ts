import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry, Hero, HeroSkill, HeroSkillDefault, SkillTree } from "@/types/dataTypes";

type HeroEnrichmentSource = Pick<
    Hero,
    | "unitKey"
    | "faction"
    | "factionKey"
    | "isMajorFaction"
    | "originKind"
    | "originFactionKey"
    | "minorFactionKey"
    | "hiddenHelperAbilityKeys"
    | "defaultSkillKeys"
    | "applicableSkillTreeKeys"
>;

type HeroSkillSource = Pick<
    HeroSkill,
    | "skillKey"
    | "publicDisplayName"
    | "resolvedDisplayName"
    | "primaryAbilityKey"
    | "resolvedSummaryLines"
    | "resolvedMechanicKind"
    | "isObsolete"
>;

type HeroSkillDefaultSource = Pick<HeroSkillDefault, "heroKey" | "defaultSkillKeys">;
type SkillTreeSource = Pick<SkillTree, "treeKey" | "treeType" | "isHidden">;

export type CodexHeroLink = {
    entry: CodexEntry;
    label: string;
};

export type CodexHeroStartingSkill = {
    key: string;
    label: string;
    summaryLines: string[];
    mechanicKind: string | null;
    primaryAbility: CodexHeroLink | null;
};

export type CodexHeroRichEnrichment = {
    origin: CodexHeroLink | null;
    classLabel: string | null;
    skillPathTypes: string[];
    startingSkills: CodexHeroStartingSkill[];
};

const EMPTY_HERO_RICH_ENRICHMENT: CodexHeroRichEnrichment = {
    origin: null,
    classLabel: null,
    skillPathTypes: [],
    startingSkills: [],
};

function normalizeKey(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeKind(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
}

function isHeroEntry(entry: CodexEntry): boolean {
    return normalizeKind(entry.exportKind) === "heroes";
}

function isFactionKind(kind: string): boolean {
    return kind === "factions" || kind === "minorfactions";
}

function isAbilityEntry(entry: CodexEntry): boolean {
    return normalizeKind(entry.exportKind) === "abilities";
}

function buildPublicCodexEntryIndex(entries: readonly CodexEntry[]): Record<string, CodexEntry> {
    return entries.reduce<Record<string, CodexEntry>>((acc, entry) => {
        const key = normalizeKey(entry.entryKey);
        if (key) acc[key] = entry;
        return acc;
    }, {});
}

function uniqueKeys(keys: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const rawKey of keys) {
        const key = normalizeKey(rawKey);
        if (!key || seen.has(key)) continue;

        seen.add(key);
        out.push(key);
    }

    return out;
}

function uniqueLabels(labels: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const rawLabel of labels) {
        const label = rawLabel.trim();
        const normalizedLabel = label.toLowerCase();
        if (!label || seen.has(normalizedLabel)) continue;

        seen.add(normalizedLabel);
        out.push(label);
    }

    return out;
}

function resolveOrigin(
    hero: HeroEnrichmentSource,
    publicEntryByKey: Record<string, CodexEntry>
): CodexHeroLink | null {
    const originKeys = uniqueKeys([
        hero.originFactionKey ?? "",
        hero.minorFactionKey ?? "",
        hero.factionKey ?? "",
    ]);

    for (const key of originKeys) {
        const entry = publicEntryByKey[key];
        if (!entry || !isFactionKind(normalizeKind(entry.exportKind))) continue;

        return {
            entry,
            label: getCodexEntryLabel(entry),
        };
    }

    return null;
}

function getClassLabel(entry: CodexEntry): string | null {
    return getCodexFactValues(entry, "Class")[0]?.trim() || null;
}

function resolveSkillPathTypes(
    hero: HeroEnrichmentSource,
    skillTreesByKey: Readonly<Record<string, SkillTreeSource | undefined>>
): string[] {
    const labels = uniqueKeys(hero.applicableSkillTreeKeys ?? [])
        .map((key) => skillTreesByKey[key])
        .filter((tree): tree is SkillTreeSource => tree !== undefined && tree.isHidden !== true)
        .map((tree) => tree.treeType?.trim() ?? "")
        .filter(Boolean);

    return uniqueLabels(labels);
}

function skillLabel(skill: HeroSkillSource): string {
    const publicLabel = skill.publicDisplayName?.trim();
    if (publicLabel) return publicLabel;

    const resolvedLabel = skill.resolvedDisplayName?.trim();
    if (resolvedLabel && resolvedLabel !== skill.skillKey) return resolvedLabel;

    return "";
}

function resolveStartingSkills(
    hero: HeroEnrichmentSource,
    skillDefault: HeroSkillDefaultSource | undefined,
    skillsByKey: Readonly<Record<string, HeroSkillSource | undefined>>,
    publicEntryByKey: Record<string, CodexEntry>
): CodexHeroStartingSkill[] {
    const hiddenAbilityKeys = new Set(uniqueKeys(hero.hiddenHelperAbilityKeys ?? []));
    const startingSkillKeys = uniqueKeys([
        ...(hero.defaultSkillKeys ?? []),
        ...(skillDefault?.defaultSkillKeys ?? []),
    ]);
    const startingSkills: CodexHeroStartingSkill[] = [];

    for (const key of startingSkillKeys) {
        const skill = skillsByKey[key];
        if (!skill || skill.isObsolete === true) continue;

        const label = skillLabel(skill);
        if (!label) continue;

        const primaryAbilityKey = normalizeKey(skill.primaryAbilityKey);
        const primaryAbilityEntry = primaryAbilityKey && !hiddenAbilityKeys.has(primaryAbilityKey)
            ? publicEntryByKey[primaryAbilityKey]
            : null;
        const primaryAbility = primaryAbilityEntry && isAbilityEntry(primaryAbilityEntry)
            ? {
                    entry: primaryAbilityEntry,
                    label: getCodexEntryLabel(primaryAbilityEntry),
                }
            : null;

        startingSkills.push({
            key,
            label,
            summaryLines: (skill.resolvedSummaryLines ?? []).map((line) => line.trim()).filter(Boolean).slice(0, 3),
            mechanicKind: skill.resolvedMechanicKind?.trim() || null,
            primaryAbility,
        });
    }

    return startingSkills;
}

export function buildCodexHeroRichEnrichment(
    entry: CodexEntry,
    heroByKey: Readonly<Record<string, HeroEnrichmentSource | undefined>>,
    skillTreesByKey: Readonly<Record<string, SkillTreeSource | undefined>>,
    skillsByKey: Readonly<Record<string, HeroSkillSource | undefined>>,
    skillDefaultsByHeroKey: Readonly<Record<string, HeroSkillDefaultSource | undefined>>,
    allEntries: readonly CodexEntry[]
): CodexHeroRichEnrichment {
    if (!isHeroEntry(entry)) return EMPTY_HERO_RICH_ENRICHMENT;

    const currentEntryKey = normalizeKey(entry.entryKey);
    if (!currentEntryKey) return EMPTY_HERO_RICH_ENRICHMENT;

    const hero = heroByKey[currentEntryKey];
    if (!hero) return EMPTY_HERO_RICH_ENRICHMENT;

    const publicEntryByKey = buildPublicCodexEntryIndex(allEntries);

    return {
        origin: resolveOrigin(hero, publicEntryByKey),
        classLabel: getClassLabel(entry),
        skillPathTypes: resolveSkillPathTypes(hero, skillTreesByKey),
        startingSkills: resolveStartingSkills(
            hero,
            skillDefaultsByHeroKey[currentEntryKey],
            skillsByKey,
            publicEntryByKey
        ),
    };
}

export function hasCodexHeroRichEnrichment(enrichment: CodexHeroRichEnrichment): boolean {
    return (
        enrichment.origin !== null ||
        Boolean(enrichment.classLabel) ||
        enrichment.skillPathTypes.length > 0 ||
        enrichment.startingSkills.length > 0
    );
}

export function getCodexHeroRichEnrichmentEntryKeys(enrichment: CodexHeroRichEnrichment): string[] {
    const seen = new Set<string>();
    const keys: string[] = [];
    const addKey = (entry: CodexEntry | null | undefined) => {
        const key = normalizeKey(entry?.entryKey);
        if (!key || seen.has(key)) return;

        seen.add(key);
        keys.push(key);
    };

    addKey(enrichment.origin?.entry);
    for (const skill of enrichment.startingSkills) {
        addKey(skill.primaryAbility?.entry);
    }

    return keys;
}
