import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
    createLoreChronologySnapshot,
    diffLoreChronologySnapshots,
    formatLoreChronologyDiff,
    formatLoreChronologySnapshot,
    type LoreChronologyBlock,
} from "@/features/quests/questLoreChronologyDiagnostic";
import {
    buildLoreFlowModel,
    type ChronicleChoiceItem,
    type LoreFlowModel,
} from "@/features/quests/questLoreFlow";
import { normalizeQuestExplorer } from "@/features/quests/questExplorerNormalizer";
import {
    findDetailProgression,
    selectionForChoice,
    type LoreChoicePathsByContext,
    type QuestDetailProgression,
    type QuestPathChoice,
} from "@/features/quests/questPathFlow";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestExplorerResponse,
    QuestProgressionStep,
} from "@/types/questTypes";

type ChronologyTarget = {
    label: string;
    entryKey: string;
};

type ChoiceCandidate = {
    contextKey: string;
    step: QuestProgressionStep;
    choiceItem: ChronicleChoiceItem;
};

const defaultTargets: ChronologyTarget[] = [
    { label: "Kin Chapter 0 tutorial continuity", entryKey: "TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01" },
    { label: "Kin Chapter 6 Leave/Stay", entryKey: "FactionQuest_KinOfSheredyn_Chapter06A_Step01" },
    { label: "Mukag Chapter 2 Pious/Open/Bold", entryKey: "FactionQuest_Mukag_Chapter02_Step01" },
    { label: "Mukag Chapter 4 Pious/Open/Bold", entryKey: "FactionQuest_Mukag_Chapter04_Step00" },
    { label: "Mukag Chapter 6 Pious/Open/Bold", entryKey: "FactionQuest_Mukag_Chapter06_Step01" },
    { label: "Aspect Chapter 3", entryKey: "FactionQuest_Aspect_Chapter03_Step01" },
    { label: "Necrophage Chapter 3 branching", entryKey: "FactionQuest_Necrophage_Chapter03_Step01" },
    { label: "Necrophage Chapter 6 failure/branching", entryKey: "FactionQuest_Necrophage_Chapter06_Step01" },
    { label: "Last Lord Chapter 2 unresolved/variant", entryKey: "FactionQuest_LastLord_Chapter02_Step01" },
    { label: "Last Lord Chapter 6 variant", entryKey: "FactionQuest_LastLord_Chapter06A_Step01" },
];

const defaultPayloadSource = "http://127.0.0.1:8080/api/quests/explorer";

function parseArgs() {
    const args = process.argv.slice(2);
    return {
        payloadSource: args.find((arg) => !arg.startsWith("--")) ?? defaultPayloadSource,
        verbose: args.includes("--verbose"),
    };
}

async function loadPayload(source: string): Promise<QuestExplorerResponse> {
    if (/^https?:\/\//.test(source)) {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Failed to fetch ${source}: ${response.status}`);
        return await response.json() as QuestExplorerResponse;
    }
    return JSON.parse(await readFile(resolve(source), "utf8")) as QuestExplorerResponse;
}

function entriesByKey(entries: QuestExplorerEntry[]): Record<string, QuestExplorerEntry> {
    return Object.fromEntries(entries.map((entry) => [entry.entryKey, entry]));
}

function modelForTarget({
    entry,
    progression,
    entries,
    choicePathsByContext = {},
}: {
    entry: QuestExplorerEntry;
    progression: QuestExplorerProgression | null;
    entries: Record<string, QuestExplorerEntry>;
    choicePathsByContext?: LoreChoicePathsByContext;
}): { model: LoreFlowModel; progression: QuestDetailProgression | null } {
    const selectedProgression = findDetailProgression(progression, entry, entry.entryKey);
    return {
        progression: selectedProgression,
        model: buildLoreFlowModel({
            selectedProgression,
            fullProgression: progression,
            entriesByKey: entries,
            loreChoicePathsByContext: choicePathsByContext,
            showRawHiddenRows: false,
        }),
    };
}

function candidateKey(candidate: ChoiceCandidate): string {
    const choice = candidate.choiceItem.choice;
    return [
        choice.label,
        choice.choiceKey ?? "no-choice-key",
        choice.branchKey ?? "no-branch",
        choice.semanticStageKind,
    ].join("|");
}

function choiceCandidates(model: LoreFlowModel): ChoiceCandidate[] {
    const candidates: ChoiceCandidate[] = [];

    model.segments.forEach((segment) => {
        segment.loreSteps.forEach((stage) => {
            const moment = stage.branchMoment;
            if (!moment) return;
            [
                ...moment.decisionChoices,
                ...moment.branchingContinuationChoices,
                ...moment.continuationChoices,
            ].forEach((choiceItem) => {
                candidates.push({
                    contextKey: segment.contextKey,
                    step: stage.step,
                    choiceItem,
                });
            });
        });
    });

    const seen = new Set<string>();
    return candidates.filter((candidate) => {
        const key = candidateKey(candidate);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function blockTexts(blocks: LoreChronologyBlock[], group: LoreChronologyBlock["group"]): string[] {
    return blocks
        .filter((block) => block.group === group)
        .map((block) => block.text);
}

function selectedChoiceIndex(blocks: LoreChronologyBlock[], choice: QuestPathChoice): number {
    return blocks.findIndex((block) => block.choiceId === choice.id);
}

function postChoiceInsertionsFor(
    blocks: LoreChronologyBlock[],
    choice: QuestPathChoice
): LoreChronologyBlock[] {
    return blocks.filter((block) => (
        block.group === "post_choice"
        && (
            (choice.choiceKey && block.choiceKey === choice.choiceKey)
            || (choice.branchKey && block.branchKey === choice.branchKey)
        )
    ));
}

function isTranscriptBlockKey(stableKey: string): boolean {
    return (
        stableKey.startsWith("pre_choice|")
        || stableKey.startsWith("post_choice|")
        || stableKey.startsWith("revealed_lore|")
    );
}

function verifyTarget({
    target,
    progression,
    entries,
    verbose,
}: {
    target: ChronologyTarget;
    progression: QuestExplorerProgression | null;
    entries: Record<string, QuestExplorerEntry>;
    verbose: boolean;
}): { lines: string[]; failed: boolean } {
    const entry = entries[target.entryKey];
    if (!entry) {
        return {
            failed: true,
            lines: [`## ${target.label}`, `missing entry: ${target.entryKey}`],
        };
    }

    const { model: beforeModel, progression: selectedProgression } = modelForTarget({
        entry,
        progression,
        entries,
    });
    const before = createLoreChronologySnapshot(beforeModel, `${target.label}: before branch selection`);
    const candidates = choiceCandidates(beforeModel).slice(0, 8);
    const lines = [
        `## ${target.label}`,
        `${entry.entryKey} | ${entry.title} | ${entry.navigation.chapterLabel ?? "no chapter"}`,
        `progression: ${selectedProgression ? "found" : "missing"} | before blocks: ${before.blocks.length}`,
        `pre-choice: ${blockTexts(before.blocks, "pre_choice").length} | choices: ${candidates.map((candidate) => candidate.choiceItem.choice.label).join(", ") || "none"}`,
    ];

    let failed = !selectedProgression;
    if (!selectedProgression && !progression) {
        lines.push("payload has no derived progression graph; run this diagnostic against the Quest Explorer API response, not the raw exporter JSON");
    }

    candidates.forEach((candidate) => {
        const choice = candidate.choiceItem.choice;
        const selection = selectionForChoice(candidate.step.stepKey, choice);
        const afterModel = modelForTarget({
            entry,
            progression,
            entries,
            choicePathsByContext: {
                [candidate.contextKey]: [selection],
            },
        }).model;
        const after = createLoreChronologySnapshot(afterModel, `${target.label}: after ${choice.label}`);
        const diff = diffLoreChronologySnapshots(before, after);
        const choiceIndex = selectedChoiceIndex(after.blocks, choice);
        const backwardInsertions = postChoiceInsertionsFor(after.blocks, choice)
            .filter((block) => choiceIndex >= 0 && block.chronologyIndex <= choiceIndex);
        const removedPreChoice = diff.removedBlocks.filter((block) => block.group === "pre_choice");
        const duplicateTranscriptKeysAfter = diff.duplicateStableKeysAfter.filter(isTranscriptBlockKey);
        const resultFailed = (
            diff.preChoiceMutations.length > 0
            || removedPreChoice.length > 0
            || backwardInsertions.length > 0
            || duplicateTranscriptKeysAfter.length > 0
        );
        failed = failed || resultFailed;

        lines.push([
            `choice "${choice.label}"`,
            `pre-choice mutations=${diff.preChoiceMutations.length}`,
            `removed pre-choice=${removedPreChoice.length}`,
            `post-choice backward insertions=${backwardInsertions.length}`,
            `added=${diff.addedBlocks.length}`,
            `duplicate transcript=${duplicateTranscriptKeysAfter.length}`,
            resultFailed ? "FAIL" : "ok",
        ].join(" | "));

        if (verbose || resultFailed) {
            lines.push(formatLoreChronologySnapshot(before));
            lines.push(formatLoreChronologySnapshot(after));
            lines.push(formatLoreChronologyDiff(diff));
        }
    });

    if (candidates.length === 0 && before.blocks.length === 0) {
        failed = true;
        lines.push("no rendered chronology blocks found");
    }

    return { lines, failed };
}

const { payloadSource, verbose } = parseArgs();
const payload = await loadPayload(payloadSource);
const normalized = normalizeQuestExplorer(payload).questExplorer;
const entries = entriesByKey(normalized.entries);
const results = defaultTargets.map((target) => verifyTarget({
    target,
    progression: normalized.progression,
    entries,
    verbose,
}));

console.log([
    `Lore chronology diagnostic: ${payloadSource}`,
    `targets: ${defaultTargets.length}`,
    ...results.flatMap((result) => result.lines),
].join("\n"));

if (results.some((result) => result.failed)) {
    process.exitCode = 1;
}
