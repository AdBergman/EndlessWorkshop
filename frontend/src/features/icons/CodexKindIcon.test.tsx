import { render, screen } from "@testing-library/react";
import { CodexKindIcon } from "./CodexKindIcon";

describe("CodexKindIcon", () => {
    it("marks Codex category icons as monochrome presentation icons", () => {
        render(<CodexKindIcon kind="factions" label="Factions" className="codex-kindIcon" />);

        const icon = screen.getByRole("presentation", { hidden: true });
        expect(icon).toHaveAttribute("src", "/svg/quests/UI_QuestCategory_Faction.svg");
        expect(icon).toHaveClass("codex-kindIcon");
        expect(icon).toHaveClass("codex-kindIcon--monochrome");
    });
});
