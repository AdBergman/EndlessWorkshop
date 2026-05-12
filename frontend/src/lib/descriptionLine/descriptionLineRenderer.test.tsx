import { render, screen } from "@testing-library/react";
import {
    extractBracketTokens,
    getDescriptionTokens,
    getTokenStyle,
    parseDescriptionLine,
    renderDescriptionLine,
    stripDescriptionAst,
    stripDescriptionTokens,
} from "./descriptionLineRenderer";

describe("descriptionLineRenderer", () => {
    it("parses plain text into a text-only AST", () => {
        expect(parseDescriptionLine("Plain description text")).toEqual({
            source: "Plain description text",
            nodes: [{ type: "text", value: "Plain description text", index: 0 }],
        });
    });

    it("parses mixed text and tokens into stable nodes", () => {
        expect(parseDescriptionLine("[DustColored] Auric Coral grants [LuxuryResource01] value")).toEqual({
            source: "[DustColored] Auric Coral grants [LuxuryResource01] value",
            nodes: [
                {
                    type: "token",
                    token: "DustColored",
                    raw: "[DustColored]",
                    index: 0,
                    style: getTokenStyle("DustColored"),
                },
                { type: "text", value: " Auric Coral grants ", index: 13 },
                {
                    type: "token",
                    token: "LuxuryResource01",
                    raw: "[LuxuryResource01]",
                    index: 33,
                    style: undefined,
                },
                { type: "text", value: " value", index: 51 },
            ],
        });
    });

    it("extracts bracket tokens from text", () => {
        expect(extractBracketTokens("[DustColored] Auric Coral grants [LuxuryResource01] value")).toEqual([
            "DustColored",
            "LuxuryResource01",
        ]);
    });

    it("renders known tokens as icons without leaking bracket text", () => {
        render(<div>{renderDescriptionLine("[DustColored] Auric Coral")}</div>);

        expect(screen.getByText("Auric Coral")).toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
        expect(screen.getByRole("img", { name: "DustColored" })).toBeInTheDocument();
    });

    it("preserves repeated known-token word coloring behavior", () => {
        render(<div>{renderDescriptionLine("[DustColored] Dust and [DustColored] income")}</div>);

        expect(screen.getByRole("img", { name: "DustColored" })).toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
        expect(screen.getByText("income")).toHaveStyle({ color: getTokenStyle("DustColored")?.wordColor });
    });

    it("strips known and unknown bracket tokens from plain previews", () => {
        expect(stripDescriptionTokens("[DustColored] Auric Coral [LuxuryResource01]")).toBe("Auric Coral");
    });

    it("strips a parsed AST with the same whitespace normalization as the legacy helper", () => {
        const ast = parseDescriptionLine("Gain [DustColored] Dust [LuxuryResource01].");

        expect(stripDescriptionAst(ast)).toBe("Gain Dust .");
        expect(stripDescriptionAst(ast)).toBe(stripDescriptionTokens(ast.source));
    });

    it("extracts token matches from a parsed AST", () => {
        expect(getDescriptionTokens(parseDescriptionLine("A [DustColored] B [LuxuryResource01]"))).toEqual([
            { token: "DustColored", raw: "[DustColored]", index: 2 },
            { token: "LuxuryResource01", raw: "[LuxuryResource01]", index: 18 },
        ]);
    });

    it("keeps malformed brackets as text", () => {
        const line = "Gain [DustColored value";

        expect(parseDescriptionLine(line)).toEqual({
            source: line,
            nodes: [{ type: "text", value: line, index: 0 }],
        });
        expect(extractBracketTokens(line)).toEqual([]);
        expect(stripDescriptionTokens(line)).toBe(line);
    });

    it("drops empty bracket tokens from extraction while preserving strip behavior", () => {
        const ast = parseDescriptionLine("A [   ] B [DustColored]");

        expect(getDescriptionTokens(ast)).toEqual([{ token: "DustColored", raw: "[DustColored]", index: 10 }]);
        expect(stripDescriptionAst(ast)).toBe("A B");
    });
});
