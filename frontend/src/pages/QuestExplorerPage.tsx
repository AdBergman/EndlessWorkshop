import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import QuestExplorerModeSwitch from "@/components/Quests/QuestExplorerModeSwitch";
import {
    filterQuestEntries,
    selectQuestError,
    selectQuestExplorer,
    selectQuestLoaded,
    selectQuestLoading,
    selectSelectedQuest,
    useQuestStore,
} from "@/stores/questStore";
import {
    DEFAULT_QUEST_EXPLORER_MODE,
    normalizeQuestExplorerMode,
    type QuestExplorerMode,
} from "@/features/quests/questExplorerMode";
import {
    getQuestCategoryLabel,
    QUEST_CATEGORY_OPTIONS,
    type QuestCategoryKey,
} from "@/features/quests/questCategories";
import {
    buildQuestRailGroups,
    resolveRailSelectionKey,
    type QuestRailGroup,
} from "@/features/quests/questRail";
import {
    selectSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";
import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
    QuestProgressionVariant,
} from "@/types/questTypes";
import "@/components/Quests/QuestExplorer.css";

type QuestDetailProgression = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
    activeStepKeys: Set<string>;
    activeVariantEntryKeys: Set<string>;
};

type QuestProgressionLocation = {
    questline: QuestProgressionQuestline;
    chapter: QuestProgressionChapter;
    step: QuestProgressionStep;
    stepIndex: number;
};

type AdventureChoice = {
    id: string;
    label: string;
    eyebrow: string;
    descriptionLines: string[];
    targetEntryKey: string | null;
    nextEntryKeys: string[];
    accent: "gold" | "teal";
};

type AdventureChoiceSelection = {
    stepKey: string;
    choiceId: string;
    label: string;
    targetEntryKey: string | null;
    nextEntryKeys: string[];
};

type AdventureSegment = {
    step: QuestProgressionStep;
    stepIndex: number;
    displayEntry: QuestExplorerEntry | null;
    choices: AdventureChoice[];
    selectedChoice: AdventureChoiceSelection | null;
    isActive: boolean;
    sharesDetailEntry: boolean;
    rendersSharedAlias: boolean;
};

type AdventureFlow = {
    segments: AdventureSegment[];
    lockedSteps: QuestProgressionStep[];
    unresolvedChoice: AdventureChoiceSelection | null;
    reachedEntryKey: string | null;
};

const PROJECTION_LABELS: Record<string, string> = {
    real_entry_backed: "Entry-backed",
    virtual_alias_expanded: "Alias beat",
    parsed_entry_backed: "Recovered beat",
    branch_variant_only: "Branch-only",
};

const VARIANT_KIND_LABELS: Record<string, string> = {
    entry: "Entry",
    branch_variant: "Branch variant",
};

function routeEntryKey(pathname: string): string | null {
    const raw = pathname.replace(/^\/quests\/?/, "").trim();
    if (!raw) return null;
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function questPath(entryKey: string, mode: QuestExplorerMode): string {
    const query = mode === DEFAULT_QUEST_EXPLORER_MODE ? "" : `?mode=${mode}`;
    return `/quests/${encodeURIComponent(entryKey)}${query}`;
}

function fallbackLabel(
    label: string | null | undefined,
    key: string | null | undefined,
    empty: string | null = "Unassigned"
): string | null {
    // TODO: keep raw key fallback only until exporter/backend supplies all display labels.
    return label || key || empty;
}

function compactMeta(entry: QuestExplorerEntry): string {
    const nav = entry.navigation;
    return [
        fallbackLabel(nav.factionName, nav.factionKey, null),
        fallbackLabel(nav.questLineName, nav.questLineKey, null),
        nav.chapterLabel,
        nav.stepLabel,
        nav.branchLabel,
    ].filter(Boolean).join(" / ");
}

function normalizedKind(value: string): string {
    return value.trim().toLowerCase();
}

function projectionLabel(projectionKind: string): string {
    return PROJECTION_LABELS[normalizedKind(projectionKind)] ?? "Projected beat";
}

function variantKindLabel(variantKind: string): string {
    return VARIANT_KIND_LABELS[normalizedKind(variantKind)] ?? "Variant";
}

function isVirtualAliasStep(step: QuestProgressionStep): boolean {
    return normalizedKind(step.projectionKind) === "virtual_alias_expanded";
}

function stepPositionLabel(step: QuestProgressionStep): string {
    if (step.stepNumber != null) return `Step ${step.stepNumber}`;
    if (step.stepOrder != null) return `Order ${step.stepOrder}`;
    return "Step";
}

function chapterPositionLabel(chapter: QuestProgressionChapter): string {
    const chapterNumber = chapter.chapterNumber ?? chapter.chapterOrder;
    return chapterNumber == null ? "Chapter" : `Chapter ${chapterNumber}`;
}

function entryIdentityKeys(entry: QuestExplorerEntry): string[] {
    return [entry.entryKey, ...entry.aliases].filter(Boolean);
}

function stepIdentityKeys(step: QuestProgressionStep): string[] {
    return [
        step.detailEntryKey,
        ...step.sourceEntryKeys,
        ...step.aliasEntryKeys,
        ...step.variants.map((variant) => variant.entryKey),
    ].filter(Boolean);
}

function visibleStepVariants(step: QuestProgressionStep): QuestProgressionVariant[] {
    const seen = new Set<string>();
    return step.variants.filter((variant) => {
        if (!variant.entryKey || seen.has(variant.entryKey)) return false;
        seen.add(variant.entryKey);
        return normalizedKind(variant.variantKind) !== "entry" || variant.entryKey !== step.detailEntryKey;
    });
}

function findDetailProgression(
    progression: QuestExplorerProgression | null,
    selectedEntry: QuestExplorerEntry | null
): QuestDetailProgression | null {
    if (!progression || !selectedEntry) return null;

    const selectedIdentityKeys = new Set(entryIdentityKeys(selectedEntry));

    for (const questline of progression.questlines) {
        for (const chapter of questline.chapters) {
            const activeStepKeys = new Set<string>();
            const activeVariantEntryKeys = new Set<string>();

            for (const step of chapter.steps) {
                if (stepIdentityKeys(step).some((key) => selectedIdentityKeys.has(key))) {
                    activeStepKeys.add(step.stepKey);
                }
                for (const variant of step.variants) {
                    if (normalizedKind(variant.variantKind) === "branch_variant" && selectedIdentityKeys.has(variant.entryKey)) {
                        activeVariantEntryKeys.add(variant.entryKey);
                    }
                }
            }

            if (activeStepKeys.size > 0) {
                return { questline, chapter, activeStepKeys, activeVariantEntryKeys };
            }
        }
    }

    return null;
}

function CategorySelector({
    value,
    options,
    onChange,
}: {
    value: QuestCategoryKey;
    options: Array<{ key: QuestCategoryKey; label: string; count: number }>;
    onChange: (value: QuestCategoryKey) => void;
}) {
    return (
        <fieldset className="questExplorer-categorySelector">
            <legend>Category</legend>
            <div className="questExplorer-categoryOptions">
                {options.map((option) => (
                    <label
                        className={`questExplorer-categoryOption${option.key === value ? " is-selected" : ""}`}
                        key={option.key}
                    >
                        <input
                            type="radio"
                            name="quest-category"
                            value={option.key}
                            checked={option.key === value}
                            onChange={() => onChange(option.key)}
                        />
                        <span className="questExplorer-categoryGlyph" aria-hidden="true" />
                        <span className="questExplorer-categoryOptionText">{option.label}</span>
                        <small>{option.count}</small>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function railIndexLabel(item: QuestRailGroup["items"][number], index: number): string {
    const chapterNumber = item.progression?.chapter.chapterNumber ?? item.progression?.chapter.chapterOrder;
    return String(chapterNumber ?? index + 1);
}

function railStepCountParts(metaLabel: string): { count: string; label: string } {
    const match = metaLabel.match(/^(\d+)\s+(.+)$/);
    return match ? { count: match[1], label: match[2] } : { count: metaLabel, label: "" };
}

function QuestList({
    groups,
    selectedRailEntryKey,
    onSelectEntry,
}: {
    groups: QuestRailGroup[];
    selectedRailEntryKey: string | null;
    onSelectEntry: (entryKey: string) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-emptyList">No quests match these filters.</p>;
    }

    return (
        <div className="questExplorer-list">
            {groups.map((group) => (
                <div className="questExplorer-listGroup" key={group.key}>
                    <div className="questExplorer-listGroupLabel">
                        <span>{group.title}</span>
                        <small>{group.items.length} {group.items.length === 1 ? "record" : "records"}</small>
                    </div>
                    {group.items.map((item, index) => {
                        const stepCount = railStepCountParts(item.metaLabel);
                        return (
                            <button
                                type="button"
                                className={`questExplorer-listItem${item.entry.entryKey === selectedRailEntryKey ? " is-selected" : ""}`}
                                aria-current={item.entry.entryKey === selectedRailEntryKey ? "page" : undefined}
                                aria-label={`${item.title} ${item.chapterLabel} ${item.metaLabel}`}
                                onClick={() => onSelectEntry(item.entry.entryKey)}
                                key={item.key}
                            >
                                <span className="questExplorer-listItemBadge" aria-hidden="true">{railIndexLabel(item, index)}</span>
                                <span className="questExplorer-listItemCopy">
                                    <span className="questExplorer-listItemTitle">{item.title}</span>
                                    <span className="questExplorer-listItemSubtitle">{item.chapterLabel}</span>
                                </span>
                                <span className="questExplorer-listItemSteps" aria-hidden="true">
                                    <strong>{stepCount.count}</strong>
                                    {stepCount.label ? <small>{stepCount.label}</small> : null}
                                </span>
                                <span className="questExplorer-listItemStepText">{item.metaLabel}</span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function branchTargetKeys(branch: QuestBranch): string[] {
    return uniqueStrings([
        ...branch.nextEntryKeys,
        ...branch.failureEntryKeys,
        ...branch.convergesIntoEntryKeys,
    ]);
}

function variantTargetKeys(variant: QuestProgressionVariant): string[] {
    return uniqueStrings([
        ...variant.nextEntryKeys,
        ...variant.failureEntryKeys,
        ...variant.convergesIntoEntryKeys,
    ]);
}

function continuationKeys(entry: QuestExplorerEntry | null): string[] {
    if (!entry) return [];
    return uniqueStrings([
        ...entry.navigation.nextEntryKeys,
        ...entry.navigation.failureEntryKeys,
        ...entry.navigation.convergesIntoEntryKeys,
    ]);
}

function entryKeysWithAliases(entryKey: string | null | undefined, entriesByKey: Record<string, QuestExplorerEntry>): string[] {
    if (!entryKey) return [];
    const entry = entriesByKey[entryKey];
    return entry ? entryIdentityKeys(entry) : [entryKey];
}

function knownEntryKey(keys: string[], entriesByKey: Record<string, QuestExplorerEntry>): string | null {
    return keys.find((key) => Boolean(entriesByKey[key])) ?? null;
}

function stepMatchesKeys(
    step: QuestProgressionStep,
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>
): boolean {
    const identities = new Set(keys.flatMap((key) => entryKeysWithAliases(key, entriesByKey)));
    return stepIdentityKeys(step).some((key) => identities.has(key));
}

function stepIndexForKeys(
    steps: QuestProgressionStep[],
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>,
    startIndex = 0
): number | null {
    if (keys.length === 0) return null;
    const index = steps.findIndex((step, candidateIndex) => (
        candidateIndex >= startIndex && stepMatchesKeys(step, keys, entriesByKey)
    ));
    return index >= 0 ? index : null;
}

function progressionLocationForKeys(
    progression: QuestExplorerProgression | null,
    keys: string[],
    entriesByKey: Record<string, QuestExplorerEntry>
): QuestProgressionLocation | null {
    if (!progression || keys.length === 0) return null;

    for (const questline of progression.questlines) {
        for (const chapter of questline.chapters) {
            const stepIndex = stepIndexForKeys(chapter.steps, keys, entriesByKey);
            if (stepIndex != null) {
                return { questline, chapter, step: chapter.steps[stepIndex], stepIndex };
            }
        }
    }

    return null;
}

function progressionContextKey(progression: QuestDetailProgression | null, fallback: string | null): string {
    if (!progression) return fallback ?? "none";
    return [
        progression.questline.questLineFamilyKey ?? progression.questline.questLineKey ?? "questline",
        progression.questline.factionFamilyKey ?? progression.questline.factionKey ?? "faction",
        progression.chapter.chapterOrder ?? progression.chapter.chapterNumber ?? "chapter",
        progression.chapter.title,
    ].join(":");
}

function isSameProgressionChapter(
    left: QuestDetailProgression,
    right: QuestProgressionLocation
): boolean {
    return (
        (left.questline.questLineFamilyKey ?? left.questline.questLineKey) === (right.questline.questLineFamilyKey ?? right.questline.questLineKey)
        && (left.questline.factionFamilyKey ?? left.questline.factionKey) === (right.questline.factionFamilyKey ?? right.questline.factionKey)
        && (left.chapter.chapterOrder ?? left.chapter.chapterNumber ?? left.chapter.title) === (right.chapter.chapterOrder ?? right.chapter.chapterNumber ?? right.chapter.title)
    );
}

function detailEntryCounts(chapter: QuestProgressionChapter): Map<string, number> {
    return chapter.steps.reduce((counts, step) => {
        counts.set(step.detailEntryKey, (counts.get(step.detailEntryKey) ?? 0) + 1);
        return counts;
    }, new Map<string, number>());
}

function choiceDescription(lines: Array<string | null | undefined>, fallback: string | null): string[] {
    const cleanLines = uniqueStrings(lines.map((line) => line?.trim()).filter(Boolean));
    return cleanLines.length > 0 ? cleanLines : fallback ? [fallback] : [];
}

function choicesForStep(
    step: QuestProgressionStep,
    detailEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): AdventureChoice[] {
    const variantChoices = visibleStepVariants(step).map((variant): AdventureChoice => {
        const target = entriesByKey[variant.entryKey] ?? null;
        const explicitTargets = variantTargetKeys(variant);
        const label = target?.title || variant.title || variant.entryKey;

        return {
            id: `variant:${variant.entryKey}`,
            label,
            eyebrow: variantKindLabel(variant.variantKind),
            descriptionLines: choiceDescription([variant.branchLabel, target?.summaryLines[0]], null),
            targetEntryKey: target?.entryKey ?? knownEntryKey(explicitTargets, entriesByKey),
            nextEntryKeys: uniqueStrings([variant.entryKey, ...explicitTargets]),
            accent: "teal",
        };
    });

    const branchChoices = [...(detailEntry?.branches ?? [])]
        .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER))
        .map((branch): AdventureChoice => {
            const explicitTargets = branchTargetKeys(branch);
            const targetEntryKey = knownEntryKey(explicitTargets, entriesByKey);
            const target = targetEntryKey ? entriesByKey[targetEntryKey] : null;

            return {
                id: `branch:${branch.branchKey}`,
                label: branch.label || target?.title || "Choice",
                eyebrow: branch.groupLabel || branch.groupKey || branch.choiceKey || "Choice",
                descriptionLines: choiceDescription([
                    ...(branch.lore?.outcomePreviewLines ?? []),
                    ...(branch.strategy?.conditions ?? []),
                    target?.summaryLines[0],
                ], target?.title ?? null),
                targetEntryKey,
                nextEntryKeys: explicitTargets,
                accent: "gold",
            };
        });

    const seen = new Set<string>();
    return [...variantChoices, ...branchChoices].filter((choice) => {
        if (seen.has(choice.id)) return false;
        seen.add(choice.id);
        return true;
    });
}

function selectionForChoice(stepKey: string, choice: AdventureChoice): AdventureChoiceSelection {
    return {
        stepKey,
        choiceId: choice.id,
        label: choice.label,
        targetEntryKey: choice.targetEntryKey,
        nextEntryKeys: choice.nextEntryKeys,
    };
}

function selectedChoiceTargetKeys(selection: AdventureChoiceSelection): string[] {
    return uniqueStrings([selection.targetEntryKey, ...selection.nextEntryKeys]);
}

function selectedChoiceContinuationKeys(
    selection: AdventureChoiceSelection,
    entriesByKey: Record<string, QuestExplorerEntry>
): string[] {
    const target = selection.targetEntryKey ? entriesByKey[selection.targetEntryKey] ?? null : null;
    return uniqueStrings([
        ...selection.nextEntryKeys,
        ...continuationKeys(target),
    ]);
}

function implicitActiveChoice(
    choices: AdventureChoice[],
    activeVariantEntryKeys: Set<string>
): AdventureChoiceSelection | null {
    const choice = choices.find((candidate) => (
        candidate.targetEntryKey ? activeVariantEntryKeys.has(candidate.targetEntryKey) : false
    ) || candidate.nextEntryKeys.some((entryKey) => activeVariantEntryKeys.has(entryKey)));

    return choice ? selectionForChoice("", choice) : null;
}

function buildAdventureFlow(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    choicePath: AdventureChoiceSelection[],
    fullProgression: QuestExplorerProgression | null
): AdventureFlow {
    const steps = progression.chapter.steps;
    const selectedByStep = new Map(choicePath.map((selection) => [selection.stepKey, selection]));
    const counts = detailEntryCounts(progression.chapter);
    const renderedDetailKeys = new Set<string>();
    const displayEntryOverrides = new Map<string, string>();
    const activeIndexes = steps
        .map((step, index) => progression.activeStepKeys.has(step.stepKey) ? index : -1)
        .filter((index) => index >= 0);
    let visibleUntil = Math.max(0, activeIndexes.length ? Math.max(...activeIndexes) : 0);
    let unresolvedChoice: AdventureChoiceSelection | null = null;
    let reachedEntryKey: string | null = null;
    let lockedFromIndex: number | null = null;
    const segments: AdventureSegment[] = [];

    for (let index = 0; index < steps.length; index += 1) {
        if (index > visibleUntil) {
            lockedFromIndex = index;
            break;
        }

        const step = steps[index];
        const overrideEntryKey = displayEntryOverrides.get(step.stepKey);
        const displayEntry = (overrideEntryKey ? entriesByKey[overrideEntryKey] : null)
            ?? entriesByKey[step.detailEntryKey]
            ?? null;
        const choices = choicesForStep(step, displayEntry, entriesByKey);
        const storedSelection = selectedByStep.get(step.stepKey);
        const storedChoice = storedSelection
            ? choices.find((choice) => choice.id === storedSelection.choiceId) ?? null
            : null;
        const selectedChoice = storedSelection
            ? storedChoice ? selectionForChoice(step.stepKey, storedChoice) : null
            : implicitActiveChoice(choices, progression.activeVariantEntryKeys);
        const sharesDetailEntry = (counts.get(step.detailEntryKey) ?? 0) > 1;
        const rendersSharedAlias = sharesDetailEntry && renderedDetailKeys.has(step.detailEntryKey);

        segments.push({
            step,
            stepIndex: index,
            displayEntry,
            choices,
            selectedChoice,
            isActive: progression.activeStepKeys.has(step.stepKey),
            sharesDetailEntry,
            rendersSharedAlias,
        });

        if (!rendersSharedAlias) {
            renderedDetailKeys.add(step.detailEntryKey);
        }

        if (choices.length > 0) {
            if (!selectedChoice) {
                if (index < visibleUntil) {
                    continue;
                }
                lockedFromIndex = index + 1;
                break;
            }

            const targetKeys = selectedChoiceTargetKeys(selectedChoice);
            const targetStepIndex = stepIndexForKeys(steps, targetKeys, entriesByKey, index);
            if (targetStepIndex != null) {
                if (selectedChoice.targetEntryKey) {
                    displayEntryOverrides.set(steps[targetStepIndex].stepKey, selectedChoice.targetEntryKey);
                }
                visibleUntil = Math.max(visibleUntil, targetStepIndex);
            }

            const continuationStepIndex = stepIndexForKeys(
                steps,
                selectedChoiceContinuationKeys(selectedChoice, entriesByKey),
                entriesByKey,
                index + 1
            );
            if (continuationStepIndex != null) {
                visibleUntil = Math.max(visibleUntil, continuationStepIndex);
                continue;
            }

            const nextLocation = progressionLocationForKeys(fullProgression, selectedChoiceContinuationKeys(selectedChoice, entriesByKey), entriesByKey)
                ?? progressionLocationForKeys(fullProgression, targetKeys, entriesByKey);
            if (nextLocation && !isSameProgressionChapter(progression, nextLocation)) {
                reachedEntryKey = entriesByKey[nextLocation.step.detailEntryKey]?.entryKey
                    ?? selectedChoice.targetEntryKey
                    ?? null;
                break;
            }

            if (targetStepIndex != null && targetStepIndex <= index && selectedChoice.stepKey === "") {
                continue;
            }

            if (targetStepIndex == null || targetStepIndex <= index) {
                unresolvedChoice = selectedChoice;
                break;
            }
        } else if (index === visibleUntil && index < steps.length - 1) {
            visibleUntil = index + 1;
        }
    }

    return {
        segments,
        lockedSteps: lockedFromIndex == null ? [] : steps.slice(lockedFromIndex),
        unresolvedChoice,
        reachedEntryKey,
    };
}

function StrategyOverview({ entry }: { entry: QuestExplorerEntry }) {
    const objectives = entry.strategyView.objectives;
    const requirements = objectives.flatMap((objective) => objective.requirements);
    const rewards = objectives.flatMap((objective) => objective.rewards);

    return (
        <section className="questExplorer-strategyOverview" aria-label="Strategy overview">
            <OverviewColumn
                title="Objectives"
                items={objectives.map((objective) => objective.text)}
                emptyLabel="No objectives recorded"
                tone="objective"
            />
            <OverviewColumn
                title="Requirements"
                items={requirements.map((requirement) => requirement.displayText)}
                emptyLabel="No requirements recorded"
                tone="requirement"
            />
            <OverviewColumn
                title="Rewards"
                items={rewards.map((reward) => reward.displayText)}
                emptyLabel="No rewards recorded"
                tone="reward"
            />
        </section>
    );
}

function OverviewColumn({
    title,
    items,
    emptyLabel,
    tone,
}: {
    title: string;
    items: string[];
    emptyLabel: string;
    tone: "objective" | "requirement" | "reward";
}) {
    const visibleItems = items.filter(Boolean).slice(0, 5);

    return (
        <section className={`questExplorer-overviewColumn questExplorer-overviewColumn--${tone}`}>
            <h3>{title}</h3>
            <ul>
                {visibleItems.length > 0 ? visibleItems.map((item, index) => (
                    <li key={`${title}:${index}`}>{item}</li>
                )) : <li className="is-empty">{emptyLabel}</li>}
            </ul>
        </section>
    );
}

function LorePrelude({ entry }: { entry: QuestExplorerEntry }) {
    const quoteLine = entry.loreView.sections
        .flatMap((section) => section.lines)
        .find((line) => line.text.length > 48 && line.role !== "narrator")
        ?? entry.loreView.sections.flatMap((section) => section.lines).find((line) => line.text.length > 64);

    return (
        <section className="questExplorer-lorePrelude" aria-label="Lore prelude">
            <div className="questExplorer-loreHero" aria-hidden="true" />
            {quoteLine ? (
                <blockquote className="questExplorer-loreQuote">
                    <p>{quoteLine.text}</p>
                    <footer>{quoteLine.speakerLabel || quoteLine.role || "Archive"}</footer>
                </blockquote>
            ) : null}
        </section>
    );
}

function EntryStrategyContent({ entry }: { entry: QuestExplorerEntry }) {
    const objectives = entry.strategyView.objectives;

    if (objectives.length === 0) {
        return <p className="questExplorer-emptyState">No strategy objectives are attached to this beat.</p>;
    }

    return (
        <div className="questExplorer-stepStrategy">
            {objectives.map((objective, index) => (
                <section className="questExplorer-stepObjective" key={objective.objectiveKey ?? `${entry.entryKey}:objective:${index}`}>
                    <span>{objective.phase || "Objective"}</span>
                    <p>{objective.text}</p>
                    <InlineMetaList label="Requirements" values={objective.requirements.map((requirement) => requirement.displayText)} />
                    <InlineMetaList label="Rewards" values={objective.rewards.map((reward) => reward.displayText)} />
                </section>
            ))}
        </div>
    );
}

function InlineMetaList({ label, values }: { label: string; values: string[] }) {
    const cleanValues = values.filter(Boolean);
    if (cleanValues.length === 0) return null;

    return (
        <div className="questExplorer-inlineMeta">
            <strong>{label}</strong>
            <ul>
                {cleanValues.map((value, index) => (
                    <li key={`${label}:${index}`}>{value}</li>
                ))}
            </ul>
        </div>
    );
}

function EntryLoreContent({ entry, compact = false }: { entry: QuestExplorerEntry; compact?: boolean }) {
    const sections = entry.loreView.sections;

    if (sections.length === 0) {
        return entry.summaryLines.length > 0 ? (
            <div className="questExplorer-stepSummary">
                {entry.summaryLines.map((line, index) => (
                    <p key={`${entry.entryKey}:summary:${index}`}>{line}</p>
                ))}
            </div>
        ) : <p className="questExplorer-emptyState">No lore sections are attached to this beat.</p>;
    }

    return (
        <div className={`questExplorer-stepLore${compact ? " questExplorer-stepLore--compact" : ""}`}>
            {sections.map((section) => (
                <section className="questExplorer-stepLoreSection" key={section.sectionKey}>
                    <h4>{section.phase || "Chronicle"}</h4>
                    {section.lines.map((line, index) => (
                        <p className={`questExplorer-stepLoreLine questExplorer-stepLoreLine--${line.role || "narrator"}`} key={`${section.sectionKey}:${index}`}>
                            {line.speakerLabel ? <strong>{line.speakerLabel}: </strong> : null}
                            {line.text}
                        </p>
                    ))}
                </section>
            ))}
        </div>
    );
}

function AdventureChoiceCards({
    step,
    choices,
    selectedChoice,
    onChoose,
}: {
    step: QuestProgressionStep;
    choices: AdventureChoice[];
    selectedChoice: AdventureChoiceSelection | null;
    onChoose: (step: QuestProgressionStep, choice: AdventureChoice) => void;
}) {
    if (choices.length === 0) return null;

    return (
        <section className="questExplorer-choiceGate" aria-label={`${stepPositionLabel(step)} choices`}>
            <h3>Make a Choice</h3>
            <div>
                {choices.map((choice) => {
                    const isSelected = selectedChoice?.choiceId === choice.id;
                    return (
                        <button
                            type="button"
                            className={`questExplorer-choiceCard questExplorer-choiceCard--${choice.accent}${isSelected ? " is-selected" : ""}`}
                            aria-pressed={isSelected}
                            aria-current={isSelected ? "true" : undefined}
                            onClick={() => onChoose(step, choice)}
                            key={`${step.stepKey}:${choice.id}`}
                        >
                            <span className="questExplorer-choiceCardMark" aria-hidden="true" />
                            <span className="questExplorer-choiceCardGlyph" aria-hidden="true" />
                            <span className="questExplorer-choiceCardCopy">
                                <small>{choice.eyebrow}</small>
                                <strong>{choice.label}</strong>
                                {choice.descriptionLines.length > 0 ? <span>{choice.descriptionLines.join(" ")}</span> : null}
                            </span>
                        </button>
                    );
                })}
            </div>
            {!selectedChoice ? (
                <p className="questExplorer-choiceHint">Your choice will shape the path ahead.</p>
            ) : null}
        </section>
    );
}

function ProgressionPips({ total, activeIndex }: { total: number; activeIndex: number }) {
    return (
        <span className="questExplorer-stepPips" aria-hidden="true">
            {Array.from({ length: Math.max(total, 1) }).map((_, index) => (
                <span className={index <= activeIndex ? "is-lit" : ""} key={index} />
            ))}
        </span>
    );
}

function AdventureChronicle({
    progression,
    flow,
    mode,
    entriesByKey,
    onChoose,
}: {
    progression: QuestDetailProgression | null;
    flow: AdventureFlow | null;
    mode: QuestExplorerMode;
    entriesByKey: Record<string, QuestExplorerEntry>;
    onChoose: (step: QuestProgressionStep, choice: AdventureChoice) => void;
}) {
    if (!progression || !flow) return null;

    const totalSteps = progression.chapter.steps.length;

    return (
        <section className={`questExplorer-adventureChronicle questExplorer-adventureChronicle--${mode}`} aria-label="Selected progression">
            {flow.segments.map((segment) => {
                const title = segment.displayEntry?.title || segment.step.title || entriesByKey[segment.step.detailEntryKey]?.title || "Unknown Horizons";

                return (
                    <article
                        className={`questExplorer-adventureStep${segment.isActive ? " is-active" : ""}`}
                        aria-current={segment.isActive ? "step" : undefined}
                        key={segment.step.stepKey}
                    >
                        <div className="questExplorer-stepRule" aria-hidden="true" />
                        <header className="questExplorer-stepHeader">
                            <div>
                                <span className="questExplorer-stepLabel">
                                    <span>{stepPositionLabel(segment.step)}</span>
                                    <span>of {totalSteps}</span>
                                </span>
                                <ProgressionPips total={totalSteps} activeIndex={segment.stepIndex} />
                            </div>
                            <strong className="questExplorer-stepTitle">{title}</strong>
                            <small>{projectionLabel(segment.step.projectionKind)}</small>
                        </header>

                        {(segment.sharesDetailEntry || isVirtualAliasStep(segment.step)) ? (
                            <div className="questExplorer-progressionStepMeta">
                                {segment.sharesDetailEntry ? <span>Shared content</span> : null}
                                {isVirtualAliasStep(segment.step) ? <span>{segment.step.detailEntryKey}</span> : null}
                            </div>
                        ) : null}

                        {segment.rendersSharedAlias ? (
                            <div className="questExplorer-sharedAlias">
                                <strong>Shared chronicle page</strong>
                                <p>This beat aliases the same content record, so the archive keeps it as shared content instead of duplicating the full page.</p>
                            </div>
                        ) : segment.displayEntry ? (
                            mode === "lore"
                                ? <EntryLoreContent entry={segment.displayEntry} />
                                : (
                                    <>
                                        {segment.displayEntry.summaryLines.length > 0 ? (
                                            <div className="questExplorer-stepSummary">
                                                {segment.displayEntry.summaryLines.map((line, index) => (
                                                    <p key={`${segment.displayEntry?.entryKey}:summary:${index}`}>{line}</p>
                                                ))}
                                            </div>
                                        ) : null}
                                        <EntryStrategyContent entry={segment.displayEntry} />
                                        <EntryLoreContent entry={segment.displayEntry} compact />
                                    </>
                                )
                        ) : (
                            <p className="questExplorer-emptyState">This progression beat has no entry-backed content in the current DTO.</p>
                        )}

                        <AdventureChoiceCards
                            step={segment.step}
                            choices={segment.choices}
                            selectedChoice={segment.selectedChoice}
                            onChoose={onChoose}
                        />
                    </article>
                );
            })}

            {flow.unresolvedChoice ? (
                <section className="questExplorer-pathState questExplorer-pathState--unresolved">
                    <span>Path Continues</span>
                    <p>The choice "{flow.unresolvedChoice.label}" is modeled, but this payload does not identify the next progression segment. The chronicle stops here rather than guessing.</p>
                </section>
            ) : null}

            {flow.reachedEntryKey ? (
                <section className="questExplorer-pathState questExplorer-pathState--chapter">
                    <span>Next Chapter Reached</span>
                    <p>{entriesByKey[flow.reachedEntryKey]?.title ?? "The next chapter"} is now the active rail context.</p>
                </section>
            ) : null}

            {flow.lockedSteps.map((step, index) => (
                <article className="questExplorer-adventureStep questExplorer-adventureStep--locked" key={`locked:${step.stepKey}`}>
                    <div className="questExplorer-stepRule" aria-hidden="true" />
                    <header className="questExplorer-stepHeader">
                        <div>
                            <span className="questExplorer-stepLabel">
                                <span>{stepPositionLabel(step)}</span>
                                <span>of {totalSteps}</span>
                            </span>
                            <ProgressionPips total={totalSteps} activeIndex={-1} />
                        </div>
                        <strong className="questExplorer-stepTitle">{step.title || entriesByKey[step.detailEntryKey]?.title || "Unknown Horizons"}</strong>
                    </header>
                    <p>This step will be revealed after you make your choice.</p>
                </article>
            ))}
        </section>
    );
}

export default function QuestExplorerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const loading = useQuestStore(selectQuestLoading);
    const loaded = useQuestStore(selectQuestLoaded);
    const error = useQuestStore(selectQuestError);
    const questExplorer = useQuestStore(selectQuestExplorer);
    const entries = useQuestStore((state) => state.entries);
    const entriesByKey = useQuestStore((state) => state.entriesByKey);
    const selectedEntry = useQuestStore(selectSelectedQuest);
    const selectedEntryKey = useQuestStore((state) => state.selectedEntryKey);
    const filters = useQuestStore((state) => state.filters);
    const mode = useQuestStore((state) => state.mode);
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const loadQuestExplorer = useQuestStore((state) => state.loadQuestExplorer);
    const setSelectedEntryKey = useQuestStore((state) => state.setSelectedEntryKey);
    const setMode = useQuestStore((state) => state.setMode);
    const setFilters = useQuestStore((state) => state.setFilters);
    const resolveEntryKey = useQuestStore((state) => state.resolveEntryKey);
    const [choicePath, setChoicePath] = useState<AdventureChoiceSelection[]>([]);

    const requestedEntryKey = routeEntryKey(location.pathname) ?? searchParams.get("quest");
    const requestedMode = normalizeQuestExplorerMode(searchParams.get("mode"));
    const visibleEntries = useMemo(
        () => filterQuestEntries(entries, filters, selectedFaction),
        [entries, filters, selectedFaction]
    );
    const visibleEntryKeys = useMemo(
        () => new Set(visibleEntries.map((entry) => entry.entryKey)),
        [visibleEntries]
    );
    const progression = questExplorer?.progression ?? null;
    const railGroups = useMemo(
        () => buildQuestRailGroups(entries, progression, visibleEntryKeys),
        [entries, progression, visibleEntryKeys]
    );
    const railEntryCount = useMemo(
        () => railGroups.reduce((total, group) => total + group.items.length, 0),
        [railGroups]
    );
    const selectedProgression = useMemo(
        () => findDetailProgression(progression, selectedEntry),
        [progression, selectedEntry]
    );
    const selectedProgressionKey = useMemo(
        () => progressionContextKey(selectedProgression, selectedEntryKey),
        [selectedEntryKey, selectedProgression]
    );
    const choicePathResetKey = `${selectedEntryKey ?? "none"}:${selectedProgressionKey}`;
    const adventureFlow = useMemo(
        () => selectedProgression
            ? buildAdventureFlow(selectedProgression, entriesByKey, choicePath, progression)
            : null,
        [choicePath, entriesByKey, progression, selectedProgression]
    );
    const activeRailEntry = adventureFlow?.reachedEntryKey
        ? entriesByKey[adventureFlow.reachedEntryKey] ?? selectedEntry
        : selectedEntry;
    const selectedRailEntryKey = useMemo(
        () => resolveRailSelectionKey(activeRailEntry, railGroups),
        [activeRailEntry, railGroups]
    );

    useEffect(() => {
        void loadQuestExplorer();
    }, [loadQuestExplorer]);

    useEffect(() => {
        if (mode !== requestedMode) setMode(requestedMode);
    }, [mode, requestedMode, setMode]);

    useEffect(() => {
        setChoicePath([]);
    }, [choicePathResetKey]);

    useEffect(() => {
        if (!loaded) return;

        if (requestedEntryKey) {
            const resolved = resolveEntryKey(requestedEntryKey);
            if (resolved && visibleEntryKeys.has(resolved)) {
                if (resolved !== selectedEntryKey) {
                    setSelectedEntryKey(resolved);
                }
                return;
            }
            if (resolved && !visibleEntryKeys.has(resolved)) {
                const fallbackEntryKey = visibleEntries[0]?.entryKey ?? null;
                if (fallbackEntryKey !== selectedEntryKey) {
                    setSelectedEntryKey(fallbackEntryKey);
                }
                if (fallbackEntryKey) {
                    navigate(questPath(fallbackEntryKey, mode), { replace: true });
                }
                return;
            }
            if (!resolved && selectedEntryKey) {
                setSelectedEntryKey(null);
            }
            return;
        }

        if (!selectedEntryKey || !visibleEntryKeys.has(selectedEntryKey)) {
            setSelectedEntryKey(visibleEntries[0]?.entryKey ?? null);
        }
    }, [loaded, mode, navigate, requestedEntryKey, resolveEntryKey, selectedEntryKey, setSelectedEntryKey, visibleEntries, visibleEntryKeys]);

    const categoryOptions = useMemo(() => (
        QUEST_CATEGORY_OPTIONS.map((option) => ({
            ...option,
            count: buildQuestRailGroups(
                entries,
                progression,
                new Set(filterQuestEntries(
                    entries,
                    { searchText: filters.searchText, category: option.key },
                    selectedFaction
                ).map((entry) => entry.entryKey))
            ).reduce((total, group) => total + group.items.length, 0),
        }))
    ), [entries, filters.searchText, progression, selectedFaction]);

    const selectEntry = (entryKey: string) => {
        setSelectedEntryKey(entryKey);
        navigate(questPath(entryKey, mode));
    };

    const chooseAdventureChoice = (step: QuestProgressionStep, choice: AdventureChoice) => {
        if (!selectedProgression) return;
        const stepIndex = selectedProgression.chapter.steps.findIndex((candidate) => candidate.stepKey === step.stepKey);
        if (stepIndex < 0) return;

        setChoicePath((current) => {
            const retained = current.filter((selection) => {
                const selectionIndex = selectedProgression.chapter.steps.findIndex((candidate) => candidate.stepKey === selection.stepKey);
                return selectionIndex >= 0 && selectionIndex < stepIndex;
            });
            return [...retained, selectionForChoice(step.stepKey, choice)];
        });
    };

    const changeMode = (nextMode: QuestExplorerMode) => {
        setMode(nextMode);
        const nextParams = new URLSearchParams(searchParams);
        if (nextMode === DEFAULT_QUEST_EXPLORER_MODE) {
            nextParams.delete("mode");
        } else {
            nextParams.set("mode", nextMode);
        }
        setSearchParams(nextParams, { replace: true });
    };

    const missingRequestedEntry = loaded && requestedEntryKey && !resolveEntryKey(requestedEntryKey);
    const detailBreadcrumb = selectedEntry
        ? [
            getQuestCategoryLabel(selectedEntry.questType),
            selectedProgression ? chapterPositionLabel(selectedProgression.chapter) : selectedEntry.navigation.chapterLabel,
        ].filter(Boolean)
        : [];
    const headerSummary = selectedEntry
        ? selectedProgression
            ? compactMeta(selectedEntry)
            : selectedEntry.summaryLines[0] ?? compactMeta(selectedEntry)
        : null;

    return (
        <main className="questExplorer-page">
            <h1 className="seo-hidden">Endless Legend 2 Quest Explorer</h1>

            <section className="questExplorer" aria-label="Quest Explorer">
                <aside className="questExplorer-sidebar">
                    <header>
                        <div>
                            <span>Quest Archive</span>
                            <h2>Progression</h2>
                        </div>
                        <div className="questExplorer-sidebarCount">
                            <strong>{railEntryCount} / {entries.length}</strong>
                            <small>Quests</small>
                        </div>
                    </header>

                    <div className="questExplorer-filters">
                        <label className="questExplorer-filterField questExplorer-filterField--search">
                            <span>Search</span>
                            <input
                                type="search"
                                value={filters.searchText}
                                placeholder="Search quests..."
                                onChange={(event) => setFilters({ searchText: event.currentTarget.value })}
                            />
                        </label>
                        <CategorySelector
                            value={filters.category}
                            options={categoryOptions}
                            onChange={(category) => setFilters({ category })}
                        />
                    </div>

                    <QuestList
                        groups={railGroups}
                        selectedRailEntryKey={selectedRailEntryKey}
                        onSelectEntry={selectEntry}
                    />
                </aside>

                <section className="questExplorer-detail" aria-live="polite">
                    {loading ? <div className="questExplorer-state">Loading quest explorer...</div> : null}
                    {error ? <div className="questExplorer-state questExplorer-state--error">{error}</div> : null}
                    {missingRequestedEntry ? (
                        <div className="questExplorer-state questExplorer-state--error">
                            No quest entry or alias matches <code>{requestedEntryKey}</code>.
                        </div>
                    ) : null}
                    {!loading && !error && !selectedEntry ? (
                        <div className="questExplorer-state">
                            {entries.length === 0 ? "No quest explorer entries are available." : "No quest matches the current filters."}
                        </div>
                    ) : null}

                    {selectedEntry ? (
                        <>
                            <header className="questExplorer-adventureHeader">
                                <div className="questExplorer-adventureHeaderCopy">
                                    <nav className="questExplorer-breadcrumb" aria-label="Quest context">
                                        {detailBreadcrumb.map((part, index) => (
                                            <span key={`${part}:${index}`}>{part}</span>
                                        ))}
                                    </nav>
                                    <h2>{selectedEntry.title}</h2>
                                    {headerSummary ? <p>{headerSummary}</p> : null}
                                </div>
                                <QuestExplorerModeSwitch mode={mode} onModeChange={changeMode} />
                            </header>

                            <section className={`questExplorer-content questExplorer-content--${mode}`}>
                                {mode === "strategy" ? (
                                    <StrategyOverview entry={selectedEntry} />
                                ) : (
                                    <LorePrelude entry={selectedEntry} />
                                )}

                                {selectedProgression ? (
                                    <AdventureChronicle
                                        progression={selectedProgression}
                                        flow={adventureFlow}
                                        mode={mode}
                                        entriesByKey={entriesByKey}
                                        onChoose={chooseAdventureChoice}
                                    />
                                ) : (
                                    <section className="questExplorer-adventureFallback" aria-label="Selected progression">
                                        {mode === "lore" ? <EntryLoreContent entry={selectedEntry} /> : <EntryStrategyContent entry={selectedEntry} />}
                                    </section>
                                )}
                            </section>
                        </>
                    ) : null}
                </section>
            </section>
        </main>
    );
}
