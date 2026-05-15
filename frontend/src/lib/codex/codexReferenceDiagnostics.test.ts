import { codexEntityRef, entityRefId } from "@/lib/entityRef/entityRef";
import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    type CodexReferenceIndexes,
} from "./codexRefs";
import {
    diagnoseCodexReference,
    diagnoseCodexRelatedReferences,
} from "./codexReferenceDiagnostics";
import type { CodexEntry } from "@/types/dataTypes";

function makeIndexes(entries: CodexEntry[]): CodexReferenceIndexes {
    return {
        entriesByKey: buildEntriesByKey(entries),
        entriesByKindKey: buildEntriesByKindKey(entries),
    };
}

describe("codexReferenceDiagnostics", () => {
    it("classifies resolved typed codex refs", () => {
        const indexes = makeIndexes([
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        expect(diagnoseCodexReference(entityRefId(codexEntityRef("heroes", "Hero_A")!), indexes)).toMatchObject({
            kind: "resolved-typed-ref",
            raw: "codex:heroes%3AHero_A",
            identity: { exportKind: "heroes", entryKey: "Hero_A" },
            resolvedEntry: { displayName: "Hero A" },
        });
    });

    it("classifies ambiguous duplicate raw keys as raw fallback refs", () => {
        const indexes = makeIndexes([
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
        ]);

        expect(diagnoseCodexReference("Shared_Key", indexes)).toMatchObject({
            kind: "raw-fallback-ref",
            raw: "Shared_Key",
            resolvedEntry: { displayName: "Unit Shared" },
            usedRawFallback: true,
            isAmbiguousRawKey: true,
            rawMatchedKinds: ["heroes", "units"],
        });
    });

    it("classifies missing imported-domain refs without trying to resolve exporter gaps", () => {
        const indexes = makeIndexes([]);

        expect(diagnoseCodexReference("Unit_MissingImportedUnit", indexes)).toEqual({
            kind: "unresolved-imported-domain-ref",
            raw: "Unit_MissingImportedUnit",
            importedKindHint: "unit",
        });

        expect(diagnoseCodexReference({ kind: "unit", key: "Unit_MissingImportedUnit" }, indexes)).toEqual({
            kind: "unresolved-imported-domain-ref",
            raw: "unit:Unit_MissingImportedUnit",
            importedKindHint: "unit",
        });

        expect(diagnoseCodexReference("FactionQuest_Missing", indexes)).toMatchObject({
            kind: "unresolved-imported-domain-ref",
            raw: "FactionQuest_Missing",
            importedKindHint: "quest",
        });
        expect(diagnoseCodexReference("Trait_Missing", indexes)).toMatchObject({
            importedKindHint: "trait",
        });
        expect(diagnoseCodexReference("MinorFaction_Missing", indexes)).toMatchObject({
            importedKindHint: "minorFaction",
        });
        expect(diagnoseCodexReference("Faction_Missing", indexes)).toMatchObject({
            importedKindHint: "faction",
        });
    });

    it("classifies unresolved codex refs separately from imported-domain gaps", () => {
        const indexes = makeIndexes([]);

        expect(diagnoseCodexReference(entityRefId(codexEntityRef("heroes", "Missing_Hero")!), indexes)).toMatchObject({
            kind: "unresolved-ref",
            raw: "codex:heroes%3AMissing_Hero",
            identity: { exportKind: "heroes", entryKey: "Missing_Hero" },
        });

        expect(diagnoseCodexReference("Missing_Key", indexes)).toEqual({
            kind: "unresolved-ref",
            raw: "Missing_Key",
            identity: undefined,
        });
    });

    it("classifies malformed refs while noting raw fallback when present", () => {
        const indexes = makeIndexes([
            {
                exportKind: "heroes",
                entryKey: "codex:heroes%3A%E0%A4%A",
                displayName: "Raw Malformed Fallback",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);

        expect(diagnoseCodexReference("codex:heroes%3A%E0%A4%A", indexes)).toMatchObject({
            kind: "malformed-ref",
            raw: "codex:heroes%3A%E0%A4%A",
            reason: "malformed-entity-ref-id",
            usedRawFallback: true,
            resolvedEntry: { displayName: "Raw Malformed Fallback" },
        });
    });

    it("classifies empty and invalid-shaped refs as malformed", () => {
        const indexes = makeIndexes([]);

        expect(diagnoseCodexReference("   ", indexes)).toEqual({
            kind: "malformed-ref",
            raw: "",
            reason: "empty-reference",
        });
        expect(diagnoseCodexReference({ kind: "codex" }, indexes)).toEqual({
            kind: "malformed-ref",
            raw: "codex:undefined",
            reason: "malformed-codex-ref",
        });
        expect(diagnoseCodexReference(42, indexes)).toEqual({
            kind: "malformed-ref",
            raw: "",
            reason: "invalid-reference-shape",
        });
    });

    it("marks duplicate related refs after resolution", () => {
        const indexes = makeIndexes([
            {
                exportKind: "heroes",
                entryKey: "Hero_A",
                displayName: "Hero A",
                descriptionLines: [],
                referenceKeys: [],
            },
        ]);
        const diagnostics = diagnoseCodexRelatedReferences(
            {
                referenceKeys: ["Hero_A", entityRefId(codexEntityRef("heroes", "Hero_A")!), "Missing_Key"],
            },
            indexes
        );

        expect(diagnostics.map((diagnostic) => diagnostic.kind)).toEqual([
            "raw-fallback-ref",
            "resolved-typed-ref",
            "unresolved-ref",
        ]);
        expect(diagnostics[1]).toMatchObject({
            isDuplicate: true,
            duplicateOfIndex: 0,
        });
    });
});
