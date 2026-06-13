import { CodexEntryIcon } from "@/features/icons/CodexEntryIcon";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    formatCodexMajorFactionText,
    stripCodexDescriptionLine,
} from "@/lib/codex/codexPresentation";
import type { CodexGrantedAbilityPreview as GrantedAbilityPreview } from "@/lib/codex/codexGrantedAbilityPreviews";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

type Props = {
    preview: GrantedAbilityPreview;
    onSelect: (entry: GrantedAbilityPreview["ability"]) => void;
};

export default function CodexGrantedAbilityPreview({ preview, onSelect }: Props) {
    const kindLabel = formatCodexKindLabel(preview.ability.exportKind);
    const accessibilityLabel = [
        preview.label,
        preview.metadata,
        stripCodexDescriptionLine(preview.effectLine),
    ].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className="codex-grantedAbilityPreview"
            aria-label={accessibilityLabel}
            onClick={() => onSelect(preview.ability)}
        >
            <CodexEntryIcon
                entry={preview.ability}
                label={kindLabel}
                className="codex-kindIcon codex-kindIcon--grantedAbility"
                size={18}
            />
            <span className="codex-grantedAbilityPreview__copy">
                <span className="codex-grantedAbilityPreview__header">
                    <span className="codex-grantedAbilityPreview__name">
                        {renderCodexLabel(preview.label)}
                    </span>
                    {preview.metadata ? (
                        <span className="codex-grantedAbilityPreview__meta">{preview.metadata}</span>
                    ) : null}
                </span>
                {preview.effectLine ? (
                    <span className="codex-grantedAbilityPreview__effect">
                        {renderDescriptionLine(formatCodexMajorFactionText(preview.effectLine))}
                    </span>
                ) : null}
            </span>
        </button>
    );
}
