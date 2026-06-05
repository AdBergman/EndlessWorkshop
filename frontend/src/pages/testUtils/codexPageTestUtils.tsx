import { useLocation, useNavigate } from "react-router-dom";
import { buildEntriesByKey } from "@/lib/codex/codexRefs";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";

export function LocationProbe() {
    const location = useLocation();

    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

export function BackButton() {
    const navigate = useNavigate();

    return <button type="button" onClick={() => navigate(-1)}>Back</button>;
}

function entriesByKind(entries: CodexEntry[]): Record<string, CodexEntry[]> {
    return entries.reduce<Record<string, CodexEntry[]>>((acc, entry) => {
        const kind = entry.exportKind.trim().toLowerCase();
        acc[kind] = [...(acc[kind] ?? []), entry];
        return acc;
    }, {});
}

export const defaultCodexEntries: CodexEntry[] = [
    {
        exportKind: "districts",
        entryKey: "District_MarketSquare",
        displayName: "[DustColored] Market Square",
        descriptionLines: ["Centralized trade district."],
        referenceKeys: ["Improvement_AuricCoral"],
    },
    {
        exportKind: "districts",
        entryKey: "District_BloomHarbor",
        displayName: "Bloom Harbor",
        descriptionLines: ["Supports blossom logistics."],
        referenceKeys: [],
    },
    {
        exportKind: "improvements",
        entryKey: "Improvement_AuricCoral",
        displayName: "[LuxuryResource01] Auric Coral",
        descriptionLines: ["Rare sea harvest."],
        referenceKeys: [],
    },
];

export function seedDefaultCodexStore(entries: CodexEntry[] = defaultCodexEntries) {
    useCodexStore.setState({
        entries,
        entriesByKey: buildEntriesByKey(entries),
        entriesByKind: entriesByKind(entries),
        loading: false,
        error: null,
    });
}
