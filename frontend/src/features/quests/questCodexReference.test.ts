import { describe, expect, it } from "vitest";

import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";
import type { Requirement, Reward } from "@/types/questTypes";
import { resolveQuestCodexReference } from "./questCodexReference";
import { requirementDisplayFromRequirement } from "./questRequirementDisplay";
import { rewardDisplayFromReward } from "./questRewardDisplay";

function codexEntry(exportKind: string, entryKey: string, displayName = entryKey): CodexEntry {
    return {
        exportKind,
        entryKey,
        displayName,
        descriptionLines: [],
        referenceKeys: [],
    };
}

function indexes(entries: CodexEntry[]) {
    return {
        entriesByKey: buildEntriesByKey(entries),
        entriesByKindKey: buildEntriesByKindKey(entries),
    };
}

function requirement(overrides: Partial<Requirement> = {}): Requirement {
    return {
        requirementKey: "Requirement_Test",
        kind: "buildConstructible",
        displayText: "Build the marked district.",
        polarity: null,
        groupLabel: null,
        groupOrder: null,
        targetRole: null,
        targetLabel: null,
        requiredCount: null,
        durationTurns: null,
        state: null,
        referenceKind: null,
        referenceKey: null,
        referenceDisplayName: null,
        codexEntryKey: null,
        ...overrides,
    };
}

function reward(overrides: Partial<Reward> = {}): Reward {
    return {
        rewardKey: "Reward_Test",
        kind: "ConstructibleUnlock",
        displayText: "Unlock constructible: Chosen",
        amount: null,
        groupLabel: null,
        groupOrder: null,
        formulaText: null,
        assetKind: null,
        assetKey: null,
        assetDisplayName: null,
        referenceKind: null,
        referenceKey: null,
        referenceDisplayName: null,
        codexEntryKey: null,
        targetScopeLabel: null,
        ...overrides,
    };
}

describe("Quest Codex reference display metadata", () => {
    it("preserves requirement and reward reference metadata in display models", () => {
        expect(requirementDisplayFromRequirement(requirement({
            referenceKind: "Tech",
            referenceKey: "Technology_Cartography",
            referenceDisplayName: "Cartography",
            codexEntryKey: "Technology_Cartography",
        }))).toEqual(expect.objectContaining({
            displayText: "Build the marked district.",
            referenceKind: "Tech",
            referenceKey: "Technology_Cartography",
            referenceDisplayName: "Cartography",
            codexEntryKey: "Technology_Cartography",
        }));

        expect(rewardDisplayFromReward(reward({
            formulaText: "50 + 50 * Technology Era",
            referenceKind: "Unit",
            referenceKey: "Unit_KinOfSheredyn_Chosen",
            referenceDisplayName: "Chosen",
            assetKind: "Unit",
            assetKey: "Unit_KinOfSheredyn_Chosen",
            assetDisplayName: "Chosen",
        }))).toEqual(expect.objectContaining({
            displayText: "Unlock constructible: Chosen",
            formulaText: "50 + 50 * Technology Era",
            referenceKind: "Unit",
            referenceKey: "Unit_KinOfSheredyn_Chosen",
            assetKind: "Unit",
            assetKey: "Unit_KinOfSheredyn_Chosen",
        }));
    });

    it("prefers direct codexEntryKey over typed reference metadata", () => {
        const direct = codexEntry("equipment", "Equipment_Reward", "Reward Equipment");
        const typedReference = codexEntry("tech", "Technology_Reward", "Reward Tech");

        const resolved = resolveQuestCodexReference({
            displayText: "Gain reward",
            codexEntryKey: direct.entryKey,
            referenceKind: "Tech",
            referenceKey: typedReference.entryKey,
            referenceDisplayName: typedReference.displayName,
        }, indexes([direct, typedReference]));

        expect(resolved).toBe(direct);
    });

    it.each([
        ["Tech", "Technology_Cartography", "tech"],
        ["Technology", "Technology_ImperialCartography", "tech"],
        ["Unit", "Unit_KinOfSheredyn_Chosen", "units"],
        ["Hero", "Hero_KinOfSheredyn_Archer_0", "heroes"],
        ["Trait", "FactionTrait_KinOfSheredyn_ChosenCap_FactionQuest", "traits"],
        ["FactionTrait", "FactionTrait_Aspects_BattleAffinity", "traits"],
        ["HeroTrait", "HeroTrait_Tactician", "traits"],
        ["Equipment", "Equipment_Accessory_01_Definition", "equipment"],
        ["District", "District_Tier1_Industry", "districts"],
        ["Improvement", "DistrictImprovement_Bridge_00", "improvements"],
        ["Action", "ActionTypeBuildBridge", "actions"],
        ["ActionType", "ActionTypeBuildDam", "actions"],
        ["FactionActionType", "FactionActionTypeMukag_MonsoonFestival", "actions"],
        ["EmpireActionType", "EmpireActionTypeMukag_Light01", "actions"],
        ["DiplomaticTreaty", "Treaty_VisionExchange", "diplomatictreaties"],
        ["Treaty", "Declaration_OpenBorders", "diplomatictreaties"],
        ["Declaration", "Declaration_JustifiedWar", "diplomatictreaties"],
        ["Faction", "Faction_KinOfSheredyn", "factions"],
        ["MinorFaction", "MinorFaction_Noquensii", "minorfactions"],
        ["Population", "Population_Divine", "populations"],
    ])("resolves %s references through the mapped Codex export kind", (referenceKind, referenceKey, exportKind) => {
        const entry = codexEntry(exportKind, referenceKey, `${referenceKind} entry`);

        expect(resolveQuestCodexReference({
            displayText: `Linked ${referenceKind}`,
            codexEntryKey: null,
            referenceKind,
            referenceKey,
            referenceDisplayName: `${referenceKind} entry`,
        }, indexes([entry]))).toBe(entry);
    });

    it("falls back to typed metadata when codexEntryKey is empty", () => {
        const tech = codexEntry("tech", "Technology_Cartography", "Cartography");

        expect(resolveQuestCodexReference({
            displayText: "Research Cartography",
            codexEntryKey: " ",
            referenceKind: "Tech",
            referenceKey: tech.entryKey,
            referenceDisplayName: tech.displayName,
        }, indexes([tech]))).toBe(tech);
    });

    it("resolves typed reference metadata and reward asset fallback", () => {
        const district = codexEntry("districts", "District_Tier1_Industry", "Works");
        const unit = codexEntry("units", "Unit_KinOfSheredyn_Chosen", "Chosen");
        const codexIndexes = indexes([district, unit]);

        expect(resolveQuestCodexReference({
            displayText: "Build 1 District.",
            codexEntryKey: null,
            referenceKind: "District",
            referenceKey: district.entryKey,
            referenceDisplayName: district.displayName,
        }, codexIndexes)).toBe(district);

        expect(resolveQuestCodexReference({
            displayText: "Unlock constructible: Chosen",
            codexEntryKey: null,
            referenceKind: null,
            referenceKey: null,
            referenceDisplayName: null,
            assetKind: "Unit",
            assetKey: unit.entryKey,
            assetDisplayName: unit.displayName,
        }, codexIndexes)).toBe(unit);
    });

    it("does not invent a Codex target for formula-only or unresolved rows", () => {
        const codexIndexes = indexes([codexEntry("tech", "Technology_Cartography", "Cartography")]);
        const formulaOnlyReward = rewardDisplayFromReward(reward({
            kind: "Money",
            displayText: "Gain Dust based on technology era.",
            formulaText: "50 + 50 * Technology Era",
        }));

        expect(formulaOnlyReward).not.toBeNull();
        expect(resolveQuestCodexReference(formulaOnlyReward!, codexIndexes)).toBeUndefined();

        expect(resolveQuestCodexReference({
            displayText: "Build the missing thing.",
            codexEntryKey: null,
            referenceKind: "Tech",
            referenceKey: "Technology_Missing",
            referenceDisplayName: "Missing Tech",
        }, codexIndexes)).toBeUndefined();
    });
});
