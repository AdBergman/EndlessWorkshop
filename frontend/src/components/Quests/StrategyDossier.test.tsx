import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StrategyDossier } from "@/components/Quests/StrategyDossier";
import type {
    StrategyDossierBranchOption,
    StrategyDossierModel,
} from "@/features/quests/questStrategyDossier";
import type { QuestPathChoice } from "@/features/quests/questPathFlow";
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
        rewardLines: ["Gain command."],
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
        rewards: optionChoice.rewardLines,
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
        title: "No Further Modeled Decision",
        description: "No further modeled decision in this chapter.",
        choiceLabel: options.find((option) => option.isSelected)?.label ?? null,
        targetLabel: null,
        markers: [],
    }
): StrategyDossierModel {
    const selectedOption = options.find((option) => option.isSelected) ?? null;

    return {
        brief: {
            title: "Test Step",
            stepLabel: "Step 1",
            totalSteps: 1,
            summaryLines: ["Choose the best route."],
        },
        decision: {
            title: "Choice",
            description: "Review the selected simulation or choose another path to compare its result.",
        },
        objectives: [],
        requirements: [],
        rewards: [],
        selectedPathSteps: selectedOption ? [{ id: selectedOption.id, label: selectedOption.label, stepLabel: "Step 1", isCurrent: true }] : [],
        projectedOutcome,
        markers: [],
        branchComparison: {
            groups: [{ id: "choice", label: "Choice", options }],
            emptyLabel: "No options.",
            selectedOption,
        },
        pathStatus,
        continuityStrip: {
            summary: "The selected path has no further modeled decision in this chapter.",
            statusKind: pathStatus.kind,
            items: [],
        },
    };
}

function renderDossier(model: StrategyDossierModel) {
    const onChoose = vi.fn();
    render(<StrategyDossier model={model} step={step} onChoose={onChoose} />);
    return onChoose;
}

describe("StrategyDossier", () => {
    it("renders a single option as the current task without choice framing", () => {
        const option = branchOption({ isSelected: false, isInSelectedPath: false });
        const onChoose = renderDossier(modelForOptions([option], null));

        const currentTask = screen.getByRole("region", { name: "Current task" });
        expect(within(currentTask).getByText("Hold the ridge")).toBeInTheDocument();
        expect(within(currentTask).getByText("Hold the ridge.")).toBeInTheDocument();
        expect(within(currentTask).getAllByText("Spend supplies.")).toHaveLength(1);
        expect(within(currentTask).getAllByText("Gain command.")).toHaveLength(1);
        expect(within(currentTask).getByText("Next")).toBeInTheDocument();
        expect(within(currentTask).getByText("No further branch is recorded")).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
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
            rewards: ["Gain command."],
            objectives: [],
        }));

        const choiceResult = screen.getByRole("region", { name: "Choosing Hold the ridge leads to" });
        expect(screen.getByRole("region", { name: "Choose a path" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        const selectedOptionButton = screen.getByRole("button", { name: /Hold the ridge/ });
        expect(within(selectedOptionButton).getAllByText("Spend supplies.")).toHaveLength(1);
        expect(within(selectedOptionButton).getAllByText("Gain command.")).toHaveLength(1);
        expect(within(choiceResult).queryByText("Spend supplies.")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("Gain command.")).not.toBeInTheDocument();
        expect(within(choiceResult).getByText("No further branch is recorded")).toBeInTheDocument();
        expect(within(selectedOptionButton).queryByText("No further branch is recorded")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Rewards")).not.toBeInTheDocument();
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
                rewards: ["Open a side route."],
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
        expect(within(choiceResult).getByText("Next")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Continues in Chapter 2: Ridge Aftermath")).toBeInTheDocument();
        expect(screen.queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Rewards")).not.toBeInTheDocument();
    });
});
