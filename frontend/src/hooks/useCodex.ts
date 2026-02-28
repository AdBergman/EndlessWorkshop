import { useGameData } from "@/context/GameDataContext";
import type { Codex } from "@/types/dataTypes";

function trimToNull(s: string | null | undefined): string | null {
    const t = (s ?? "").trim();
    return t.length ? t : null;
}

export function useCodex() {
    const { codexByKindKey } = useGameData();

    // Raw lookup (no filtering)
    const getEntry = (exportKind: string, entryKey: string): Codex | undefined => {
        if (!exportKind || !entryKey) return undefined;
        return codexByKindKey.get(exportKind)?.get(entryKey);
    };

    // Opinionated lookup: must resolve AND have a non-blank displayName
    const getVisibleEntry = (exportKind: string, entryKey: string): Codex | undefined => {
        const e = getEntry(exportKind, entryKey);
        if (!e) return undefined;

        const name = trimToNull(e.displayName);
        if (!name) return undefined;

        // Return the original object (keeps Codex type intact)
        return e;
    };

    const getVisibleLabel = (exportKind: string, entryKey: string): string | null => {
        const e = getEntry(exportKind, entryKey);
        if (!e) return null;
        return trimToNull(e.displayName);
    };

    const getTooltipLines = (exportKind: string, entryKey: string): string[] => {
        const e = getVisibleEntry(exportKind, entryKey);
        if (!e) return [];
        return (e.descriptionLines ?? [])
            .map((x) => (x ?? "").trim())
            .filter((x) => x.length > 0);
    };

    return {
        getEntry,
        getVisibleEntry,
        getVisibleLabel,
        getTooltipLines,
    };
}