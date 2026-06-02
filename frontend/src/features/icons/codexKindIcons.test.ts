import { getCodexKindIconPath, getConfiguredCodexKindIconPaths } from "./codexKindIcons";

describe("codexKindIcons", () => {
    it("resolves common Codex kind icons from the raw manifest through typed keys", () => {
        expect(getCodexKindIconPath("abilities")).toBe("/svg/common/UI_Common_HeroSkills.svg");
        expect(getCodexKindIconPath("councilors")).toBe("/svg/common/UI_Common_Council.svg");
        expect(getCodexKindIconPath("factions")).toBe("/svg/quests/UI_QuestCategory_Faction.svg");
        expect(getCodexKindIconPath("units")).toBe("/svg/common/UI_Common_Unit.svg");
        expect(getCodexKindIconPath("tech")).toBe("/svg/common/UI_Common_Technology.svg");
        expect(getCodexKindIconPath("quests")).toBe("/svg/quests/UI_Header_QuestPicto.svg");
    });

    it("normalizes singular aliases and returns null for unknown kinds", () => {
        expect(getCodexKindIconPath("Technology")).toBe("/svg/common/UI_Common_Technology.svg");
        expect(getCodexKindIconPath("unit")).toBe("/svg/common/UI_Common_Unit.svg");
        expect(getCodexKindIconPath("unknown")).toBeNull();
    });

    it("exposes configured paths for diagnostics without duplicate aliases", () => {
        const paths = getConfiguredCodexKindIconPaths();

        expect(paths).toContain("/svg/common/UI_Common_Unit.svg");
        expect(paths).toContain("/svg/common/UI_Common_Technology.svg");
        expect(new Set(paths).size).toBe(paths.length);
    });
});
