import { useMemo } from "react";
import { parseCodexStructuredDescription } from "@/lib/codex/codexStructuredDescription";
import { getCodexFactValues } from "@/lib/codex/codexFactValues";
import { formatCodexMajorFactionText } from "@/lib/codex/codexPresentation";
import { getStatusScopeDisplayLabel } from "@/lib/codex/codexStatusArchiveFilters";
import {
    buildAbilityInlineLinkCandidates,
    type CodexAbilityInlineLinkCandidate,
} from "@/lib/codex/codexAbilityInlineLinks";
import {
    buildGrantedAbilityPreview,
    isGrantedAbilityPreviewSection,
} from "@/lib/codex/codexGrantedAbilityPreviews";
import {
    findPopulationThresholdTargetSummary,
} from "@/lib/codex/codexPopulationThresholdTargets";
import {
    buildTechUnlockSummary,
    isTechUnlockSummarySection,
} from "@/lib/codex/codexTechUnlockSummaries";
import {
    buildTreatyStatusSummary,
    isTreatyAppliedStatusSummarySection,
} from "@/lib/codex/codexTreatyStatusSummaries";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import type { CodexStructuredSectionItem } from "@/lib/codex/codexStructuredDescription";
import CodexAbilityEffectLine from "./CodexAbilityEffectLine";
import CodexGrantedAbilityPreview from "./CodexGrantedAbilityPreview";
import CodexPopulationThresholdTargetSummary from "./CodexPopulationThresholdTargetSummary";
import CodexTechUnlockSummary from "./CodexTechUnlockSummary";
import CodexTreatyStatusSummary from "./CodexTreatyStatusSummary";

type Props = {
    entry: CodexEntry;
    relatedEntries?: CodexEntry[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
};

type ParsedCodexDescription = ReturnType<typeof parseCodexStructuredDescription>;

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
        <CodexAbilityEffectLine
            className={className}
            inlineLinkCandidates={inlineLinkCandidates}
            line={line}
            lineKey={lineKey}
            onSelectInlineEntry={onSelectInlineEntry}
        />
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
    const grantedAbilityPreview = isGrantedAbilityPreviewSection(entry, sectionLabel)
        ? buildGrantedAbilityPreview(item, relatedEntries)
        : null;
    const techUnlockSummary = isTechUnlockSummarySection(entry, sectionLabel)
        ? buildTechUnlockSummary(item, relatedEntries)
        : null;
    const treatyStatusSummary = isTreatyAppliedStatusSummarySection(entry, sectionLabel)
        ? buildTreatyStatusSummary(item, relatedEntries)
        : null;

    if (grantedAbilityPreview && onSelectInlineEntry) {
        return (
            <CodexGrantedAbilityPreview
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

            {techUnlockSummary && onSelectInlineEntry ? (
                <CodexTechUnlockSummary
                    summary={techUnlockSummary}
                    onSelect={onSelectInlineEntry}
                />
            ) : null}

            {treatyStatusSummary && onSelectInlineEntry ? (
                <CodexTreatyStatusSummary
                    summary={treatyStatusSummary}
                    onSelect={onSelectInlineEntry}
                />
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

function factValue(parsed: ParsedCodexDescription, label: string): string {
    const normalizedLabel = label.trim().toLowerCase();
    return parsed.facts.find((fact) => fact.label.trim().toLowerCase() === normalizedLabel)?.value.trim() ?? "";
}

function abilityProfileItems(parsed: ParsedCodexDescription): Array<{ label: string; value: string; priority: "primary" | "secondary" }> {
    return [
        { label: "Mechanic", value: factValue(parsed, "Ability mechanic"), priority: "primary" as const },
        { label: "Target", value: factValue(parsed, "Target"), priority: "primary" as const },
        { label: "Range", value: factValue(parsed, "Range"), priority: "primary" as const },
        { label: "Cost", value: factValue(parsed, "Cost"), priority: "primary" as const },
    ].filter((item) => item.value.length > 0);
}

function formatStatusDurationValue(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    return trimmedValue.replace(/^1\s+turns$/i, "1 turn");
}

function statusProfileItems(entry: CodexEntry): Array<{ label: string; value: string }> {
    const items: Array<{ label: string; value: string }> = [];
    const seenValues = new Set<string>();

    const addValue = (label: string, value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const normalizedValue = `${label}:${trimmedValue}`.toLowerCase();
        if (seenValues.has(normalizedValue)) return;

        seenValues.add(normalizedValue);
        items.push({ label, value: trimmedValue });
    };

    getCodexFactValues(entry, "Scope").forEach((value) =>
        addValue("Scope", getStatusScopeDisplayLabel(value))
    );
    getCodexFactValues(entry, "Duration").forEach((value) =>
        addValue("Duration", formatStatusDurationValue(value))
    );

    return items;
}

function isSectionLabel(sectionLabel: string, expectedLabel: string): boolean {
    return sectionLabel.trim().toLowerCase() === expectedLabel.toLowerCase();
}

function splitStructuredLines(lines: readonly string[]): string[] {
    return lines.flatMap((line) =>
        line
            .split(/\r?\n/)
            .map((value) => value.trim())
            .filter(Boolean)
    );
}

function StructuredBlock({
    entry,
    section,
    inlineLinkCandidates,
    onSelectInlineEntry,
    relatedEntries,
    className,
    lineClassName,
    itemsClassName,
}: {
    entry: CodexEntry;
    section: ParsedCodexDescription["sections"][number];
    inlineLinkCandidates: CodexAbilityInlineLinkCandidate[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
    relatedEntries: CodexEntry[];
    className?: string;
    lineClassName?: string;
    itemsClassName?: string;
}) {
    return (
        <section className={["codex-structuredBlock", className].filter(Boolean).join(" ")} key={section.label}>
            <h3 className="codex-structuredBlock__heading">{section.label}</h3>
            {section.lines.length > 0 ? (
                <div className="codex-structuredBlock__lines">
                    {splitStructuredLines(section.lines).map((line, index) => (
                        <RenderLine
                            key={`${section.label}-${index}`}
                            line={line}
                            className={["codex-structuredBlock__line", lineClassName].filter(Boolean).join(" ")}
                            inlineLinkCandidates={inlineLinkCandidates}
                            onSelectInlineEntry={onSelectInlineEntry}
                            lineKey={`${section.label}-${index}`}
                        />
                    ))}
                </div>
            ) : null}
            {section.items?.length ? (
                <div className={["codex-structuredItems", itemsClassName].filter(Boolean).join(" ")}>
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
    );
}

function AbilityStructuredDetail({
    entry,
    parsed,
    relatedEntries,
    inlineLinkCandidates,
    onSelectInlineEntry,
}: {
    entry: CodexEntry;
    parsed: ParsedCodexDescription;
    relatedEntries: CodexEntry[];
    inlineLinkCandidates: CodexAbilityInlineLinkCandidate[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
}) {
    const profileItems = abilityProfileItems(parsed);
    const effectsSections = parsed.sections.filter((section) => isSectionLabel(section.label, "Effects"));
    const battleMechanicsSections = parsed.sections.filter((section) => isSectionLabel(section.label, "Battle mechanics"));
    const remainingSections = parsed.sections.filter((section) => (
        !isSectionLabel(section.label, "Effects") &&
        !isSectionLabel(section.label, "Battle mechanics")
    ));
    const hasEffects = effectsSections.some((section) => section.lines.length > 0 || (section.items?.length ?? 0) > 0);
    const hasUsefulStructuredContent = profileItems.length > 0 ||
        hasEffects ||
        battleMechanicsSections.length > 0 ||
        remainingSections.length > 0 ||
        parsed.bodyLines.length > 0;

    if (!hasUsefulStructuredContent) {
        return (
            <section className="codex-detail__section" aria-labelledby="codex-ability-detail-heading">
                <div className="codex-sectionLabel" id="codex-ability-detail-heading">
                    Ability dossier
                </div>
                <p className="codex-detail__placeholder">{emptyMessageFor(entry.exportKind)}</p>
            </section>
        );
    }

    return (
        <section
            className="codex-detail__section codex-structuredDossier codex-abilityDossier"
            aria-labelledby="codex-ability-detail-heading"
        >
            <div className="codex-sectionLabel" id="codex-ability-detail-heading">
                Ability dossier
            </div>

            {effectsSections.length > 0 ? (
                effectsSections.map((section) => (
                    <StructuredBlock
                        key={section.label}
                        entry={entry}
                        section={section}
                        inlineLinkCandidates={inlineLinkCandidates}
                        onSelectInlineEntry={onSelectInlineEntry}
                        relatedEntries={relatedEntries}
                        className="codex-abilityEffects"
                        lineClassName="codex-abilityEffects__line"
                    />
                ))
            ) : (
                <p className="codex-detail__placeholder">{emptyMessageFor(entry.exportKind)}</p>
            )}

            {profileItems.length > 0 ? (
                <dl className="codex-abilityProfile" aria-label="Ability profile">
                    {profileItems.map((item) => (
                        <div
                            className={`codex-abilityProfile__item codex-abilityProfile__item--${item.priority}`}
                            key={`${item.label}-${item.value}`}
                        >
                            <dt>{item.label}</dt>
                            <dd>{renderDescriptionLine(formatCodexMajorFactionText(item.value))}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {battleMechanicsSections.map((section) => (
                <StructuredBlock
                    key={section.label}
                    entry={entry}
                    section={section}
                    inlineLinkCandidates={inlineLinkCandidates}
                    onSelectInlineEntry={onSelectInlineEntry}
                    relatedEntries={relatedEntries}
                    className="codex-abilityMechanics"
                    itemsClassName="codex-structuredItems--abilityMechanics"
                />
            ))}

            {remainingSections.map((section) => (
                <StructuredBlock
                    key={section.label}
                    entry={entry}
                    section={section}
                    inlineLinkCandidates={inlineLinkCandidates}
                    onSelectInlineEntry={onSelectInlineEntry}
                    relatedEntries={relatedEntries}
                />
            ))}

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
        </section>
    );
}

function StatusStructuredDetail({
    entry,
    parsed,
    relatedEntries,
    inlineLinkCandidates,
    onSelectInlineEntry,
}: {
    entry: CodexEntry;
    parsed: ParsedCodexDescription;
    relatedEntries: CodexEntry[];
    inlineLinkCandidates: CodexAbilityInlineLinkCandidate[];
    onSelectInlineEntry?: (entry: CodexEntry) => void;
}) {
    const profileItems = statusProfileItems(entry);
    const mechanicsSections = parsed.sections.filter((section) => isSectionLabel(section.label, "Status mechanics"));
    const effectsSections = parsed.sections.filter((section) => isSectionLabel(section.label, "Effects"));
    const remainingSections = parsed.sections.filter((section) => (
        !isSectionLabel(section.label, "Status mechanics") &&
        !isSectionLabel(section.label, "Effects")
    ));
    const primarySections = [...mechanicsSections, ...effectsSections];
    const hasPrimaryContent = primarySections.some((section) =>
        section.lines.length > 0 || (section.items?.length ?? 0) > 0
    );
    const hasUsefulStructuredContent = profileItems.length > 0 ||
        hasPrimaryContent ||
        remainingSections.length > 0 ||
        parsed.bodyLines.length > 0;

    if (!hasUsefulStructuredContent) {
        return (
            <section className="codex-detail__section" aria-labelledby="codex-status-detail-heading">
                <div className="codex-sectionLabel" id="codex-status-detail-heading">
                    Status dossier
                </div>
                <p className="codex-detail__placeholder">{emptyMessageFor(entry.exportKind)}</p>
            </section>
        );
    }

    return (
        <section
            className="codex-detail__section codex-structuredDossier codex-statusDossier"
            aria-labelledby="codex-status-detail-heading"
        >
            <div className="codex-sectionLabel" id="codex-status-detail-heading">
                Status dossier
            </div>

            {hasPrimaryContent ? (
                primarySections.map((section) => (
                    <StructuredBlock
                        key={section.label}
                        entry={entry}
                        section={section}
                        inlineLinkCandidates={inlineLinkCandidates}
                        onSelectInlineEntry={onSelectInlineEntry}
                        relatedEntries={relatedEntries}
                        className="codex-statusMechanics"
                        lineClassName="codex-statusMechanics__line"
                    />
                ))
            ) : (
                <section className="codex-structuredBlock codex-statusMechanics">
                    <h3 className="codex-structuredBlock__heading">Status mechanics</h3>
                    <p className="codex-detail__placeholder">No public mechanics exported yet.</p>
                </section>
            )}

            {profileItems.length > 0 ? (
                <dl className="codex-statusProfile" aria-label="Status profile">
                    {profileItems.map((item) => (
                        <div className="codex-statusProfile__item" key={`${item.label}-${item.value}`}>
                            <dt>{item.label}</dt>
                            <dd>{renderDescriptionLine(formatCodexMajorFactionText(item.value))}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {remainingSections.map((section) => (
                <StructuredBlock
                    key={section.label}
                    entry={entry}
                    section={section}
                    inlineLinkCandidates={inlineLinkCandidates}
                    onSelectInlineEntry={onSelectInlineEntry}
                    relatedEntries={relatedEntries}
                />
            ))}

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
        </section>
    );
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
    const isAbilityEntry = entry.exportKind.trim().toLowerCase() === "abilities";
    const isStatusEntry = entry.exportKind.trim().toLowerCase() === "statuses";
    const hasStatusProfile = isStatusEntry && statusProfileItems(entry).length > 0;

    if (isAbilityEntry && parsed.hasStructuredContent) {
        return (
            <AbilityStructuredDetail
                entry={entry}
                parsed={parsed}
                relatedEntries={relatedEntries}
                inlineLinkCandidates={inlineLinkCandidates}
                onSelectInlineEntry={onSelectInlineEntry}
            />
        );
    }

    if (isStatusEntry && (parsed.hasStructuredContent || hasStatusProfile)) {
        return (
            <StatusStructuredDetail
                entry={entry}
                parsed={parsed}
                relatedEntries={relatedEntries}
                inlineLinkCandidates={inlineLinkCandidates}
                onSelectInlineEntry={onSelectInlineEntry}
            />
        );
    }

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
                        {parsed.timeline.map((item) => {
                            const thresholdTargetSummary = onSelectInlineEntry
                                ? findPopulationThresholdTargetSummary(entry, item.label, relatedEntries)
                                : null;

                            return (
                                <li className="codex-structuredTimeline__item" key={`${item.label}-${item.value}`}>
                                    <span className="codex-structuredTimeline__label">{item.label}</span>
                                    <span className="codex-structuredTimeline__value">
                                        {renderDescriptionLine(formatCodexMajorFactionText(item.value))}
                                        {thresholdTargetSummary && onSelectInlineEntry ? (
                                            <CodexPopulationThresholdTargetSummary
                                                summary={thresholdTargetSummary}
                                                onSelect={onSelectInlineEntry}
                                            />
                                        ) : null}
                                    </span>
                                </li>
                            );
                        })}
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
