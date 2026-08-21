import { useId } from "react";
import { useCodexReferenceTarget } from "@/hooks/useCodexReferenceTarget";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import type { CodexIdentityRecord } from "@/types/dataTypes";
import { CodexKindIcon } from "@/features/icons/CodexKindIcon";
import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";
import type { CodexRelatedTarget } from "@/lib/codex/codexRefs";

type Props = {
    targets: CodexRelatedTarget[];
    onSelect: (identity: CodexIdentityRecord) => void;
    priorityMode?: "default" | "faction";
    headingLabel?: string;
    loading?: boolean;
};

type RelatedEntryGroup = {
    kind: string;
    label: string;
    targets: CodexRelatedTarget[];
};

const FACTION_RELATED_KIND_ORDER = [
    "traits",
    "units",
    "tech",
    "districts",
    "heroes",
    "populations",
];

function groupRelatedEntries(targets: CodexRelatedTarget[], priorityMode: Props["priorityMode"]): RelatedEntryGroup[] {
    const groups = new Map<string, RelatedEntryGroup>();

    targets.forEach((target) => {
        const kind = target.identity.routeKind.trim().toLowerCase() || "unknown";
        const existing = groups.get(kind);

        if (existing) {
            existing.targets.push(target);
            return;
        }

        groups.set(kind, {
            kind,
            label: formatCodexKindLabel(kind),
            targets: [target],
        });
    });

    return Array.from(groups.values()).sort((left, right) => {
        if (priorityMode === "faction") {
            const leftPriority = FACTION_RELATED_KIND_ORDER.indexOf(left.kind);
            const rightPriority = FACTION_RELATED_KIND_ORDER.indexOf(right.kind);
            const leftRank = leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority;
            const rightRank = rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority;

            if (leftRank !== rightRank) return leftRank - rightRank;
        }

        return left.label.localeCompare(right.label);
    });
}

export default function RelatedEntries({
    targets,
    onSelect,
    priorityMode = "default",
    headingLabel = "Related entries",
    loading = false,
}: Props) {
    const headingId = useId();

    if (targets.length === 0 && !loading) {
        return null;
    }

    const groups = groupRelatedEntries(targets, priorityMode);

    return (
        <section className="codex-related" aria-labelledby={headingId}>
            <div className="codex-sectionLabel" id={headingId}>
                {headingLabel}
            </div>

            {loading ? (
                <p className="codex-related__loading" aria-live="polite">
                    Loading linked encyclopedia entries…
                </p>
            ) : null}

            {groups.length > 0 ? <div className="codex-related__groups">
                {groups.map((group) => (
                    <div className="codex-related__group" key={group.kind}>
                        <div className="codex-related__groupHeader">
                            <span className="codex-related__groupLabel">
                                <CodexKindIcon
                                    kind={group.kind}
                                    label={group.label}
                                    className="codex-kindIcon codex-kindIcon--relatedGroup"
                                    size={16}
                                />
                                <span>{group.label}</span>
                            </span>
                            <span>{group.targets.length}</span>
                        </div>

                        <div className="codex-related__list">
                            {group.targets.map((target) => (
                                <RelatedEntryTarget
                                    key={`${target.identity.routeKind}:${target.identity.entryKey}`}
                                    target={target}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div> : null}
        </section>
    );
}

function RelatedEntryTarget({
    target,
    onSelect,
}: {
    target: CodexRelatedTarget;
    onSelect: (identity: CodexIdentityRecord) => void;
}) {
    const hydratedTarget = useCodexReferenceTarget(target.identity);
    const entry = hydratedTarget.entry ?? target.entry;
    const entryLabel = getCodexEntryLabel(target.identity);
    const kindLabel = formatCodexKindLabel(target.identity.routeKind);
    const relatedContext = entry ? getCodexRelatedContext(entry) : "";
    const contextLabel = relatedContext.startsWith("Quest ·")
        ? relatedContext
        : relatedContext
            ? `${kindLabel} / ${relatedContext}`
            : kindLabel;
    const previewLine = entry
        ? getCodexReadablePreviewLine(entry) || getCodexDescriptionPreviewLine(entry.descriptionLines)
        : "";
    const accessibilityLabel = [entryLabel, contextLabel, previewLine]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            className="codex-related__chip"
            aria-label={accessibilityLabel}
            onClick={() => onSelect(target.identity)}
            onMouseEnter={hydratedTarget.hydrate}
            onFocus={hydratedTarget.hydrate}
        >
            {entry ? (
                <CodexEntryIcon
                    entry={entry}
                    label={kindLabel}
                    className="codex-kindIcon codex-kindIcon--relatedChip"
                    size={16}
                />
            ) : (
                <CodexKindIcon
                    kind={target.identity.routeKind}
                    label={kindLabel}
                    className="codex-kindIcon codex-kindIcon--relatedChip"
                    size={16}
                />
            )}
            <span className="codex-related__copy">
                <span className="codex-related__name">{renderCodexLabel(entryLabel)}</span>
                <span className="codex-related__kind">{contextLabel}</span>
                {previewLine ? (
                    <span className="codex-related__preview">{previewLine}</span>
                ) : null}
            </span>
        </button>
    );
}
