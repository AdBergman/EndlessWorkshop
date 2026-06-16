import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexMajorFactionText,
    stripCodexDescriptionLine,
} from "@/lib/codex/codexPresentation";
import type { CodexTreatyStatusSummary as TreatyStatusSummary } from "@/lib/codex/codexTreatyStatusSummaries";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

type Props = {
    summary: TreatyStatusSummary;
    onSelect: (entry: TreatyStatusSummary["target"]) => void;
};

export default function CodexTreatyStatusSummary({ summary, onSelect }: Props) {
    const accessibilityLabel = [
        summary.label,
        summary.metadata,
        stripCodexDescriptionLine(summary.previewLine),
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className="codex-statusTarget"
            aria-label={accessibilityLabel}
            onClick={() => onSelect(summary.target)}
        >
            <CodexEntryIcon
                entry={summary.target}
                label="Status"
                className="codex-kindIcon codex-kindIcon--statusTarget"
                size={16}
            />
            <span className="codex-statusTarget__copy">
                <span className="codex-statusTarget__name">
                    {renderCodexLabel(summary.label)}
                </span>
                {summary.metadata ? (
                    <>
                        <span className="codex-statusTarget__separator">·</span>
                        <span className="codex-statusTarget__meta">{summary.metadata}</span>
                    </>
                ) : null}
                {summary.previewLine ? (
                    <>
                        <span className="codex-statusTarget__separator">·</span>
                        <span className="codex-statusTarget__preview">
                            {renderDescriptionLine(formatCodexMajorFactionText(summary.previewLine))}
                        </span>
                    </>
                ) : null}
            </span>
        </button>
    );
}
