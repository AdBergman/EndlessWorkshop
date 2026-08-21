import { describe, expect, it } from "vitest";

import {
    codexEntryHref,
    codexIdentityHref,
    getCanonicalCodexIdentityRoute,
} from "@/lib/codex/codexRoute";

describe("Codex canonical identity routing", () => {
    it("uses category plus the stable key for visible public entries", () => {
        expect(codexIdentityHref({
            entryKey: "Population_Minor_Ametrine",
            routeKind: " populations ",
        })).toBe("/codex?category=populations&entry=Population_Minor_Ametrine");
    });

    it("uses the same canonical route for hidden public entries", () => {
        expect(codexIdentityHref({
            entryKey: "ActionCostModifier_RaiseRuin_Decrease_00",
            routeKind: "Modifiers",
        })).toBe(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00"
        );
        expect(codexIdentityHref({
            entryKey: "FactionQuest_LastLord_Chapter01_Step01",
            routeKind: "quests",
        })).toBe(
            "/codex?category=quests&entry=FactionQuest_LastLord_Chapter01_Step01"
        );
        expect(codexEntryHref({
            entryKey: "Extractor_Luxury01_Tier2",
            exportKind: "extractors",
        })).toBe(
            "/codex?category=extractors&entry=Extractor_Luxury01_Tier2"
        );
    });

    it("rejects incomplete route identities instead of inventing a route", () => {
        expect(getCanonicalCodexIdentityRoute({ entryKey: "Modifier_A", routeKind: " " }))
            .toBeNull();
        expect(codexIdentityHref({ entryKey: "", routeKind: "modifiers" })).toBe("/codex");
    });
});
