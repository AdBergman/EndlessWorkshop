import { render, screen } from "@testing-library/react";
import { CodexEntryIcon } from "./CodexEntryIcon";

describe("CodexEntryIcon", () => {
    it("renders major faction entry icons as monochrome", () => {
        render(
            <CodexEntryIcon
                entry={{
                    exportKind: "factions",
                    entryKey: "Faction_Mukag",
                    displayName: "Tahuk",
                }}
                label="Factions"
                className="codex-kindIcon"
            />
        );

        const icon = screen.getByRole("presentation", { hidden: true });
        expect(icon).toHaveAttribute("src", "/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg");
        expect(icon).toHaveClass("codex-kindIcon");
        expect(icon).toHaveClass("codex-kindIcon--monochrome");
    });

    it("does not force resource-like entry icons to monochrome", () => {
        render(
            <CodexEntryIcon
                entry={{
                    exportKind: "improvements",
                    entryKey: "Improvement_AuricCoral",
                    displayName: "[LuxuryResource01] Auric Coral",
                }}
                label="Improvements"
                className="codex-kindIcon"
            />
        );

        const icon = screen.getByRole("presentation", { hidden: true });
        expect(icon).toHaveAttribute("src", "/svg/constructibles/UI_Resource_Luxury_Klak.svg");
        expect(icon).toHaveClass("codex-kindIcon");
        expect(icon).not.toHaveClass("codex-kindIcon--monochrome");
    });
});
