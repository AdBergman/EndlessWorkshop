import { describe, expect, it } from "vitest";
import {
    getCodexCategoryMode,
    getCodexTopLevelVisibility,
    isDirectRoutableHiddenCodexKind,
    isVisibleTopLevelCodexKind,
    normalizeCodexKind,
    supportsFullWidthReferenceOverview,
} from "@/lib/codex/codexCategoryConfig";

describe("codexCategoryConfig", () => {
    it("normalizes kind keys before checking category behavior", () => {
        expect(normalizeCodexKind(" Abilities ")).toBe("abilities");
        expect(getCodexCategoryMode(" Abilities ")).toBe("abilityArchive");
        expect(getCodexCategoryMode(" Actions ")).toBe("actionArchive");
        expect(getCodexCategoryMode(" DiplomaticTreaties ")).toBe("diplomacyArchive");
        expect(getCodexCategoryMode(" Districts ")).toBe("districtArchive");
        expect(getCodexCategoryMode(" Equipment ")).toBe("equipmentArchive");
        expect(getCodexCategoryMode(" Heroes ")).toBe("heroArchive");
        expect(getCodexCategoryMode(" Improvements ")).toBe("improvementArchive");
        expect(getCodexCategoryMode(" Populations ")).toBe("populationArchive");
        expect(getCodexCategoryMode(" Quests ")).toBe("questArchive");
        expect(getCodexCategoryMode(" Statuses ")).toBe("statusArchive");
        expect(getCodexCategoryMode(" Tech ")).toBe("techArchive");
        expect(getCodexCategoryMode(" Units ")).toBe("unitArchive");
        expect(supportsFullWidthReferenceOverview(" Resources ")).toBe(true);
    });

    it("keeps only player-facing categories visible in top-level navigation", () => {
        expect(isVisibleTopLevelCodexKind("abilities")).toBe(true);
        expect(isVisibleTopLevelCodexKind("naturalwonders")).toBe(true);
        expect(isVisibleTopLevelCodexKind("victorypaths")).toBe(false);
        expect(isVisibleTopLevelCodexKind("victoryconditions")).toBe(false);
        expect(isVisibleTopLevelCodexKind("extractors")).toBe(false);
        expect(isVisibleTopLevelCodexKind("modifiers")).toBe(false);
        expect(isVisibleTopLevelCodexKind("bonuses")).toBe(false);
        expect(isVisibleTopLevelCodexKind("quests")).toBe(false);
    });

    it("allows local-only Codex categories into navigation only when explicitly enabled", () => {
        expect(getCodexTopLevelVisibility("victorypaths")).toBe("localOnly");
        expect(getCodexTopLevelVisibility("victoryconditions")).toBe("localOnly");
        expect(getCodexTopLevelVisibility("quests")).toBe("hidden");
        expect(getCodexTopLevelVisibility("naturalwonders")).toBe("public");

        expect(isVisibleTopLevelCodexKind("victorypaths", { includeLocalOnly: false })).toBe(false);
        expect(isVisibleTopLevelCodexKind("victoryconditions", { includeLocalOnly: false })).toBe(false);
        expect(isVisibleTopLevelCodexKind("victorypaths", { includeLocalOnly: true })).toBe(true);
        expect(isVisibleTopLevelCodexKind("victoryconditions", { includeLocalOnly: true })).toBe(true);
    });

    it("allows only approved hidden categories to remain direct-routable", () => {
        expect(isDirectRoutableHiddenCodexKind("extractors")).toBe(true);
        expect(isDirectRoutableHiddenCodexKind("quests")).toBe(true);
        expect(isDirectRoutableHiddenCodexKind("victorypaths")).toBe(true);
        expect(isDirectRoutableHiddenCodexKind("victoryconditions")).toBe(true);
        expect(isDirectRoutableHiddenCodexKind("modifiers")).toBe(false);
    });

    it("classifies only deliberate full-width reference categories as reference sheets", () => {
        expect(getCodexCategoryMode("partnereffects")).toBe("referenceSheet");
        expect(getCodexCategoryMode("counciloreffects")).toBe("referenceSheet");
        expect(getCodexCategoryMode("resources")).toBe("referenceSheet");
        expect(getCodexCategoryMode("naturalwonders")).toBe("referenceSheet");
        expect(getCodexCategoryMode("traits")).toBe("traitArchive");
    });
});
