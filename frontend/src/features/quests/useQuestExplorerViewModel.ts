import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    buildQuestArchiveModel,
    defaultQuestArchiveFilters,
    type QuestArchiveFilters,
    type QuestArchiveModel,
} from "./questArchiveModel";
import {
    selectQuestError,
    selectQuestLoaded,
    selectQuestLoading,
    selectQuests,
    useQuestStore,
} from "@/stores/questStore";
import { buildQuestExplorerViewModel } from "./questViewModel";
import type {
    QuestExplorerContentModel,
    QuestExplorerSelection,
    QuestExplorerStatus,
} from "./questExplorerTypes";

type QuestExplorerActions = {
    selectQuest: (questKey: string) => void;
    selectChoice: (choiceKey: string) => void;
    selectStep: (stepIndex: number) => void;
    updateArchiveFilters: (filters: Partial<QuestArchiveFilters>) => void;
    clearArchiveFilters: () => void;
};

export type QuestExplorerViewModel = Omit<QuestExplorerContentModel, "status"> & {
    status: QuestExplorerStatus;
    error: string | null;
    archive: QuestArchiveModel;
    actions: QuestExplorerActions;
};

const clean = (value: string | null | undefined): string | null => {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
};

const areArchiveFiltersEqual = (left: QuestArchiveFilters, right: QuestArchiveFilters): boolean =>
    left.searchText === right.searchText &&
    left.faction === right.faction &&
    left.category === right.category &&
    left.chapter === right.chapter &&
    left.branchVariant === right.branchVariant;

export function useQuestExplorerViewModel(): QuestExplorerViewModel {
    const quests = useQuestStore(selectQuests);
    const loading = useQuestStore(selectQuestLoading);
    const loaded = useQuestStore(selectQuestLoaded);
    const error = useQuestStore(selectQuestError);
    const loadQuestExplorer = useQuestStore((state) => state.loadQuestExplorer);
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedQuestKey = clean(searchParams.get("quest"));
    const [localSelection, setLocalSelection] = useState<Omit<QuestExplorerSelection, "questKey">>({
        choiceKey: null,
        stepIndex: null,
    });
    const [archiveFilters, setArchiveFilters] = useState<QuestArchiveFilters>({
        ...defaultQuestArchiveFilters,
    });

    useEffect(() => {
        void loadQuestExplorer();
    }, [loadQuestExplorer]);

    const content = useMemo(
        () =>
            buildQuestExplorerViewModel({
                quests,
                selection: {
                    questKey: requestedQuestKey,
                    choiceKey: localSelection.choiceKey,
                    stepIndex: localSelection.stepIndex,
                },
            }),
        [localSelection.choiceKey, localSelection.stepIndex, quests, requestedQuestKey]
    );

    const selectedQuestKey = content.selection.questKey;
    const archive = useMemo(
        () =>
            buildQuestArchiveModel({
                quests,
                selectedQuestKey,
                filters: archiveFilters,
            }),
        [archiveFilters, quests, selectedQuestKey]
    );

    useEffect(() => {
        if (areArchiveFiltersEqual(archiveFilters, archive.filters)) return;
        setArchiveFilters(archive.filters);
    }, [archive.filters, archiveFilters]);

    useEffect(() => {
        if (!loaded || content.status !== "ready" || !selectedQuestKey) return;
        if (requestedQuestKey === selectedQuestKey) return;

        setSearchParams(
            (currentParams) => {
                const nextParams = new URLSearchParams(currentParams);
                nextParams.set("quest", selectedQuestKey);
                return nextParams;
            },
            { replace: true }
        );
    }, [content.status, loaded, requestedQuestKey, selectedQuestKey, setSearchParams]);

    const selectQuest = useCallback(
        (questKey: string) => {
            const normalizedQuestKey = clean(questKey);
            if (!normalizedQuestKey) return;

            setLocalSelection({
                choiceKey: null,
                stepIndex: null,
            });
            setSearchParams(
                (currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);
                    nextParams.set("quest", normalizedQuestKey);
                    return nextParams;
                },
                { replace: false }
            );
        },
        [setSearchParams]
    );

    const selectChoice = useCallback((choiceKey: string) => {
        const normalizedChoiceKey = clean(choiceKey);
        if (!normalizedChoiceKey) return;

        setLocalSelection({
            choiceKey: normalizedChoiceKey,
            stepIndex: null,
        });
    }, []);

    const selectStep = useCallback((stepIndex: number) => {
        if (!Number.isFinite(stepIndex)) return;

        setLocalSelection((currentSelection) => ({
            ...currentSelection,
            stepIndex,
        }));
    }, []);

    const updateArchiveFilters = useCallback((filters: Partial<QuestArchiveFilters>) => {
        setArchiveFilters((currentFilters) => ({
            ...currentFilters,
            ...filters,
        }));
    }, []);

    const clearArchiveFilters = useCallback(() => {
        setArchiveFilters({ ...defaultQuestArchiveFilters });
    }, []);

    const status: QuestExplorerStatus = (() => {
        if (error) return "error";
        if (!loaded) return "loading";
        if (loading && content.status === "empty") return "loading";
        return content.status;
    })();

    return {
        ...content,
        rail: archive.rail,
        status,
        error,
        archive,
        actions: {
            selectQuest,
            selectChoice,
            selectStep,
            updateArchiveFilters,
            clearArchiveFilters,
        },
    };
}
