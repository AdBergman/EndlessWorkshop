import {
    buildCodexTechRichEnrichment,
    hasCodexTechRichEnrichment,
} from "@/lib/codex/codexTechRichEnrichment";
import type { CodexEntry, Tech } from "@/types/dataTypes";

const codexTech = (entryKey: string, displayName: string): CodexEntry => ({
    exportKind: "tech",
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
});

const codexEntry = (entryKey: string, displayName: string, exportKind = "improvements"): CodexEntry => ({
    exportKind,
    entryKey,
    displayName,
    descriptionLines: [],
    referenceKeys: [],
});

const richTech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Current",
    name: "Current Tech",
    era: 1,
    type: "Discovery",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

describe("codexTechRichEnrichment", () => {
    it("resolves prerequisite and exclusive prerequisite links from exact public Codex Tech entries", () => {
        const current = codexTech("Tech_Current", "Current Tech");
        const prerequisite = codexTech("Tech_Prereq", "Prerequisite Tech");
        const exclusivePrerequisite = codexTech("Tech_Exclusive", "Exclusive Tech");

        const enrichment = buildCodexTechRichEnrichment(
            current,
            {
                Tech_Current: richTech({
                    technologyPrerequisiteTechKeys: ["Tech_Prereq"],
                    exclusiveTechnologyPrerequisiteTechKeys: ["Tech_Exclusive"],
                }),
            },
            [current, prerequisite, exclusivePrerequisite]
        );

        expect(enrichment.prerequisites.map((link) => link.label)).toEqual(["Prerequisite Tech"]);
        expect(enrichment.exclusivePrerequisites.map((link) => link.label)).toEqual(["Exclusive Tech"]);
        expect(hasCodexTechRichEnrichment(enrichment)).toBe(true);
    });

    it("falls back to current Tech DTO prereq/excludes fields without parsing names or prose", () => {
        const current = codexTech("Tech_Current", "Current Tech");
        const prerequisite = codexTech("Tech_Prereq", "Prerequisite Tech");
        const exclusivePrerequisite = codexTech("Tech_Exclusive", "Exclusive Tech");

        const enrichment = buildCodexTechRichEnrichment(
            current,
            {
                Tech_Current: richTech({
                    prereq: "Tech_Prereq",
                    excludes: "Tech_Exclusive",
                    descriptionLines: ["Mentions Unrelated Tech in prose."],
                }),
            },
            [current, prerequisite, exclusivePrerequisite, codexTech("Tech_Unrelated", "Unrelated Tech")]
        );

        expect(enrichment.prerequisites.map((link) => link.entry.entryKey)).toEqual(["Tech_Prereq"]);
        expect(enrichment.exclusivePrerequisites.map((link) => link.entry.entryKey)).toEqual(["Tech_Exclusive"]);
    });

    it("fails closed when rich data is missing or target keys do not resolve to public Codex Tech entries", () => {
        const current = codexTech("Tech_Current", "Current Tech");

        expect(
            hasCodexTechRichEnrichment(buildCodexTechRichEnrichment(current, {}, [current]))
        ).toBe(false);

        const unresolved = buildCodexTechRichEnrichment(
            current,
            {
                Tech_Current: richTech({
                    technologyPrerequisiteTechKeys: ["Tech_Missing", "Improvement_SameKey"],
                    exclusiveTechnologyPrerequisiteTechKeys: ["Tech_Exclusive_Missing"],
                }),
            },
            [current, codexEntry("Improvement_SameKey", "Same Key Improvement")]
        );

        expect(unresolved.prerequisites).toEqual([]);
        expect(unresolved.exclusivePrerequisites).toEqual([]);
        expect(hasCodexTechRichEnrichment(unresolved)).toBe(false);
    });
});
