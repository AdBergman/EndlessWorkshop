import { describe, expect, it } from "vitest";
import {
    buildAbilityInlineLinkCandidates,
    findAbilityInlineLinkMatch,
} from "./codexAbilityInlineLinks";
import type { CodexEntry } from "@/types/dataTypes";

function codexEntry(overrides: Partial<CodexEntry>): CodexEntry {
    return {
        exportKind: "abilities",
        entryKey: "Ability_Test",
        displayName: "Test Ability",
        descriptionLines: [],
        referenceKeys: [],
        ...overrides,
    };
}

describe("codexAbilityInlineLinks", () => {
    it("only builds candidates for related statuses on ability entries", () => {
        const ability = codexEntry({ exportKind: "abilities" });
        const candidates = buildAbilityInlineLinkCandidates(ability, [
            codexEntry({
                exportKind: "statuses",
                entryKey: "Status_Jinxed_2",
                displayName: "Jinxed II",
            }),
            codexEntry({
                exportKind: "abilities",
                entryKey: "Ability_Other",
                displayName: "Other Ability",
            }),
        ]);

        expect(candidates).toHaveLength(1);
        expect(candidates[0].entry.entryKey).toBe("Status_Jinxed_2");
        expect(
            buildAbilityInlineLinkCandidates(
                codexEntry({ exportKind: "units" }),
                candidates.map((candidate) => candidate.entry)
            )
        ).toEqual([]);
    });

    it("prefers the longest exact status label when labels share the same start", () => {
        const ability = codexEntry({ exportKind: "abilities" });
        const candidates = buildAbilityInlineLinkCandidates(ability, [
            codexEntry({
                exportKind: "statuses",
                entryKey: "Status_Jinxed",
                displayName: "Jinxed",
            }),
            codexEntry({
                exportKind: "statuses",
                entryKey: "Status_Jinxed_2",
                displayName: "Jinxed II",
            }),
        ]);

        const match = findAbilityInlineLinkMatch("Applies Jinxed II Status to the attacked Units", candidates);

        expect(match?.candidate.entry.entryKey).toBe("Status_Jinxed_2");
        expect(match?.label).toBe("Jinxed II");
    });

    it("does not match status labels inside larger words", () => {
        const ability = codexEntry({ exportKind: "abilities" });
        const candidates = buildAbilityInlineLinkCandidates(ability, [
            codexEntry({
                exportKind: "statuses",
                entryKey: "Status_Jinxed_2",
                displayName: "Jinxed II",
            }),
        ]);

        expect(findAbilityInlineLinkMatch("Applies UnJinxed II Status to the attacker", candidates)).toBeNull();
        expect(findAbilityInlineLinkMatch("Applies Jinxed IIBonus to the attacker", candidates)).toBeNull();
    });
});
