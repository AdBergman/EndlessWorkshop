import type { CodexEntry } from "@/types/dataTypes";
import {
    createCodexQuestGroupEntry,
    parseCodexQuestContext,
    type CodexListItem,
    type CodexQuestVariant,
} from "./codexPresentation";

type GroupOptions = {
    expandedGroupKeys?: ReadonlySet<string>;
};

type PendingGroup = {
    groupKey: string;
    displayName: string;
    groupContext: string;
    variants: Map<string, PendingVariant>;
};

type PendingVariant = {
    variantKey: string;
    variantLabel: string;
    variantContext: string;
    isAlternate: boolean;
    nodes: CodexEntry[];
};

function getVariantSortNumber(variant: Pick<PendingVariant, "isAlternate" | "variantLabel">): number {
    if (!variant.isAlternate) return 0;

    const variantNumber = variant.variantLabel.match(/([0-9]+)$/)?.[1];
    return variantNumber ? Number.parseInt(variantNumber, 10) : Number.MAX_SAFE_INTEGER;
}

export function groupQuestListItems(entries: readonly CodexEntry[], options: GroupOptions = {}): CodexListItem[] {
    const groups = new Map<string, PendingGroup>();
    const entryGroupKeys = new Map<string, string>();

    for (const entry of entries) {
        const context = parseCodexQuestContext(entry);
        if (!context) continue;

        const group = groups.get(context.groupKey) ?? {
            groupKey: context.groupKey,
            displayName: entry.displayName,
            groupContext: context.groupContext,
            variants: new Map<string, PendingVariant>(),
        };

        const variant = group.variants.get(context.variantKey) ?? {
            variantKey: context.variantKey,
            variantLabel: context.variantLabel,
            variantContext: context.variantContext,
            isAlternate: context.isAlternateQuestline,
            nodes: [],
        };

        variant.nodes.push(entry);
        group.variants.set(context.variantKey, variant);
        groups.set(context.groupKey, group);
        entryGroupKeys.set(entry.entryKey, context.groupKey);
    }

    const groupableKeys = new Set(
        Array.from(groups.values())
            .filter((group) => {
                const nodeCount = Array.from(group.variants.values())
                    .reduce((total, variant) => total + variant.nodes.length, 0);
                return nodeCount > 1 || group.variants.size > 1;
            })
            .map((group) => group.groupKey)
    );
    const emittedGroups = new Set<string>();
    return entries.flatMap<CodexListItem>((entry) => {
        const groupKey = entryGroupKeys.get(entry.entryKey);
        if (!groupKey || !groupableKeys.has(groupKey)) {
            return [entry];
        }

        if (emittedGroups.has(groupKey)) {
            return [];
        }

        const group = groups.get(groupKey);
        if (!group) return [entry];

        emittedGroups.add(groupKey);
        const variants = Array.from(group.variants.values())
            .sort((left, right) => {
                if (left.isAlternate !== right.isAlternate) {
                    return left.isAlternate ? 1 : -1;
                }

                return getVariantSortNumber(left) - getVariantSortNumber(right) ||
                    left.variantLabel.localeCompare(right.variantLabel);
            })
            .map<CodexQuestVariant>((variant) => ({
                ...variant,
                nodeCount: variant.nodes.length,
                nodes: [...variant.nodes].sort((left, right) => {
                    const leftContext = parseCodexQuestContext(left);
                    const rightContext = parseCodexQuestContext(right);
                    return (leftContext?.sortKey ?? left.entryKey).localeCompare(rightContext?.sortKey ?? right.entryKey);
                }),
            }));
        const nodes = variants.flatMap((variant) => variant.nodes);
        const isExpanded = Boolean(options.expandedGroupKeys?.has(groupKey));

        return [
            createCodexQuestGroupEntry(group.groupKey, group.displayName, group.groupContext, variants, isExpanded),
        ];
    });
}
