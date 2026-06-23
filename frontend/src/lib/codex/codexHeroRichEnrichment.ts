import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry, Hero, HeroSkill, HeroSkillDefault, SkillTier, SkillTree } from "@/types/dataTypes";

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
type SkillTreeSource = Pick<
    SkillTree,
    "treeKey" | "treeType" | "isHidden" | "tierPlacementKeys"
>;
type SkillTierSource = Pick<
    SkillTier,
    "tierPlacementKey" | "tierKey" | "tierIndex" | "levelPrerequisite" | "skillKeys"
>;

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

export type CodexHeroSkillOption = CodexHeroStartingSkill;

export type CodexHeroSkillUnlockGroup = {
    key: string;
    unlockThreshold: number | null;
    skills: CodexHeroSkillOption[];
};

export type CodexHeroSkillTree = {
    key: string;
    label: string;
    unlockGroups: CodexHeroSkillUnlockGroup[];
};

export type CodexHeroRichEnrichment = {
    origin: CodexHeroLink | null;
    classLabel: string | null;
    skillPathTypes: string[];
    startingSkills: CodexHeroStartingSkill[];
    skillOptions: CodexHeroSkillTree[];
};

const EMPTY_HERO_RICH_ENRICHMENT: CodexHeroRichEnrichment = {
    origin: null,
    classLabel: null,
    skillPathTypes: [],
    startingSkills: [],
    skillOptions: [],
};

const SKILL_GROUP_ORDER = ["Synergy", "Faction", "Class", "Common"];

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

function skillGroupOrder(label: string): number {
    const index = SKILL_GROUP_ORDER.indexOf(label);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortSkillGroupLabels(labels: readonly string[]): string[] {
    return [...labels].sort((a, b) => {
        const indexA = skillGroupOrder(a);
        const indexB = skillGroupOrder(b);

        if (indexA !== indexB) {
            return indexA - indexB;
        }

        return a.localeCompare(b);
    });
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
    skillTreesByKey: Readonly<Record<string, SkillTreeSource | undefined>>,
    skillTiersByKey: Readonly<Record<string, SkillTierSource | undefined>>
): string[] {
    const labels: string[] = [];

    for (const treeKey of uniqueKeys(hero.applicableSkillTreeKeys ?? [])) {
        const tree = skillTreesByKey[treeKey];
        if (!tree || tree.isHidden === true) continue;

        const label = tree.treeType?.trim() ?? "";
        if (label) labels.push(label);

        const hasCommonTier = uniqueKeys(tree.tierPlacementKeys ?? [])
            .map((tierKey) => skillTiersByKey[tierKey])
            .some((tier): tier is SkillTierSource => (
                tier !== undefined &&
                uniqueKeys(tier.skillKeys ?? []).length > 0 &&
                isCommonSkillTier(tier)
            ));

        if (hasCommonTier) labels.push("Common");
    }

    return sortSkillGroupLabels(uniqueLabels(labels));
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

function buildSkillOption(
    key: string,
    hiddenAbilityKeys: ReadonlySet<string>,
    skillsByKey: Readonly<Record<string, HeroSkillSource | undefined>>,
    publicEntryByKey: Record<string, CodexEntry>
): CodexHeroSkillOption | null {
    const skill = skillsByKey[key];
    if (!skill || skill.isObsolete === true) return null;

    const label = skillLabel(skill);
    if (!label) return null;

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

    return {
        key,
        label,
        summaryLines: (skill.resolvedSummaryLines ?? []).map((line) => line.trim()).filter(Boolean).slice(0, 2),
        mechanicKind: skill.resolvedMechanicKind?.trim() || null,
        primaryAbility,
    };
}

function isCommonSkillKey(key: string): boolean {
    return normalizeKey(key).startsWith("HeroSkill_Common");
}

function isCommonSkillTier(tier: SkillTierSource): boolean {
    const tierKey = normalizeKey(tier.tierKey);
    const tierPlacementKey = normalizeKey(tier.tierPlacementKey);

    return tierKey.startsWith("HeroSkillTier_Common") ||
        tierPlacementKey.includes("HeroSkillTier_Common") ||
        uniqueKeys(tier.skillKeys ?? []).some(isCommonSkillKey);
}

function getSkillGroupLabel(treeLabel: string, tier: SkillTierSource, skillKey: string): string {
    if (isCommonSkillTier(tier) || isCommonSkillKey(skillKey)) {
        return "Common";
    }

    return treeLabel;
}

type MutableSkillTreeGroup = CodexHeroSkillTree & {
    groupByThreshold: Map<string, CodexHeroSkillUnlockGroup>;
    seenSkillKeysByGroup: Map<string, Set<string>>;
};

function getOrCreateSkillTreeGroup(
    treesByLabel: Map<string, MutableSkillTreeGroup>,
    label: string,
    treeKey: string
): MutableSkillTreeGroup {
    let tree = treesByLabel.get(label);
    if (!tree) {
        tree = {
            key: label === "Common" ? "HeroSkillTree_Common" : treeKey,
            label,
            unlockGroups: [],
            groupByThreshold: new Map<string, CodexHeroSkillUnlockGroup>(),
            seenSkillKeysByGroup: new Map<string, Set<string>>(),
        };
        treesByLabel.set(label, tree);
    }

    return tree;
}

function addSkillOptionToTreeGroup(
    tree: MutableSkillTreeGroup,
    sourceTreeKey: string,
    tierRow: SkillTierSource,
    option: CodexHeroSkillOption
) {
    const unlockThreshold = Number.isFinite(tierRow.levelPrerequisite) ? tierRow.levelPrerequisite : null;
    const groupKey = unlockThreshold === null
        ? `tier:${normalizeKey(tierRow.tierPlacementKey)}`
        : `threshold:${unlockThreshold}`;
    let group = tree.groupByThreshold.get(groupKey);

    if (!group) {
        group = {
            key: `${sourceTreeKey}:${tree.label}:${groupKey}`,
            unlockThreshold,
            skills: [],
        };
        tree.groupByThreshold.set(groupKey, group);
        tree.unlockGroups.push(group);
        tree.seenSkillKeysByGroup.set(groupKey, new Set<string>());
    }

    const seenSkillKeys = tree.seenSkillKeysByGroup.get(groupKey);
    if (seenSkillKeys?.has(option.key)) return;

    seenSkillKeys?.add(option.key);
    group.skills.push(option);
}

function resolveSkillOptions(
    hero: HeroEnrichmentSource,
    skillTreesByKey: Readonly<Record<string, SkillTreeSource | undefined>>,
    skillTiersByKey: Readonly<Record<string, SkillTierSource | undefined>>,
    skillsByKey: Readonly<Record<string, HeroSkillSource | undefined>>,
    publicEntryByKey: Record<string, CodexEntry>
): CodexHeroSkillTree[] {
    const hiddenAbilityKeys = new Set(uniqueKeys(hero.hiddenHelperAbilityKeys ?? []));
    const treesByLabel = new Map<string, MutableSkillTreeGroup>();

    for (const treeKey of uniqueKeys(hero.applicableSkillTreeKeys ?? [])) {
        const tree = skillTreesByKey[treeKey];
        const label = tree?.treeType?.trim() ?? "";
        if (!tree || tree.isHidden === true || !label) continue;

        const tierRows = uniqueKeys(tree.tierPlacementKeys ?? [])
            .map((tierKey) => skillTiersByKey[tierKey])
            .filter((tier): tier is SkillTierSource => tier !== undefined)
            .sort((a, b) => (
                (a.tierIndex ?? Number.MAX_SAFE_INTEGER) -
                (b.tierIndex ?? Number.MAX_SAFE_INTEGER)
            ));

        for (const tierRow of tierRows) {
            for (const skillKey of uniqueKeys(tierRow.skillKeys ?? [])) {
                const option = buildSkillOption(
                    skillKey,
                    hiddenAbilityKeys,
                    skillsByKey,
                    publicEntryByKey
                );
                if (!option) continue;

                const groupLabel = getSkillGroupLabel(label, tierRow, skillKey);
                const skillTreeGroup = getOrCreateSkillTreeGroup(treesByLabel, groupLabel, treeKey);
                addSkillOptionToTreeGroup(skillTreeGroup, treeKey, tierRow, option);
            }
        }
    }

    return [...treesByLabel.values()]
        .map((tree) => ({
            key: tree.key,
            label: tree.label,
            unlockGroups: tree.unlockGroups
                .filter((group) => group.skills.length > 0)
                .sort((a, b) => (
                    (a.unlockThreshold ?? Number.MAX_SAFE_INTEGER) -
                    (b.unlockThreshold ?? Number.MAX_SAFE_INTEGER)
                )),
        }))
        .filter((tree) => tree.unlockGroups.length > 0)
        .sort((a, b) => {
            const orderDelta = skillGroupOrder(a.label) - skillGroupOrder(b.label);
            return orderDelta === 0 ? a.label.localeCompare(b.label) : orderDelta;
        });
}

export function buildCodexHeroRichEnrichment(
    entry: CodexEntry,
    heroByKey: Readonly<Record<string, HeroEnrichmentSource | undefined>>,
    skillTreesByKey: Readonly<Record<string, SkillTreeSource | undefined>>,
    skillTiersByKey: Readonly<Record<string, SkillTierSource | undefined>>,
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
        skillPathTypes: resolveSkillPathTypes(hero, skillTreesByKey, skillTiersByKey),
        startingSkills: resolveStartingSkills(
            hero,
            skillDefaultsByHeroKey[currentEntryKey],
            skillsByKey,
            publicEntryByKey
        ),
        skillOptions: resolveSkillOptions(
            hero,
            skillTreesByKey,
            skillTiersByKey,
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
        enrichment.startingSkills.length > 0 ||
        enrichment.skillOptions.length > 0
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
    for (const tree of enrichment.skillOptions) {
        for (const group of tree.unlockGroups) {
            for (const skill of group.skills) {
                addKey(skill.primaryAbility?.entry);
            }
        }
    }

    return keys;
}
