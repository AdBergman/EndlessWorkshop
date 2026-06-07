import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { QuestExplorerMode } from "./questExplorerMode";
import {
    selectionForChoice,
    type LoreChoicePathsByContext,
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
} from "./questPathFlow";
import type { QuestProgressionStep } from "@/types/questTypes";

type UseQuestExplorerPathStateOptions = {
    mode: QuestExplorerMode;
    selectedEntryKey: string | null;
    selectedProgression: QuestDetailProgression | null;
    selectedProgressionKey: string;
    initialStrategyChoicePath: QuestPathChoiceSelection[];
};

type ChooseQuestPathChoice = (
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    choiceProgression?: QuestDetailProgression | null,
    loreContextKey?: string
) => void;

export type QuestExplorerPathState = {
    strategyChoicePath: QuestPathChoiceSelection[];
    strategyChoiceRevision: number;
    loreChoicePathsByContext: LoreChoicePathsByContext;
    chooseExplicitChoice: ChooseQuestPathChoice;
};

function nextChoicePathForSelection(
    currentPath: QuestPathChoiceSelection[],
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    choiceProgression: QuestDetailProgression
): QuestPathChoiceSelection[] {
    const stepIndex = choiceProgression.chapter.steps.findIndex((candidate) => candidate.stepKey === step.stepKey);
    if (stepIndex < 0) return currentPath;

    const nextSelection = selectionForChoice(step.stepKey, choice);
    const nextBranchStepOrder = nextSelection.branchStepOrder ?? Number.MAX_SAFE_INTEGER;
    const requiredAncestorBranchKeys = new Set([
        choice.parentBranchKey,
        ...choice.prerequisiteBranchKeys,
    ].filter((branchKey): branchKey is string => Boolean(branchKey)));
    const retained = currentPath.filter((selection) => {
        if (selection.branchKey && requiredAncestorBranchKeys.has(selection.branchKey)) return true;
        const selectionIndex = choiceProgression.chapter.steps.findIndex((candidate) => candidate.stepKey === selection.stepKey);
        if (selectionIndex < 0 || selectionIndex > stepIndex) return false;
        if (selectionIndex < stepIndex) return true;
        return (selection.branchStepOrder ?? Number.MAX_SAFE_INTEGER) < nextBranchStepOrder;
    });

    return [...retained, nextSelection];
}

export function useQuestExplorerPathState({
    mode,
    selectedEntryKey,
    selectedProgression,
    selectedProgressionKey,
    initialStrategyChoicePath,
}: UseQuestExplorerPathStateOptions): QuestExplorerPathState {
    const [strategyChoicePath, setStrategyChoicePath] = useState<QuestPathChoiceSelection[]>([]);
    const [strategyChoiceRevision, setStrategyChoiceRevision] = useState(0);
    const [loreChoicePathsByContext, setLoreChoicePathsByContext] = useState<LoreChoicePathsByContext>({});
    const choicePathResetKey = `${selectedEntryKey ?? "none"}:${selectedProgressionKey}`;
    const previousModeRef = useRef(mode);

    useLayoutEffect(() => {
        setStrategyChoicePath(choicePathForProgression(initialStrategyChoicePath, selectedProgression));
        setStrategyChoiceRevision(0);
    }, [choicePathResetKey, initialStrategyChoicePath, selectedProgression]);

    useEffect(() => {
        const previousMode = previousModeRef.current;
        previousModeRef.current = mode;
        if (previousMode === mode) return;

        setStrategyChoicePath([]);
        setStrategyChoiceRevision(0);
        setLoreChoicePathsByContext({});
    }, [mode]);

    const chooseExplicitChoice = useCallback<ChooseQuestPathChoice>(
        (
            step,
            choice,
            choiceProgression = selectedProgression,
            loreContextKey = selectedProgressionKey
        ) => {
            if (!choiceProgression) return;

            if (mode === "strategy") {
                setStrategyChoicePath((currentPath) => nextChoicePathForSelection(
                    currentPath,
                    step,
                    choice,
                    choiceProgression
                ));
                setStrategyChoiceRevision((revision) => revision + 1);
                return;
            }

            setLoreChoicePathsByContext((current) => ({
                ...current,
                [loreContextKey]: nextChoicePathForSelection(
                    current[loreContextKey] ?? [],
                    step,
                    choice,
                    choiceProgression
                ),
            }));
        },
        [mode, selectedProgression, selectedProgressionKey]
    );

    return {
        strategyChoicePath,
        strategyChoiceRevision,
        loreChoicePathsByContext,
        chooseExplicitChoice,
    };
}

function choicePathForProgression(
    choicePath: QuestPathChoiceSelection[],
    selectedProgression: QuestDetailProgression | null
): QuestPathChoiceSelection[] {
    if (!selectedProgression || choicePath.length === 0) return [];
    const stepKeys = new Set(selectedProgression.chapter.steps.map((step) => step.stepKey));
    return choicePath.filter((selection) => stepKeys.has(selection.stepKey));
}
