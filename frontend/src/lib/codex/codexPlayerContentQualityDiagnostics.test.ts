import type { CodexEntry } from "@/types/dataTypes";
import {
    createCodexPlayerContentQualityReport,
    formatCodexPlayerContentQualityReport,
    type CodexPlayerContentRichSource,
} from "./codexPlayerContentQualityDiagnostics";

function entry(overrides: Partial<CodexEntry> = {}): CodexEntry {
    return {
        exportKind: "traits",
        entryKey: "FactionTrait_Test",
        displayName: "Test Trait",
        descriptionLines: [],
        referenceKeys: [],
        ...overrides,
    };
}

function richSource(record: Record<string, unknown>, kind = "traits"): CodexPlayerContentRichSource {
    return { kind, record };
}

describe("codexPlayerContentQualityDiagnostics", () => {
    it("flags Feeding Frenzy-style public records whose quest context does not explain the trait effect", () => {
        const report = createCodexPlayerContentQualityReport([
            entry({
                entryKey: "FactionTrait_LastLord_Chapter06AChoice01_FactionQuest",
                displayName: "Feeding Frenzy",
                descriptionLines: [
                    "Cost: 1",
                    "Quest reward: A Mortal Life?",
                    "A cure for the Lords' curse has been found, but the price is high.",
                    "Reward objective: Defeat Galardi's rebels who oppose the Lords' transformation.",
                ],
                facts: [
                    { label: "Kind", value: "Trait" },
                    { label: "Trait type", value: "Faction" },
                    { label: "Cost", value: "1" },
                ],
                publicContextKeys: ["FactionTrait_LastLord_Chapter06AChoice01_FactionQuest"],
            }),
        ]);

        expect(report.findings).toEqual([
            expect.objectContaining({
                exportKind: "traits",
                entryKey: "FactionTrait_LastLord_Chapter06AChoice01_FactionQuest",
                displayName: "Feeding Frenzy",
                candidateKind: "missing-category-gameplay-content",
                expectedContent: "trait effect, granted ability, unlock, requirement, or mechanical description",
                classification: "unresolved-manual-evidence-required",
                owner: "Both",
            }),
        ]);
    });

    it("does not flag public records with category-relevant gameplay content", () => {
        const report = createCodexPlayerContentQualityReport([
            entry({
                displayName: "Feeding Frenzy",
                descriptionLines: [
                    "Cost: 1",
                ],
                facts: [
                    { label: "Kind", value: "Trait" },
                    { label: "Trait type", value: "Faction" },
                    { label: "Cost", value: "1" },
                ],
                sections: [{
                    title: "Effects",
                    items: [{
                        label: "Fleet Hunger",
                        lines: ["Units gain +10% Damage while attacking wounded armies."],
                    }],
                }],
            }),
            entry({
                entryKey: "Equipment_Accessory_Test",
                exportKind: "equipment",
                displayName: "Test Accessory",
                sections: [{
                    title: "Granted Abilities",
                    items: [{ label: "Battleborn", referenceKey: "UnitAbility_Battleborn" }],
                }],
            }),
            entry({
                entryKey: "FactionTrait_Past_Tense_Effect",
                displayName: "Past Tense Effect",
                descriptionLines: [
                    "Decreased Unit cost.",
                    "Quest reward: A Mortal Life?",
                ],
            }),
            entry({
                entryKey: "FactionTrait_Disables_Effect",
                displayName: "Disables Effect",
                descriptionLines: [
                    "Disables Increased odds of Rebellion when doing a Round Up on City",
                    "Quest reward: A Mortal Life?",
                ],
            }),
        ]);

        expect(report.findings).toHaveLength(0);
    });

    it("separates rich-domain join gaps, dropped source fields, and support/publication issues", () => {
        const richRecordsByKindKey = {
            equipment: {
                Equipment_Test: richSource({
                    entryKey: "Equipment_Test",
                    effectLines: ["Grants +20% Damage to infantry units."],
                }, "equipment"),
            },
        };
        const report = createCodexPlayerContentQualityReport([
            entry({
                exportKind: "equipment",
                entryKey: "Equipment_Test",
                displayName: "Test Equipment",
                facts: [
                    { label: "Kind", value: "Equipment" },
                    { label: "Slot", value: "Accessory" },
                ],
            }),
            Object.assign(
                entry({
                    exportKind: "actions",
                    entryKey: "Action_With_Dropped_Field",
                    displayName: "Dropped Field Action",
                    facts: [
                        { label: "Kind", value: "Action" },
                        { label: "Type", value: "Empire" },
                    ],
                }),
                { effects: ["Gain Dust from explored ruins."] }
            ),
            entry({
                exportKind: "actions",
                entryKey: "Action_Deprecated_Test",
                displayName: "[DEPRECATED] Test Action",
                facts: [{ label: "Kind", value: "Action" }],
            }),
        ], { richRecordsByKindKey });

        expect(report.findings).toEqual(expect.arrayContaining([
            expect.objectContaining({
                exportKind: "equipment",
                classification: "ewshop-rich-import-render-gap",
                owner: "EWShop",
                evidence: expect.arrayContaining(["rich source equipment effectLines[0]: Grants +20% Damage to infantry units."]),
            }),
            expect.objectContaining({
                exportKind: "actions",
                entryKey: "Action_With_Dropped_Field",
                classification: "ewshop-rich-import-render-gap",
                owner: "EWShop",
            }),
            expect.objectContaining({
                exportKind: "actions",
                classification: "likely-internal-support-record",
                owner: "Both",
            }),
        ]));
    });

    it("treats currently joined rich-domain enrichment as player-useful context", () => {
        const report = createCodexPlayerContentQualityReport([
            entry({
                exportKind: "districts",
                entryKey: "District_Test",
                displayName: "Test District",
                facts: [
                    { label: "Kind", value: "District" },
                    { label: "Type", value: "City" },
                ],
            }),
        ], {
            richRecordsByKindKey: {
                districts: {
                    District_Test: richSource({
                        entryKey: "District_Test",
                        unlockTechnologyKeys: ["Technology_A"],
                        placementPrerequisites: { river: { constraint: "AnyRiver" } },
                    }, "districts"),
                },
            },
        });

        expect(report.findings).toHaveLength(0);
    });

    it("does not treat zero-valued rich modifiers as proven player-useful source data", () => {
        const report = createCodexPlayerContentQualityReport([
            entry({
                exportKind: "abilities",
                entryKey: "UnitAbility_Zero",
                displayName: "Zero Ability",
                facts: [
                    { label: "Kind", value: "Ability" },
                    { label: "Category", value: "Passive" },
                ],
            }),
        ], {
            richRecordsByKindKey: {
                abilities: {
                    UnitAbility_Zero: richSource({
                        entryKey: "UnitAbility_Zero",
                        descriptionLines: ["+0 [Damage] Damage"],
                    }, "abilities"),
                },
            },
        });

        expect(report.findings).toEqual([
            expect.objectContaining({
                classification: "no-richer-source-found",
                owner: "Exporter",
            }),
        ]);
    });

    it("normalizes status-like bonus exports before applying status usefulness expectations", () => {
        const report = createCodexPlayerContentQualityReport([
            entry({
                exportKind: "bonuses",
                entryKey: "Status_City_Test",
                displayName: "Test City Status",
                kind: "Status",
                category: "Status",
                facts: [
                    { label: "Kind", value: "Status" },
                    { label: "Status type", value: "City" },
                ],
            }),
        ], {
            richRecordsByKindKey: {
                statuses: {},
            },
        });

        expect(report.findings).toEqual([
            expect.objectContaining({
                exportKind: "statuses",
                expectedContent: "status effect/mechanical description or interactions",
                classification: "no-richer-source-found",
            }),
        ]);
    });

    it("formats a deterministic report that names the player-content boundary", () => {
        const report = createCodexPlayerContentQualityReport([
            entry({
                exportKind: "actions",
                entryKey: "Action_Test",
                displayName: "Test Action",
                facts: [{ label: "Kind", value: "Action" }],
            }),
        ]);
        const text = formatCodexPlayerContentQualityReport(report, { detailLimit: 5 });

        expect(text).toContain("CODEX PLAYER CONTENT QUALITY DIAGNOSTIC");
        expect(text).toContain("separate from reference integrity and strict-thin structural checks");
        expect(text).toContain("unresolved-manual-evidence-required: 1");
        expect(text).toContain("actions:Action_Test");
    });
});
