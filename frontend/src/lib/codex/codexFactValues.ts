import type { CodexEntry } from "@/types/dataTypes";

export function getCodexFactValues(entry: Pick<CodexEntry, "facts">, label: string): string[] {
    const exactLabel = label.trim();
    if (!exactLabel) return [];

    return (entry.facts ?? [])
        .filter((fact) => fact.label?.trim() === exactLabel)
        .map((fact) => fact.value?.trim() ?? "")
        .filter(Boolean);
}

export function entryHasCodexFactValue(
    entry: Pick<CodexEntry, "facts">,
    label: string,
    value: string
): boolean {
    const exactValue = value.trim();
    if (!exactValue) return false;

    return getCodexFactValues(entry, label).some((factValue) => factValue === exactValue);
}
