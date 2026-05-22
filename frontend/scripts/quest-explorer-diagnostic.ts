import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createQuestExplorerFrontendDiagnostic } from "@/features/quests/questExplorerDiagnostic";
import { normalizeQuestExplorer } from "@/stores/questStore";
import type { QuestExplorerResponse } from "@/types/questTypes";

const sourceFiles = [
    "src/pages/QuestExplorerPage.tsx",
    "src/features/quests/questRail.ts",
];

const samplePayload: QuestExplorerResponse = {
    gameVersion: "0.80",
    exporterVersion: "frontend-diagnostic",
    exportedAtUtc: "deterministic",
    exportKind: "quest_explorer",
    schemaVersion: "quest_explorer.v3",
    entries: [
        {
            entryKey: "Quest_Shared",
            title: "Shared Chronicle",
            summaryLines: ["The same chronicle page carries both steps."],
            questType: "Faction Quest",
            isMandatory: true,
            isKeyNarrativeBeat: false,
            aliases: ["Quest_Shared_Alias_Step02"],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "Line_Shared",
                questLineName: "Shared Line",
                chapter: 4,
                chapterLabel: "Chapter 4",
                step: 1,
                stepLabel: "Step 1",
                sequenceIndex: 0,
                chapterOrder: 4,
                stepOrder: 1,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                isBranchStart: null,
                isBranchEnd: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
                failureEntryKeys: [],
                convergesIntoEntryKeys: [],
            },
            loreView: { sections: [] },
            strategyView: { objectives: [] },
            branches: [],
            quality: null,
        },
        {
            entryKey: "Quest_Branch",
            title: "Branch Choice",
            summaryLines: [],
            questType: "Faction Quest",
            isMandatory: false,
            isKeyNarrativeBeat: false,
            aliases: [],
            navigation: {
                factionKey: "Faction_Kin",
                factionName: "Kin",
                questLineKey: "Line_Shared",
                questLineName: "Shared Line",
                chapter: 4,
                chapterLabel: "Chapter 4",
                step: 2,
                stepLabel: "Step 2",
                sequenceIndex: 1,
                chapterOrder: 4,
                stepOrder: 2,
                branchGroupKey: "Quest_Shared",
                branchLabel: "Shared fork",
                branchOrder: 1,
                isBranchStart: null,
                isBranchEnd: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
                failureEntryKeys: [],
                convergesIntoEntryKeys: [],
            },
            loreView: { sections: [] },
            strategyView: { objectives: [] },
            branches: [],
            quality: null,
        },
        {
            entryKey: "Quest_Minor",
            title: "Minor Envoy",
            summaryLines: [],
            questType: "Minor Faction Quest",
            isMandatory: false,
            isKeyNarrativeBeat: false,
            aliases: [],
            navigation: {
                factionKey: "MinorFaction_Ametrine",
                factionName: "Ametrine",
                questLineKey: "MinorFaction_SpecificQuest_Ametrine",
                questLineName: "Ametrine",
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 2,
                chapterOrder: null,
                stepOrder: null,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                isBranchStart: null,
                isBranchEnd: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
                failureEntryKeys: [],
                convergesIntoEntryKeys: [],
            },
            loreView: { sections: [] },
            strategyView: { objectives: [] },
            branches: [],
            quality: null,
        },
        {
            entryKey: "Quest_World",
            title: "World Signal",
            summaryLines: [],
            questType: "Curiosity",
            isMandatory: false,
            isKeyNarrativeBeat: false,
            aliases: [],
            navigation: {
                factionKey: null,
                factionName: null,
                questLineKey: "World",
                questLineName: "World Quests",
                chapter: null,
                chapterLabel: null,
                step: null,
                stepLabel: null,
                sequenceIndex: 3,
                chapterOrder: null,
                stepOrder: null,
                branchGroupKey: null,
                branchLabel: null,
                branchOrder: null,
                isBranchStart: null,
                isBranchEnd: null,
                previousEntryKeys: [],
                nextEntryKeys: [],
                failureEntryKeys: [],
                convergesIntoEntryKeys: [],
            },
            loreView: { sections: [] },
            strategyView: { objectives: [] },
            branches: [],
            quality: null,
        },
    ],
    progression: {
        questlines: [
            {
                questLineKey: "Line_Shared",
                questLineFamilyKey: "Line_Shared",
                questLineName: "Shared Line",
                factionKey: "Faction_Kin",
                factionFamilyKey: "Faction_Kin",
                factionName: "Kin",
                sourceQuestLineKeys: ["Line_Shared"],
                sourceFactionKeys: ["Faction_Kin"],
                chapters: [
                    {
                        chapterNumber: 4,
                        chapterOrder: 4,
                        title: "Shared Chronicle",
                        steps: [
                            {
                                stepKey: "Line_Shared:Faction_Kin:chapter-4:step-1",
                                stepNumber: 1,
                                stepOrder: 1,
                                title: "Shared Chronicle",
                                projectionKind: "real_entry_backed",
                                detailEntryKey: "Quest_Shared",
                                sourceEntryKeys: ["Quest_Shared"],
                                aliasEntryKeys: [],
                                variants: [{ entryKey: "Quest_Shared", title: "Shared Chronicle", variantKind: "entry", branchGroupKey: null, branchLabel: null, branchOrder: null, previousEntryKeys: [], nextEntryKeys: [], failureEntryKeys: [], convergesIntoEntryKeys: [] }],
                            },
                            {
                                stepKey: "Line_Shared:Faction_Kin:chapter-4:step-2",
                                stepNumber: 2,
                                stepOrder: 2,
                                title: "Shared Chronicle Echo",
                                projectionKind: "virtual_alias_expanded",
                                detailEntryKey: "Quest_Shared",
                                sourceEntryKeys: ["Quest_Shared"],
                                aliasEntryKeys: ["Quest_Shared_Alias_Step02"],
                                variants: [{ entryKey: "Quest_Branch", title: "Branch Choice", variantKind: "branch_variant", branchGroupKey: "Quest_Shared", branchLabel: "Shared fork", branchOrder: 1, previousEntryKeys: [], nextEntryKeys: [], failureEntryKeys: [], convergesIntoEntryKeys: [] }],
                            },
                        ],
                    },
                ],
            },
        ],
        debugSummary: null,
    },
};

async function sourceTexts() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async (file) => [
        file,
        await readFile(resolve(file), "utf8"),
    ])));
}

async function loadPayload(argument: string | undefined): Promise<QuestExplorerResponse> {
    if (!argument || argument === "--sample") return samplePayload;
    if (/^https?:\/\//.test(argument)) {
        const response = await fetch(argument);
        if (!response.ok) throw new Error(`Failed to fetch ${argument}: ${response.status}`);
        return await response.json() as QuestExplorerResponse;
    }
    return JSON.parse(await readFile(resolve(argument), "utf8")) as QuestExplorerResponse;
}

const payload = await loadPayload(process.argv[2]);
const normalized = normalizeQuestExplorer(payload).questExplorer;
const diagnostic = createQuestExplorerFrontendDiagnostic(normalized, {
    selectedEntryKey: normalized.entries[0]?.entryKey ?? null,
    sourceTexts: await sourceTexts(),
});

console.log(diagnostic.reportText);

if (diagnostic.findings.some((finding) => finding.classification === "blocker")) {
    process.exitCode = 1;
}
