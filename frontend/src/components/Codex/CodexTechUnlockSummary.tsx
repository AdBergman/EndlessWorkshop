import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    formatCodexMajorFactionText,
    stripCodexDescriptionLine,
} from "@/lib/codex/codexPresentation";
import type { CodexTechUnlockSummary as TechUnlockSummary } from "@/lib/codex/codexTechUnlockSummaries";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

type Props = {
    summary: TechUnlockSummary;
    onSelect: (entry: TechUnlockSummary["target"]) => void;
};

export default function CodexTechUnlockSummary({ summary, onSelect }: Props) {
    const kindLabel = formatCodexKindLabel(summary.target.exportKind);
    const accessibilityLabel = [
        summary.label,
        summary.metadata,
        stripCodexDescriptionLine(summary.previewLine),
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className="codex-unlockTarget"
            aria-label={accessibilityLabel}
            onClick={() => onSelect(summary.target)}
        >
            <CodexEntryIcon
                entry={summary.target}
                label={kindLabel}
                className="codex-kindIcon codex-kindIcon--unlockTarget"
                size={16}
            />
            <span className="codex-unlockTarget__copy">
                <span className="codex-unlockTarget__name">
                    {renderCodexLabel(summary.label)}
                </span>
                {summary.metadata ? (
                    <>
                        <span className="codex-unlockTarget__separator">·</span>
                        <span className="codex-unlockTarget__meta">{summary.metadata}</span>
                    </>
                ) : null}
                {summary.previewLine ? (
                    <>
                        <span className="codex-unlockTarget__separator">·</span>
                        <span className="codex-unlockTarget__preview">
                            {renderDescriptionLine(formatCodexMajorFactionText(summary.previewLine))}
                        </span>
                    </>
                ) : null}
            </span>
        </button>
    );
}
