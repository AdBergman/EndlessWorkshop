import { useMemo } from "react";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import { formatCodexMajorFactionText } from "@/lib/codex/codexPresentation";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import type { CodexStructuredSectionItem } from "@/lib/codex/codexStructuredDescription";

type Props = {
    entry: CodexEntry;
};

function RenderLine({ line, className }: { line: string; className: string }) {
    return (
        <p className={className}>
            {renderDescriptionLine(formatCodexMajorFactionText(line))}
        </p>
    );
}

function StructuredSectionItem({ item }: { item: CodexStructuredSectionItem }) {
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

export default function CodexStructuredDetail({ entry }: Props) {
    const parsed = useMemo(
        () => parseCodexStructuredDescription(entry),
        [entry]
    );
    const descriptionLines = entry.descriptionLines ?? [];
    const hasDescription = descriptionLines.some((line) => line.trim().length > 0);

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
                                />
                            ))}
                        </div>
                    ) : null}
                    {section.items?.length ? (
                        <div className="codex-structuredItems">
                            {section.items.map((item) => (
                                <StructuredSectionItem
                                    item={item}
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
                            />
                        ))}
                    </div>
                </section>
            ) : null}
        </section>
    );
}
