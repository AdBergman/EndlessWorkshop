import { Fragment, type ReactNode, useMemo } from "react";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import { formatCodexMajorFactionText } from "@/lib/codex/codexPresentation";
import {
    buildAbilityInlineLinkCandidates,
    findAbilityInlineLinkMatch,
    type CodexAbilityInlineLinkCandidate,
} from "@/lib/codex/codexAbilityInlineLinks";
import {
    buildUnitGrantedAbilityPreview,
    isUnitGrantedAbilitiesSection,
} from "@/lib/codex/codexUnitGrantedAbilities";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import type { CodexStructuredSectionItem } from "@/lib/codex/codexStructuredDescription";
import CodexInlineEntityLink from "./CodexInlineEntityLink";
import CodexUnitGrantedAbilityPreview from "./CodexUnitGrantedAbilityPreview";

type Props = {
    entry: CodexEntry;
    relatedEntries?: CodexEntry[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
};

function renderLineWithInlineLinks(
    line: string,
    candidates: CodexAbilityInlineLinkCandidate[],
    onSelectInlineEntry: ((entry: CodexEntry) => void) | undefined,
    keyPrefix: string
): ReactNode {
    if (!onSelectInlineEntry || candidates.length === 0) {
        return renderDescriptionLine(formatCodexMajorFactionText(line));
    }

    const nodes: ReactNode[] = [];
    let remaining = line;
    let offset = 0;
    let linkIndex = 0;

    while (remaining.length > 0) {
        const match = findAbilityInlineLinkMatch(remaining, candidates);
        if (!match) {
            nodes.push(
                <Fragment key={`${keyPrefix}-text-${offset}`}>
                    {renderDescriptionLine(formatCodexMajorFactionText(remaining))}
                </Fragment>
            );
            break;
        }

        const before = remaining.slice(0, match.index);
        const linkedText = remaining.slice(match.index, match.index + match.label.length);
        if (before) {
            nodes.push(
                <Fragment key={`${keyPrefix}-text-${offset}`}>
                    {renderDescriptionLine(formatCodexMajorFactionText(before))}
                </Fragment>
            );
        }

        nodes.push(
            <CodexInlineEntityLink
                key={`${keyPrefix}-inline-${offset + match.index}-${linkIndex}`}
                entry={match.candidate.entry}
                onSelect={onSelectInlineEntry}
            >
                {renderDescriptionLine(formatCodexMajorFactionText(linkedText))}
            </CodexInlineEntityLink>
        );

        const nextIndex = match.index + match.label.length;
        remaining = remaining.slice(nextIndex);
        offset += nextIndex;
        linkIndex += 1;
    }

    return nodes;
}

function RenderLine({
    line,
    className,
    inlineLinkCandidates = [],
    onSelectInlineEntry,
    lineKey,
}: {
    line: string;
    className: string;
    inlineLinkCandidates?: CodexAbilityInlineLinkCandidate[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
    lineKey: string;
}) {
    return (
        <p className={className}>
            {renderLineWithInlineLinks(line, inlineLinkCandidates, onSelectInlineEntry, lineKey)}
        </p>
    );
}

function StructuredSectionItem({
    item,
    inlineLinkCandidates,
    onSelectInlineEntry,
    entry,
    sectionLabel,
    relatedEntries,
}: {
    item: CodexStructuredSectionItem;
    inlineLinkCandidates: CodexAbilityInlineLinkCandidate[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
    entry: CodexEntry;
    sectionLabel: string;
    relatedEntries: CodexEntry[];
}) {
    const grantedAbilityPreview = isUnitGrantedAbilitiesSection(entry, sectionLabel)
        ? buildUnitGrantedAbilityPreview(item, relatedEntries)
        : null;

    if (grantedAbilityPreview && onSelectInlineEntry) {
        return (
            <CodexUnitGrantedAbilityPreview
                preview={grantedAbilityPreview}
                onSelect={onSelectInlineEntry}
            />
        );
    }

    return (
        <article className="codex-structuredItem">
            <h4 className="codex-structuredItem__heading">{item.label}</h4>

            {item.facts.length > 0 ? (
                <dl className="codex-structuredItemFacts">
                    {item.facts.map((fact) => (
                        <div className="codex-structuredItemFact" key={`${item.label}-${fact.label}-${fact.value}`}>
                            <dt>{fact.label}</dt>
                            <dd>{renderDescriptionLine(formatCodexMajorFactionText(fact.value))}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {item.lines.length > 0 ? (
                <div className="codex-structuredItem__lines">
                    {item.lines.map((line, index) => (
                        <RenderLine
                            key={`${item.label}-line-${index}`}
                            line={line}
                            className="codex-structuredItem__line"
                            inlineLinkCandidates={inlineLinkCandidates}
                            onSelectInlineEntry={onSelectInlineEntry}
                            lineKey={`${item.label}-line-${index}`}
                        />
                    ))}
                </div>
            ) : null}
        </article>
    );
}

function sectionHeadingFor(kind: string): string {
    switch (kind.trim().toLowerCase()) {
        case "actions":
            return "Action dossier";
        case "bonuses":
            return "Bonus dossier";
        case "councilors":
            return "Councilor dossier";
        case "diplomatictreaties":
            return "Diplomatic treaty dossier";
        case "equipment":
            return "Equipment dossier";
        case "heroes":
            return "Hero dossier";
        case "minorfactions":
            return "Minor faction dossier";
        case "populations":
            return "Population dossier";
        case "modifiers":
            return "Modifier dossier";
        case "statuses":
            return "Status dossier";
        case "traits":
            return "Trait dossier";
        default:
            return "Description";
    }
}

function emptyMessageFor(kind: string): string {
    switch (kind.trim().toLowerCase()) {
        case "actions":
            return "No public gameplay summary has been added for this action yet.";
        case "districts":
            return "No public construction summary has been added for this district yet.";
        case "improvements":
            return "No public construction summary has been added for this improvement yet.";
        case "modifiers":
            return "No public modifier summary has been added for this linked mechanic yet.";
        case "statuses":
            return "No public status summary has been added for this effect yet.";
        default:
            return "No public description has been added for this entry yet.";
    }
}

function hasOnlyClassificationFacts(parsed: ReturnType<typeof parseCodexStructuredDescription>): boolean {
    if (
        parsed.facts.length === 0 ||
        parsed.sections.length > 0 ||
        parsed.timeline.length > 0 ||
        parsed.bodyLines.length > 0
    ) {
        return false;
    }

    const classificationLabels = new Set(["category", "kind"]);
    return parsed.facts.every((fact) => classificationLabels.has(fact.label.trim().toLowerCase()));
}

export default function CodexStructuredDetail({
    entry,
    relatedEntries = [],
    onSelectInlineEntry,
}: Props) {
    const parsed = useMemo(
        () => parseCodexStructuredDescription(entry),
        [entry]
    );
    const inlineLinkCandidates = useMemo(
        () => buildAbilityInlineLinkCandidates(entry, relatedEntries),
        [entry, relatedEntries]
    );
    const descriptionLines = entry.descriptionLines ?? [];
    const hasDescription = descriptionLines.some((line) => line.trim().length > 0);
    const hasOnlyClassificationMetadata = hasOnlyClassificationFacts(parsed);

    if (!parsed.hasStructuredContent) {
        return (
            <section className="codex-detail__section" aria-labelledby="codex-description-heading">
                <div className="codex-sectionLabel" id="codex-description-heading">
                    Description
                </div>

                {hasDescription ? (
                    <div className="codex-detail__description">
                        {descriptionLines.map((line, index) => (
                            <RenderLine
                                key={`${entry.entryKey}-${index}`}
                                line={line}
                                className="codex-detail__line"
                                inlineLinkCandidates={inlineLinkCandidates}
                                onSelectInlineEntry={onSelectInlineEntry}
                                lineKey={`${entry.entryKey}-${index}`}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="codex-detail__placeholder">{emptyMessageFor(entry.exportKind)}</p>
                )}
            </section>
        );
    }

    return (
        <section className="codex-detail__section codex-structuredDossier" aria-labelledby="codex-structured-heading">
            <div className="codex-sectionLabel" id="codex-structured-heading">
                {sectionHeadingFor(entry.exportKind)}
            </div>

            {parsed.facts.length > 0 ? (
                <dl className="codex-structuredFacts">
                    {parsed.facts.map((fact) => (
                        <div className="codex-structuredFact" key={`${fact.label}-${fact.value}`}>
                            <dt>{fact.label}</dt>
                            <dd>{renderDescriptionLine(formatCodexMajorFactionText(fact.value))}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {parsed.sections.map((section) => (
                <section className="codex-structuredBlock" key={section.label}>
                    <h3 className="codex-structuredBlock__heading">{section.label}</h3>
                    {section.lines.length > 0 ? (
                        <div className="codex-structuredBlock__lines">
                            {section.lines.map((line, index) => (
                                <RenderLine
                                    key={`${section.label}-${index}`}
                                    line={line}
                                    className="codex-structuredBlock__line"
                                    inlineLinkCandidates={inlineLinkCandidates}
                                    onSelectInlineEntry={onSelectInlineEntry}
                                    lineKey={`${section.label}-${index}`}
                                />
                            ))}
                        </div>
                    ) : null}
                    {section.items?.length ? (
                        <div className="codex-structuredItems">
                            {section.items.map((item) => (
                                <StructuredSectionItem
                                    item={item}
                                    inlineLinkCandidates={inlineLinkCandidates}
                                    onSelectInlineEntry={onSelectInlineEntry}
                                    entry={entry}
                                    sectionLabel={section.label}
                                    relatedEntries={relatedEntries}
                                    key={`${section.label}-${item.label}-${item.referenceKey ?? ""}`}
                                />
                            ))}
                        </div>
                    ) : null}
                </section>
            ))}

            {parsed.timeline.length > 0 ? (
                <section className="codex-structuredBlock">
                    <h3 className="codex-structuredBlock__heading">Population thresholds</h3>
                    <ol className="codex-structuredTimeline">
                        {parsed.timeline.map((item) => (
                            <li className="codex-structuredTimeline__item" key={`${item.label}-${item.value}`}>
                                <span className="codex-structuredTimeline__label">{item.label}</span>
                                <span className="codex-structuredTimeline__value">
                                    {renderDescriptionLine(formatCodexMajorFactionText(item.value))}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>
            ) : null}

            {parsed.bodyLines.length > 0 ? (
                <section className="codex-structuredBlock">
                    <h3 className="codex-structuredBlock__heading">Notes</h3>
                    <div className="codex-detail__description codex-detail__description--structuredNotes">
                        {parsed.bodyLines.map((line, index) => (
                            <RenderLine
                                key={`${entry.entryKey}-note-${index}`}
                                line={line}
                                className="codex-detail__line"
                                inlineLinkCandidates={inlineLinkCandidates}
                                onSelectInlineEntry={onSelectInlineEntry}
                                lineKey={`${entry.entryKey}-note-${index}`}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {hasOnlyClassificationMetadata ? (
                <p className="codex-detail__placeholder">{emptyMessageFor(entry.exportKind)}</p>
            ) : null}
        </section>
    );
}
