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
    getQuestCategoryKey,
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
import { getEmpireLabel } from "@/lib/labels/empireLabels";
import type {
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerProgression,
    LoreSection,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
    QuestProgressionVariant,
    StrategyObjective,
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

type QuestPathChoice = {
    id: string;
    label: string;
    eyebrow: string;
    sourceEntryKey: string | null;
    descriptionLines: string[];
    strategyLines: string[];
    loreLines: string[];
    requirementLines: string[];
    rewardLines: string[];
    targetEntryKey: string | null;
    continuationTitle: string | null;
    nextEntryKeys: string[];
    accent: "gold" | "teal";
};

type QuestPathChoiceSelection = {
    stepKey: string;
    choiceId: string;
    label: string;
    targetEntryKey: string | null;
    nextEntryKeys: string[];
};

type RenderedPathStep = {
    step: QuestProgressionStep;
    stepIndex: number;
    displayEntry: QuestExplorerEntry | null;
    choices: QuestPathChoice[];
    selectedChoice: QuestPathChoiceSelection | null;
    isActive: boolean;
    repeatsDetailEntry: boolean;
    rendersRepeatedDetailContent: boolean;
};

type QuestPathFlow = {
    renderedSteps: RenderedPathStep[];
    lockedSteps: QuestProgressionStep[];
    unresolvedContinuation: QuestPathChoiceSelection | null;
    reachedContinuationEntryKey: string | null;
};

type QuestObjectivePath = {
    objective: StrategyObjective;
    sections: LoreSection[];
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

function questPath(entryKey: string, mode: QuestExplorerMode, debugQuestProgression = false): string {
    const params = new URLSearchParams();
    if (mode !== DEFAULT_QUEST_EXPLORER_MODE) params.set("mode", mode);
    if (debugQuestProgression) params.set("debugQuestProgression", "true");
    const query = params.toString();
    return `/quests/${encodeURIComponent(entryKey)}${query ? `?${query}` : ""}`;
}

function isQuestProgressionDebugEnabled(searchParams: URLSearchParams): boolean {
    return searchParams.get("debugQuestProgression") === "true";
}

function compactMeta(entry: QuestExplorerEntry): string {
    const nav = entry.navigation;
    return [
        nav.factionName,
        nav.questLineName,
        nav.chapterLabel,
        nav.stepLabel,
        nav.branchLabel,
    ].filter(Boolean).join(" / ");
}

function normalizedKind(value: string): string {
    return value.trim().toLowerCase();
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

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

function phaseDisplayLabel(phase: string | null | undefined, fallback = "Objective"): string {
    const normalized = (phase ?? "").trim().toLowerCase();
    if (!normalized) return fallback;

    const labels: Record<string, string> = {
        start: "Opening",
        intro: "Opening",
        success: "Resolution",
        failure: "Setback",
        choice: "Choice",
        completion: "Objective",
        other: fallback,
    };

    return labels[normalized] ?? normalized
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function headerMetaItems(
    entry: QuestExplorerEntry,
    progression: QuestDetailProgression | null
): Array<{ label: string; value: string }> {
    return [
        { label: "Faction", value: entry.navigation.factionName ?? "" },
        { label: "Questline", value: entry.navigation.questLineName ?? progression?.questline.questLineName ?? "" },
        {
            label: "Chapter",
            value: progression ? chapterPositionLabel(progression.chapter) : entry.navigation.chapterLabel ?? "",
        },
        {
            label: "Progression",
            value: progression ? countLabel(progression.chapter.steps.length, "step") : entry.navigation.stepLabel ?? "",
        },
    ].filter((item) => item.value.trim().length > 0);
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
    const scopeLabels: Record<QuestCategoryKey, string> = {
        faction: "Main",
        minorFaction: "Minor",
        world: "World",
        other: "Other",
    };

    return (
        <fieldset className="questExplorer-categorySelector" aria-label="Category">
            <legend>Scope</legend>
            <div className="questExplorer-categoryOptions">
                {options.map((option) => {
                    const label = scopeLabels[option.key] ?? option.label;
                    return (
                        <label
                            className={`questExplorer-categoryOption${option.key === value ? " is-selected" : ""}`}
                            key={option.key}
                        >
                            <input
                                aria-label={`${option.label} ${option.count}`}
                                type="radio"
                                name="quest-category"
                                value={option.key}
                                checked={option.key === value}
                                onChange={() => onChange(option.key)}
                            />
                            <span className="questExplorer-categoryGlyph" aria-hidden="true" />
                            <span className="questExplorer-categoryOptionText">{label}</span>
                            <small>{option.count}</small>
                        </label>
                    );
                })}
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

function cleanRailDisplayLabel(value: string | null | undefined): string | null {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
}

function railFactionLabel(...keys: Array<string | null | undefined>): string | null {
    for (const key of keys) {
        const label = getEmpireLabel(key);
        if (label !== "Unknown" && label !== key) return label;
    }
    return null;
}

function railGroupDisplayTitle(group: QuestRailGroup): string {
    const firstItem = group.items[0] ?? null;
    const questline = firstItem?.progression?.questline ?? null;

    return cleanRailDisplayLabel(questline?.questLineName)
        ?? cleanRailDisplayLabel(firstItem?.entry.navigation.questLineName)
        ?? railFactionLabel(
            questline?.factionFamilyKey,
            questline?.factionKey,
            firstItem?.entry.navigation.factionKey
        )
        ?? cleanRailDisplayLabel(questline?.factionName)
        ?? cleanRailDisplayLabel(firstItem?.entry.navigation.factionName)
        ?? group.title;
}

function isMinorFactionVariantQuest(entry: QuestExplorerEntry): boolean {
    return getQuestCategoryKey(entry.questType) === "minorFaction"
        && entry.strategyView.objectives.length > 1;
}

function lorePhaseKey(phase: string | null | undefined): string {
    return (phase ?? "").trim().toLowerCase();
}

function isResolutionLoreSection(section: LoreSection): boolean {
    return lorePhaseKey(section.phase) === "success" || lorePhaseKey(section.phase) === "resolution";
}

function objectiveVariantLabel(index: number): string {
    return `Objective ${index + 1}`;
}

function objectivePaths(entry: QuestExplorerEntry): QuestObjectivePath[] {
    return entry.strategyView.objectives.map((objective) => ({
        objective,
        sections: entry.loreView.sections.filter((section) => (
            section.objectiveKey === objective.objectiveKey && !isResolutionLoreSection(section)
        )),
    }));
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
                        <span>{railGroupDisplayTitle(group)}</span>
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
): QuestPathChoice[] {
    const variantChoices = visibleStepVariants(step).map((variant): QuestPathChoice => {
        const target = entriesByKey[variant.entryKey] ?? null;
        const explicitTargets = variantTargetKeys(variant);
        const targetSummary = target?.summaryLines[0] ?? null;
        const label = target?.title || variant.title || "Choice";
        const descriptionLines = choiceDescription([variant.branchLabel, targetSummary], null);

        return {
            id: `variant:${variant.entryKey}`,
            label,
            eyebrow: variant.branchLabel || "Choice",
            sourceEntryKey: target?.entryKey ?? variant.entryKey,
            descriptionLines,
            strategyLines: choiceDescription([targetSummary], null),
            loreLines: descriptionLines,
            requirementLines: [],
            rewardLines: [],
            targetEntryKey: target?.entryKey ?? knownEntryKey(explicitTargets, entriesByKey),
            continuationTitle: target?.title ?? null,
            nextEntryKeys: uniqueStrings([variant.entryKey, ...explicitTargets]),
            accent: "teal",
        };
    });

    const branchChoices = [...(detailEntry?.branches ?? [])]
        .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER))
        .map((branch): QuestPathChoice => {
            const explicitTargets = branchTargetKeys(branch);
            const targetEntryKey = knownEntryKey(explicitTargets, entriesByKey);
            const target = targetEntryKey ? entriesByKey[targetEntryKey] : null;
            const loreLines = choiceDescription([
                ...(branch.lore?.outcomePreviewLines ?? []),
                target?.summaryLines[0],
            ], target?.title ?? null);
            const strategyLines = choiceDescription([
                ...(branch.strategy?.conditions ?? []),
                target?.summaryLines[0],
            ], target?.title ?? null);
            const requirementLines = (branch.strategy?.requirements ?? []).map((requirement) => requirement.displayText);
            const rewardLines = (branch.strategy?.rewards ?? []).map((reward) => reward.displayText);
            const repeatedEntryTitle = branch.label && detailEntry?.title && branch.label === detailEntry.title;

            return {
                id: `branch:${branch.branchKey}`,
                label: repeatedEntryTitle ? strategyLines[0] ?? target?.title ?? branch.label ?? "Choice" : branch.label || target?.title || "Choice",
                eyebrow: branch.groupLabel || "Choice",
                sourceEntryKey: detailEntry?.entryKey ?? null,
                descriptionLines: uniqueStrings([...strategyLines, ...loreLines]),
                strategyLines,
                loreLines,
                requirementLines,
                rewardLines,
                targetEntryKey,
                continuationTitle: target?.title ?? null,
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

function selectionForChoice(stepKey: string, choice: QuestPathChoice): QuestPathChoiceSelection {
    return {
        stepKey,
        choiceId: choice.id,
        label: choice.label,
        targetEntryKey: choice.targetEntryKey,
        nextEntryKeys: choice.nextEntryKeys,
    };
}

function selectedChoiceTargetKeys(selection: QuestPathChoiceSelection): string[] {
    return uniqueStrings([selection.targetEntryKey, ...selection.nextEntryKeys]);
}

function selectedChoiceContinuationKeys(
    selection: QuestPathChoiceSelection,
    entriesByKey: Record<string, QuestExplorerEntry>
): string[] {
    const target = selection.targetEntryKey ? entriesByKey[selection.targetEntryKey] ?? null : null;
    return uniqueStrings([
        ...selection.nextEntryKeys,
        ...continuationKeys(target),
    ]);
}

function implicitActiveChoice(
    choices: QuestPathChoice[],
    activeVariantEntryKeys: Set<string>
): QuestPathChoiceSelection | null {
    const choice = choices.find((candidate) => (
        candidate.targetEntryKey ? activeVariantEntryKeys.has(candidate.targetEntryKey) : false
    ) || candidate.nextEntryKeys.some((entryKey) => activeVariantEntryKeys.has(entryKey)));

    return choice ? selectionForChoice("", choice) : null;
}

function locationLabel(location: QuestProgressionLocation | null, entriesByKey: Record<string, QuestExplorerEntry>): string | null {
    if (!location) return null;
    const title = entriesByKey[location.step.detailEntryKey]?.title ?? location.step.title;
    return [
        chapterPositionLabel(location.chapter),
        stepPositionLabel(location.step),
        title ? `(${title})` : null,
    ].filter(Boolean).join(" ");
}

function choiceKindLabel(choice: QuestPathChoice): string {
    return choice.id.startsWith("variant:") ? "variant" : "branch";
}

function isMainFactionEntry(entry: QuestExplorerEntry | null): boolean {
    return Boolean(entry && getQuestCategoryKey(entry.questType) === "faction");
}

function isTerminalChoiceChapter(progression: QuestDetailProgression): boolean {
    const chapterNumber = progression.chapter.chapterNumber ?? progression.chapter.chapterOrder;
    return chapterNumber != null && chapterNumber >= 6;
}

function hasModeledChoiceContinuation(choice: QuestPathChoice): boolean {
    return Boolean(choice.targetEntryKey || choice.nextEntryKeys.length > 0);
}

function isHiddenNormalChoice(
    choice: QuestPathChoice,
    displayEntry: QuestExplorerEntry | null,
    progression: QuestDetailProgression
): boolean {
    return isMainFactionEntry(displayEntry)
        && !isTerminalChoiceChapter(progression)
        && !hasModeledChoiceContinuation(choice);
}

function visibleChoicesForMode(
    choices: QuestPathChoice[],
    displayEntry: QuestExplorerEntry | null,
    progression: QuestDetailProgression,
    debugQuestProgression: boolean
): QuestPathChoice[] {
    if (debugQuestProgression) return choices;
    return choices.filter((choice) => !isHiddenNormalChoice(choice, displayEntry, progression));
}

function entryNavigationLocationLabel(entry: QuestExplorerEntry | null): string | null {
    if (!entry) return null;
    const chapter = entry.navigation.chapterLabel
        ?? (entry.navigation.chapter != null ? `Chapter ${entry.navigation.chapter}` : null);
    const step = entry.navigation.stepLabel
        ?? (entry.navigation.step != null ? `Step ${entry.navigation.step}` : null);
    const location = [chapter, step].filter(Boolean).join(" ");
    return location ? `${location} (${entry.entryKey})` : entry.entryKey;
}

function choiceOriginLabel(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>
): string {
    const renderedAt = `${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(step)}`;
    const owner = entryNavigationLocationLabel(choice.sourceEntryKey ? entriesByKey[choice.sourceEntryKey] ?? null : null);
    return owner ? `shown at ${renderedAt}; owner ${owner}` : `shown at ${renderedAt}; owner unknown`;
}

function choiceDebugDestination(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): string {
    const sourceEntry = choice.sourceEntryKey ? entriesByKey[choice.sourceEntryKey] ?? null : null;
    const currentStepIndex = progression.chapter.steps.findIndex((candidate) => candidate.stepKey === step.stepKey);
    const selection = selectionForChoice(step.stepKey, choice);
    const targetKeys = selectedChoiceTargetKeys(selection);
    const continuationKeysForChoice = selectedChoiceContinuationKeys(selection, entriesByKey);
    const continuationOnlyKeys = continuationKeysForChoice.filter((key) => !targetKeys.includes(key));
    const continuationLookupKeys = continuationOnlyKeys.length > 0 ? continuationOnlyKeys : continuationKeysForChoice;
    const targetStepIndex = stepIndexForKeys(progression.chapter.steps, targetKeys, entriesByKey, currentStepIndex);
    const continuationStepIndex = stepIndexForKeys(
        progression.chapter.steps,
        continuationLookupKeys,
        entriesByKey,
        currentStepIndex < 0 ? 0 : currentStepIndex + 1
    );
    const kind = choiceKindLabel(choice);
    const origin = choiceOriginLabel(step, choice, progression, entriesByKey);
    const hiddenNormal = isHiddenNormalChoice(choice, sourceEntry, progression)
        ? "; hidden in normal UI: no modeled continuation before final chapter"
        : "";

    if (kind === "variant" && targetStepIndex === currentStepIndex) {
        const continuationLocation = progressionLocationForKeys(fullProgression, continuationLookupKeys, entriesByKey);
        const continuationLabel = continuationStepIndex != null
            ? `${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(progression.chapter.steps[continuationStepIndex])}`
            : locationLabel(continuationLocation, entriesByKey);
        return continuationLabel
            ? `Debug: ${origin}; variant -> current step variant; then ${continuationLabel}${hiddenNormal}`
            : `Debug: ${origin}; variant -> current step variant; continuation unresolved${hiddenNormal}`;
    }

    if (continuationStepIndex != null) {
        return `Debug: ${origin}; ${kind} -> ${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(progression.chapter.steps[continuationStepIndex])}${hiddenNormal}`;
    }

    const continuationLocation = progressionLocationForKeys(fullProgression, continuationLookupKeys, entriesByKey);
    if (continuationLocation) {
        return `Debug: ${origin}; ${kind} -> ${locationLabel(continuationLocation, entriesByKey)}${hiddenNormal}`;
    }

    if (targetStepIndex != null) {
        const targetStep = progression.chapter.steps[targetStepIndex];
        const sameStepNote = targetStep.stepKey === step.stepKey ? "current step" : stepPositionLabel(targetStep);
        return `Debug: ${origin}; ${kind} -> ${chapterPositionLabel(progression.chapter)} ${sameStepNote}${hiddenNormal}`;
    }

    const targetLocation = progressionLocationForKeys(fullProgression, targetKeys, entriesByKey);
    if (targetLocation) {
        return `Debug: ${origin}; ${kind} -> ${locationLabel(targetLocation, entriesByKey)}${hiddenNormal}`;
    }

    return `Debug: ${origin}; ${kind} -> unresolved, no modeled continuation${hiddenNormal}`;
}

function choiceDebugDetailsForStep(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): Map<string, string> {
    return new Map(choices.map((choice) => [
        choice.id,
        choiceDebugDestination(step, choice, progression, fullProgression, entriesByKey),
    ]));
}

function buildQuestPathFlow(
    progression: QuestDetailProgression,
    entriesByKey: Record<string, QuestExplorerEntry>,
    choicePath: QuestPathChoiceSelection[],
    fullProgression: QuestExplorerProgression | null,
    debugQuestProgression: boolean
): QuestPathFlow {
    const steps = progression.chapter.steps;
    const selectedByStep = new Map(choicePath.map((selection) => [selection.stepKey, selection]));
    const counts = detailEntryCounts(progression.chapter);
    const renderedDetailKeys = new Set<string>();
    const displayEntryOverrides = new Map<string, string>();
    const activeIndexes = steps
        .map((step, index) => progression.activeStepKeys.has(step.stepKey) ? index : -1)
        .filter((index) => index >= 0);
    let visibleUntil = Math.max(0, activeIndexes.length ? Math.max(...activeIndexes) : 0);
    let unresolvedContinuation: QuestPathChoiceSelection | null = null;
    let reachedContinuationEntryKey: string | null = null;
    let lockedFromIndex: number | null = null;
    const renderedSteps: RenderedPathStep[] = [];

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
        const repeatsDetailEntry = (counts.get(step.detailEntryKey) ?? 0) > 1;
        const rendersRepeatedDetailContent = repeatsDetailEntry && renderedDetailKeys.has(step.detailEntryKey);
        const allChoices = rendersRepeatedDetailContent ? [] : choicesForStep(step, displayEntry, entriesByKey);
        const choices = visibleChoicesForMode(allChoices, displayEntry, progression, debugQuestProgression);
        const storedSelection = selectedByStep.get(step.stepKey);
        const storedChoice = storedSelection
            ? choices.find((choice) => choice.id === storedSelection.choiceId) ?? null
            : null;
        const selectedChoice = storedSelection
            ? storedChoice ? selectionForChoice(step.stepKey, storedChoice) : null
            : implicitActiveChoice(choices, progression.activeVariantEntryKeys);

        renderedSteps.push({
            step,
            stepIndex: index,
            displayEntry,
            choices,
            selectedChoice,
            isActive: progression.activeStepKeys.has(step.stepKey),
            repeatsDetailEntry,
            rendersRepeatedDetailContent,
        });

        if (!rendersRepeatedDetailContent) {
            renderedDetailKeys.add(step.detailEntryKey);
        }

        if (allChoices.length > 0 && choices.length === 0) {
            if (index < visibleUntil && progression.activeVariantEntryKeys.size > 0) {
                continue;
            }
            lockedFromIndex = index + 1;
            break;
        }

        if (choices.length > 0) {
            if (!selectedChoice) {
                if (index < visibleUntil && progression.activeVariantEntryKeys.size > 0) {
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
                reachedContinuationEntryKey = entriesByKey[nextLocation.step.detailEntryKey]?.entryKey
                    ?? selectedChoice.targetEntryKey
                    ?? null;
                break;
            }

            if (targetStepIndex != null && targetStepIndex <= index && selectedChoice.stepKey === "") {
                continue;
            }

            if (targetStepIndex == null || targetStepIndex <= index) {
                unresolvedContinuation = selectedChoice;
                break;
            }
        } else if (index === visibleUntil && index < steps.length - 1) {
            visibleUntil = index + 1;
        }
    }

    const lockedSteps = lockedFromIndex == null
        ? []
        : steps.slice(lockedFromIndex).filter((step) => !renderedDetailKeys.has(step.detailEntryKey));

    return {
        renderedSteps,
        lockedSteps,
        unresolvedContinuation,
        reachedContinuationEntryKey,
    };
}

type ModeHeaderProps = {
    entry: QuestExplorerEntry;
    breadcrumb: string[];
    mode: QuestExplorerMode;
    onModeChange: (mode: QuestExplorerMode) => void;
    progression: QuestDetailProgression | null;
};

function Breadcrumb({ parts }: { parts: string[] }) {
    return (
        <nav className="questExplorer-breadcrumb" aria-label="Quest context">
            {parts.map((part, index) => (
                <span key={`${part}:${index}`}>{part}</span>
            ))}
        </nav>
    );
}

function StrategyHeader({
    entry,
    breadcrumb,
    mode,
    onModeChange,
    progression,
    summary,
}: ModeHeaderProps & { summary: string | null }) {
    const metaItems = headerMetaItems(entry, progression);

    return (
        <header className="questExplorer-questPathHeader questExplorer-strategyHeader">
            <div className="questExplorer-questPathHeaderCopy">
                <Breadcrumb parts={breadcrumb} />
                <h2>{entry.title}</h2>
                {summary ? <p>{summary}</p> : null}
                {metaItems.length > 0 ? (
                    <dl className="questExplorer-headerMeta">
                        {metaItems.map((item) => (
                            <div key={item.label}>
                                <dt>{item.label}</dt>
                                <dd>{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                ) : null}
            </div>
            <QuestExplorerModeSwitch mode={mode} onModeChange={onModeChange} />
        </header>
    );
}

function LoreHeader({
    entry,
    breadcrumb,
    mode,
    onModeChange,
}: ModeHeaderProps) {
    return (
        <header className="questExplorer-questPathHeader questExplorer-loreHeader">
            <div className="questExplorer-questPathHeaderCopy">
                <Breadcrumb parts={breadcrumb} />
                <h2>{entry.title}</h2>
            </div>
            <QuestExplorerModeSwitch mode={mode} onModeChange={onModeChange} />
        </header>
    );
}

function StrategyOverview({ entry }: { entry: QuestExplorerEntry }) {
    if (isMinorFactionVariantQuest(entry) || entry.branches.length > 0) return null;

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
            <h3>
                <span>{title}</span>
                <small>{visibleItems.length}</small>
            </h3>
            <ul>
                {visibleItems.length > 0 ? visibleItems.map((item, index) => (
                    <li key={`${title}:${index}`}>{item}</li>
                )) : <li className="is-empty">{emptyLabel}</li>}
            </ul>
        </section>
    );
}

function LoreOpening({ entry }: { entry: QuestExplorerEntry }) {
    if (entry.loreView.sections.length === 0) return null;

    const openingLines = entry.summaryLines.filter(Boolean).slice(0, 2);
    if (openingLines.length === 0) return null;

    return (
        <section className="questExplorer-loreOpening" aria-label="Lore opening">
            {openingLines.map((line, index) => (
                <p key={`${entry.entryKey}:opening:${index}`}>{line}</p>
            ))}
        </section>
    );
}

function StepSummary({ entry }: { entry: QuestExplorerEntry }) {
    if (entry.summaryLines.length === 0) return null;

    return (
        <div className="questExplorer-stepSummary">
            {entry.summaryLines.map((line, index) => (
                <p key={`${entry.entryKey}:summary:${index}`}>{line}</p>
            ))}
        </div>
    );
}

function EntryStrategyContent({ entry }: { entry: QuestExplorerEntry }) {
    const objectives = entry.strategyView.objectives;
    const usesObjectivePaths = isMinorFactionVariantQuest(entry);

    if (objectives.length === 0) {
        return <p className="questExplorer-emptyState">No strategy objectives are attached to this step.</p>;
    }

    return (
        <div className="questExplorer-stepStrategy">
            {objectives.map((objective, index) => (
                <section className="questExplorer-stepObjective" key={objective.objectiveKey ?? `${entry.entryKey}:objective:${index}`}>
                    <header className="questExplorer-stepObjectiveHeader">
                        <span>{usesObjectivePaths ? "Pacification Objective" : phaseDisplayLabel(objective.phase)}</span>
                        <strong>{usesObjectivePaths ? objectiveVariantLabel(index) : `Objective ${index + 1}`}</strong>
                    </header>
                    <p>{objective.text}</p>
                    <div className="questExplorer-stepObjectiveMetaGrid">
                        <InlineMetaList
                            label="Requirements"
                            values={objective.requirements.map((requirement) => requirement.displayText)}
                            tone="requirement"
                        />
                        <InlineMetaList
                            label="Rewards"
                            values={objective.rewards.map((reward) => reward.displayText)}
                            tone="reward"
                        />
                    </div>
                </section>
            ))}
        </div>
    );
}

function InlineMetaList({
    label,
    values,
    tone = "objective",
}: {
    label: string;
    values: string[];
    tone?: "objective" | "requirement" | "reward";
}) {
    const cleanValues = values.filter(Boolean);
    if (cleanValues.length === 0) return null;

    return (
        <div className={`questExplorer-inlineMeta questExplorer-inlineMeta--${tone}`}>
            <strong>{label}</strong>
            <ul>
                {cleanValues.map((value, index) => (
                    <li key={`${label}:${index}`}>{value}</li>
                ))}
            </ul>
        </div>
    );
}

function LoreSectionList({ entry }: { entry: QuestExplorerEntry }) {
    const sections = entry.loreView.sections;

    if (sections.length === 0) {
        return entry.summaryLines.length > 0
            ? <StepSummary entry={entry} />
            : <p className="questExplorer-emptyState">No lore sections are attached to this step.</p>;
    }

    if (isMinorFactionVariantQuest(entry)) {
        const paths = objectivePaths(entry);
        const sharedSections = sections.filter((section) => !section.objectiveKey && !isResolutionLoreSection(section));
        const resolutionSections = sections.filter(isResolutionLoreSection);

        return (
            <div className="questExplorer-loreSectionList questExplorer-loreSectionList--paths">
                {sharedSections.map((section) => (
                    <LoreSectionArticle section={section} key={section.sectionKey} />
                ))}
                <div className="questExplorer-lorePathList">
                    {paths.map((path, index) => (
                        <section
                            className="questExplorer-lorePath"
                            key={path.objective.objectiveKey ?? `${entry.entryKey}:path:${index}`}
                        >
                            <header className="questExplorer-lorePathHeader">
                                <span>{objectiveVariantLabel(index)}</span>
                                <strong>{path.objective.text}</strong>
                            </header>
                            {path.sections.length > 0 ? (
                                <div className="questExplorer-lorePathSections">
                                    {path.sections.map((section) => (
                                        <LoreSectionLines section={section} key={section.sectionKey} />
                                    ))}
                                </div>
                            ) : (
                                <p className="questExplorer-emptyState">No lore section is attached to this objective.</p>
                            )}
                        </section>
                    ))}
                </div>
                {resolutionSections.map((section) => (
                    <LoreSectionArticle section={section} key={section.sectionKey} title="Resolution" />
                ))}
            </div>
        );
    }

    return (
        <div className="questExplorer-loreSectionList">
            {sections.map((section) => (
                <LoreSectionArticle section={section} key={section.sectionKey} />
            ))}
        </div>
    );
}

function LoreSectionArticle({ section, title }: { section: LoreSection; title?: string }) {
    return (
        <section className="questExplorer-loreSection">
            <h4>{title ?? phaseDisplayLabel(section.phase, "Chronicle")}</h4>
            <LoreSectionLines section={section} />
        </section>
    );
}

function LoreSectionLines({ section }: { section: LoreSection }) {
    return (
        <>
            {section.lines.map((line, index) => (
                <p className={`questExplorer-loreLine questExplorer-loreLine--${line.role || "narrator"}`} key={`${section.sectionKey}:${index}`}>
                    {line.speakerLabel ? <strong className="questExplorer-loreSpeaker">{line.speakerLabel}:</strong> : null}
                    <span>{line.text}</span>
                </p>
            ))}
        </>
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

function stepTitle(
    step: QuestProgressionStep,
    entry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): string {
    return entry?.title || step.title || entriesByKey[step.detailEntryKey]?.title || "Unknown Horizons";
}

function StrategyChoiceGate({
    step,
    choices,
    selectedChoice,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choices: QuestPathChoice[];
    selectedChoice: QuestPathChoiceSelection | null;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (choices.length === 0) return null;

    return (
        <section className="questExplorer-choiceGate questExplorer-strategyChoiceGate" aria-label={`${stepPositionLabel(step)} choices`}>
            <h3>Make a Choice</h3>
            <div>
                {choices.map((choice) => {
                    const isSelected = selectedChoice?.choiceId === choice.id;
                    const primaryLines = choice.strategyLines.length > 0 ? choice.strategyLines : choice.descriptionLines;
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
                                {primaryLines.length > 0 ? <span>{primaryLines.join(" ")}</span> : null}
                                <InlineChoiceMeta label="Requires" values={choice.requirementLines} />
                                <InlineChoiceMeta label="Rewards" values={choice.rewardLines} />
                                <InlineChoiceMeta label="Leads to" values={choice.continuationTitle ? [choice.continuationTitle] : []} />
                                {debugChoiceDetails?.get(choice.id) ? (
                                    <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(choice.id)}</span>
                                ) : null}
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

function InlineChoiceMeta({ label, values }: { label: string; values: string[] }) {
    const cleanValues = values.filter(Boolean);
    if (cleanValues.length === 0) return null;

    return (
        <span className="questExplorer-choiceCardMeta">
            <b>{label}</b> {cleanValues.join("; ")}
        </span>
    );
}

function LoreBranchMoment({
    step,
    choices,
    selectedChoice,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choices: QuestPathChoice[];
    selectedChoice: QuestPathChoiceSelection | null;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (choices.length === 0) return null;

    return (
        <section className="questExplorer-loreBranchMoment" aria-label={`${stepPositionLabel(step)} narrative choices`}>
            <h3>Choose a Path</h3>
            <div>
                {choices.map((choice) => {
                    const isSelected = selectedChoice?.choiceId === choice.id;
                    const previewLines = choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines;
                    return (
                        <button
                            type="button"
                            className={`questExplorer-loreChoice questExplorer-loreChoice--${choice.accent}${isSelected ? " is-selected" : ""}`}
                            aria-pressed={isSelected}
                            aria-current={isSelected ? "true" : undefined}
                            onClick={() => onChoose(step, choice)}
                            key={`${step.stepKey}:${choice.id}`}
                        >
                            <span className="questExplorer-loreChoiceMark" aria-hidden="true" />
                            <span className="questExplorer-loreChoiceCopy">
                                <small>{choice.eyebrow}</small>
                                <strong>{choice.label}</strong>
                                {previewLines.length > 0 ? <span>{previewLines.join(" ")}</span> : null}
                                {debugChoiceDetails?.get(choice.id) ? (
                                    <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(choice.id)}</span>
                                ) : null}
                            </span>
                        </button>
                    );
                })}
            </div>
            {!selectedChoice ? (
                <p className="questExplorer-choiceHint">The chronicle waits for your choice.</p>
            ) : null}
        </section>
    );
}

function StrategyStep({
    renderedStep,
    totalSteps,
    entriesByKey,
    debugChoiceDetails,
    onChoose,
}: {
    renderedStep: RenderedPathStep;
    totalSteps: number;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const title = stepTitle(renderedStep.step, renderedStep.displayEntry, entriesByKey);

    return (
        <article
            className={`questExplorer-questPathStep questExplorer-strategyStep${renderedStep.isActive ? " is-active" : ""}`}
            aria-current={renderedStep.isActive ? "step" : undefined}
        >
            <div className="questExplorer-stepRule" aria-hidden="true" />
            <header className="questExplorer-stepHeader questExplorer-strategyStepHeader">
                <div>
                    <span className="questExplorer-stepLabel">
                        <span>{stepPositionLabel(renderedStep.step)}</span>
                        <span>of {totalSteps}</span>
                    </span>
                    <ProgressionPips total={totalSteps} activeIndex={renderedStep.stepIndex} />
                </div>
                <strong className="questExplorer-stepTitle">{title}</strong>
            </header>

            {!renderedStep.rendersRepeatedDetailContent ? (
                renderedStep.displayEntry ? (
                    <div className="questExplorer-strategyStepBody">
                        <StepSummary entry={renderedStep.displayEntry} />
                        <EntryStrategyContent entry={renderedStep.displayEntry} />
                    </div>
                ) : (
                    <p className="questExplorer-emptyState">This progression step has no entry-backed content in the current DTO.</p>
                )
            ) : null}

            <StrategyChoiceGate
                step={renderedStep.step}
                choices={renderedStep.choices}
                selectedChoice={renderedStep.selectedChoice}
                debugChoiceDetails={debugChoiceDetails}
                onChoose={onChoose}
            />
        </article>
    );
}

function LoreStep({
    renderedStep,
    entriesByKey,
    debugChoiceDetails,
    onChoose,
}: {
    renderedStep: RenderedPathStep;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const title = stepTitle(renderedStep.step, renderedStep.displayEntry, entriesByKey);

    return (
        <article
            className={`questExplorer-questPathStep questExplorer-loreStep${renderedStep.isActive ? " is-active" : ""}`}
            aria-current={renderedStep.isActive ? "step" : undefined}
        >
            <div className="questExplorer-stepRule" aria-hidden="true" />
            <header className="questExplorer-stepHeader questExplorer-loreStepHeader">
                <div>
                    <span className="questExplorer-stepLabel">{stepPositionLabel(renderedStep.step)}</span>
                </div>
                <strong className="questExplorer-stepTitle">{title}</strong>
            </header>

            {!renderedStep.rendersRepeatedDetailContent ? (
                renderedStep.displayEntry ? (
                    <LoreSectionList entry={renderedStep.displayEntry} />
                ) : (
                    <p className="questExplorer-emptyState">This progression step has no entry-backed content in the current DTO.</p>
                )
            ) : null}

            <LoreBranchMoment
                step={renderedStep.step}
                choices={renderedStep.choices}
                selectedChoice={renderedStep.selectedChoice}
                debugChoiceDetails={debugChoiceDetails}
                onChoose={onChoose}
            />
        </article>
    );
}

function StrategyPathState({
    flow,
    entriesByKey,
}: {
    flow: QuestPathFlow;
    entriesByKey: Record<string, QuestExplorerEntry>;
}) {
    return (
        <>
            {flow.unresolvedContinuation ? (
                <section className="questExplorer-pathState questExplorer-strategyPathState questExplorer-pathState--unresolved">
                    <span>Path Continues</span>
                    <p>The choice "{flow.unresolvedContinuation.label}" is modeled, but the archive does not identify the next continuation step. The chronicle stops here rather than guessing.</p>
                </section>
            ) : null}

            {flow.reachedContinuationEntryKey ? (
                <section className="questExplorer-pathState questExplorer-strategyPathState questExplorer-pathState--chapter">
                    <span>Next Chapter Reached</span>
                    <p>{entriesByKey[flow.reachedContinuationEntryKey]?.title ?? "The next chapter"} is now the active rail context.</p>
                </section>
            ) : null}
        </>
    );
}

function LorePathState({
    flow,
    entriesByKey,
}: {
    flow: QuestPathFlow;
    entriesByKey: Record<string, QuestExplorerEntry>;
}) {
    return (
        <>
            {flow.unresolvedContinuation ? (
                <section className="questExplorer-pathState questExplorer-lorePathState questExplorer-pathState--unresolved">
                    <span>Path Continues</span>
                    <p>The choice "{flow.unresolvedContinuation.label}" is preserved, but the archive does not identify the next continuation step. The chronicle closes this page rather than guessing.</p>
                </section>
            ) : null}

            {flow.reachedContinuationEntryKey ? (
                <section className="questExplorer-pathState questExplorer-lorePathState questExplorer-pathState--chapter">
                    <span>Next Chapter Reached</span>
                    <p>{entriesByKey[flow.reachedContinuationEntryKey]?.title ?? "The next chapter"} is now the active rail context.</p>
                </section>
            ) : null}
        </>
    );
}

function StrategyLockedStep({
    step,
    totalSteps,
    entriesByKey,
}: {
    step: QuestProgressionStep;
    totalSteps: number;
    entriesByKey: Record<string, QuestExplorerEntry>;
}) {
    return (
        <article className="questExplorer-questPathStep questExplorer-strategyStep questExplorer-questPathStep--locked">
            <div className="questExplorer-stepRule" aria-hidden="true" />
            <header className="questExplorer-stepHeader questExplorer-strategyStepHeader">
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
    );
}

function LoreLockedStep({
    step,
    entriesByKey,
}: {
    step: QuestProgressionStep;
    entriesByKey: Record<string, QuestExplorerEntry>;
}) {
    return (
        <article className="questExplorer-questPathStep questExplorer-loreStep questExplorer-questPathStep--locked">
            <div className="questExplorer-stepRule" aria-hidden="true" />
            <header className="questExplorer-stepHeader questExplorer-loreStepHeader">
                <div>
                    <span className="questExplorer-stepLabel">{stepPositionLabel(step)}</span>
                </div>
                <strong className="questExplorer-stepTitle">{step.title || entriesByKey[step.detailEntryKey]?.title || "Unknown Horizons"}</strong>
            </header>
            <p>The chronicle will continue once a path is chosen.</p>
        </article>
    );
}

function StrategyProgression({
    progression,
    fullProgression,
    flow,
    entriesByKey,
    debugQuestProgression,
    onChoose,
}: {
    progression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    flow: QuestPathFlow | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugQuestProgression: boolean;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (!progression || !flow) return null;

    const totalSteps = progression.chapter.steps.length;

    return (
        <section className="questExplorer-questPathChronicle questExplorer-strategyChronicle" aria-label="Selected progression">
            {flow.renderedSteps.map((renderedStep) => (
                <StrategyStep
                    renderedStep={renderedStep}
                    totalSteps={totalSteps}
                    entriesByKey={entriesByKey}
                    debugChoiceDetails={debugQuestProgression
                        ? choiceDebugDetailsForStep(renderedStep.step, renderedStep.choices, progression, fullProgression, entriesByKey)
                        : undefined}
                    onChoose={onChoose}
                    key={renderedStep.step.stepKey}
                />
            ))}
            <StrategyPathState flow={flow} entriesByKey={entriesByKey} />
            {flow.lockedSteps.map((step) => (
                <StrategyLockedStep
                    step={step}
                    totalSteps={totalSteps}
                    entriesByKey={entriesByKey}
                    key={`locked:${step.stepKey}`}
                />
            ))}
        </section>
    );
}

function LoreProgression({
    progression,
    fullProgression,
    flow,
    entriesByKey,
    debugQuestProgression,
    onChoose,
}: {
    progression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    flow: QuestPathFlow | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugQuestProgression: boolean;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (!progression || !flow) return null;

    return (
        <section className="questExplorer-questPathChronicle questExplorer-loreChronicle" aria-label="Selected progression">
            {flow.renderedSteps.map((renderedStep) => (
                <LoreStep
                    renderedStep={renderedStep}
                    entriesByKey={entriesByKey}
                    debugChoiceDetails={debugQuestProgression
                        ? choiceDebugDetailsForStep(renderedStep.step, renderedStep.choices, progression, fullProgression, entriesByKey)
                        : undefined}
                    onChoose={onChoose}
                    key={renderedStep.step.stepKey}
                />
            ))}
            <LorePathState flow={flow} entriesByKey={entriesByKey} />
            {flow.lockedSteps.map((step) => (
                <LoreLockedStep
                    step={step}
                    entriesByKey={entriesByKey}
                    key={`locked:${step.stepKey}`}
                />
            ))}
        </section>
    );
}

function debugList(values: string[]): string {
    return values.length > 0 ? values.join(", ") : "none";
}

function debugChoiceSelection(selection: QuestPathChoiceSelection): string {
    return [
        `stepKey=${selection.stepKey || "implicit"}`,
        `choiceId=${selection.choiceId}`,
        `targetEntryKey=${selection.targetEntryKey ?? "none"}`,
        `nextEntryKeys=${debugList(selection.nextEntryKeys)}`,
    ].join(" | ");
}

function DebugRows({ rows }: { rows: Array<{ label: string; value: string }> }) {
    return (
        <dl className="questExplorer-debugRows">
            {rows.map((row) => (
                <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}

function QuestProgressionDebugPanel({
    selectedEntry,
    progression,
    flow,
    entriesByKey,
    choicePath,
}: {
    selectedEntry: QuestExplorerEntry;
    progression: QuestDetailProgression | null;
    flow: QuestPathFlow | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    choicePath: QuestPathChoiceSelection[];
}) {
    return (
        <section className="questExplorer-debugPanel" aria-label="Quest progression debug">
            <header>
                <span>Debug</span>
                <h3>Debug progression</h3>
            </header>

            <DebugRows
                rows={[
                    { label: "selected entry", value: selectedEntry.entryKey },
                    {
                        label: "questline",
                        value: progression?.questline.questLineFamilyKey
                            ?? progression?.questline.questLineKey
                            ?? "none",
                    },
                    {
                        label: "chapter",
                        value: progression ? chapterPositionLabel(progression.chapter) : "none",
                    },
                    {
                        label: "selected choice path",
                        value: choicePath.length > 0 ? choicePath.map(debugChoiceSelection).join(" || ") : "none",
                    },
                    {
                        label: "unresolved continuation",
                        value: flow?.unresolvedContinuation ? debugChoiceSelection(flow.unresolvedContinuation) : "none",
                    },
                    {
                        label: "reached continuation entry",
                        value: flow?.reachedContinuationEntryKey ?? "none",
                    },
                ]}
            />

            {flow?.renderedSteps.map((renderedStep) => {
                const continuation = renderedStep.selectedChoice
                    ? selectedChoiceContinuationKeys(renderedStep.selectedChoice, entriesByKey)
                    : continuationKeys(renderedStep.displayEntry);
                const variants = renderedStep.step.variants.map((variant) => [
                    variant.entryKey,
                    variant.variantKind ? `kind=${variant.variantKind}` : null,
                    variant.branchLabel ? `branch=${variant.branchLabel}` : null,
                ].filter(Boolean).join(" "));

                return (
                    <article className="questExplorer-debugStep" key={`debug:${renderedStep.step.stepKey}`}>
                        <h4>{stepPositionLabel(renderedStep.step)}</h4>
                        <DebugRows
                            rows={[
                                { label: "stepKey", value: renderedStep.step.stepKey },
                                { label: "detailEntryKey", value: renderedStep.step.detailEntryKey },
                                { label: "projectionKind", value: renderedStep.step.projectionKind || "none" },
                                { label: "sourceEntryKeys", value: debugList(renderedStep.step.sourceEntryKeys) },
                                { label: "aliasEntryKeys", value: debugList(renderedStep.step.aliasEntryKeys) },
                                { label: "variant keys", value: debugList(variants) },
                                { label: "continuation keys", value: debugList(continuation) },
                                {
                                    label: "selected choice",
                                    value: renderedStep.selectedChoice ? debugChoiceSelection(renderedStep.selectedChoice) : "none",
                                },
                                {
                                    label: "repeated detailEntryKey",
                                    value: renderedStep.repeatsDetailEntry
                                        ? (renderedStep.rendersRepeatedDetailContent ? "yes, content already rendered" : "yes, first rendered occurrence")
                                        : "no",
                                },
                            ]}
                        />
                    </article>
                );
            }) ?? (
                <p className="questExplorer-debugEmpty">No progression step is active for this entry.</p>
            )}
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
    const [choicePath, setChoicePath] = useState<QuestPathChoiceSelection[]>([]);

    const requestedEntryKey = routeEntryKey(location.pathname) ?? searchParams.get("quest");
    const requestedMode = normalizeQuestExplorerMode(searchParams.get("mode"));
    const debugQuestProgression = isQuestProgressionDebugEnabled(searchParams);
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
    const questPathFlow = useMemo(
        () => selectedProgression
            ? buildQuestPathFlow(selectedProgression, entriesByKey, choicePath, progression, debugQuestProgression)
            : null,
        [choicePath, debugQuestProgression, entriesByKey, progression, selectedProgression]
    );
    const activeRailEntry = questPathFlow?.reachedContinuationEntryKey
        ? entriesByKey[questPathFlow.reachedContinuationEntryKey] ?? selectedEntry
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
                    navigate(questPath(fallbackEntryKey, mode, debugQuestProgression), { replace: true });
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
    }, [debugQuestProgression, loaded, mode, navigate, requestedEntryKey, resolveEntryKey, selectedEntryKey, setSelectedEntryKey, visibleEntries, visibleEntryKeys]);

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
        navigate(questPath(entryKey, mode, debugQuestProgression));
    };

    const chooseQuestPathChoice = (step: QuestProgressionStep, choice: QuestPathChoice) => {
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
        ].filter((part): part is string => Boolean(part))
        : [];
    const strategySummary = selectedEntry
        ? selectedEntry.summaryLines[0] ?? compactMeta(selectedEntry)
        : null;

    return (
        <main className="questExplorer-page">
            <h1 className="seo-hidden">Endless Legend 2 Quest Explorer</h1>

            <section className="questExplorer" aria-label="Quest Explorer">
                <aside className="questExplorer-sidebar">
                    <header>
                        <div>
                            <h2>Quest Archive</h2>
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
                            {mode === "strategy" ? (
                                <StrategyHeader
                                    entry={selectedEntry}
                                    breadcrumb={detailBreadcrumb}
                                    mode={mode}
                                    onModeChange={changeMode}
                                    progression={selectedProgression}
                                    summary={strategySummary}
                                />
                            ) : (
                                <LoreHeader
                                    entry={selectedEntry}
                                    breadcrumb={detailBreadcrumb}
                                    mode={mode}
                                    onModeChange={changeMode}
                                    progression={selectedProgression}
                                />
                            )}

                            <section className={`questExplorer-content questExplorer-content--${mode}`}>
                                {mode === "strategy" ? (
                                    <>
                                        <StrategyOverview entry={selectedEntry} />
                                        {selectedProgression ? (
                                            <StrategyProgression
                                                progression={selectedProgression}
                                                fullProgression={progression}
                                                flow={questPathFlow}
                                                entriesByKey={entriesByKey}
                                                debugQuestProgression={debugQuestProgression}
                                                onChoose={chooseQuestPathChoice}
                                            />
                                        ) : (
                                            <section className="questExplorer-questPathFallback questExplorer-strategyFallback" aria-label="Selected progression">
                                                <EntryStrategyContent entry={selectedEntry} />
                                            </section>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <LoreOpening entry={selectedEntry} />
                                        {selectedProgression ? (
                                            <LoreProgression
                                                progression={selectedProgression}
                                                fullProgression={progression}
                                                flow={questPathFlow}
                                                entriesByKey={entriesByKey}
                                                debugQuestProgression={debugQuestProgression}
                                                onChoose={chooseQuestPathChoice}
                                            />
                                        ) : (
                                            <section className="questExplorer-questPathFallback questExplorer-loreFallback" aria-label="Selected progression">
                                                <LoreSectionList entry={selectedEntry} />
                                            </section>
                                        )}
                                    </>
                                )}
                                {debugQuestProgression ? (
                                    <QuestProgressionDebugPanel
                                        selectedEntry={selectedEntry}
                                        progression={selectedProgression}
                                        flow={questPathFlow}
                                        entriesByKey={entriesByKey}
                                        choicePath={choicePath}
                                    />
                                ) : null}
                            </section>
                        </>
                    ) : null}
                </section>
            </section>
        </main>
    );
}
