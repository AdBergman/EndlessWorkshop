import {
    buildAbilityArchiveFilterOptions,
    entryMatchesAbilityArchiveFilters,
    getAbilityArchiveFactFilterConfig,
    getAbilityArchiveSummary,
    getActiveAbilityArchiveFilterItems,
    getEntryFactFilterValues,
    type ActiveCodexFactFilters,
} from "@/lib/codex/codexAbilityArchiveFilters";
import type { CodexEntry } from "@/types/dataTypes";

function ability(
    entryKey: string,
    displayName: string,
    facts: CodexEntry["facts"] = [],
    descriptionLines: string[] = []
): CodexEntry {
    return {
        exportKind: "abilities",
        entryKey,
        displayName,
        descriptionLines,
        referenceKeys: [],
        facts,
    };
}

describe("codexAbilityArchiveFilters", () => {
    const filters = getAbilityArchiveFactFilterConfig("abilities");
    const roleFilter = filters.find((filter) => filter.label === "Combat role");
    const mechanicFilter = filters.find((filter) => filter.label === "Ability mechanic");

    it("exposes only the curated Ability Archive filter groups for abilities", () => {
        expect(filters.map((filter) => filter.displayLabel)).toEqual([
            "Popular / Player-centric",
            "Mechanics",
            "Sources",
        ]);
        expect(roleFilter?.allowedValues).toEqual([
            "Damage",
            "Status apply",
            "Shield",
            "Heal",
            "Movement",
            "Teleport",
            "Summon",
            "Push",
            "Status remove",
            "Reactive skill",
        ]);
        expect(getAbilityArchiveFactFilterConfig("statuses")).toEqual([]);
    });

    it("splits exported comma-separated Combat role facts without reading names or prose", () => {
        expect(roleFilter).toBeDefined();
        const entry = ability(
            "Ability_DamageNameOnly",
            "Damage Name Only",
            [{ label: "Combat role", value: "Damage, Movement, Status apply" }],
            ["Heal appears in prose only."]
        );

        expect(getEntryFactFilterValues(entry, roleFilter!)).toEqual([
            "Damage",
            "Movement",
            "Status apply",
        ]);
        expect(entryMatchesAbilityArchiveFilters(entry, { "Combat role": "Movement" }, filters)).toBe(true);
        expect(entryMatchesAbilityArchiveFilters(entry, { "Combat role": "Heal" }, filters)).toBe(false);
    });

    it("uses exact exported fact labels and does not infer from key, name, or description", () => {
        const proseOnly = ability(
            "Ability_Damage_StatusApply",
            "Damage Status Apply",
            [{ label: "Role", value: "Damage" }],
            ["Status apply and Damage appear here only."]
        );

        expect(entryMatchesAbilityArchiveFilters(proseOnly, { "Combat role": "Damage" }, filters)).toBe(false);
        expect(entryMatchesAbilityArchiveFilters(proseOnly, { Role: "Damage" }, filters)).toBe(true);
    });

    it("builds dynamic counts from exported facts and hides absent curated role values", () => {
        const entries = [
            ability("Ability_Damage", "Damage Ability", [
                { label: "Combat role", value: "Damage, Movement" },
                { label: "Ability mechanic", value: "Active" },
                { label: "Ability source", value: "Battle skill" },
            ]),
            ability("Ability_Shield", "Shield Ability", [
                { label: "Combat role", value: "Shield" },
                { label: "Ability mechanic", value: "Passive" },
                { label: "Ability source", value: "Battle ability" },
            ]),
            ability("Ability_ProseOnly", "Heal Name Only", [], ["Heal appears in prose only."]),
        ];

        const options = buildAbilityArchiveFilterOptions(entries, filters, {});
        const roleValues = options.find((filter) => filter.label === "Combat role")?.values ?? [];
        expect(roleValues).toEqual([
            { value: "Damage", count: 1 },
            { value: "Shield", count: 1 },
            { value: "Movement", count: 1 },
        ]);
        expect(roleValues.some((option) => option.value === "Heal")).toBe(false);
    });

    it("recalculates option counts against other active filters", () => {
        const entries = [
            ability("Ability_DamageActive", "Damage Active", [
                { label: "Combat role", value: "Damage, Movement" },
                { label: "Ability mechanic", value: "Active" },
            ]),
            ability("Ability_DamagePassive", "Damage Passive", [
                { label: "Combat role", value: "Damage" },
                { label: "Ability mechanic", value: "Passive" },
            ]),
            ability("Ability_ShieldActive", "Shield Active", [
                { label: "Combat role", value: "Shield" },
                { label: "Ability mechanic", value: "Active" },
            ]),
        ];
        const activeFilters: ActiveCodexFactFilters = { "Ability mechanic": "Active" };

        const options = buildAbilityArchiveFilterOptions(entries, filters, activeFilters);
        const roleValues = options.find((filter) => filter.label === "Combat role")?.values ?? [];
        const mechanicValues = options.find((filter) => filter.label === "Ability mechanic")?.values ?? [];

        expect(roleValues).toEqual([
            { value: "Damage", count: 1 },
            { value: "Shield", count: 1 },
            { value: "Movement", count: 1 },
        ]);
        expect(mechanicValues).toEqual([
            { value: "Active", count: 2 },
            { value: "Passive", count: 1 },
            { value: "Reaction", count: 0 },
            { value: "Mixed", count: 0 },
        ]);
    });

    it("builds active shelf labels and Ability Archive summaries", () => {
        const activeItems = getActiveAbilityArchiveFilterItems(
            { "Combat role": "Status apply", "Ability mechanic": "Reaction" },
            filters
        );

        expect(activeItems).toEqual([
            { label: "Combat role", displayLabel: "Popular / Player-centric", value: "Status apply" },
            { label: "Ability mechanic", displayLabel: "Mechanics", value: "Reaction" },
        ]);
        expect(getAbilityArchiveSummary([], 336)).toEqual({
            title: "Ability Archive",
            lead: "Browse combat and empire abilities by role, mechanic, and source.",
            context: "Archive index",
        });
        expect(getAbilityArchiveSummary(activeItems, 12)).toEqual({
            title: "Status Apply + Reaction Abilities",
            lead: "A curated combined shelf containing 12 abilities.",
            context: "Archive shelf",
        });
    });
});
