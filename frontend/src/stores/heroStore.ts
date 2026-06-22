import { create } from "zustand";
import { apiClient } from "@/api/apiClient";
import { normalizeCollection } from "@/stores/utils/normalizedCollection";
import type { Hero } from "@/types/dataTypes";

type LoadOptions = {
    force?: boolean;
};

type HeroStore = {
    heroes: Hero[];
    heroesByKey: Record<string, Hero>;
    heroKeys: string[];
    duplicateHeroKeys: string[];

    loading: boolean;
    loaded: boolean;
    error: string | null;
    lastLoadedAt?: string;

    loadHeroes: (opts?: LoadOptions) => Promise<void>;
    refreshHeroes: () => Promise<void>;
    invalidateHeroes: () => void;
    reset: () => void;

    replaceHeroes: (heroes: Hero[]) => void;
    getHeroByKey: (key: string) => Hero | undefined;
};

let inflightLoad: Promise<void> | null = null;

export const normalizeHeroKey = (key: string | null | undefined) => (key ?? "").trim();

const stringList = (values: unknown): string[] =>
    Array.isArray(values)
        ? values
                .filter((value): value is string => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean)
        : [];

const normalizeHero = (hero: Hero): Hero => ({
    ...hero,
    unitKey: normalizeHeroKey(hero.unitKey),
    displayName: hero.displayName ?? "",
    faction: hero.faction ?? null,
    factionKey: hero.factionKey ?? null,
    isMajorFaction: hero.isMajorFaction ?? null,
    heroKey: normalizeHeroKey(hero.heroKey) || null,
    heroClassKey: normalizeHeroKey(hero.heroClassKey) || null,
    originKind: hero.originKind ?? null,
    originFactionKey: normalizeHeroKey(hero.originFactionKey) || null,
    minorFactionKey: normalizeHeroKey(hero.minorFactionKey) || null,
    unitClassKey: normalizeHeroKey(hero.unitClassKey) || null,
    attackSkillKey: normalizeHeroKey(hero.attackSkillKey) || null,
    ownAbilityKeys: stringList(hero.ownAbilityKeys),
    abilityKeys: stringList(hero.abilityKeys),
    combatAbilityKeys: stringList(hero.combatAbilityKeys),
    tacticalAbilityKeys: stringList(hero.tacticalAbilityKeys),
    passiveAbilityKeys: stringList(hero.passiveAbilityKeys),
    mechanicalAbilityKeys: stringList(hero.mechanicalAbilityKeys),
    classRuleAbilityKeys: stringList(hero.classRuleAbilityKeys),
    hiddenHelperAbilityKeys: stringList(hero.hiddenHelperAbilityKeys),
    defaultSkillKeys: stringList(hero.defaultSkillKeys),
    applicableSkillTreeKeys: stringList(hero.applicableSkillTreeKeys),
    descriptionLines: stringList(hero.descriptionLines),
    referenceKeys: stringList(hero.referenceKeys),
});

const initialState = {
    heroes: [] as Hero[],
    heroesByKey: {} as Record<string, Hero>,
    heroKeys: [] as string[],
    duplicateHeroKeys: [] as string[],
    loading: false,
    loaded: false,
    error: null as string | null,
    lastLoadedAt: undefined as string | undefined,
};

const formatLoadError = (reason: unknown) =>
    `Failed to load heroes: ${(reason as Error)?.message ?? String(reason)}`;

const normalizeHeroCollection = (rawHeroes: Hero[]) => {
    const normalizedHeroes = rawHeroes.map(normalizeHero);
    return normalizeCollection(normalizedHeroes, (hero) => hero.unitKey, {
        normalizeKey: normalizeHeroKey,
    });
};

export const useHeroStore = create<HeroStore>((set, get) => ({
    ...initialState,

    loadHeroes: async (opts) => {
        const force = opts?.force ?? false;
        const state = get();

        if (!force && state.loading && inflightLoad) return inflightLoad;
        if (!force && state.loaded) return;

        set({ loading: true, error: null });

        inflightLoad = (async () => {
            try {
                const heroes = normalizeHeroCollection(await apiClient.getHeroes());
                set({
                    heroes: heroes.items,
                    heroesByKey: heroes.byKey,
                    heroKeys: heroes.keys,
                    duplicateHeroKeys: heroes.duplicateKeys,
                    loading: false,
                    loaded: true,
                    error: null,
                    lastLoadedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Failed to fetch heroes from API.", err);
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

    refreshHeroes: async () => {
        await get().loadHeroes({ force: true });
    },

    invalidateHeroes: () => {
        set({ loaded: false });
    },

    reset: () => {
        inflightLoad = null;
        set(initialState);
    },

    replaceHeroes: (rawHeroes) => {
        const heroes = normalizeHeroCollection(rawHeroes);
        set({
            heroes: heroes.items,
            heroesByKey: heroes.byKey,
            heroKeys: heroes.keys,
            duplicateHeroKeys: heroes.duplicateKeys,
            loading: false,
            loaded: true,
            error: null,
            lastLoadedAt: new Date().toISOString(),
        });
    },

    getHeroByKey: (key) => {
        const normalizedKey = normalizeHeroKey(key);
        if (!normalizedKey) return undefined;
        return get().heroesByKey[normalizedKey];
    },
}));

export const selectHeroes = (state: HeroStore) => state.heroes;
export const selectHeroesByKey = (state: HeroStore) => state.heroesByKey;
export const selectHeroByKey = (key: string) => (state: HeroStore) =>
    state.heroesByKey[normalizeHeroKey(key)];
