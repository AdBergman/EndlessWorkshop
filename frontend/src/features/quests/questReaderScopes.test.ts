import { describe, expect, it } from "vitest";
import {
    claimVisibleLoreSections,
    createLoreNarrativeOwnershipTracker,
} from "@/features/quests/questReaderScopes";
import type { LoreSection } from "@/types/questTypes";

function loreSection(overrides: Partial<LoreSection>): LoreSection {
    return {
        sectionKey: "section",
        phase: "intro",
        choiceKey: null,
        stepIndex: null,
        objectiveKey: null,
        lines: [{ speakerLabel: null, role: "narrator", text: "A chronicle beat." }],
        ...overrides,
    };
}

describe("Lore narrative ownership", () => {
    it("claims stable section keys once per visible detail owner", () => {
        const tracker = createLoreNarrativeOwnershipTracker();
        const section = loreSection({ sectionKey: "Quest_A:lore:intro" });

        expect(claimVisibleLoreSections([section], "Quest_A", tracker)).toEqual([section]);
        expect(claimVisibleLoreSections([section], "Quest_A", tracker)).toEqual([]);
        expect(claimVisibleLoreSections([section], "Quest_B", tracker)).toEqual([section]);
    });

    it("falls back to body identity when a stable section key is unavailable", () => {
        const tracker = createLoreNarrativeOwnershipTracker();
        const firstBeat = loreSection({
            sectionKey: "",
            choiceKey: "Choice_A",
            stepIndex: 0,
            lines: [{ speakerLabel: "Scout", role: "character", text: "The same beat carries forward." }],
        });
        const repeatedBeat = loreSection({
            sectionKey: "",
            choiceKey: "Choice_A",
            stepIndex: 0,
            lines: [{ speakerLabel: "Scout", role: "character", text: "The same beat carries forward." }],
        });
        const distinctBeat = loreSection({
            sectionKey: "",
            choiceKey: "Choice_A",
            stepIndex: 0,
            lines: [{ speakerLabel: "Scout", role: "character", text: "A different beat remains visible." }],
        });

        expect(claimVisibleLoreSections([firstBeat], "Quest_A", tracker)).toEqual([firstBeat]);
        expect(claimVisibleLoreSections([repeatedBeat], "Quest_A", tracker)).toEqual([]);
        expect(claimVisibleLoreSections([distinctBeat], "Quest_A", tracker)).toEqual([distinctBeat]);
    });

    it("leaves raw debug detail output unfiltered when no tracker is provided", () => {
        const section = loreSection({ sectionKey: "Quest_A:lore:intro" });

        expect(claimVisibleLoreSections([section, section], "Quest_A", null)).toEqual([section, section]);
    });
});
