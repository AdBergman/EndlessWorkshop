import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    DEFAULT_QUEST_EXPLORER_MODE,
    normalizeQuestExplorerMode,
    type QuestExplorerMode,
} from "./questExplorerMode";
import { mockQuestExplorerExport } from "./mockQuestExplorerExport";
import { buildQuestExplorerPrototypeViewModel } from "./questExplorerPrototypeViewModel";

const QUEST_QUERY_PARAM = "quest";
const BRANCH_QUERY_PARAM = "branch";
const MODE_QUERY_PARAM = "mode";

const clean = (value: string | null | undefined): string | null => {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
};

export function useQuestExplorerPrototype() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isRailOpen, setRailOpen] = useState(false);
    const [visitedEntryKeys, setVisitedEntryKeys] = useState<string[]>([]);
    const mode = normalizeQuestExplorerMode(searchParams.get(MODE_QUERY_PARAM));
    const questKey = clean(searchParams.get(QUEST_QUERY_PARAM));
    const branchKey = clean(searchParams.get(BRANCH_QUERY_PARAM));

    const viewModel = useMemo(
        () =>
            buildQuestExplorerPrototypeViewModel(mockQuestExplorerExport, {
                mode,
                questKey,
                branchKey,
                visitedEntryKeys,
            }),
        [branchKey, mode, questKey, visitedEntryKeys]
    );

    useEffect(() => {
        const selectedKey = viewModel.selectedEntry.entryKey;
        setVisitedEntryKeys((current) =>
            current.includes(selectedKey) ? current : [...current, selectedKey]
        );
    }, [viewModel.selectedEntry.entryKey]);

    useEffect(() => {
        setRailOpen(false);
    }, [viewModel.selectedEntry.entryKey]);

    const updateSearchParams = useCallback(
        (mutate: (nextParams: URLSearchParams) => void, replace = false) => {
            setSearchParams(
                (currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);
                    mutate(nextParams);
                    return nextParams;
                },
                { replace }
            );
        },
        [setSearchParams]
    );

    const setMode = useCallback(
        (nextMode: QuestExplorerMode) => {
            updateSearchParams((nextParams) => {
                if (nextMode === DEFAULT_QUEST_EXPLORER_MODE) {
                    nextParams.delete(MODE_QUERY_PARAM);
                } else {
                    nextParams.set(MODE_QUERY_PARAM, nextMode);
                }
            }, true);
        },
        [updateSearchParams]
    );

    const selectQuest = useCallback(
        (entryKey: string) => {
            const normalizedKey = clean(entryKey);
            if (!normalizedKey) return;

            updateSearchParams((nextParams) => {
                nextParams.set(QUEST_QUERY_PARAM, normalizedKey);
                nextParams.delete(BRANCH_QUERY_PARAM);
            });
        },
        [updateSearchParams]
    );

    const selectBranch = useCallback(
        (nextBranchKey: string) => {
            const normalizedBranchKey = clean(nextBranchKey);
            if (!normalizedBranchKey) return;

            updateSearchParams((nextParams) => {
                nextParams.set(BRANCH_QUERY_PARAM, normalizedBranchKey);
            });
        },
        [updateSearchParams]
    );

    return {
        viewModel,
        isRailOpen,
        actions: {
            setMode,
            selectQuest,
            selectBranch,
            openRail: () => setRailOpen(true),
            closeRail: () => setRailOpen(false),
        },
    };
}
