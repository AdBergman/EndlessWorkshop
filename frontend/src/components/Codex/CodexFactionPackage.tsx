import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { CodexKindIcon } from "@/features/icons/CodexKindIcon";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import type { CodexFactionPackageGroup } from "@/lib/codex/codexFactionPackage";
import {
    formatCodexKindLabel,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import { getCodexReadablePreviewLine } from "@/lib/codex/codexStructuredDescription";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    groups: CodexFactionPackageGroup[];
    onSelectEntry: (entry: CodexEntry) => void;
};

function getContextLabel(entry: CodexEntry): string {
    const kindLabel = formatCodexKindLabel(entry.exportKind);
    const relatedContext = getCodexRelatedContext(entry);

    if (relatedContext.startsWith("Quest ·")) return relatedContext;
    return relatedContext ? `${kindLabel} / ${relatedContext}` : kindLabel;
}

export default function CodexFactionPackage({ groups, onSelectEntry }: Props) {
    if (groups.length === 0) {
        return null;
    }

    return (
        <section className="codex-factionPackage" aria-labelledby="codex-faction-package-heading">
            <div className="codex-sectionLabel" id="codex-faction-package-heading">
                Faction package
            </div>

            <div className="codex-factionPackage__groups">
                {groups.map((group) => (
                    <div className="codex-factionPackage__group" key={group.id}>
                        <div className="codex-factionPackage__groupHeader">
                            <span className="codex-factionPackage__groupLabel">
                                <CodexKindIcon
                                    kind={group.id}
                                    label={group.label}
                                    className="codex-kindIcon codex-kindIcon--factionPackage"
                                    size={16}
                                />
                                <span>{group.label}</span>
                            </span>
                            <span>{group.totalCount}</span>
                        </div>

                        <div className="codex-factionPackage__list">
                            {group.visibleEntries.map((entry) => {
                                const entryLabel = getCodexEntryLabel(entry);
                                const kindLabel = formatCodexKindLabel(entry.exportKind);
                                const contextLabel = getContextLabel(entry);
                                const previewLine = getCodexReadablePreviewLine(entry) ||
                                    getCodexDescriptionPreviewLine(entry.descriptionLines);
                                const accessibilityLabel = [entryLabel, contextLabel, previewLine]
                                    .filter(Boolean)
                                    .join(" ");

                                return (
                                    <button
                                        key={entry.entryKey}
                                        type="button"
                                        className="codex-factionPackage__item"
                                        aria-label={accessibilityLabel}
                                        onClick={() => onSelectEntry(entry)}
                                    >
                                        <CodexEntryIcon
                                            entry={entry}
                                            label={kindLabel}
                                            className="codex-kindIcon codex-kindIcon--factionPackageItem"
                                            size={16}
                                        />
                                        <span className="codex-factionPackage__copy">
                                            <span className="codex-factionPackage__name">
                                                {renderCodexLabel(entryLabel)}
                                            </span>
                                            <span className="codex-factionPackage__kind">
                                                {contextLabel}
                                            </span>
                                            {previewLine ? (
                                                <span className="codex-factionPackage__preview">
                                                    {renderDescriptionLine(previewLine)}
                                                </span>
                                            ) : null}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {group.totalCount > group.visibleEntries.length ? (
                            <div className="codex-factionPackage__more">
                                Showing {group.visibleEntries.length} of {group.totalCount} exact refs
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    );
}
