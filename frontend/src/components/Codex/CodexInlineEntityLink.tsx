import ReactDOM from "react-dom";
import { type FocusEvent, type MouseEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";

import BaseTooltip from "@/components/Tooltips/BaseTooltip";
import {
    getHoverCoordsForElement,
    type PixelTooltipCoords,
} from "@/components/Tooltips/hoverHelpers";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexKindLabel,
    formatCodexMajorFactionText,
    getCodexDescriptionPreviewLine,
    getCodexEntryLabel,
    getCodexRelatedContext,
} from "@/lib/codex/codexPresentation";
import {
    getCodexReadablePreviewLine,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    entry: CodexEntry;
    children: ReactNode;
    onSelect: (entry: CodexEntry) => void;
};

type TooltipCoords = PixelTooltipCoords;

export default function CodexInlineEntityLink({ entry, children, onSelect }: Props) {
    const tooltipId = useId();
    const [tooltipCoords, setTooltipCoords] = useState<TooltipCoords | null>(null);
    const hideTimerRef = useRef<number | null>(null);
    const label = getCodexEntryLabel(entry);
    const tooltipPreview = useMemo(() => getInlineTooltipPreview(entry), [entry]);
    const context = getCodexRelatedContext(entry);
    const kindLabel = formatCodexKindLabel(entry.exportKind);
    const contextLabel = context ? `${kindLabel} · ${context}` : kindLabel;

    const clearHideTimer = () => {
        if (!hideTimerRef.current) return;
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
    };

    useEffect(() => () => {
        if (!hideTimerRef.current) return;
        window.clearTimeout(hideTimerRef.current);
    }, []);

    const showTooltipForElement = (element: HTMLElement) => {
        clearHideTimer();
        setTooltipCoords(getHoverCoordsForElement(element));
    };

    const showMouseTooltip = (event: MouseEvent<HTMLElement>) => {
        showTooltipForElement(event.currentTarget);
    };

    const showFocusTooltip = (event: FocusEvent<HTMLElement>) => {
        showTooltipForElement(event.currentTarget);
    };

    const hideTooltip = () => {
        clearHideTimer();
        setTooltipCoords(null);
    };

    const hideTooltipSoon = () => {
        clearHideTimer();
        hideTimerRef.current = window.setTimeout(() => setTooltipCoords(null), 120);
    };

    const handleSelect = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onSelect(entry);
    };

    const tooltip = tooltipCoords
        ? ReactDOM.createPortal(
            <BaseTooltip coords={tooltipCoords} onMouseEnter={clearHideTimer} onMouseLeave={hideTooltipSoon}>
                <div className="codex-inlineLinkTooltip" id={tooltipId} role="tooltip">
                    <strong>{renderCodexLabel(label)}</strong>
                    <span>{contextLabel}</span>
                    {tooltipPreview ? (
                        <p>{renderDescriptionLine(formatCodexMajorFactionText(tooltipPreview))}</p>
                    ) : null}
                </div>
            </BaseTooltip>,
            document.body
        )
        : null;

    return (
        <>
            <button
                type="button"
                className="codex-inlineEntityLink"
                aria-label={`Open ${label} in Codex`}
                aria-describedby={tooltip ? tooltipId : undefined}
                onClick={handleSelect}
                onMouseEnter={showMouseTooltip}
                onMouseLeave={hideTooltipSoon}
                onFocus={showFocusTooltip}
                onBlur={hideTooltip}
            >
                {children}
            </button>
            {tooltip}
        </>
    );
}

function getInlineTooltipPreview(entry: CodexEntry): string {
    const readablePreview = getCodexReadablePreviewLine(entry);
    if (readablePreview && !isInlineTooltipTaxonomyPreview(entry, readablePreview)) {
        return readablePreview;
    }

    const parsed = parseCodexStructuredDescription(entry);
    for (const section of parsed.sections) {
        const sectionLine = section.lines.find((line) => line.trim().length > 0);
        if (sectionLine) return sectionLine;

        for (const item of section.items ?? []) {
            const itemLine = item.lines.find((line) => line.trim().length > 0);
            if (itemLine) return itemLine;
        }
    }

    return readablePreview || getCodexDescriptionPreviewLine(entry.descriptionLines);
}

function isInlineTooltipTaxonomyPreview(entry: CodexEntry, value: string): boolean {
    const normalizedKind = entry.exportKind.trim().toLowerCase();
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "status") return true;

    if (normalizedKind !== "abilities") return false;

    return [
        "active",
        "combat",
        "mixed",
        "passive",
        "reaction",
        "tactical",
    ].includes(normalizedValue);
}
