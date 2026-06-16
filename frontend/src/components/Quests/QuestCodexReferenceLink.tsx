import ReactDOM from "react-dom";
import { type FocusEvent, type MouseEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

import BaseTooltip from "@/components/Tooltips/BaseTooltip";
import {
    getHoverCoordsForElement,
    type PixelTooltipCoords,
} from "@/components/Tooltips/hoverHelpers";
import {
    codexEntryHref,
    resolveQuestCodexReference,
    type QuestCodexReferenceSource,
} from "@/features/quests/questCodexReference";
import {
    formatCodexKindLabel,
    formatCodexMajorFactionText,
    getCodexEntryLabel,
} from "@/lib/codex/codexPresentation";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import { useCodexStore } from "@/stores/codexStore";

type TooltipCoords = PixelTooltipCoords;

export function QuestCodexReferenceLink({
    source,
    children,
    showTooltip = false,
    presentation = "default",
}: {
    source: QuestCodexReferenceSource;
    children: ReactNode;
    showTooltip?: boolean;
    presentation?: "default" | "compactReward";
}) {
    const tooltipId = useId();
    const entriesByKey = useCodexStore((state) => state.entriesByKey);
    const entriesByKindKey = useCodexStore((state) => state.entriesByKindKey);
    const entry = resolveQuestCodexReference(source, { entriesByKey, entriesByKindKey });
    const [tooltipCoords, setTooltipCoords] = useState<TooltipCoords | null>(null);
    const hideTimerRef = useRef<number | null>(null);
    const referenceRef = useRef<HTMLSpanElement | null>(null);
    const tooltipLines = useMemo(
        () => (entry?.descriptionLines ?? [])
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 4),
        [entry?.descriptionLines]
    );

    const stopContainingAction = (event: MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
    };

    const clearHideTimer = () => {
        if (!hideTimerRef.current) return;
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
    };

    const showTooltipForElement = (element: HTMLElement) => {
        if (!showTooltip) return;
        clearHideTimer();
        setTooltipCoords(tooltipCoordsForElement(element));
    };

    const showMouseTooltip = (event: MouseEvent<HTMLElement>) => {
        showTooltipForElement(event.currentTarget);
    };

    const showFocusTooltip = (event: FocusEvent<HTMLElement>) => {
        showTooltipForElement(event.currentTarget);
    };

    const showClickTooltip = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        showTooltipForElement(event.currentTarget);
    };

    const stopPreviewMouseDown = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
    };

    const hideTooltip = () => {
        clearHideTimer();
        setTooltipCoords(null);
    };

    const hideTooltipSoon = () => {
        clearHideTimer();
        hideTimerRef.current = window.setTimeout(() => setTooltipCoords(null), 120);
    };

    useEffect(() => {
        if (!tooltipCoords) return undefined;

        const handlePointerDown = (event: PointerEvent) => {
            if (!(event.target instanceof Node)) return;
            if (referenceRef.current?.contains(event.target)) return;

            const tooltipElement = document.getElementById(tooltipId);
            if (tooltipElement?.contains(event.target)) return;

            hideTooltip();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                hideTooltip();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [tooltipCoords, tooltipId]);

    if (!entry) return <>{children}</>;

    const label = getCodexEntryLabel(entry);
    const textParts = referenceTextParts(source, label);
    const tooltip = showTooltip && tooltipCoords
        ? ReactDOM.createPortal(
            <BaseTooltip coords={tooltipCoords} onMouseEnter={clearHideTimer} onMouseLeave={hideTooltipSoon}>
                <div className="questExplorer-codexTooltip" id={tooltipId} role="tooltip">
                    <strong>{label}</strong>
                    <span>{codexKindLine(entry.exportKind, entry.kind, entry.category)}</span>
                    {tooltipLines.length > 0 ? (
                        <div className="questExplorer-codexTooltipPreview">
                            {tooltipLines.map((line, index) => (
                                <p key={`${entry.entryKey}:preview:${index}`}>
                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                </p>
                            ))}
                        </div>
                    ) : null}
                </div>
            </BaseTooltip>,
            document.body
        )
        : null;

    if (showTooltip) {
        if (presentation === "compactReward") {
            const compactPrimary = textParts.matchedEntity ? textParts.entityText : label;
            const compactKind = compactRewardKindLabel(source, textParts, entry.exportKind, entry.kind);

            return (
                <span
                    className="questExplorer-codexReference questExplorer-codexReference--compactReward"
                    aria-label={source.displayText.trim()}
                    ref={referenceRef}
                >
                    <span className="questExplorer-codexRewardText">
                        <span
                            className="questExplorer-codexPreviewTarget questExplorer-codexRewardTitle"
                            tabIndex={0}
                            aria-describedby={tooltip ? tooltipId : undefined}
                            onMouseEnter={showMouseTooltip}
                            onMouseLeave={hideTooltipSoon}
                            onFocus={showFocusTooltip}
                            onMouseDown={stopPreviewMouseDown}
                            onClick={showClickTooltip}
                            onBlur={hideTooltip}
                        >
                            {compactPrimary}
                        </span>
                        {compactKind ? (
                            <small className="questExplorer-codexRewardKind">{compactKind}</small>
                        ) : null}
                    </span>
                    <a
                        className="questExplorer-codexOpenLink"
                        href={codexEntryHref(entry)}
                        aria-label={`Open ${label} in Codex`}
                        onClick={stopContainingAction}
                        onMouseDown={stopContainingAction}
                        onFocus={showFocusTooltip}
                        onBlur={hideTooltip}
                    >
                        <FaExternalLinkAlt aria-hidden="true" focusable="false" />
                    </a>
                    {tooltip}
                </span>
            );
        }

        return (
            <span
                className="questExplorer-codexReference"
                aria-label={source.displayText.trim()}
                ref={referenceRef}
            >
                {textParts.prefix ? (
                    <span className="questExplorer-codexReferencePrefix">{textParts.prefix}</span>
                ) : null}
                <span
                    className="questExplorer-codexPreviewTarget"
                    tabIndex={0}
                    aria-describedby={tooltip ? tooltipId : undefined}
                    onMouseEnter={showMouseTooltip}
                    onMouseLeave={hideTooltipSoon}
                    onFocus={showFocusTooltip}
                    onMouseDown={stopPreviewMouseDown}
                    onClick={showClickTooltip}
                    onBlur={hideTooltip}
                >
                    {textParts.entityText}
                </span>
                {textParts.suffix ? (
                    <span className="questExplorer-codexReferencePrefix">{textParts.suffix}</span>
                ) : null}
                <a
                    className="questExplorer-codexOpenLink"
                    href={codexEntryHref(entry)}
                    aria-label={`Open ${label} in Codex`}
                    onClick={stopContainingAction}
                    onMouseDown={stopContainingAction}
                    onFocus={showFocusTooltip}
                    onBlur={hideTooltip}
                >
                    <FaExternalLinkAlt aria-hidden="true" focusable="false" />
                </a>
                {tooltip}
            </span>
        );
    }

    return (
        <a
            className="questExplorer-codexMetaLink"
            href={codexEntryHref(entry)}
            title={`Open ${label} in Codex`}
            onClick={stopContainingAction}
            onMouseDown={stopContainingAction}
        >
            {children}
        </a>
    );
}

type ReferenceTextParts = {
    prefix: string | null;
    entityText: string;
    suffix: string | null;
    matchedEntity: boolean;
};

function referenceTextParts(source: QuestCodexReferenceSource, resolvedLabel: string): ReferenceTextParts {
    const displayText = source.displayText.trim();
    const entityLabels = uniqueEntityLabels([
        resolvedLabel,
        source.referenceDisplayName,
        source.assetDisplayName,
    ]);

    for (const entityLabel of entityLabels) {
        const matchIndex = displayText.toLocaleLowerCase().indexOf(entityLabel.toLocaleLowerCase());
        if (matchIndex < 0) continue;

        return {
            prefix: cleanPart(displayText.slice(0, matchIndex)),
            entityText: displayText.slice(matchIndex, matchIndex + entityLabel.length),
            suffix: cleanPart(displayText.slice(matchIndex + entityLabel.length)),
            matchedEntity: true,
        };
    }

    return {
        prefix: null,
        entityText: displayText,
        suffix: null,
        matchedEntity: false,
    };
}

function uniqueEntityLabels(values: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();

    return values.reduce<string[]>((labels, value) => {
        const label = value?.trim() ?? "";
        const key = label.toLocaleLowerCase();
        if (!label || seen.has(key)) return labels;
        seen.add(key);
        labels.push(label);
        return labels;
    }, []);
}

function cleanPart(value: string): string | null {
    const cleaned = value.trim();
    return cleaned || null;
}

function compactRewardKindLabel(
    source: QuestCodexReferenceSource,
    textParts: ReferenceTextParts,
    exportKind: string,
    kind: string | null | undefined
): string {
    const sourceText = source.displayText.trim().toLowerCase();
    const prefix = textParts.prefix?.toLowerCase() ?? "";

    if (/\bequipment\b/.test(sourceText)) return "Equipment";
    if (/\bfaction\s+trait\b/.test(sourceText)) return "Faction Trait";
    if (/\bbonus\b/.test(prefix) || /\bbonus\b/.test(sourceText)) return "Bonus";
    if (/\bconstructible\b/.test(prefix) || /\bconstructible\b/.test(sourceText)) return "Constructible";
    if (/\bpopulation\b/.test(prefix) || /\bpopulation\b/.test(sourceText)) return "Population";
    if (/\bhero\b/.test(prefix) || /\bhero\b/.test(sourceText)) return "Hero";
    if (/\bunit\b/.test(prefix) || /\bunit\b/.test(sourceText)) return "Unit";

    return formatCodexKindLabel(kind?.trim() || exportKind);
}

function tooltipCoordsForElement(element: HTMLElement): TooltipCoords {
    return getHoverCoordsForElement(element);
}

function codexKindLine(exportKind: string, kind: string | null | undefined, category: string | null | undefined): string {
    const details = [kind, category]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));

    return details.length > 0
        ? `${formatCodexKindLabel(exportKind)} · ${details.join(" · ")}`
        : formatCodexKindLabel(exportKind);
}
