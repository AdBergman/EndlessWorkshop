import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { normalizeCollection } from "@/stores/utils/normalizedCollection";
import type { HeroSkill, HeroSkillDefault, SkillTier, SkillTree, Skills } from "@/types/dataTypes";

type LoadOptions = {
    force?: boolean;
};

type SkillStore = {
    skillTrees: SkillTree[];
    skillTreesByKey: Record<string, SkillTree>;
    skillTiers: SkillTier[];
    skillTiersByKey: Record<string, SkillTier>;
    skills: HeroSkill[];
    skillsByKey: Record<string, HeroSkill>;
    heroSkillDefaults: HeroSkillDefault[];
    heroSkillDefaultsByHeroKey: Record<string, HeroSkillDefault>;

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadSkills: (opts?: LoadOptions) => Promise<void>;
    refreshSkills: () => Promise<void>;
    invalidateSkills: () => void;
    reset: () => void;
    replaceSkills: (skills: Skills) => void;
    getSkillByKey: (key: string) => HeroSkill | undefined;
    getSkillTreeByKey: (key: string) => SkillTree | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeSkillKey = (key: string | null | undefined) => (key ?? "").trim();

const stringList = (values: unknown): string[] =>
    Array.isArray(values)
        ? values
                .filter((value): value is string => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean)
        : [];

const mapList = (values: unknown): Array<Record<string, unknown>> =>
    Array.isArray(values)
        ? values.filter((value): value is Record<string, unknown> =>
                typeof value === "object" && value !== null && !Array.isArray(value)
          )
        : [];

const normalizeTree = (tree: SkillTree): SkillTree => ({
    ...tree,
    treeKey: normalizeSkillKey(tree.treeKey),
    treeType: tree.treeType ?? null,
    isHidden: tree.isHidden ?? null,
    tierPlacementKeys: stringList(tree.tierPlacementKeys),
    tierKeys: stringList(tree.tierKeys),
    skillKeys: stringList(tree.skillKeys),
    referenceKeys: stringList(tree.referenceKeys),
    classPrerequisiteKey: normalizeSkillKey(tree.classPrerequisiteKey) || null,
    factionPrerequisiteKey: normalizeSkillKey(tree.factionPrerequisiteKey) || null,
});

const normalizeTier = (tier: SkillTier): SkillTier => ({
    ...tier,
    tierPlacementKey: normalizeSkillKey(tier.tierPlacementKey),
    tierKey: normalizeSkillKey(tier.tierKey) || null,
    treeKey: normalizeSkillKey(tier.treeKey) || null,
    treeType: tier.treeType ?? null,
    tierIndex: tier.tierIndex ?? null,
    levelPrerequisite: tier.levelPrerequisite ?? null,
    skillKeys: stringList(tier.skillKeys),
    referenceKeys: stringList(tier.referenceKeys),
});

const normalizeSkill = (skill: HeroSkill): HeroSkill => ({
    ...skill,
    skillKey: normalizeSkillKey(skill.skillKey),
    entryKey: normalizeSkillKey(skill.entryKey) || null,
    kind: skill.kind ?? null,
    displayName: skill.displayName ?? null,
    publicDisplayName: skill.publicDisplayName ?? null,
    primaryAbilityKey: normalizeSkillKey(skill.primaryAbilityKey) || null,
    descriptionLines: stringList(skill.descriptionLines),
    resolvedDisplayName: skill.resolvedDisplayName ?? null,
    resolvedSummaryLines: stringList(skill.resolvedSummaryLines),
    resolvedMechanicKind: skill.resolvedMechanicKind ?? null,
    resolvedMechanicTags: stringList(skill.resolvedMechanicTags),
    isObsolete: skill.isObsolete ?? null,
    isActive: skill.isActive ?? null,
    isPassive: skill.isPassive ?? null,
    placements: mapList(skill.placements),
    prerequisiteSkillKeys: stringList(skill.prerequisiteSkillKeys),
    inhibitedBySkillKeys: stringList(skill.inhibitedBySkillKeys),
    lockedBySkillKeys: stringList(skill.lockedBySkillKeys),
    effects: mapList(skill.effects),
    unitAbilityKeys: stringList(skill.unitAbilityKeys),
    battleSkillKeys: stringList(skill.battleSkillKeys),
    battleAbilityKeys: stringList(skill.battleAbilityKeys),
    descriptorKeys: stringList(skill.descriptorKeys),
    unitAbilityEventKeys: stringList(skill.unitAbilityEventKeys),
    rewardPerKillInBattleEffectKeys: stringList(skill.rewardPerKillInBattleEffectKeys),
    statAffinityNames: stringList(skill.statAffinityNames),
    defaultForHeroKeys: stringList(skill.defaultForHeroKeys),
    referenceKeys: stringList(skill.referenceKeys),
});

const normalizeDefault = (defaultSkill: HeroSkillDefault): HeroSkillDefault => ({
    ...defaultSkill,
    heroKey: normalizeSkillKey(defaultSkill.heroKey),
    defaultSkillKeys: stringList(defaultSkill.defaultSkillKeys),
    referenceKeys: stringList(defaultSkill.referenceKeys),
    factionKey: normalizeSkillKey(defaultSkill.factionKey) || null,
    classKey: normalizeSkillKey(defaultSkill.classKey) || null,
});

const initialState = {
    skillTrees: [] as SkillTree[],
    skillTreesByKey: {} as Record<string, SkillTree>,
    skillTiers: [] as SkillTier[],
    skillTiersByKey: {} as Record<string, SkillTier>,
    skills: [] as HeroSkill[],
    skillsByKey: {} as Record<string, HeroSkill>,
    heroSkillDefaults: [] as HeroSkillDefault[],
    heroSkillDefaultsByHeroKey: {} as Record<string, HeroSkillDefault>,
    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load skills: ${(reason as Error)?.message ?? String(reason)}`;

const buildState = (raw: Skills) => {
    const treeCollection = normalizeCollection((raw.skillTrees ?? []).map(normalizeTree), (tree) => tree.treeKey, {
        normalizeKey: normalizeSkillKey,
    });
    const tierCollection = normalizeCollection((raw.skillTiers ?? []).map(normalizeTier), (tier) => tier.tierPlacementKey, {
        normalizeKey: normalizeSkillKey,
    });
    const skillCollection = normalizeCollection((raw.skills ?? []).map(normalizeSkill), (skill) => skill.skillKey, {
        normalizeKey: normalizeSkillKey,
    });
    const defaultCollection = normalizeCollection(
        (raw.heroSkillDefaults ?? []).map(normalizeDefault),
        (defaultSkill) => defaultSkill.heroKey,
        { normalizeKey: normalizeSkillKey }
    );

    return {
        skillTrees: treeCollection.items,
        skillTreesByKey: treeCollection.byKey,
        skillTiers: tierCollection.items,
        skillTiersByKey: tierCollection.byKey,
        skills: skillCollection.items,
        skillsByKey: skillCollection.byKey,
        heroSkillDefaults: defaultCollection.items,
        heroSkillDefaultsByHeroKey: defaultCollection.byKey,
    };
};

export const useSkillStore = create<SkillStore>((set, get) => ({
    ...initialState,

    loadSkills: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();
        if (!force && state.loading && inflightLoad) return inflightLoad;
        if (!force && state.loaded) return;

        set({ loading: true, error: null });
        inflightLoad = (async () => {
            try {
                set({
                    ...buildState(await apiClient.getSkills()),
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch skills from API.", err);
                set({
                    ...initialState,
                    loaded: false,
                    error: formatLoadError(err),
                    lastLoadedAt: new Date().toISOString(),
                });
            } finally {
                inflightLoad = null;
            }
        })();

        return inflightLoad;
    },

    refreshSkills: async () => {
        await get().loadSkills({ force: true });
    },

    invalidateSkills: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    replaceSkills: (skills) => {
        set({
            ...buildState(skills),
            loading: false,
            loaded: true,
            error: null,
            lastLoadedAt: new Date().toISOString(),
        });
    },

    getSkillByKey: (key) => {
        const normalizedKey = normalizeSkillKey(key);
        if (!normalizedKey) return undefined;
        return get().skillsByKey[normalizedKey];
    },

    getSkillTreeByKey: (key) => {
        const normalizedKey = normalizeSkillKey(key);
        if (!normalizedKey) return undefined;
        return get().skillTreesByKey[normalizedKey];
    },
}));
