import { codexEntityRef, entityRefId } from "@/lib/entityRef/entityRef";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    resolveCodexReference,
    resolveRelatedEntries,
} from "@/lib/codex/codexRefs";
import type { CodexEntry } from "@/types/dataTypes";

describe("resolveRelatedEntries", () => {
    it("keeps only resolved references, removes self references, and de-duplicates keys", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Ability_A", "Hero_A", "Hero_A", "Missing_Key", "Unit_A"],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Unit_A",
                displayName: "Unit A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
        });

        expect(related.map((entry) => entry.entryKey)).toEqual(["Hero_A", "Unit_A"]);
    });

    it("preserves raw reference fallback behavior when entry keys are ambiguous", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Shared_Key"],
            },
            {
                exportKind: "heroes",
                entryKey: "Shared_Key",
                displayName: "Hero Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Shared_Key",
                displayName: "Unit Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => `${entry.exportKind}:${entry.displayName}`)).toEqual([
            "units:Unit Shared",
        ]);
    });

    it("resolves typed codex ref IDs through entriesByKindKey before raw fallback", () => {
        const heroRef = codexEntityRef("heroes", "Shared_Key");
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: [entityRefId(heroRef!)],
            },
            {
                exportKind: "heroes",
                entryKey: "Shared_Key",
                displayName: "Hero Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
            {
                exportKind: "units",
                entryKey: "Shared_Key",
                displayName: "Unit Shared",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => `${entry.exportKind}:${entry.displayName}`)).toEqual([
            "heroes:Hero Shared",
        ]);
    });

    it("removes typed self references and de-duplicates references that resolve to the same entry", () => {
        const unitRef = codexEntityRef("units", "Unit_A");
        const entries: CodexEntry[] = [
            {
                exportKind: "units",
                entryKey: "Unit_A",
                displayName: "Unit A",
                descriptionLines: [],
                referenceKeys: [entityRefId(unitRef!), "Hero_A", entityRefId(codexEntityRef("heroes", "Hero_A")!)],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => entry.displayName)).toEqual(["Hero A"]);
    });

    it("de-duplicates repeated raw references after resolution", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "abilities",
                entryKey: "Ability_A",
                displayName: "Ability A",
                descriptionLines: [],
                referenceKeys: ["Hero_A", "Hero_A", "  Hero_A  "],
            },
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];

        const related = resolveRelatedEntries(entries[0], {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        });

        expect(related.map((entry) => entry.displayName)).toEqual(["Hero A"]);
    });
});

describe("resolveCodexReference", () => {
    it("resolves direct codex entity refs and encoded codex keys", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "Hero:With Spaces",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        const indexes = {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        };

        expect(resolveCodexReference(codexEntityRef("heroes", "Hero:With Spaces"), indexes)?.displayName).toBe(
            "Hero A"
        );
        expect(resolveCodexReference("heroes:Hero%3AWith%20Spaces", indexes)?.displayName).toBe("Hero A");
    });

    it("falls back to raw keys for malformed encoded reference strings", () => {
        const entries: CodexEntry[] = [
            {
                exportKind: "heroes",
                entryKey: "codex:heroes%3A%E0%A4%A",
                displayName: "Raw Fallback",
                descriptionLines: [],
                referenceKeys: [],
            },
        ];
        const indexes = {
            entriesByKey: buildEntriesByKey(entries),
            entriesByKindKey: buildEntriesByKindKey(entries),
        };

        expect(resolveCodexReference("codex:heroes%3A%E0%A4%A", indexes)?.displayName).toBe("Raw Fallback");
    });
});
