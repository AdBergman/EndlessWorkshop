import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexAbilityInlineLinkCandidate = {
    entry: CodexEntry;
    labels: string[];
};

export type CodexAbilityInlineLinkMatch = {
    candidate: CodexAbilityInlineLinkCandidate;
    label: string;
    index: number;
};

function normalizeInlineLinkLabel(value: string): string {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isWordCharacter(value: string): boolean {
    return /[A-Za-z0-9]/.test(value);
}

function hasSafeLabelBoundary(line: string, index: number, label: string): boolean {
    const before = index > 0 ? line[index - 1] : "";
    const afterIndex = index + label.length;
    const after = afterIndex < line.length ? line[afterIndex] : "";

    return (!before || !isWordCharacter(before)) && (!after || !isWordCharacter(after));
}

export function buildAbilityInlineLinkCandidates(
    entry: CodexEntry,
    relatedEntries: CodexEntry[]
): CodexAbilityInlineLinkCandidate[] {
    if (entry.exportKind.trim().toLowerCase() !== "abilities") return [];

    return relatedEntries
        .filter((relatedEntry) => relatedEntry.exportKind.trim().toLowerCase() === "statuses")
        .map((relatedEntry) => {
            const labels = [getCodexEntryLabel(relatedEntry), relatedEntry.displayName]
                .map((label) => label.trim())
                .filter(Boolean);
            const uniqueLabels = Array.from(new Set(labels.map(normalizeInlineLinkLabel)))
                .map((key) => labels.find((label) => normalizeInlineLinkLabel(label) === key))
                .filter((label): label is string => Boolean(label))
                .sort((left, right) => right.length - left.length);

            return { entry: relatedEntry, labels: uniqueLabels };
        })
        .filter((candidate) => candidate.labels.length > 0);
}

export function findAbilityInlineLinkMatch(
    line: string,
    candidates: CodexAbilityInlineLinkCandidate[]
): CodexAbilityInlineLinkMatch | null {
    const normalizedLine = line.toLowerCase();
    const labelMatches = candidates.flatMap((candidate) =>
        candidate.labels.map((label) => ({ candidate, label }))
    ).sort((left, right) => right.label.length - left.label.length);
    let bestMatch: CodexAbilityInlineLinkMatch | null = null;

    for (const { candidate, label } of labelMatches) {
        const normalizedLabel = label.toLowerCase();
        let searchStart = 0;

        while (searchStart < normalizedLine.length) {
            const index = normalizedLine.indexOf(normalizedLabel, searchStart);
            if (index < 0) break;

            if (hasSafeLabelBoundary(line, index, label)) {
                if (
                    !bestMatch ||
                    index < bestMatch.index ||
                    (index === bestMatch.index && label.length > bestMatch.label.length)
                ) {
                    bestMatch = { candidate, label, index };
                }
                break;
            }

            searchStart = index + normalizedLabel.length;
        }
    }

    return bestMatch;
}
