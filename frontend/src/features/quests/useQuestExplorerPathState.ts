import { useCallback, useEffect, useState } from "react";
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
};

type ChooseQuestPathChoice = (
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    choiceProgression?: QuestDetailProgression | null,
    loreContextKey?: string
) => void;

export type QuestExplorerPathState = {
    strategyChoicePath: QuestPathChoiceSelection[];
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
    const retained = currentPath.filter((selection) => {
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
}: UseQuestExplorerPathStateOptions): QuestExplorerPathState {
    const [strategyChoicePath, setStrategyChoicePath] = useState<QuestPathChoiceSelection[]>([]);
    const [loreChoicePathsByContext, setLoreChoicePathsByContext] = useState<LoreChoicePathsByContext>({});
    const choicePathResetKey = `${selectedEntryKey ?? "none"}:${selectedProgressionKey}`;

    useEffect(() => {
        setStrategyChoicePath([]);
    }, [choicePathResetKey]);

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
        loreChoicePathsByContext,
        chooseExplicitChoice,
    };
}
