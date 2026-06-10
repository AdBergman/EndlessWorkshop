import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StrategyDossier } from "@/components/Quests/StrategyDossier";
import { shortenMechanicalStrategyRequirementLabel } from "@/components/Quests/strategyDossierLabels";
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

function codexEntry(
    exportKind: string,
    entryKey: string,
    displayName = entryKey,
    overrides: Partial<CodexEntry> = {}
): CodexEntry {
    return {
        exportKind,
        entryKey,
        displayName,
        descriptionLines: [],
        referenceKeys: [],
        ...overrides,
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
        objectives: [],
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
        label: "Final Outcome",
        title: "Story currently ends here",
        description: "No later quest step is recorded for this path in the current archive.",
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

    it("shortens mechanical Strategy requirement labels without changing the value", () => {
        expect(shortenMechanicalStrategyRequirementLabel("Build constructible: Stalwart 3 times")).toBe("Build: Stalwart 3 times");
        expect(shortenMechanicalStrategyRequirementLabel("Use faction action: Last Lord Round Up Village 3 times")).toBe(
            "Use action: Last Lord Round Up Village 3 times"
        );
        expect(shortenMechanicalStrategyRequirementLabel("Control 10 territories for 5 turns")).toBe("Control 10 territories for 5 turns");
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
        expect(within(currentTask).queryByText("Continuation")).not.toBeInTheDocument();
        expect(within(currentTask).queryByText("No further continuation is recorded")).not.toBeInTheDocument();
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

        const choiceResult = screen.getByRole("region", { name: "Choosing Hold the ridge completes this path" });
        expect(screen.getByRole("region", { name: "Choose a path" })).toBeInTheDocument();
        expect(within(choiceResult).getByRole("heading", { name: "Choosing Hold the ridge completes this path" })).toBeInTheDocument();
        expect(within(choiceResult).getByText("Final outcome")).toBeInTheDocument();
        expect(within(choiceResult).getByText("Story currently ends here")).toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Required Path" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Selected Simulation" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Projected Result" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Next Destination" })).not.toBeInTheDocument();
        const selectedOptionButton = screen.getByRole("button", { name: /Hold the ridge/ });
        expect(within(selectedOptionButton).getAllByText("Spend supplies.")).toHaveLength(1);
        expect(within(selectedOptionButton).getAllByText("Gain command.")).toHaveLength(1);
        expect(within(choiceResult).queryByText("Spend supplies.")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("Gain command.")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("No further continuation is recorded")).not.toBeInTheDocument();
        expect(within(selectedOptionButton).queryByText("No further continuation is recorded")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Requirements")).not.toBeInTheDocument();
        expect(screen.queryByText("Projected Rewards")).not.toBeInTheDocument();
    });

    it("omits empty branch result panels when same-chapter continuation status is suppressed", () => {
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
                title: "Hold the ridge",
                lines: ["Hold the ridge."],
                requirements: selectedOption.requirements,
                requirementDetails: selectedOption.requirementDetails,
                rewards: selectedOption.rewards,
                rewardDetails: selectedOption.rewardDetails,
                objectives: [],
            },
            {
                kind: "continues-in-chapter",
                label: "Continues",
                title: "Selected sequence reaches another decision in this chapter",
                description: "Continue simulation from Step 2.",
                choiceLabel: selectedOption.label,
                targetLabel: "Step 2: Follow-up",
                markers: [],
            }
        ));

        expect(screen.queryByRole("region", { name: "Choosing Hold the ridge leads to" })).not.toBeInTheDocument();
        expect(screen.queryByRole("region", { name: "Choosing Hold the ridge" })).not.toBeInTheDocument();
    });

    it("renders formula text as secondary Strategy reward detail without duplicating projected rewards", () => {
        const selectedOption = branchOption({
            choice: choice({
                rewardLines: ["Gain Dust based on technology era."],
                rewardDetails: [{
                    ...rewardDisplaysFromText(["Gain Dust based on technology era."])[0]!,
                    kind: "Money",
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
        const choiceResult = screen.getByRole("region", { name: "Choosing Hold the ridge completes this path" });

        expect(within(selectedOptionButton).getByText("Gain Dust")).toBeInTheDocument();
        expect(within(selectedOptionButton).getByText("50 + 50 × Technology Era")).toBeInTheDocument();
        expect(selectedOptionButton.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/resources/UI_Common_Resource_Dust.svg"]'
        )).toBeInTheDocument();
        expect(selectedOptionButton.querySelector(".questExplorer-inlineMetaItem--iconReward")).toBeInTheDocument();
        expect(selectedOptionButton.querySelector(".questExplorer-rewardStack")).toBeInTheDocument();
        expect(selectedOptionButton.querySelector(".questExplorer-rewardStackBody")).toBeInTheDocument();
        expect(screen.queryByText("Formula: 50 + 50 * Technology Era")).not.toBeInTheDocument();
        expect(screen.queryByText("Formula: 50 + 50 × Technology Era")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("Gain Dust based on technology era.")).not.toBeInTheDocument();
        expect(within(choiceResult).queryByText("50 + 50 × Technology Era")).not.toBeInTheDocument();
    });

    it("renders resource icons for economy and known strategic reward kinds", () => {
        const option = branchOption({
            choice: choice({
                sectionRole: "continuation",
                semanticStageKind: "deterministic_continuation",
                rewardLines: [
                    "Gain 500 Dust",
                    "Gain Influence based on technology era",
                    "Gain Science based on technology era",
                    "Gain Food based on technology era",
                    "Gain Titanium based on technology era",
                    "Gain equipment: The Adjudicator",
                ],
                rewardDetails: [
                    { ...rewardDisplaysFromText(["Gain 500 Dust"])[0]!, kind: "Money" },
                    {
                        ...rewardDisplaysFromText(["Gain Influence based on technology era"])[0]!,
                        kind: "Influence",
                        formulaText: "5 + 5 * Technology Era",
                    },
                    {
                        ...rewardDisplaysFromText(["Gain Science based on technology era"])[0]!,
                        kind: "Science",
                        formulaText: "20 + 20 * Technology Era",
                    },
                    {
                        ...rewardDisplaysFromText(["Gain Food based on technology era"])[0]!,
                        kind: "Food",
                        formulaText: "25 + 50 * Technology Era",
                    },
                    {
                        ...rewardDisplaysFromText(["Gain Titanium based on technology era"])[0]!,
                        kind: "Resource",
                        formulaText: "5 + 5 * Technology Era",
                    },
                    {
                        ...rewardDisplaysFromText(["Gain equipment: The Adjudicator"])[0]!,
                        kind: "Equipment",
                        referenceKind: "Equipment",
                        referenceKey: "Equipment_TwoHanded_19_Definition",
                        referenceDisplayName: "The Adjudicator",
                    },
                ],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/resources/UI_Common_Resource_Dust.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/resources/UI_Common_Resource_Influence.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/resources/UI_Common_Resource_Science.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/constructibles/UI_Common_Resource_Food.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/constructibles/UI_Resource_Strategic_Titanium.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelectorAll("img.questExplorer-rewardIcon")).toHaveLength(5);
        expect(document.querySelectorAll(".questExplorer-inlineMetaItem--iconReward")).toHaveLength(5);
        expect(document.querySelectorAll(".questExplorer-rewardStack")).toHaveLength(5);
        expect(screen.getByText("Gain Influence")).toBeInTheDocument();
        expect(screen.getByText("Gain Science")).toBeInTheDocument();
        expect(screen.getByText("Gain Food")).toBeInTheDocument();
        expect(screen.getByText("Gain Titanium")).toBeInTheDocument();
        expect(screen.getAllByText("5 + 5 × Technology Era")).toHaveLength(2);
        expect(screen.getByText("20 + 20 × Technology Era")).toBeInTheDocument();
        expect(screen.getByText("25 + 50 × Technology Era")).toBeInTheDocument();
    });

    it("shows a compact Codex preview tooltip from linked Strategy reward text on hover and focus", async () => {
        setCodexEntries([
            codexEntry("units", "Unit_KinOfSheredyn_Chosen", "Chosen", {
                kind: "Unit",
                descriptionLines: [
                    "Elite Kin warriors trained for decisive engagements.",
                    "+70 Damage",
                    "",
                    "+3 [MovementPoints] Movement Points",
                    "Requires strategic resources.",
                    "Hidden overflow line should not render.",
                ],
            }),
        ]);
        const option = branchOption({
            choice: choice({
                sectionRole: "continuation",
                semanticStageKind: "deterministic_continuation",
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

        const onChoose = renderDossier(modelForOptions([option], null));

        const rewardPrefix = screen.getByText("Unlock constructible:");
        const rewardText = screen.getByText("Chosen");
        const rewardPreviewTarget = rewardText.closest(".questExplorer-codexPreviewTarget");
        const rewardReference = rewardText.closest(".questExplorer-codexReference");
        expect(rewardPrefix).toHaveClass("questExplorer-codexReferencePrefix");
        expect(rewardPrefix.closest(".questExplorer-codexPreviewTarget")).toBeNull();
        expect(rewardReference).toHaveAttribute("aria-label", "Unlock constructible: Chosen");
        expect(rewardPreviewTarget).toBeInstanceOf(HTMLElement);
        expect(rewardText.closest("a")).toBeNull();
        expect(rewardPreviewTarget).toHaveAttribute("tabindex", "0");
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/common/UI_Common_Unit.svg"]'
        )).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Unlock constructible: Chosen" })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Chosen in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=Unit_KinOfSheredyn_Chosen"
        );
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        fireEvent.mouseEnter(rewardPreviewTarget!);

        const hoverTooltip = await screen.findByRole("tooltip");
        expect(within(hoverTooltip).getByText("Chosen")).toBeInTheDocument();
        expect(within(hoverTooltip).getByText("Units · Unit")).toBeInTheDocument();
        expect(within(hoverTooltip).getByText("Elite Kin warriors trained for decisive engagements.")).toBeInTheDocument();
        expect(within(hoverTooltip).getByText("+70 Damage")).toBeInTheDocument();
        expect(within(hoverTooltip).queryByText("Hidden overflow line should not render.")).not.toBeInTheDocument();

        fireEvent.mouseLeave(rewardPreviewTarget!);
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        fireEvent.click(rewardPreviewTarget!);
        expect(await screen.findByRole("tooltip")).toBeInTheDocument();
        expect(onChoose).not.toHaveBeenCalled();
        fireEvent.blur(rewardPreviewTarget!);
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        fireEvent.focus(rewardPreviewTarget!);
        expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    });

    it("shows a compact Codex preview tooltip from linked Strategy requirement text on hover and focus", async () => {
        setCodexEntries([
            codexEntry("tech", "Technology_RidgeLogistics", "Ridge Logistics", {
                kind: "Technology",
                descriptionLines: [
                    "Improves movement and convoy handling along broken ridges.",
                    "+1 [MovementPoints] Movement Points on ridge routes.",
                    "Unlocks stronger expedition logistics.",
                    "Hidden requirement overflow line should not render.",
                    "Another hidden requirement overflow line should not render.",
                ],
            }),
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
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        const requirementPrefix = screen.getByText("Research");
        const requirementText = screen.getByText("Ridge Logistics");
        const requirementSuffix = screen.getByText(".");
        const requirementPreviewTarget = requirementText.closest(".questExplorer-codexPreviewTarget");
        expect(requirementPrefix).toHaveClass("questExplorer-codexReferencePrefix");
        expect(requirementPrefix.closest(".questExplorer-codexPreviewTarget")).toBeNull();
        expect(requirementSuffix).toHaveClass("questExplorer-codexReferencePrefix");
        expect(requirementSuffix.closest(".questExplorer-codexPreviewTarget")).toBeNull();
        expect(requirementPreviewTarget).toBeInstanceOf(HTMLElement);
        expect(requirementText.closest("a")).toBeNull();
        expect(requirementPreviewTarget).toHaveAttribute("tabindex", "0");
        expect(screen.queryByRole("link", { name: "Research Ridge Logistics." })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Ridge Logistics in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=Technology_RidgeLogistics"
        );
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        fireEvent.mouseEnter(requirementPreviewTarget!);

        const hoverTooltip = await screen.findByRole("tooltip");
        expect(within(hoverTooltip).getByText("Ridge Logistics")).toBeInTheDocument();
        expect(within(hoverTooltip).getByText("Tech · Technology")).toBeInTheDocument();
        expect(within(hoverTooltip).getByText("Improves movement and convoy handling along broken ridges.")).toBeInTheDocument();
        expect(within(hoverTooltip).queryByText("Another hidden requirement overflow line should not render.")).not.toBeInTheDocument();

        fireEvent.mouseLeave(requirementPreviewTarget!);
        await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());

        fireEvent.focus(requirementPreviewTarget!);
        expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    });

    it("uses explicit Codex open icons for resolved requirement and reward metadata", () => {
        setCodexEntries([
            codexEntry("tech", "Technology_RidgeLogistics", "Ridge Logistics"),
            codexEntry("units", "Unit_KinOfSheredyn_Chosen", "Chosen"),
            codexEntry("equipment", "Equipment_TwoHanded_19_Definition", "The Adjudicator"),
            codexEntry("traits", "FactionTrait_KinOfSheredyn_ChosenCap_FactionQuest", "Ahead in the Polls"),
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
                rewardLines: [
                    "Unlock constructible: Chosen",
                    "Gain equipment: The Adjudicator",
                    "Gain bonus: Ahead in the Polls",
                ],
                rewardDetails: [
                    {
                        ...rewardDisplaysFromText(["Unlock constructible: Chosen"])[0]!,
                        assetKind: "Unit",
                        assetKey: "Unit_KinOfSheredyn_Chosen",
                        assetDisplayName: "Chosen",
                    },
                    {
                        ...rewardDisplaysFromText(["Gain equipment: The Adjudicator"])[0]!,
                        referenceKind: "Equipment",
                        referenceKey: "Equipment_TwoHanded_19_Definition",
                        referenceDisplayName: "The Adjudicator",
                    },
                    {
                        ...rewardDisplaysFromText(["Gain bonus: Ahead in the Polls"])[0]!,
                        referenceKind: "FactionTrait",
                        referenceKey: "FactionTrait_KinOfSheredyn_ChosenCap_FactionQuest",
                        referenceDisplayName: "Ahead in the Polls",
                    },
                ],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        expect(screen.getByText("Research").closest("a")).toBeNull();
        expect(screen.getByText("Ridge Logistics").closest("a")).toBeNull();
        expect(screen.queryByRole("link", { name: "Research Ridge Logistics." })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Ridge Logistics in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=Technology_RidgeLogistics"
        );
        expect(screen.getByText("Unlock constructible:").closest("a")).toBeNull();
        expect(screen.getByText("Chosen").closest("a")).toBeNull();
        expect(screen.queryByRole("link", { name: "Unlock constructible: Chosen" })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Chosen in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=Unit_KinOfSheredyn_Chosen"
        );
        expect(screen.getByRole("link", { name: "Open The Adjudicator in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=Equipment_TwoHanded_19_Definition"
        );
        expect(screen.getByRole("link", { name: "Open Ahead in the Polls in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=FactionTrait_KinOfSheredyn_ChosenCap_FactionQuest"
        );
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/common/UI_Common_Unit.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/common/UI_Common_HeroEquipment.svg"]'
        )).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/common/UI_Common_Deed.svg"]'
        )).toBeInTheDocument();
    });

    it("keeps the whole display text as the preview target when the entity label cannot be safely split", async () => {
        setCodexEntries([
            codexEntry("units", "Unit_KinOfSheredyn_Chosen", "Chosen", {
                kind: "Unit",
                descriptionLines: ["Elite Kin warriors trained for decisive engagements."],
            }),
        ]);
        const option = branchOption({
            choice: choice({
                sectionRole: "continuation",
                semanticStageKind: "deterministic_continuation",
                rewardLines: ["Unlock an elite constructible."],
                rewardDetails: [{
                    ...rewardDisplaysFromText(["Unlock an elite constructible."])[0]!,
                    assetKind: "Unit",
                    assetKey: "Unit_KinOfSheredyn_Chosen",
                    assetDisplayName: null,
                }],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        const fallbackText = screen.getByText("Unlock an elite constructible.");
        const fallbackPreviewTarget = fallbackText.closest(".questExplorer-codexPreviewTarget");
        expect(fallbackPreviewTarget).toBeInstanceOf(HTMLElement);
        expect(screen.queryByText("Unlock an elite constructible:", { exact: false })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Open Chosen in Codex" })).toHaveAttribute(
            "href",
            "/codex?entry=Unit_KinOfSheredyn_Chosen"
        );

        fireEvent.focus(fallbackPreviewTarget!);
        expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    });

    it("keeps requirement and reward Codex icons from selecting an enclosing decision option", () => {
        setCodexEntries([
            codexEntry("tech", "Technology_RidgeLogistics", "Ridge Logistics"),
            codexEntry("units", "Unit_KinOfSheredyn_Chosen", "Chosen"),
        ]);
        const linkedRewardOption = branchOption({
            choice: choice({
                id: "choice-linked",
                label: "Train the chosen",
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
        const plainOption = branchOption({
            choice: choice({
                id: "choice-plain",
                branchKey: "Branch_B",
                choiceKey: "Choice_B",
                label: "Hold reserves",
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        const onChoose = renderDossier(modelForOptions([linkedRewardOption, plainOption], null));

        const requirementOpenIcon = screen.getByRole("link", { name: "Open Ridge Logistics in Codex" });
        expect(requirementOpenIcon).toHaveAttribute("href", "/codex?entry=Technology_RidgeLogistics");
        requirementOpenIcon.addEventListener("click", (event) => event.preventDefault(), { once: true });
        fireEvent.click(requirementOpenIcon);

        const rewardOpenIcon = screen.getByRole("link", { name: "Open Chosen in Codex" });
        expect(rewardOpenIcon).toHaveAttribute("href", "/codex?entry=Unit_KinOfSheredyn_Chosen");

        rewardOpenIcon.addEventListener("click", (event) => event.preventDefault(), { once: true });
        fireEvent.click(rewardOpenIcon);

        expect(onChoose).not.toHaveBeenCalled();
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
                rewardLines: ["Gain Dust based on technology era.", "Unlock missing relic"],
                rewardDetails: [
                    {
                        ...rewardDisplaysFromText(["Gain Dust based on technology era."])[0]!,
                        kind: "Money",
                        formulaText: "50 + 50 * Technology Era",
                    },
                    {
                        ...rewardDisplaysFromText(["Unlock missing relic"])[0]!,
                        assetKind: "Unit",
                        assetKey: "Unit_Missing_Relic",
                        assetDisplayName: "Missing Relic",
                    },
                ],
            }),
            isSelected: false,
            isInSelectedPath: false,
        });

        renderDossier(modelForOptions([option], null));

        expect(screen.getByText("Research missing logistics.")).toBeInTheDocument();
        expect(screen.getByText("Gain Dust")).toBeInTheDocument();
        expect(screen.getByText("Unlock missing relic")).toBeInTheDocument();
        expect(screen.getByText("50 + 50 × Technology Era")).toBeInTheDocument();
        expect(document.querySelector(
            'img.questExplorer-rewardIcon[src="/svg/resources/UI_Common_Resource_Dust.svg"]'
        )).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Research missing logistics." })).not.toBeInTheDocument();
        expect(screen.queryByText("Gain Dust based on technology era.")).not.toBeInTheDocument();
        expect(screen.queryByText("Formula: 50 + 50 × Technology Era")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Gain Dust based on technology era." })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Unlock missing relic" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Open Missing Relic in Codex" })).not.toBeInTheDocument();
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
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
