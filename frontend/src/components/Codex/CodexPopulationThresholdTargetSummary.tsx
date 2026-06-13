import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    formatCodexMajorFactionText,
    stripCodexDescriptionLine,
} from "@/lib/codex/codexPresentation";
import type { CodexPopulationThresholdTargetSummary as ThresholdTargetSummary } from "@/lib/codex/codexPopulationThresholdTargets";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

type Props = {
    summary: ThresholdTargetSummary;
    onSelect: (entry: ThresholdTargetSummary["target"]) => void;
};

export default function CodexPopulationThresholdTargetSummary({ summary, onSelect }: Props) {
    const kindLabel = formatCodexKindLabel(summary.target.exportKind);
    const accessibilityLabel = [
        summary.label,
        summary.metadata,
        stripCodexDescriptionLine(summary.previewLine),
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className="codex-thresholdTarget"
            aria-label={accessibilityLabel}
            onClick={() => onSelect(summary.target)}
        >
            <CodexEntryIcon
                entry={summary.target}
                label={kindLabel}
                className="codex-kindIcon codex-kindIcon--thresholdTarget"
                size={16}
            />
            <span className="codex-thresholdTarget__copy">
                <span className="codex-thresholdTarget__name">
                    {renderCodexLabel(summary.label)}
                </span>
                {summary.metadata ? (
                    <>
                        <span className="codex-thresholdTarget__separator">·</span>
                        <span className="codex-thresholdTarget__meta">{summary.metadata}</span>
                    </>
                ) : null}
                {summary.previewLine ? (
                    <>
                        <span className="codex-thresholdTarget__separator">·</span>
                        <span className="codex-thresholdTarget__preview">
                            {renderDescriptionLine(formatCodexMajorFactionText(summary.previewLine))}
                        </span>
                    </>
                ) : null}
            </span>
        </button>
    );
}
