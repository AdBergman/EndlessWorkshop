import { useCallback } from "react";

import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry, CodexIdentityRecord } from "@/types/dataTypes";

export type CodexReferencePreviewStatus = "idle" | "loading" | "ready" | "error" | "missing";

export function useCodexReferenceTarget(identity: CodexIdentityRecord | null | undefined): {
    entry: CodexEntry | undefined;
    previewStatus: CodexReferencePreviewStatus;
    error: string | null;
    hydrate: () => void;
} {
    const routeKind = identity?.routeKind.trim().toLowerCase() ?? "";
    const entryKey = identity?.entryKey.trim() ?? "";
    const entry = useCodexStore((state) => (
        routeKind && entryKey ? state.entriesByKindKey[routeKind]?.[entryKey] : undefined
    ));
    const categoryLoadState = useCodexStore((state) => (
        routeKind ? state.categoryLoadStates[routeKind] ?? "idle" : "idle"
    ));
    const categoryError = useCodexStore((state) => (
        routeKind ? state.categoryErrors[routeKind] ?? null : null
    ));
    const fullLoaded = useCodexStore((state) => state.fullLoaded);
    const loadCategory = useCodexStore((state) => state.loadCategory);

    const hydrate = useCallback(() => {
        if (!routeKind || !entryKey || entry || fullLoaded || categoryLoadState === "loaded") return;
        void loadCategory(routeKind);
    }, [categoryLoadState, entry, entryKey, fullLoaded, loadCategory, routeKind]);

    let previewStatus: CodexReferencePreviewStatus = "idle";
    if (entry) {
        previewStatus = "ready";
    } else if (categoryLoadState === "loading") {
        previewStatus = "loading";
    } else if (categoryLoadState === "error") {
        previewStatus = "error";
    } else if (fullLoaded || categoryLoadState === "loaded") {
        previewStatus = "missing";
    }

    return {
        entry,
        previewStatus,
        error: categoryError,
        hydrate,
    };
}
