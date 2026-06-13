import type { CodexEntry } from "@/types/dataTypes";
import {
    createCodexContentQualityReport,
    formatCodexContentQualityReport,
} from "./codexContentQualityDiagnostics";

function entry(overrides: Partial<CodexEntry> = {}): CodexEntry {
    return {
        exportKind: "abilities",
        entryKey: "Ability_Test",
        displayName: "Test Ability",
        descriptionLines: [],
        referenceKeys: [],
        ...overrides,
    };
}

describe("codexContentQualityDiagnostics", () => {
    it("separates placeholder text, raw labels, metadata gaps, and sparse entries", () => {
        const report = createCodexContentQualityReport([
            entry({
                exportKind: "councilors",
                entryKey: "Councilor_TBD",
                displayName: "Notable_CollectibleEvent_015_TBD",
                descriptionLines: [],
                facts: [
                    { label: "Reference key", value: "Notable_CollectibleEvent_015_TBD" },
                ],
            }),
            entry({
                exportKind: "equipment",
                entryKey: "Equipment_A",
                displayName: "Scout Ring",
                descriptionLines: ["Type: Accessory", "Forged for scouting."],
                facts: [{ label: "Type", value: "Accessory" }],
            }),
            entry({
                exportKind: "tech",
                entryKey: "Technology_A",
                displayName: "Bridgeworks",
                descriptionLines: ["Tier: 1", "Era: 2", "Quadrant: Empire"],
            }),
            entry({
                exportKind: "actions",
                entryKey: "Action_A",
                displayName: "Absorb City",
                descriptionLines: [],
                facts: [
                    { label: "Category", value: "Action" },
                    { label: "Kind", value: "Action" },
                ],
            }),
        ]);

        expect(report.countsByKind).toEqual(expect.objectContaining({
            "metadata-gap": 1,
            "missing-player-context": 1,
            "placeholder-text": 2,
            "raw-internal-label": 1,
            "raw-internal-text": 2,
        }));

        expect(report.findings).toEqual(expect.arrayContaining([
            expect.objectContaining({
                exportKind: "tech",
                entryKey: "Technology_A",
                kind: "metadata-gap",
                owner: "Exporter",
            }),
            expect.objectContaining({
                exportKind: "actions",
                entryKey: "Action_A",
                kind: "missing-player-context",
                owner: "Exporter",
            }),
        ]));
        expect(report.findings).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                exportKind: "equipment",
                entryKey: "Equipment_A",
            }),
        ]));
    });

    it("flags no-op and formula-looking content while preserving deterministic text output", () => {
        const report = createCodexContentQualityReport([
            entry({
                exportKind: "factions",
                entryKey: "Faction_A",
                displayName: "Faction A",
                descriptionLines: [
                    "+0 [DustColored] Dust on City",
                    "*2 Food if adjacent to Foundation on Bridge",
                ],
            }),
        ]);
        const text = formatCodexContentQualityReport(report, { detailLimit: 5 });

        expect(report.countsByKind).toEqual(expect.objectContaining({
            "formula-like-text": 1,
            "no-op-effect": 1,
        }));
        expect(text).toContain("CODEX CONTENT QUALITY DIAGNOSTIC");
        expect(text).toContain("SUMMARY BY OWNER");
        expect(text).toContain("TOP EWSHOP CANDIDATES");
        expect(text).toContain("TOP EXPORTER / EDITORIAL CANDIDATES");
        expect(text).toContain("factions:Faction_A");
    });
});
