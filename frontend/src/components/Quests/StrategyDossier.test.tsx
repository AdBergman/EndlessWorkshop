import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
    const optionChoice = choice();

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

function modelForOption(
    option: StrategyDossierBranchOption,
    projectedOutcome: StrategyDossierModel["projectedOutcome"]
): StrategyDossierModel {
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
        selectedPathSteps: [{ id: option.id, label: option.label, stepLabel: "Step 1", isCurrent: true }],
        projectedOutcome,
        markers: [],
        branchComparison: {
            groups: [{ id: "choice", label: "Choice", options: [option] }],
            emptyLabel: "No options.",
            selectedOption: option,
        },
        pathStatus: {
            kind: "complete",
            label: "Complete",
            title: "No Further Modeled Decision",
            description: "No further modeled decision in this chapter.",
            choiceLabel: option.label,
            targetLabel: "Step 2: Quiet Ridge",
            markers: [],
        },
        continuityStrip: {
            summary: "The selected path has no further modeled decision in this chapter.",
            statusKind: "complete",
            items: [],
        },
    };
}

function renderDossier(projectedOutcome: StrategyDossierModel["projectedOutcome"]) {
    const option = branchOption();

    render(
        <StrategyDossier
            model={modelForOption(option, projectedOutcome)}
            step={step}
            onChoose={() => undefined}
        />
    );

    return screen.getByRole("button", { name: /Hold the ridge/ });
}

describe("StrategyDossier", () => {
    it("does not repeat identical selected option and projected requirement/reward lists", () => {
        const selectedOption = renderDossier({
            title: "Hold the ridge",
            lines: ["Hold the ridge."],
            requirements: ["Spend supplies."],
            rewards: ["Gain command."],
            objectives: [],
        });

        expect(screen.getByRole("region", { name: "Required Path" })).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Choice" })).not.toBeInTheDocument();
        expect(within(selectedOption).getAllByText("Spend supplies.")).toHaveLength(1);
        expect(within(selectedOption).getAllByText("Gain command.")).toHaveLength(1);
        expect(within(selectedOption).queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(within(selectedOption).queryByText("Projected Rewards")).not.toBeInTheDocument();
    });

    it("renders distinct projected requirement/reward lists inside the selected option", () => {
        const selectedOption = renderDossier({
            title: "Projected Advantage",
            lines: ["The ridge route exposes a safer follow-up."],
            requirements: ["Scout the ridge."],
            rewards: ["Open a side route."],
            objectives: [],
        });

        expect(within(selectedOption).getByText("Outcome")).toBeInTheDocument();
        expect(within(selectedOption).getByText("Projected Advantage")).toBeInTheDocument();
        expect(within(selectedOption).getByText("Projected Requirements")).toBeInTheDocument();
        expect(within(selectedOption).getByText("Scout the ridge.")).toBeInTheDocument();
        expect(within(selectedOption).getByText("Projected Rewards")).toBeInTheDocument();
        expect(within(selectedOption).getByText("Open a side route.")).toBeInTheDocument();
    });
});
