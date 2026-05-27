import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    const latestContextRef = useRef({ mode, selectedEntryKey, selectedProgressionKey });
    const suppressNextUrlSyncRef = useRef(false);
    latestContextRef.current = { mode, selectedEntryKey, selectedProgressionKey };
    const applyPassiveScroll = useCallback((entryKey: string | null) => {
        if (entryKey === null) suppressNextUrlSyncRef.current = true;
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
        if (suppressNextUrlSyncRef.current) {
            if (scrollActiveRailEntryKey === null) suppressNextUrlSyncRef.current = false;
            return;
        }

        const latestContext = latestContextRef.current;
        if (
            latestContext.mode !== mode
            || latestContext.selectedEntryKey !== selectedEntryKey
            || latestContext.selectedProgressionKey !== selectedProgressionKey
        ) {
            return;
        }

        const nextLoreEntryParam = mode === "lore"
            && scrollActiveRailEntryKey
            && segmentRailEntryKeySet.has(scrollActiveRailEntryKey)
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
        segmentRailEntryKeySet,
        scrollActiveRailEntryKey,
        selectedEntryKey,
        selectedProgressionKey,
        setSearchParams,
    ]);

    return {
        scrollActiveRailEntryKey,
        applyPassiveScroll,
    };
}
