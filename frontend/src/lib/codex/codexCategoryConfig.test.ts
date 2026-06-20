import { describe, expect, it } from "vitest";
import {
    getCodexCategoryMode,
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
        expect(getCodexCategoryMode(" Equipment ")).toBe("equipmentArchive");
        expect(getCodexCategoryMode(" Statuses ")).toBe("statusArchive");
        expect(supportsFullWidthReferenceOverview(" Resources ")).toBe(true);
    });

    it("keeps only player-facing categories visible in top-level navigation", () => {
        expect(isVisibleTopLevelCodexKind("abilities")).toBe(true);
        expect(isVisibleTopLevelCodexKind("extractors")).toBe(false);
        expect(isVisibleTopLevelCodexKind("modifiers")).toBe(false);
        expect(isVisibleTopLevelCodexKind("bonuses")).toBe(false);
    });

    it("allows only approved hidden categories to remain direct-routable", () => {
        expect(isDirectRoutableHiddenCodexKind("extractors")).toBe(true);
        expect(isDirectRoutableHiddenCodexKind("modifiers")).toBe(false);
    });

    it("classifies only deliberate full-width reference categories as reference sheets", () => {
        expect(getCodexCategoryMode("partnereffects")).toBe("referenceSheet");
        expect(getCodexCategoryMode("counciloreffects")).toBe("referenceSheet");
        expect(getCodexCategoryMode("resources")).toBe("referenceSheet");
        expect(getCodexCategoryMode("traits")).toBe("traitArchive");
        expect(getCodexCategoryMode("tech")).toBe("generic");
    });
});
