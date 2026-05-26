import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StrategyDossier } from "@/components/Quests/StrategyDossier";
import { buildEntriesByKey, buildEntriesByKindKey } from "@/lib/codex/codexRefs";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import type {
    StrategyDossierBranchOption,
    StrategyDossierModel,
} from "@/features/quests/questStrategyDossier";
import type { QuestPathChoice } from "@/features/quests/questPathFlow";
import { rewardDisplaysFromText } from "@/features/quests/questRewardDisplay";
import { requirementDisplaysFromText } from "@/features/quests/questRequirementDisplay";
import type { QuestProgressionStep } from "@/types/questTypes";

const step: QuestProgressionStep = {
    stepKey: "test-step",
    stepNumber: 1,
    stepOrder: 1,
    title: "Test Step",
    projectionKind: "real_entry_backed",
    detailEntryKey: "Quest_Test",
    sourceEntryKeys: ["Quest_Test"],
    aliasEntryKeys: [],
    variants: [],
};

function codexEntry(exportKind: string, entryKey: string, displayName = entryKey): CodexEntry {
    return {
        exportKind,
        entryKey,
        displayName,
        descriptionLines: [],
        referenceKeys: [],
    };
}

function setCodexEntries(entries: CodexEntry[]) {
    useCodexStore.setState({
        entries,
        entriesByKey: buildEntriesByKey(entries),
        entriesByKindKey: buildEntriesByKindKey(entries),
        entriesByKind: entries.reduce<Record<string, CodexEntry[]>>((accumulator, entry) => {
            const entriesForKind = accumulator[entry.exportKind] ?? [];
            entriesForKind.push(entry);
            accumulator[entry.exportKind] = entriesForKind;
            return accumulator;
        }, {}),
        loading: false,
        error: null,
    });
}

function choice(overrides: Partial<QuestPathChoice> = {}): QuestPathChoice {
    return {
        id: "choice-a",
        branchKey: "Branch_A",
        choiceKey: "Choice_A",
        label: "Hold the ridge",
        eyebrow: "Choice",
        groupKey: null,
        groupLabel: null,
        sourceEntryKey: "Quest_Test",
        sectionRole: "true_choice",
        semanticStageKind: "explicit_decision_option",
        prerequisiteBranchKeys: [],
        revealedByBranchKeys: [],
        revealedByChoiceKeys: [],
        revealedByBranchPathAlternatives: [],
        parentBranchKey: null,
        parentChoiceKey: null,
        choiceGroupKey: null,
        convergenceGroupKey: null,
        branchStepOrder: 1,
        hasDependentContinuations: false,
        descriptionLines: [],
        strategyLines: ["Hold the ridge."],
        loreLines: [],
        requirementLines: ["Spend supplies."],
        requirementDetails: overrides.requirementDetails ?? requirementDisplaysFromText(overrides.requirementLines ?? ["Spend supplies."]),
        rewardLines: ["Gain command."],
        rewardDetails: overrides.rewardDetails ?? rewardDisplaysFromText(overrides.rewardLines ?? ["Gain command."]),
        targetEntryKey: null,
        targetSummaryLine: null,
        continuationTitle: null,
        nextEntryKeys: [],
        failureEntryKeys: [],
        convergesIntoEntryKeys: [],
        accent: "gold",
        ...overrides,
    };
}

function branchOption(overrides: Partial<StrategyDossierBranchOption> = {}): StrategyDossierBranchOption {
    const optionChoice = overrides.choice ?? choice();

    return {
        id: optionChoice.id,
        choice: optionChoice,
        label: optionChoice.label,
        eyebrow: optionChoice.eyebrow,
        outcomeLines: optionChoice.strategyLines,
        requirements: optionChoice.requirementLines,
        requirementDetails: optionChoice.requirementDetails ?? requirementDisplaysFromText(optionChoice.requirementLines),
        rewards: optionChoice.rewardLines,
        rewardDetails: optionChoice.rewardDetails,
        leadsTo: [],
        markers: [],
        isSelected: true,
        isInSelectedPath: true,
        ...overrides,
    };
}

function modelForOptions(
    options: StrategyDossierBranchOption[],
    projectedOutcome: StrategyDossierModel["projectedOutcome"],
    pathStatus: StrategyDossierModel["pathStatus"] = {
        kind: "complete",
        label: "Complete",
        title: "No further modeled decision",
        description: "No further modeled decision in this chapter.",
        choiceLabel: options.find((option) => option.isSelected)?.label ?? null,
        targetLabel: null,
        markers: [],
    },
    overrides: Partial<StrategyDossierModel> = {}
): StrategyDossierModel {
    const selectedOption = options.find((option) => option.isSelected) ?? null;
    const branchComparison = {
        groups: options.length > 1 ? [{ id: "choice", label: "Choice", options }] : [],
        emptyLabel: "No options.",
        selectedOption,
    };
    const currentTask = options.length === 1 ? options[0] : null;

    return {
        brief: {
            title: "Test Step",
            stepLabel: "Step 1",
            totalSteps: 1,
            summaryLines: ["Choose the best route."],
        },
        decision: {
            title: "Choice",
            description: "Review the explicit decision options to compare their results.",
        },
        objectives: [],
        requirements: [],
        requirementDetails: [],
        rewards: [],
        rewardDetails: [],
        selectedPathSteps: selectedOption ? [{ id: selectedOption.id, label: selectedOption.label, stepLabel: "Step 1", isCurrent: true }] : [],
        projectedOutcome,
        markers: [],
        currentTask,
        decisionGroup: branchComparison,
        continuation: currentTask?.choice.semanticStageKind === "deterministic_continuation" ? currentTask : null,
        topologyAlternatives: [],
        outcomePreview: projectedOutcome,
        continuationStatus: pathStatus,
        branchComparison,
        pathStatus,
        continuityStrip: {
            summary: "The selected sequence has no further modeled decision in this chapter.",
            statusKind: pathStatus.kind,
            items: [],
        },
        ...overrides,
    };
}

function renderDossier(model: StrategyDossierModel, debugChoiceDetails?: Map<string, string>) {
    const onChoose = vi.fn();
    render(<StrategyDossier model={model} step={step} onChoose={onChoose} debugChoiceDetails={debugChoiceDetails} />);
    return onChoose;
}

describe("StrategyDossier", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
    });

    it("renders a single option as the current task without choice framing", () => {
        const option = branchOption({
            choice: choice({
                sectionRole: "continuation",
                semanticStageKind: "deterministic_continuation",
            }),
            isSelected: false,
            isInSelectedPath: false,
        });
        const onChoose = renderDossier(modelForOptions([option], null));

        const currentTask = screen.getByRole("region", { name: "Current task" });
        expect(within(currentTask).getByText("Hold the ridge")).toBeInTheDocument();
        expect(within(currentTask).getByText("Hold the ridge.")).toBeInTheDocument();
        expect(within(currentTask).getAllByText("Spend supplies.")).toHaveLength(1);
        expect(within(currentTask).getAllByText("Gain command.")).toHaveLength(1);
        expect(within(currentTask).getAllByText("Continuation")).toHaveLength(1);
        expect(within(currentTask).getAllByText("No further continuation is recorded")).toHaveLength(1);
        expect(screen.queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(screen.queryByText("No path is being simulated yet.")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Hold the ridge/ })).not.toBeInTheDocument();
        expect(onChoose).not.toHaveBeenCalled();
    });

    it("does not repeat identical selected option and projected requirement/reward lists", () => {
        const selectedOption = branchOption();
        const compareOption = branchOption({
            choice: choice({
                id: "choice-b",
                branchKey: "Branch_B",
                choiceKey: "Choice_B",
                label: "Circle wide",
                strategyLines: ["Circle wide."],
                requirementLines: ["Spend scouts."],
                rewardLines: ["Gain time."],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([selectedOption, compareOption], {
            title: "Hold the ridge",
            lines: ["Hold the ridge."],
            requirements: ["Spend supplies."],
            requirementDetails: requirementDisplaysFromText(["Spend supplies."]),
            rewards: ["Gain command."],
            rewardDetails: selectedOption.rewardDetails,
            objectives: [],
        }));

        const choiceResult = screen.getByRole("region", { name: "Choosing Hold the ridge leads to" });
        expect(screen.getByRole("region", { name: "Choose a path" })).toBeInTheDocument();
        expect(within(choiceResult).getByRole("heading", { name: "Choosing Hold the ridge leads to..." })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        const selectedOptionButton = screen.getByRole("button", { name: /Hold the ridge/ });
        expect(within(selectedOptionButton).getAllByText("Spend supplies.")).toHaveLength(1);
        expect(within(selectedOptionButton).getAllByText("Gain command.")).toHaveLength(1);
        expect(within(choiceResult).queryByText("Spend supplies.")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("Gain command.")).not.toBeInTheDocument();
        expect(within(choiceResult).getByText("No further continuation is recorded")).toBeInTheDocument();
        expect(within(selectedOptionButton).queryByText("No further continuation is recorded")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Rewards")).not.toBeInTheDocument();
    });

    it("renders formula text as secondary Strategy reward detail without duplicating projected rewards", () => {
        const selectedOption = branchOption({
            choice: choice({
                rewardLines: ["Gain Dust based on technology era."],
                rewardDetails: [{
                    ...rewardDisplaysFromText(["Gain Dust based on technology era."])[0]!,
                    formulaText: "50 + 50 * Technology Era",
                }],
            }),
        });
        const compareOption = branchOption({
            choice: choice({
                id: "choice-b",
                branchKey: "Branch_B",
                choiceKey: "Choice_B",
                label: "Circle wide",
                strategyLines: ["Circle wide."],
                requirementLines: ["Spend scouts."],
                rewardLines: ["Gain time."],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([selectedOption, compareOption], {
            title: "Hold the ridge",
            lines: ["Hold the ridge."],
            requirements: ["Spend supplies."],
            requirementDetails: requirementDisplaysFromText(["Spend supplies."]),
            rewards: ["Gain Dust based on technology era."],
            rewardDetails: selectedOption.rewardDetails,
            objectives: [],
        }));

        const selectedOptionButton = screen.getByRole("button", { name: /Hold the ridge/ });
        const choiceResult = screen.getByRole("region", { name: "Choosing Hold the ridge leads to" });

        expect(within(selectedOptionButton).getByText("Gain Dust based on technology era.")).toBeInTheDocument();
        expect(within(selectedOptionButton).getByText("Formula: 50 + 50 × Technology Era")).toBeInTheDocument();
        expect(screen.queryByText("Formula: 50 + 50 * Technology Era")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("Gain Dust based on technology era.")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("Formula: 50 + 50 × Technology Era")).not.toBeInTheDocument();
    });

    it("renders resolved requirement and reward metadata as Codex links", () => {
        setCodexEntries([
            codexEntry("tech", "Technology_RidgeLogistics", "Ridge Logistics"),
            codexEntry("units", "Unit_KinOfSheredyn_Chosen", "Chosen"),
        ]);
        const option = branchOption({
            choice: choice({
                sectionRole: "continuation",
                semanticStageKind: "deterministic_continuation",
                requirementLines: ["Research Ridge Logistics."],
                requirementDetails: [{
                    ...requirementDisplaysFromText(["Research Ridge Logistics."])[0]!,
                    referenceKind: "Tech",
                    referenceKey: "Technology_RidgeLogistics",
                    referenceDisplayName: "Ridge Logistics",
                }],
                rewardLines: ["Unlock constructible: Chosen"],
                rewardDetails: [{
                    ...rewardDisplaysFromText(["Unlock constructible: Chosen"])[0]!,
                    assetKind: "Unit",
                    assetKey: "Unit_KinOfSheredyn_Chosen",
                    assetDisplayName: "Chosen",
                }],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        expect(screen.getByRole("link", { name: "Research Ridge Logistics." })).toHaveAttribute(
            "href",
            "/codex?entry=Technology_RidgeLogistics"
        );
        expect(screen.getByRole("link", { name: "Unlock constructible: Chosen" })).toHaveAttribute(
            "href",
            "/codex?entry=Unit_KinOfSheredyn_Chosen"
        );
    });

    it("keeps unresolved requirement and formula-only reward rows as plain text", () => {
        setCodexEntries([codexEntry("tech", "Technology_RidgeLogistics", "Ridge Logistics")]);
        const option = branchOption({
            choice: choice({
                sectionRole: "continuation",
                semanticStageKind: "deterministic_continuation",
                requirementLines: ["Research missing logistics."],
                requirementDetails: [{
                    ...requirementDisplaysFromText(["Research missing logistics."])[0]!,
                    referenceKind: "Tech",
                    referenceKey: "Technology_Missing",
                    referenceDisplayName: "Missing Logistics",
                }],
                rewardLines: ["Gain Dust based on technology era."],
                rewardDetails: [{
                    ...rewardDisplaysFromText(["Gain Dust based on technology era."])[0]!,
                    formulaText: "50 + 50 * Technology Era",
                }],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        expect(screen.getByText("Research missing logistics.")).toBeInTheDocument();
        expect(screen.getByText("Gain Dust based on technology era.")).toBeInTheDocument();
        expect(screen.getByText("Formula: 50 + 50 × Technology Era")).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Research missing logistics." })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Gain Dust based on technology era." })).not.toBeInTheDocument();
    });

    it("renders topology forks as possible continuations without decision controls", () => {
        const surveyTunnel = branchOption({
            choice: choice({
                id: "topology-a",
                branchKey: "Branch_Tunnel",
                choiceKey: "Choice_Tunnel",
                label: "Survey the tunnel",
                sectionRole: "branch",
                semanticStageKind: "topology_fork_option",
                strategyLines: ["Scout the older passage."],
                requirementLines: ["Bring lantern oil."],
                rewardLines: ["Reveal the underpass."],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });
        const holdGate = branchOption({
            choice: choice({
                id: "topology-b",
                branchKey: "Branch_Gate",
                choiceKey: "Choice_Gate",
                label: "Hold the gate",
                sectionRole: "branch",
                semanticStageKind: "topology_fork_option",
                strategyLines: ["Keep the visible route secure."],
                requirementLines: ["Post a watch."],
                rewardLines: ["Preserve the convoy."],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });
        const debugChoiceDetails = new Map([
            [surveyTunnel.choice.id, "semanticStage=topology_fork_option"],
        ]);

        renderDossier(modelForOptions([], null, undefined, {
            topologyAlternatives: [surveyTunnel, holdGate],
        }), debugChoiceDetails);

        const continuations = screen.getByRole("region", { name: "Possible continuations" });
        expect(screen.queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(continuations).getByText("Survey the tunnel")).toBeInTheDocument();
        expect(within(continuations).getByText("Scout the older passage.")).toBeInTheDocument();
        expect(within(continuations).getByText("Hold the gate")).toBeInTheDocument();
        expect(within(continuations).getByText("Keep the visible route secure.")).toBeInTheDocument();
        expect(within(continuations).getByText("semanticStage=topology_fork_option")).toBeInTheDocument();
        expect(within(continuations).queryByRole("button", { name: /Survey the tunnel/ })).not.toBeInTheDocument();
        expect(within(continuations).queryByText("Choice")).not.toBeInTheDocument();
        expect(within(continuations).queryByText("Alternative")).not.toBeInTheDocument();
    });

    it("does not let the legacy branch comparison field create a decision section", () => {
        const selectedOption = branchOption();
        const compareOption = branchOption({
            choice: choice({
                id: "choice-b",
                branchKey: "Branch_B",
                choiceKey: "Choice_B",
                label: "Circle wide",
                strategyLines: ["Circle wide."],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([selectedOption, compareOption], null, undefined, {
            decisionGroup: {
                groups: [],
                emptyLabel: "No explicit decisions.",
                selectedOption: null,
            },
        }));

        expect(screen.queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Hold the ridge/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Circle wide/ })).not.toBeInTheDocument();
    });

    it("renders distinct projected requirement/reward lists in the selected result preview", () => {
        const selectedOption = branchOption();
        const compareOption = branchOption({
            choice: choice({
                id: "choice-b",
                branchKey: "Branch_B",
                choiceKey: "Choice_B",
                label: "Circle wide",
                strategyLines: ["Circle wide."],
                requirementLines: ["Spend scouts."],
                rewardLines: ["Gain time."],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions(
            [selectedOption, compareOption],
            {
                title: "Projected Advantage",
                lines: ["The ridge route exposes a safer follow-up."],
                requirements: ["Scout the ridge."],
                requirementDetails: requirementDisplaysFromText(["Scout the ridge."]),
                rewards: ["Open a side route."],
                rewardDetails: rewardDisplaysFromText(["Open a side route."]),
                objectives: [],
            },
            {
                kind: "chapter-exit",
                label: "Chapter Exit",
                title: "Continues",
                description: "Continues to the next chapter.",
                choiceLabel: selectedOption.label,
                targetLabel: "Chapter 2: Ridge Aftermath",
                markers: [],
            }
        ));

        const selectedOptionButton = screen.getByRole("button", { name: /Hold the ridge/ });
        const choiceResult = screen.getByRole("region", { name: "Choosing Hold the ridge leads to" });

        expect(within(selectedOptionButton).queryByText("Projected Advantage")).not.toBeInTheDocument();
        expect(within(choiceResult).getByText("Projected Advantage")).toBeInTheDocument();
        expect(within(choiceResult).getByText("The ridge route exposes a safer follow-up.")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Requires")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Scout the ridge.")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Rewards")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Open a side route.")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Continuation")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Continues in Chapter 2: Ridge Aftermath")).toBeInTheDocument();
        expect(screen.queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Rewards")).not.toBeInTheDocument();
    });
});
