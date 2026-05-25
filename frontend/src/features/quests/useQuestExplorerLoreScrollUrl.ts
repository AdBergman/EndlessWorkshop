import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { QuestExplorerMode } from "./questExplorerMode";

export const LORE_SCROLL_ENTRY_QUERY_PARAM = "loreEntry";

type UseQuestExplorerLoreScrollUrlOptions = {
    mode: QuestExplorerMode;
    selectedEntryKey: string | null;
    selectedProgressionKey: string;
    segmentRailEntryKeys: string[];
};

export type QuestExplorerLoreScrollUrlState = {
    scrollActiveRailEntryKey: string | null;
    applyPassiveScroll: (entryKey: string | null) => void;
};

export function useQuestExplorerLoreScrollUrl({
    mode,
    selectedEntryKey,
    selectedProgressionKey,
    segmentRailEntryKeys,
}: UseQuestExplorerLoreScrollUrlOptions): QuestExplorerLoreScrollUrlState {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentLoreEntryParam = searchParams.get(LORE_SCROLL_ENTRY_QUERY_PARAM);
    const segmentRailEntryKeySet = useMemo(
        () => new Set(segmentRailEntryKeys.filter(Boolean)),
        [segmentRailEntryKeys]
    );
    const currentParamIsKnownSegment = Boolean(currentLoreEntryParam && segmentRailEntryKeySet.has(currentLoreEntryParam));
    const [scrollActiveRailEntryKey, setScrollActiveRailEntryKey] = useState<string | null>(null);
    const applyPassiveScroll = useCallback((entryKey: string | null) => {
        setScrollActiveRailEntryKey(entryKey);
    }, []);

    useEffect(() => {
        setScrollActiveRailEntryKey(null);
    }, [mode, selectedProgressionKey]);

    useEffect(() => {
        if (mode !== "lore" || !currentLoreEntryParam || !segmentRailEntryKeySet.has(currentLoreEntryParam)) return;
        setScrollActiveRailEntryKey(currentLoreEntryParam);
    }, [currentLoreEntryParam, mode, segmentRailEntryKeySet]);

    useEffect(() => {
        const nextLoreEntryParam = mode === "lore"
            && scrollActiveRailEntryKey
            && scrollActiveRailEntryKey !== selectedEntryKey
            ? scrollActiveRailEntryKey
            : null;

        if (mode === "lore" && currentParamIsKnownSegment && scrollActiveRailEntryKey === null) return;
        if ((currentLoreEntryParam ?? null) === nextLoreEntryParam) return;

        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            if (nextLoreEntryParam) {
                nextParams.set(LORE_SCROLL_ENTRY_QUERY_PARAM, nextLoreEntryParam);
            } else {
                nextParams.delete(LORE_SCROLL_ENTRY_QUERY_PARAM);
            }
            return nextParams;
        }, { replace: true });
    }, [
        currentLoreEntryParam,
        currentParamIsKnownSegment,
        mode,
        scrollActiveRailEntryKey,
        selectedEntryKey,
        setSearchParams,
    ]);

    return {
        scrollActiveRailEntryKey,
        applyPassiveScroll,
    };
}
