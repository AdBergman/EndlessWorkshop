import { normalizeCodexKind } from "@/lib/codex/codexCategoryConfig";
import type { CodexEntry, CodexIdentityRecord } from "@/types/dataTypes";

export type CanonicalCodexIdentityRoute = {
    category: string;
    entry: string;
};

export function getCanonicalCodexIdentityRoute(
    identity: Pick<CodexIdentityRecord, "entryKey" | "routeKind">
): CanonicalCodexIdentityRoute | null {
    const category = normalizeCodexKind(identity.routeKind);
    const entry = identity.entryKey.trim();
    if (!category || !entry) return null;

    return { category, entry };
}

export function codexIdentityHref(
    identity: Pick<CodexIdentityRecord, "entryKey" | "routeKind">
): string {
    const route = getCanonicalCodexIdentityRoute(identity);
    if (!route) return "/codex";

    const params = new URLSearchParams(route);
    return `/codex?${params.toString()}`;
}

export function codexEntryHref(
    entry: Pick<CodexEntry, "entryKey" | "exportKind">
): string {
    return codexIdentityHref({
        entryKey: entry.entryKey,
        routeKind: entry.exportKind,
    });
}
