import { getTokenStyle, parseDescriptionLine } from "./descriptionLineRenderer";
import { diagnoseDescriptionLine, getDescriptionDiagnostics } from "./descriptionDiagnostics";

describe("descriptionDiagnostics", () => {
    it("classifies known styled tokens", () => {
        expect(diagnoseDescriptionLine("Gain [DustColored] per turn.")).toEqual([
            {
                kind: "known-style-token",
                token: "DustColored",
                raw: "[DustColored]",
                index: 5,
                style: getTokenStyle("DustColored"),
            },
        ]);
    });

    it("classifies unknown bracket tokens", () => {
        expect(diagnoseDescriptionLine("[TBD] Internal note")).toEqual([
            {
                kind: "unknown-token",
                token: "TBD",
                raw: "[TBD]",
                index: 0,
            },
        ]);
    });

    it("classifies entity-like bracket tokens without resolving them", () => {
        expect(
            diagnoseDescriptionLine("Unlock [Unit_Necro_Larva], [LuxuryResource01], and [PopulationCategory_03].")
        ).toEqual([
            {
                kind: "entity-like-token",
                token: "Unit_Necro_Larva",
                raw: "[Unit_Necro_Larva]",
                index: 7,
                entityKindHint: "unit",
            },
            {
                kind: "entity-like-token",
                token: "LuxuryResource01",
                raw: "[LuxuryResource01]",
                index: 27,
                entityKindHint: "codex",
            },
            {
                kind: "entity-like-token",
                token: "PopulationCategory_03",
                raw: "[PopulationCategory_03]",
                index: 51,
                entityKindHint: "population",
            },
        ]);
    });

    it("classifies empty bracket tokens as malformed", () => {
        expect(diagnoseDescriptionLine("A [   ] B")).toEqual([
            {
                kind: "malformed-token",
                token: "",
                raw: "[   ]",
                index: 2,
                reason: "empty-token",
            },
        ]);
    });

    it("classifies unclosed bracket fragments as malformed text diagnostics", () => {
        expect(diagnoseDescriptionLine("Gain [DustColored value")).toEqual([
            {
                kind: "malformed-token",
                token: "DustColored value",
                raw: "[DustColored value",
                index: 5,
                reason: "unclosed-token",
            },
        ]);
    });

    it("classifies unexpected closing brackets in plain text", () => {
        expect(diagnoseDescriptionLine("Gain Dust] value")).toEqual([
            {
                kind: "malformed-token",
                token: "",
                raw: "]",
                index: 9,
                reason: "unexpected-closing-bracket",
            },
        ]);
    });

    it("diagnoses an existing AST without reparsing", () => {
        const ast = parseDescriptionLine("[ScienceColored] with [Unknown]");

        expect(getDescriptionDiagnostics(ast).map((diagnostic) => diagnostic.kind)).toEqual([
            "known-style-token",
            "unknown-token",
        ]);
    });
});
