import {
    buildEntriesByKey,
    buildEntriesByKindKey,
    resolveCodexReference,
} from "@/lib/codex/codexRefs";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexStatusInteractionLink = {
    interaction: string;
    entry: CodexEntry;
    label: string;
};

const STATUS_INTERACTIONS_SECTION = "status interactions";
const STATUS_INTERACTION_FACT = "interaction";

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function isStatusEntry(entry: CodexEntry | undefined): entry is CodexEntry {
    return entry?.exportKind.trim().toLowerCase() === "statuses";
}

export function buildStatusInteractionLinks(
    entry: CodexEntry,
    allEntries: readonly CodexEntry[]
): CodexStatusInteractionLink[] {
    if (!isStatusEntry(entry)) return [];

    const referenceIndexes = {
        entriesByKey: buildEntriesByKey(allEntries),
        entriesByKindKey: buildEntriesByKindKey(allEntries),
    };
    const links: CodexStatusInteractionLink[] = [];
    const seen = new Set<string>();

    for (const section of entry.sections ?? []) {
        if (section.title.trim().toLowerCase() !== STATUS_INTERACTIONS_SECTION) continue;

        for (const item of section.items ?? []) {
            const target = resolveCodexReference(item.referenceKey, referenceIndexes);
            if (!isStatusEntry(target)) continue;

            const interactions = (item.facts ?? [])
                .filter((fact) => fact.label.trim().toLowerCase() === STATUS_INTERACTION_FACT)
                .map((fact) => normalize(fact.value))
                .filter(Boolean);

            for (const interaction of interactions) {
                const identity = `${interaction.toLowerCase()}:${target.exportKind}:${target.entryKey}`;
                if (seen.has(identity)) continue;

                seen.add(identity);
                links.push({
                    interaction,
                    entry: target,
                    label: getCodexEntryLabel(target),
                });
            }
        }
    }

    return links;
}
