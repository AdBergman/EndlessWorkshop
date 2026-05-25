import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
    EMPTY_CHOICE_PATH,
    addSelectionToRevealContext,
    buildLoreChronicleStream,
    buildQuestPathFlow,
    choiceKindLabel,
    cloneRevealContext,
    continuationKeys,
    entryKeysWithAliases,
    findDetailProgression,
    locationLabel,
    progressionContextKey,
    progressionLocationForKeys,
    revealVisible,
    selectedChoiceContinuationKeys,
    selectedChoiceTargetKeys,
    selectionForChoice,
    stepIdentityKeys,
    stepIndexForKeys,
    uniqueStrings,
    type ChoiceVisibilityDiagnostics,
    type LoreChoicePathsByContext,
    type LoreChronicleSegment,
    type LoreChronicleStream,
    type NormalHiddenChoiceReason,
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
    type QuestPathFlow,
    type RenderedPathStep,
    type RevealContext,
} from "@/features/quests/questPathFlow";
import {
    buildStrategyDossierModel,
    type StrategyDossierBranchComparisonGroup,
    type StrategyDossierBranchOption,
    type StrategyDossierMarker,
    type StrategyDossierModel,
    type StrategyDossierObjective,
    type StrategyDossierSelectedPathStep,
} from "@/features/quests/questStrategyDossier";
import {
    selectSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";
import { getEmpireLabel } from "@/lib/labels/empireLabels";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    LoreSection,
    QuestProgressionChapter,
    QuestProgressionStep,
    StrategyObjective,
} from "@/types/questTypes";
import "@/components/Quests/QuestExplorer.css";

type QuestModeDebugChoicePaths = Record<QuestExplorerMode, QuestPathChoiceSelection[]>;

type ChoicePresentationGroups = {
    structuralContextChoices: QuestPathChoice[];
    primaryChoices: QuestPathChoice[];
    activeContinuationChoices: QuestPathChoice[];
    selectedPathBranchKeys: Set<string>;
};

type ReaderChoiceContext = {
    choiceKey: string;
    branchStepOrder: number | null;
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

function choiceSelectedBranchKeys(choicePath: QuestPathChoiceSelection[]): Set<string> {
    return new Set(choicePath.map((selection) => selection.branchKey).filter((branchKey): branchKey is string => Boolean(branchKey)));
}

function choiceSelectedChoiceKeys(choicePath: QuestPathChoiceSelection[]): Set<string> {
    return new Set(choicePath.map((selection) => selection.choiceKey).filter((choiceKey): choiceKey is string => Boolean(choiceKey)));
}

function choiceSelectedBranchPath(choicePath: QuestPathChoiceSelection[]): string[] {
    return choicePath.map((selection) => selection.branchKey).filter((branchKey): branchKey is string => Boolean(branchKey));
}

function debugChoicePath(choicePath: QuestPathChoiceSelection[]): string {
    return choicePath.length > 0 ? choicePath.map(debugChoiceSelection).join(" || ") : "none";
}

function debugBranchPath(choicePath: QuestPathChoiceSelection[]): string {
    return debugList([...choiceSelectedBranchKeys(choicePath)]);
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
    entriesByKey: Record<string, QuestExplorerEntry>,
    hiddenReason: NormalHiddenChoiceReason | null
): string {
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
    const metadata = choice.branchKey
        ? [
            choice.sectionRole ? `role=${choice.sectionRole}` : null,
            choice.branchStepOrder != null ? `branchStepOrder=${choice.branchStepOrder}` : null,
            choice.prerequisiteBranchKeys.length > 0 ? `requires=${choice.prerequisiteBranchKeys.join(",")}` : null,
            choice.parentBranchKey ? `parent=${choice.parentBranchKey}` : null,
            choice.parentChoiceKey ? `parentChoice=${choice.parentChoiceKey}` : null,
            choice.revealedByBranchKeys.length > 0 ? `revealedByBranches=${choice.revealedByBranchKeys.join(",")}` : null,
            choice.revealedByChoiceKeys.length > 0 ? `revealedByChoices=${choice.revealedByChoiceKeys.join(",")}` : null,
            choice.revealedByBranchPathAlternatives.length > 0
                ? `revealedByPaths=${choice.revealedByBranchPathAlternatives.map((path) => path.join(">")).join("|")}`
                : null,
            choice.choiceGroupKey ? `choiceGroup=${choice.choiceGroupKey}` : null,
            choice.convergenceGroupKey ? `convergence=${choice.convergenceGroupKey}` : null,
        ].filter(Boolean).join("; ")
        : "";
    const metadataNote = metadata ? `; ${metadata}` : "";
    const hiddenNormal = hiddenReason ? `; hidden in normal UI: ${hiddenReason.message}` : "";

    if (kind === "variant" && targetStepIndex === currentStepIndex) {
        const continuationLocation = progressionLocationForKeys(fullProgression, continuationLookupKeys, entriesByKey);
        const continuationLabel = continuationStepIndex != null
            ? `${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(progression.chapter.steps[continuationStepIndex])}`
            : locationLabel(continuationLocation, entriesByKey);
        return continuationLabel
            ? `Debug: ${origin}; variant -> current step variant; then ${continuationLabel}${metadataNote}${hiddenNormal}`
            : `Debug: ${origin}; variant -> current step variant; continuation unresolved${metadataNote}${hiddenNormal}`;
    }

    if (continuationStepIndex != null) {
        return `Debug: ${origin}; ${kind} -> ${chapterPositionLabel(progression.chapter)} ${stepPositionLabel(progression.chapter.steps[continuationStepIndex])}${metadataNote}${hiddenNormal}`;
    }

    const continuationLocation = progressionLocationForKeys(fullProgression, continuationLookupKeys, entriesByKey);
    if (continuationLocation) {
        return `Debug: ${origin}; ${kind} -> ${locationLabel(continuationLocation, entriesByKey)}${metadataNote}${hiddenNormal}`;
    }

    if (targetStepIndex != null) {
        const targetStep = progression.chapter.steps[targetStepIndex];
        const sameStepNote = targetStep.stepKey === step.stepKey ? "current step" : stepPositionLabel(targetStep);
        return `Debug: ${origin}; ${kind} -> ${chapterPositionLabel(progression.chapter)} ${sameStepNote}${metadataNote}${hiddenNormal}`;
    }

    const targetLocation = progressionLocationForKeys(fullProgression, targetKeys, entriesByKey);
    if (targetLocation) {
        return `Debug: ${origin}; ${kind} -> ${locationLabel(targetLocation, entriesByKey)}${metadataNote}${hiddenNormal}`;
    }

    return `Debug: ${origin}; ${kind} -> unresolved, no modeled continuation${metadataNote}${hiddenNormal}`;
}

function choiceDebugDetailsForStep(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    diagnostics: ChoiceVisibilityDiagnostics,
    progression: QuestDetailProgression,
    fullProgression: QuestExplorerProgression | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    revealedChoices: QuestPathChoice[] = []
): Map<string, string> {
    const revealedChoiceIds = new Set(revealedChoices.map((choice) => choice.id));
    return new Map(choices.map((choice) => [
        choice.id,
        choiceDebugDestination(
            step,
            choice,
            progression,
            fullProgression,
            entriesByKey,
            revealedChoiceIds.has(choice.id) ? null : diagnostics.hiddenReasonsByChoiceId.get(choice.id) ?? null
        ),
    ]));
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

function uniqueReaderChoiceContexts(contexts: ReaderChoiceContext[]): ReaderChoiceContext[] {
    const seen = new Set<string>();
    return contexts.filter((context) => {
        const key = `${context.choiceKey}:${context.branchStepOrder ?? "any"}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function contextForChoice(choice: QuestPathChoice | QuestPathChoiceSelection): ReaderChoiceContext | null {
    return choice.choiceKey
        ? { choiceKey: choice.choiceKey, branchStepOrder: choice.branchStepOrder }
        : null;
}

function readerCurrentChoiceContextsForStep(renderedStep: RenderedPathStep): ReaderChoiceContext[] {
    const currentBeatContext = renderedStep.currentBeatChoice
        ? contextForChoice(renderedStep.currentBeatChoice)
        : null;
    if (currentBeatContext) return [currentBeatContext];

    const selectedContext = renderedStep.selectedChoice
        ? contextForChoice(renderedStep.selectedChoice)
        : null;
    if (selectedContext) return [selectedContext];

    const keyedChoices = renderedStep.choices.filter((choice) => choice.choiceKey && choice.sectionRole !== "continuation");
    if (keyedChoices.length === 0) return [];

    const trueChoices = keyedChoices.filter((choice) => choice.sectionRole === "true_choice");
    if (trueChoices.length > 1) return [];
    if (keyedChoices.length === 1) {
        const context = contextForChoice(keyedChoices[0]);
        return context ? [context] : [];
    }

    const orderedChoices = keyedChoices.filter((choice) => choice.branchStepOrder != null);
    if (orderedChoices.length === 0) return [];

    const earliestOrder = Math.min(...orderedChoices.map((choice) => choice.branchStepOrder ?? Number.MAX_SAFE_INTEGER));
    const earliestContexts = orderedChoices
        .filter((choice) => choice.branchStepOrder === earliestOrder)
        .map(contextForChoice)
        .filter((context): context is ReaderChoiceContext => Boolean(context));

    return uniqueReaderChoiceContexts(earliestContexts);
}

function readerRevealedChoiceContextsForStep(renderedStep: RenderedPathStep): ReaderChoiceContext[] {
    return uniqueReaderChoiceContexts(
        renderedStep.revealedContinuations
            .map(contextForChoice)
            .filter((context): context is ReaderChoiceContext => Boolean(context))
    );
}

function revealContextForRevealedContinuations(renderedStep: RenderedPathStep): RevealContext {
    const context = cloneRevealContext(renderedStep.revealContext);
    addSelectionToRevealContext(context, renderedStep.selectedChoice);
    addSelectionToRevealContext(context, renderedStep.currentBeatChoice);
    renderedStep.revealedContinuations.forEach((choice) => {
        addSelectionToRevealContext(context, selectionForChoice(renderedStep.step.stepKey, choice));
    });
    return context;
}

function loreSectionsForChoiceContexts(
    sections: LoreSection[],
    contexts: ReaderChoiceContext[],
    revealContext?: RevealContext
): LoreSection[] {
    const scopedSections = contexts.flatMap((context) => {
        const choiceSections = sections.filter((section) => (
            section.choiceKey === context.choiceKey
            && (!revealContext || revealVisible(section, revealContext))
        ));
        if (choiceSections.length === 0 || context.branchStepOrder == null) return choiceSections;

        const branchStepIndex = context.branchStepOrder - 1;
        const stepScopedSections = choiceSections.filter((section) => section.stepIndex === branchStepIndex);
        return stepScopedSections.length > 0 ? stepScopedSections : choiceSections;
    });

    return uniqueLoreSections(scopedSections);
}

function objectivesForLoreSections(
    objectives: StrategyObjective[],
    sections: LoreSection[],
    revealContext: RevealContext
): { objectives: StrategyObjective[]; objectiveIndexOffset: number } | null {
    const objectiveKeys = new Set(sections
        .map((section) => section.objectiveKey)
        .filter((objectiveKey): objectiveKey is string => Boolean(objectiveKey)));
    if (objectiveKeys.size === 0) return null;

    const scopedObjectives = objectives.filter((objective) => (
        objective.objectiveKey != null && objectiveKeys.has(objective.objectiveKey)
        && revealVisible(objective, revealContext)
    ));
    if (scopedObjectives.length === 0) return null;

    const firstIndex = objectives.findIndex((objective) => objective.objectiveKey === scopedObjectives[0]?.objectiveKey);
    return {
        objectives: scopedObjectives,
        objectiveIndexOffset: firstIndex >= 0 ? firstIndex : 0,
    };
}

function objectiveScopeForBranchStepOrder(
    objectives: StrategyObjective[],
    branchStepOrder: number | null,
    revealContext: RevealContext
): { objectives: StrategyObjective[]; objectiveIndexOffset: number } | null {
    if (branchStepOrder == null) return null;

    const objectiveIndex = branchStepOrder - 1;
    const objective = objectives[objectiveIndex];
    return objective && revealVisible(objective, revealContext)
        ? { objectives: [objective], objectiveIndexOffset: objectiveIndex }
        : null;
}

function strategyObjectiveScopeForStep(
    entry: QuestExplorerEntry,
    renderedStep: RenderedPathStep
): { objectives: StrategyObjective[]; objectiveIndexOffset: number } {
    const allObjectives = entry.strategyView.objectives;
    const visibleObjectiveEntries = allObjectives
        .map((objective, index) => ({ objective, index }))
        .filter(({ objective }) => revealVisible(objective, renderedStep.revealContext));
    const objectives = visibleObjectiveEntries.map(({ objective }) => objective);
    if (objectives.length <= 1) {
        return {
            objectives,
            objectiveIndexOffset: visibleObjectiveEntries[0]?.index ?? 0,
        };
    }

    const choiceContexts = readerCurrentChoiceContextsForStep(renderedStep);
    const choiceScopedLoreSections = loreSectionsForChoiceContexts(entry.loreView.sections, choiceContexts, renderedStep.revealContext);
    const choiceScopedObjectives = objectivesForLoreSections(allObjectives, choiceScopedLoreSections, renderedStep.revealContext);
    if (choiceScopedObjectives) return choiceScopedObjectives;

    const choiceOrderedObjectiveScope = choiceContexts
        .map((context) => objectiveScopeForBranchStepOrder(allObjectives, context.branchStepOrder, renderedStep.revealContext))
        .find((scope): scope is { objectives: StrategyObjective[]; objectiveIndexOffset: number } => Boolean(scope));
    if (choiceOrderedObjectiveScope) return choiceOrderedObjectiveScope;

    const hasChoiceKeyedRows = renderedStep.choices.some((choice) => choice.choiceKey);
    if (choiceContexts.length > 0 || hasChoiceKeyedRows) {
        return { objectives: [], objectiveIndexOffset: 0 };
    }

    const indexCandidates = stepIndexCandidates(renderedStep.step, renderedStep.stepIndex);
    const stepScopedLoreSections = entry.loreView.sections.filter((section) => (
        section.stepIndex != null && indexCandidates.has(section.stepIndex)
    ));
    const stepScopedObjectives = objectivesForLoreSections(allObjectives, stepScopedLoreSections, renderedStep.revealContext);
    if (stepScopedObjectives) return stepScopedObjectives;

    const preferredIndex = Math.min(Math.max(renderedStep.stepIndex, 0), objectives.length - 1);
    return {
        objectives: [objectives[preferredIndex]],
        objectiveIndexOffset: visibleObjectiveEntries[preferredIndex]?.index ?? preferredIndex,
    };
}

function strategyObjectiveScopeForRevealedContinuations(
    entry: QuestExplorerEntry,
    renderedStep: RenderedPathStep
): { objectives: StrategyObjective[]; objectiveIndexOffset: number } | null {
    const objectives = entry.strategyView.objectives;
    if (objectives.length === 0) return null;

    const choiceContexts = readerRevealedChoiceContextsForStep(renderedStep);
    if (choiceContexts.length === 0) return null;

    const revealContext = revealContextForRevealedContinuations(renderedStep);
    const choiceScopedLoreSections = loreSectionsForChoiceContexts(entry.loreView.sections, choiceContexts, revealContext);
    const choiceScopedObjectives = objectivesForLoreSections(objectives, choiceScopedLoreSections, revealContext);
    return choiceScopedObjectives ?? null;
}

function EntryStrategyContent({
    entry,
    objectives: scopedObjectives,
    objectiveIndexOffset = 0,
}: {
    entry: QuestExplorerEntry;
    objectives?: StrategyObjective[];
    objectiveIndexOffset?: number;
}) {
    const objectives = scopedObjectives ?? entry.strategyView.objectives;
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
                        <strong>{usesObjectivePaths ? objectiveVariantLabel(index) : `Objective ${objectiveIndexOffset + index + 1}`}</strong>
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

function StrategyDossier({
    model,
    step,
    onChoose,
    debugChoiceDetails,
    projectedDebugDetails,
}: {
    model: StrategyDossierModel;
    step: QuestProgressionStep;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
}) {
    return (
        <div className="questExplorer-strategyDossier">
            <StrategyDossierSection title="Chapter Tactical Brief">
                <div className="questExplorer-strategyDossierBrief">
                    <span>{model.brief.stepLabel} of {model.brief.totalSteps}</span>
                    <strong>{model.brief.title}</strong>
                    {model.brief.summaryLines.length > 0 ? (
                        model.brief.summaryLines.map((line, index) => <p key={`${model.brief.title}:summary:${index}`}>{line}</p>)
                    ) : (
                        <p>No tactical summary is attached to this step.</p>
                    )}
                </div>
            </StrategyDossierSection>

            <StrategyDossierSection title="Current Objective">
                <StrategyDossierObjectiveList
                    objectives={model.objectives}
                    emptyLabel="No strategy objectives are attached to this step."
                />
            </StrategyDossierSection>

            <div className="questExplorer-strategyDossierTwin">
                <StrategyDossierSection title="Requirements">
                    <StrategyDossierList
                        items={model.requirements}
                        emptyLabel="No requirements recorded."
                        tone="requirement"
                    />
                </StrategyDossierSection>
                <StrategyDossierSection title="Rewards">
                    <StrategyDossierList
                        items={model.rewards}
                        emptyLabel="No rewards recorded."
                        tone="reward"
                    />
                </StrategyDossierSection>
            </div>

            <StrategyDossierSection title="Selected Path">
                {model.selectedPathSteps.length > 0 ? (
                    <ol className="questExplorer-strategyPathBreadcrumb">
                        {model.selectedPathSteps.map((pathStep) => (
                            <StrategyPathBreadcrumbItem pathStep={pathStep} key={pathStep.id} />
                        ))}
                    </ol>
                ) : (
                    <p className="questExplorer-strategyDossierEmpty">No path is being simulated yet.</p>
                )}
            </StrategyDossierSection>

            <StrategyDossierSection title="Decision Options">
                <StrategyBranchComparison
                    groups={model.branchComparison.groups}
                    emptyLabel={model.branchComparison.emptyLabel}
                    selectedOption={model.branchComparison.selectedOption}
                    step={step}
                    debugChoiceDetails={debugChoiceDetails}
                    onChoose={onChoose}
                />
            </StrategyDossierSection>

            <StrategyDossierSection title="Projected Outcome">
                {model.projectedOutcome ? (
                    <div className="questExplorer-strategyProjectedOutcome">
                        <strong>{model.projectedOutcome.title}</strong>
                        {model.projectedOutcome.lines.map((line, index) => (
                            <p key={`${model.projectedOutcome?.title}:line:${index}`}>{line}</p>
                        ))}
                        <StrategyDossierObjectiveList objectives={model.projectedOutcome.objectives} />
                        <div className="questExplorer-stepObjectiveMetaGrid">
                            <InlineMetaList
                                label="Requirements"
                                values={model.projectedOutcome.requirements}
                                tone="requirement"
                            />
                            <InlineMetaList
                                label="Rewards"
                                values={model.projectedOutcome.rewards}
                                tone="reward"
                            />
                        </div>
                        {projectedDebugDetails?.map((detail, index) => (
                            <span className="questExplorer-choiceDebugMeta" key={`projected-debug:${index}`}>{detail}</span>
                        ))}
                    </div>
                ) : (
                    <p className="questExplorer-strategyDossierEmpty">Choose a path to project the next outcome.</p>
                )}
            </StrategyDossierSection>

            <StrategyDossierSection title="Path Markers">
                {model.markers.length > 0 ? (
                    <div className="questExplorer-strategyDossierMarkers">
                        {model.markers.map((marker, index) => (
                            <StrategyDossierMarkerPill marker={marker} key={`${marker.kind}:${marker.detail}:${index}`} />
                        ))}
                    </div>
                ) : (
                    <p className="questExplorer-strategyDossierEmpty">No leads, convergence, failure, or unresolved markers are active.</p>
                )}
            </StrategyDossierSection>
        </div>
    );
}

function StrategyBranchComparison({
    groups,
    emptyLabel,
    selectedOption,
    step,
    debugChoiceDetails,
    onChoose,
}: {
    groups: StrategyDossierBranchComparisonGroup[];
    emptyLabel: string;
    selectedOption: StrategyDossierBranchOption | null;
    step: QuestProgressionStep;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-strategyDossierEmpty">{emptyLabel}</p>;
    }

    return (
        <div className="questExplorer-strategyComparisonGroups">
            {selectedOption ? <StrategySelectedOptionSummary option={selectedOption} /> : null}
            {groups.map((group) => (
                <section className="questExplorer-strategyComparisonGroup" key={group.id} aria-label={group.label}>
                    <h4>{group.label}</h4>
                    <div className="questExplorer-strategyComparisonGrid">
                        {group.options.map((option) => (
                            <StrategyBranchComparisonOption
                                option={option}
                                step={step}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={option.id}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function StrategyPathBreadcrumbItem({ pathStep }: { pathStep: StrategyDossierSelectedPathStep }) {
    return (
        <li className={pathStep.isCurrent ? "is-current" : undefined}>
            <span className="questExplorer-strategyPathStepLabel">{pathStep.stepLabel}</span>
            <strong>{pathStep.label}</strong>
            {pathStep.isCurrent ? <em>Current</em> : null}
        </li>
    );
}

function StrategySelectedOptionSummary({ option }: { option: StrategyDossierBranchOption }) {
    return (
        <section className="questExplorer-strategySelectedSummary" aria-label="Selected Option Summary">
            <header>
                <span>Selected Option</span>
                <strong>{option.label}</strong>
            </header>
            {option.outcomeLines.length > 0 ? (
                <p>{option.outcomeLines.join(" ")}</p>
            ) : (
                <p>No outcome preview is recorded for this option.</p>
            )}
            <div className="questExplorer-stepObjectiveMetaGrid">
                <InlineMetaList label="Requirements" values={option.requirements} tone="requirement" />
                <InlineMetaList label="Rewards" values={option.rewards} tone="reward" />
                <InlineMetaList label="Leads To" values={option.leadsTo} tone="objective" />
            </div>
            {option.markers.length > 0 ? (
                <div className="questExplorer-strategyComparisonMarkers">
                    {option.markers.map((marker, index) => (
                        <StrategyDossierMarkerPill marker={marker} key={`${option.id}:summary:${marker.kind}:${marker.detail}:${index}`} />
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function StrategyBranchComparisonOption({
    option,
    step,
    debugChoiceDetails,
    onChoose,
}: {
    option: StrategyDossierBranchOption;
    step: QuestProgressionStep;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const isActive = option.isSelected || option.isInSelectedPath;

    return (
        <button
            type="button"
            className={`questExplorer-strategyComparisonOption${option.isSelected ? " is-selected" : ""}${option.isInSelectedPath ? " is-inPath" : ""}`}
            aria-pressed={isActive}
            aria-current={option.isSelected ? "true" : undefined}
            onClick={() => onChoose(step, option.choice)}
        >
            <span className="questExplorer-strategyComparisonStatus">
                {option.isSelected ? "Selected" : option.isInSelectedPath ? "In Path" : "Alternative"}
            </span>
            <span className="questExplorer-strategyComparisonHeader">
                <small>{option.eyebrow}</small>
                <strong>{option.label}</strong>
            </span>
            {option.outcomeLines.length > 0 ? (
                <span className="questExplorer-strategyComparisonOutcome">
                    {option.outcomeLines.join(" ")}
                </span>
            ) : null}
            <div className="questExplorer-strategyComparisonMeta">
                <InlineMetaList label="Requirements" values={option.requirements} tone="requirement" />
                <InlineMetaList label="Rewards" values={option.rewards} tone="reward" />
                <InlineMetaList label="Leads To" values={option.leadsTo} tone="objective" />
            </div>
            {option.markers.length > 0 ? (
                <div className="questExplorer-strategyComparisonMarkers">
                    {option.markers.map((marker, index) => (
                        <StrategyDossierMarkerPill marker={marker} key={`${option.id}:${marker.kind}:${marker.detail}:${index}`} />
                    ))}
                </div>
            ) : null}
            {debugChoiceDetails?.get(option.choice.id) ? (
                <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(option.choice.id)}</span>
            ) : null}
        </button>
    );
}

function StrategyDossierSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="questExplorer-strategyDossierSection" aria-label={title}>
            <h3>{title}</h3>
            {children}
        </section>
    );
}

function StrategyDossierObjectiveList({
    objectives,
    emptyLabel,
}: {
    objectives: StrategyDossierObjective[];
    emptyLabel?: string;
}) {
    if (objectives.length === 0) {
        return emptyLabel ? <p className="questExplorer-strategyDossierEmpty">{emptyLabel}</p> : null;
    }

    return (
        <div className="questExplorer-strategyDossierObjectives">
            {objectives.map((objective) => (
                <section className="questExplorer-strategyDossierObjective" key={objective.id}>
                    <header>
                        <span>{objective.phaseLabel}</span>
                        <strong>{objective.label}</strong>
                    </header>
                    <p>{objective.text}</p>
                    <div className="questExplorer-stepObjectiveMetaGrid">
                        <InlineMetaList label="Requirements" values={objective.requirements} tone="requirement" />
                        <InlineMetaList label="Rewards" values={objective.rewards} tone="reward" />
                    </div>
                </section>
            ))}
        </div>
    );
}

function StrategyDossierList({
    items,
    emptyLabel,
    tone,
}: {
    items: string[];
    emptyLabel: string;
    tone: "requirement" | "reward";
}) {
    if (items.length === 0) {
        return <p className="questExplorer-strategyDossierEmpty">{emptyLabel}</p>;
    }

    return (
        <ul className={`questExplorer-strategyDossierList questExplorer-strategyDossierList--${tone}`}>
            {items.map((item, index) => (
                <li key={`${tone}:${index}`}>{item}</li>
            ))}
        </ul>
    );
}

function StrategyDossierMarkerPill({ marker }: { marker: StrategyDossierMarker }) {
    return (
        <span className={`questExplorer-strategyDossierMarker questExplorer-strategyDossierMarker--${marker.kind}`}>
            <span className="questExplorer-strategyDossierMarkerIcon" aria-hidden="true" />
            <strong>{marker.label}</strong>
            <span className="questExplorer-strategyDossierMarkerDetail">{marker.detail}</span>
        </span>
    );
}

function stepIndexCandidates(step: QuestProgressionStep, stepIndex: number): Set<number> {
    return new Set([
        stepIndex,
        step.stepNumber != null ? step.stepNumber - 1 : null,
        step.stepOrder != null ? step.stepOrder - 1 : null,
    ].filter((value): value is number => value != null && Number.isFinite(value) && value >= 0));
}

function leadingSharedLoreSections(sections: LoreSection[]): LoreSection[] {
    const sharedSections: LoreSection[] = [];
    for (const section of sections) {
        if (
            section.stepIndex != null
            || section.objectiveKey
            || section.choiceKey
            || isResolutionLoreSection(section)
        ) {
            break;
        }
        sharedSections.push(section);
    }
    return sharedSections;
}

function loreSectionsForStep(entry: QuestExplorerEntry, renderedStep: RenderedPathStep): LoreSection[] {
    const sections = entry.loreView.sections.filter((section) => revealVisible(section, renderedStep.revealContext));
    if (sections.length <= 1) return sections;

    const sharedOpeningSections = renderedStep.stepIndex === 0
        ? leadingSharedLoreSections(sections)
        : [];
    const choiceContexts = readerCurrentChoiceContextsForStep(renderedStep);
    const choiceScopedSections = loreSectionsForChoiceContexts(sections, choiceContexts, renderedStep.revealContext);
    if (choiceScopedSections.length > 0) {
        return uniqueLoreSections([...sharedOpeningSections, ...choiceScopedSections]);
    }

    const choiceOrderedStepIndexes = new Set(choiceContexts
        .map((context) => context.branchStepOrder != null ? context.branchStepOrder - 1 : null)
        .filter((value): value is number => value != null && Number.isFinite(value) && value >= 0));
    if (choiceOrderedStepIndexes.size > 0) {
        const choiceOrderedSections = sections.filter((section) => (
            section.stepIndex != null && choiceOrderedStepIndexes.has(section.stepIndex)
        ));
        if (choiceOrderedSections.length > 0) {
            return uniqueLoreSections([...sharedOpeningSections, ...choiceOrderedSections]);
        }
    }

    const hasChoiceKeyedRows = renderedStep.choices.some((choice) => choice.choiceKey);
    if (choiceContexts.length > 0 || hasChoiceKeyedRows) {
        return sharedOpeningSections;
    }

    const indexCandidates = stepIndexCandidates(renderedStep.step, renderedStep.stepIndex);
    const stepTaggedSections = sections.filter((section) => (
        section.stepIndex != null && indexCandidates.has(section.stepIndex)
    ));
    if (stepTaggedSections.length > 0) {
        return uniqueLoreSections([...sharedOpeningSections, ...stepTaggedSections]);
    }

    const strategyScope = strategyObjectiveScopeForStep(entry, renderedStep);
    const objectiveKeys = new Set(strategyScope.objectives.map((objective) => objective.objectiveKey).filter(Boolean));
    const objectiveTaggedSections = sections.filter((section) => (
        section.objectiveKey != null && objectiveKeys.has(section.objectiveKey)
    ));
    if (objectiveTaggedSections.length > 0) return objectiveTaggedSections;

    const fallbackSection = sections[Math.min(Math.max(renderedStep.stepIndex, 0), sections.length - 1)];
    return fallbackSection ? [fallbackSection] : [];
}

function loreSectionsForRevealedContinuations(entry: QuestExplorerEntry, renderedStep: RenderedPathStep): LoreSection[] {
    const choiceContexts = readerRevealedChoiceContextsForStep(renderedStep);
    if (choiceContexts.length === 0) return [];
    return loreSectionsForChoiceContexts(entry.loreView.sections, choiceContexts, revealContextForRevealedContinuations(renderedStep));
}

function uniqueLoreSections(sections: LoreSection[]): LoreSection[] {
    const seen = new Set<string>();
    return sections.filter((section) => {
        if (seen.has(section.sectionKey)) return false;
        seen.add(section.sectionKey);
        return true;
    });
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

function LoreSectionList({ entry, sections: scopedSections }: { entry: QuestExplorerEntry; sections?: LoreSection[] }) {
    const sections = scopedSections ?? entry.loreView.sections;

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

function choiceTargetsCurrentDisplayStep(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>
): boolean {
    if (!displayEntry) return false;

    const stepKeys = new Set(stepIdentityKeys(step).flatMap((key) => entryKeysWithAliases(key, entriesByKey)));
    return uniqueStrings([choice.targetEntryKey, ...choice.nextEntryKeys])
        .flatMap((key) => entryKeysWithAliases(key, entriesByKey))
        .some((key) => stepKeys.has(key));
}

function isStructuralContextChoice(
    step: QuestProgressionStep,
    choice: QuestPathChoice,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean
): boolean {
    if (showRawHiddenRows) return false;
    if (!choice.id.startsWith("variant:")) return false;
    if (!displayEntry) return false;
    if (choice.requirementLines.length > 0 || choice.rewardLines.length > 0) return false;
    if (!choiceTargetsCurrentDisplayStep(step, choice, displayEntry, entriesByKey)) return false;

    return [choice.label, choice.continuationTitle]
        .filter(Boolean)
        .some((label) => label === displayEntry.title);
}

function selectedPathBranchKeys(choices: QuestPathChoice[], selectedChoice: QuestPathChoiceSelection | null): Set<string> {
    if (!selectedChoice) return new Set();
    const selected = choices.find((choice) => choice.id === selectedChoice.choiceId);
    return new Set([
        ...(selected?.prerequisiteBranchKeys ?? []),
        selected?.parentBranchKey ?? null,
    ].filter((branchKey): branchKey is string => Boolean(branchKey)));
}

function choicePresentationGroups(
    step: QuestProgressionStep,
    choices: QuestPathChoice[],
    selectedChoice: QuestPathChoiceSelection | null,
    displayEntry: QuestExplorerEntry | null,
    entriesByKey: Record<string, QuestExplorerEntry>,
    showRawHiddenRows: boolean,
    debugChoiceDetails?: Map<string, string>
): ChoicePresentationGroups {
    const structuralContextChoices = choices.filter((choice) => (
        isStructuralContextChoice(step, choice, displayEntry, entriesByKey, showRawHiddenRows)
    ));
    const structuralIds = new Set(structuralContextChoices.map((choice) => choice.id));
    const actionableChoices = choices.filter((choice) => !structuralIds.has(choice.id));
    const activeContinuationChoices = showRawHiddenRows
        ? []
        : actionableChoices.filter((choice) => (
            choice.sectionRole === "continuation" && choice.prerequisiteBranchKeys.length > 0
        ));
    const continuationIds = new Set(activeContinuationChoices.map((choice) => choice.id));

    return {
        structuralContextChoices,
        primaryChoices: actionableChoices.filter((choice) => !continuationIds.has(choice.id)),
        activeContinuationChoices,
        selectedPathBranchKeys: selectedPathBranchKeys(choices, selectedChoice),
    };
}

function ChoiceStageHeading({ children }: { children: string }) {
    return <h4 className="questExplorer-choiceStageHeading">{children}</h4>;
}

function StrategyChoiceButton({
    step,
    choice,
    selectedChoice,
    selectedPathBranchKeys,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choice: QuestPathChoice;
    selectedChoice: QuestPathChoiceSelection | null;
    selectedPathBranchKeys: Set<string>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const isSelected = selectedChoice?.choiceId === choice.id;
    const isInSelectedPath = !isSelected && Boolean(choice.branchKey && selectedPathBranchKeys.has(choice.branchKey));
    const primaryLines = choice.strategyLines.length > 0 ? choice.strategyLines : choice.descriptionLines;

    return (
        <button
            type="button"
            className={`questExplorer-choiceCard questExplorer-choiceCard--${choice.accent}${isSelected ? " is-selected" : ""}${isInSelectedPath ? " is-inPath" : ""}`}
            aria-pressed={isSelected || isInSelectedPath}
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
}

function StrategyChoiceContext({ choice }: { choice: QuestPathChoice }) {
    const primaryLines = choice.strategyLines.length > 0 ? choice.strategyLines : choice.descriptionLines;

    return (
        <div className="questExplorer-choiceContext" key={choice.id}>
            <span className="questExplorer-choiceCardGlyph" aria-hidden="true" />
            <span className="questExplorer-choiceCardCopy">
                <small>{choice.eyebrow}</small>
                <strong>{choice.label}</strong>
                {primaryLines.length > 0 ? <span>{primaryLines.join(" ")}</span> : null}
                <InlineChoiceMeta label="Leads to" values={choice.continuationTitle ? [choice.continuationTitle] : []} />
            </span>
        </div>
    );
}

function StrategyChoiceGate({
    step,
    choices,
    selectedChoice,
    displayEntry,
    entriesByKey,
    showRawHiddenRows,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choices: QuestPathChoice[];
    selectedChoice: QuestPathChoiceSelection | null;
    displayEntry: QuestExplorerEntry | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (choices.length === 0) return null;

    const presentation = choicePresentationGroups(step, choices, selectedChoice, displayEntry, entriesByKey, showRawHiddenRows, debugChoiceDetails);
    const hasActionableChoices = presentation.primaryChoices.length > 0 || presentation.activeContinuationChoices.length > 0;
    const showPrimaryHeading = presentation.activeContinuationChoices.length > 0 || presentation.structuralContextChoices.length > 0;

    return (
        <section className="questExplorer-choiceGate questExplorer-strategyChoiceGate" aria-label={`${stepPositionLabel(step)} choices`}>
            <h3>Make a Choice</h3>
            {presentation.structuralContextChoices.length > 0 ? (
                <div className="questExplorer-choiceContextList">
                    {presentation.structuralContextChoices.map((choice) => (
                        <StrategyChoiceContext choice={choice} key={choice.id} />
                    ))}
                </div>
            ) : null}
            {presentation.primaryChoices.length > 0 ? (
                <div className="questExplorer-choiceStage">
                    {showPrimaryHeading ? <ChoiceStageHeading>Path Choices</ChoiceStageHeading> : null}
                    <div>
                        {presentation.primaryChoices.map((choice) => (
                            <StrategyChoiceButton
                                step={step}
                                choice={choice}
                                selectedChoice={selectedChoice}
                                selectedPathBranchKeys={presentation.selectedPathBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {presentation.activeContinuationChoices.length > 0 ? (
                <div className="questExplorer-choiceStage questExplorer-choiceStage--continuation">
                    <ChoiceStageHeading>Next Choices</ChoiceStageHeading>
                    <div>
                        {presentation.activeContinuationChoices.map((choice) => (
                            <StrategyChoiceButton
                                step={step}
                                choice={choice}
                                selectedChoice={selectedChoice}
                                selectedPathBranchKeys={presentation.selectedPathBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {!selectedChoice && hasActionableChoices ? (
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

function LoreChoiceButton({
    step,
    choice,
    selectedChoice,
    selectedPathBranchKeys,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choice: QuestPathChoice;
    selectedChoice: QuestPathChoiceSelection | null;
    selectedPathBranchKeys: Set<string>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const isSelected = selectedChoice?.choiceId === choice.id;
    const isInSelectedPath = !isSelected && Boolean(choice.branchKey && selectedPathBranchKeys.has(choice.branchKey));
    const previewLines = choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines;

    return (
        <button
            type="button"
            className={`questExplorer-loreChoice questExplorer-loreChoice--${choice.accent}${isSelected ? " is-selected" : ""}${isInSelectedPath ? " is-inPath" : ""}`}
            aria-pressed={isSelected || isInSelectedPath}
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
}

function LoreChoiceContext({ choice }: { choice: QuestPathChoice }) {
    const previewLines = choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines;

    return (
        <div className="questExplorer-loreChoiceContext" key={choice.id}>
            <span className="questExplorer-loreChoiceMark" aria-hidden="true" />
            <span className="questExplorer-loreChoiceCopy">
                <small>{choice.eyebrow}</small>
                <strong>{choice.label}</strong>
                {previewLines.length > 0 ? <span>{previewLines.join(" ")}</span> : null}
            </span>
        </div>
    );
}

function LoreRevealedContinuation({
    choice,
    debugChoiceDetails,
}: {
    choice: QuestPathChoice;
    debugChoiceDetails?: Map<string, string>;
}) {
    const previewLines = (choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines)
        .filter((line) => line !== choice.label && line !== choice.targetSummaryLine);

    return (
        <section className="questExplorer-revealedContinuation questExplorer-revealedContinuation--lore" key={choice.id}>
            <span className="questExplorer-revealedContinuationLabel">Path Revealed</span>
            <div className="questExplorer-revealedContinuationCopy">
                <strong>{choice.label}</strong>
                {previewLines.map((line, index) => (
                    <p key={`${choice.id}:line:${index}`}>{line}</p>
                ))}
                {debugChoiceDetails?.get(choice.id) ? (
                    <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(choice.id)}</span>
                ) : null}
            </div>
        </section>
    );
}

function LoreRevealedContinuations({
    choices,
    debugChoiceDetails,
}: {
    choices: QuestPathChoice[];
    debugChoiceDetails?: Map<string, string>;
}) {
    if (choices.length === 0) return null;

    return (
        <div className="questExplorer-revealedContinuationList">
            {choices.map((choice) => (
                <LoreRevealedContinuation choice={choice} debugChoiceDetails={debugChoiceDetails} key={choice.id} />
            ))}
        </div>
    );
}

function LoreBranchMoment({
    step,
    choices,
    selectedChoice,
    displayEntry,
    entriesByKey,
    showRawHiddenRows,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choices: QuestPathChoice[];
    selectedChoice: QuestPathChoiceSelection | null;
    displayEntry: QuestExplorerEntry | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (choices.length === 0) return null;

    const presentation = choicePresentationGroups(step, choices, selectedChoice, displayEntry, entriesByKey, showRawHiddenRows, debugChoiceDetails);
    const hasActionableChoices = presentation.primaryChoices.length > 0 || presentation.activeContinuationChoices.length > 0;
    const showPrimaryHeading = presentation.activeContinuationChoices.length > 0 || presentation.structuralContextChoices.length > 0;

    return (
        <section className="questExplorer-loreBranchMoment" aria-label={`${stepPositionLabel(step)} narrative choices`}>
            <h3>Choose a Path</h3>
            {presentation.structuralContextChoices.length > 0 ? (
                <div className="questExplorer-choiceContextList">
                    {presentation.structuralContextChoices.map((choice) => (
                        <LoreChoiceContext choice={choice} key={choice.id} />
                    ))}
                </div>
            ) : null}
            {presentation.primaryChoices.length > 0 ? (
                <div className="questExplorer-choiceStage">
                    {showPrimaryHeading ? <ChoiceStageHeading>Path Choices</ChoiceStageHeading> : null}
                    <div>
                        {presentation.primaryChoices.map((choice) => (
                            <LoreChoiceButton
                                step={step}
                                choice={choice}
                                selectedChoice={selectedChoice}
                                selectedPathBranchKeys={presentation.selectedPathBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {presentation.activeContinuationChoices.length > 0 ? (
                <div className="questExplorer-choiceStage questExplorer-choiceStage--continuation">
                    <ChoiceStageHeading>Next Choices</ChoiceStageHeading>
                    <div>
                        {presentation.activeContinuationChoices.map((choice) => (
                            <LoreChoiceButton
                                step={step}
                                choice={choice}
                                selectedChoice={selectedChoice}
                                selectedPathBranchKeys={presentation.selectedPathBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {!selectedChoice && hasActionableChoices ? (
                <p className="questExplorer-choiceHint">The chronicle waits for your choice.</p>
            ) : null}
        </section>
    );
}

function RepeatedDetailCheckpoint() {
    return (
        <div className="questExplorer-stepCheckpoint">
            <span>Chronicle Checkpoint</span>
            <p>This moment carries forward from the record already shown above.</p>
        </div>
    );
}

function StrategyStep({
    renderedStep,
    totalSteps,
    flow,
    entriesByKey,
    showRawHiddenRows,
    debugChoiceDetails,
    onChoose,
}: {
    renderedStep: RenderedPathStep;
    totalSteps: number;
    flow: QuestPathFlow;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const title = stepTitle(renderedStep.step, renderedStep.displayEntry, entriesByKey);
    const strategyScope = renderedStep.displayEntry
        ? strategyObjectiveScopeForStep(renderedStep.displayEntry, renderedStep)
        : null;
    const revealedStrategyScope = renderedStep.displayEntry
        ? strategyObjectiveScopeForRevealedContinuations(renderedStep.displayEntry, renderedStep)
        : null;
    const strategyChoicePresentation = choicePresentationGroups(
        renderedStep.step,
        renderedStep.choices,
        renderedStep.selectedChoice,
        renderedStep.displayEntry,
        entriesByKey,
        showRawHiddenRows,
        debugChoiceDetails
    );
    const strategyDossier = buildStrategyDossierModel({
        renderedStep,
        totalSteps,
        title,
        displayEntry: renderedStep.displayEntry,
        objectiveScope: strategyScope,
        revealedObjectiveScope: revealedStrategyScope,
        flow,
        entriesByKey,
        usesObjectivePaths: renderedStep.displayEntry ? isMinorFactionVariantQuest(renderedStep.displayEntry) : false,
        comparisonChoices: [
            ...strategyChoicePresentation.primaryChoices,
            ...strategyChoicePresentation.activeContinuationChoices,
        ],
    });
    const selectedChoiceForDebug = renderedStep.selectedChoice
        ? [...renderedStep.choices, ...renderedStep.revealedContinuations]
            .find((choice) => choice.id === renderedStep.selectedChoice?.choiceId)
        : null;
    const projectedDebugDetails = debugChoiceDetails
        ? (renderedStep.revealedContinuations.length > 0 ? renderedStep.revealedContinuations : selectedChoiceForDebug ? [selectedChoiceForDebug] : [])
            .map((choice) => debugChoiceDetails.get(choice.id))
            .filter((detail): detail is string => Boolean(detail))
        : undefined;
    const fallbackChoiceGate = renderedStep.choices.length > 0 ? (
        <StrategyChoiceGate
            step={renderedStep.step}
            choices={renderedStep.choices}
            selectedChoice={renderedStep.selectedChoice}
            displayEntry={renderedStep.displayEntry}
            entriesByKey={entriesByKey}
            showRawHiddenRows={showRawHiddenRows}
            debugChoiceDetails={debugChoiceDetails}
            onChoose={onChoose}
        />
    ) : null;

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

            {renderedStep.rendersRepeatedDetailContent ? (
                <RepeatedDetailCheckpoint />
            ) : (
                renderedStep.displayEntry ? (
                    <div className="questExplorer-strategyStepBody">
                        <StrategyDossier
                            model={strategyDossier}
                            step={renderedStep.step}
                            debugChoiceDetails={debugChoiceDetails}
                            onChoose={onChoose}
                            projectedDebugDetails={projectedDebugDetails}
                        />
                    </div>
                ) : (
                    <p className="questExplorer-emptyState">This progression step has no entry-backed content in the current DTO.</p>
                )
            )}

            {!renderedStep.displayEntry ? fallbackChoiceGate : null}
        </article>
    );
}

function LoreStep({
    renderedStep,
    entriesByKey,
    showRawHiddenRows,
    debugChoiceDetails,
    onChoose,
}: {
    renderedStep: RenderedPathStep;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const title = stepTitle(renderedStep.step, renderedStep.displayEntry, entriesByKey);
    const loreSections = renderedStep.displayEntry
        ? loreSectionsForStep(renderedStep.displayEntry, renderedStep)
        : undefined;
    const revealedLoreSections = renderedStep.displayEntry
        ? loreSectionsForRevealedContinuations(renderedStep.displayEntry, renderedStep)
        : [];

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

            {renderedStep.rendersRepeatedDetailContent ? (
                <RepeatedDetailCheckpoint />
            ) : (
                renderedStep.displayEntry ? (
                    <LoreSectionList entry={renderedStep.displayEntry} sections={loreSections} />
                ) : (
                    <p className="questExplorer-emptyState">This progression step has no entry-backed content in the current DTO.</p>
                )
            )}

            <LoreBranchMoment
                step={renderedStep.step}
                choices={renderedStep.choices}
                selectedChoice={renderedStep.selectedChoice}
                displayEntry={renderedStep.displayEntry}
                entriesByKey={entriesByKey}
                showRawHiddenRows={showRawHiddenRows}
                debugChoiceDetails={debugChoiceDetails}
                onChoose={onChoose}
            />

            <LoreRevealedContinuations
                choices={renderedStep.revealedContinuations}
                debugChoiceDetails={debugChoiceDetails}
            />

            {renderedStep.displayEntry && revealedLoreSections.length > 0 && !renderedStep.revealedContinuationsBecomeSteps ? (
                <div className="questExplorer-revealedBeatBody questExplorer-revealedBeatBody--lore">
                    <LoreSectionList entry={renderedStep.displayEntry} sections={revealedLoreSections} />
                </div>
            ) : null}
        </article>
    );
}

function continuationChapterMessage(entry: QuestExplorerEntry | null): string {
    const title = entry?.title ?? "the next chapter";
    const chapter = entry?.navigation.chapterLabel
        ?? (entry?.navigation.chapter != null ? `Chapter ${entry.navigation.chapter}` : null);

    return chapter
        ? `This path continues in ${chapter}: ${title}.`
        : `This path continues with ${title}.`;
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
                    <span>Path Continues</span>
                    <p>{continuationChapterMessage(entriesByKey[flow.reachedContinuationEntryKey] ?? null)}</p>
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
                    <span>Path Continues</span>
                    <p>{continuationChapterMessage(entriesByKey[flow.reachedContinuationEntryKey] ?? null)}</p>
                </section>
            ) : null}
        </>
    );
}

function StrategyProgression({
    progression,
    fullProgression,
    flow,
    entriesByKey,
    debugQuestProgression,
    showRawHiddenRows,
    onChoose,
}: {
    progression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    flow: QuestPathFlow | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugQuestProgression: boolean;
    showRawHiddenRows: boolean;
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
                    flow={flow}
                    entriesByKey={entriesByKey}
                    showRawHiddenRows={showRawHiddenRows}
                    debugChoiceDetails={debugQuestProgression
                        ? choiceDebugDetailsForStep(
                            renderedStep.step,
                            [...renderedStep.choices, ...renderedStep.revealedContinuations],
                            renderedStep.choiceDiagnostics,
                            progression,
                            fullProgression,
                            entriesByKey,
                            renderedStep.revealedContinuations
                        )
                        : undefined}
                    onChoose={onChoose}
                    key={renderedStep.step.stepKey}
                />
            ))}
            <StrategyPathState flow={flow} entriesByKey={entriesByKey} />
        </section>
    );
}

function LoreContinuousProgression({
    stream,
    fullProgression,
    entriesByKey,
    debugQuestProgression,
    showRawHiddenRows,
    onChoose,
    activeRailEntryKey,
}: {
    stream: LoreChronicleStream;
    fullProgression: QuestExplorerProgression | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugQuestProgression: boolean;
    showRawHiddenRows: boolean;
    onChoose: (segment: LoreChronicleSegment, step: QuestProgressionStep, choice: QuestPathChoice) => void;
    activeRailEntryKey: string | null;
}) {
    if (stream.segments.length === 0) return null;

    return (
        <section className="questExplorer-questPathChronicle questExplorer-loreChronicle" aria-label="Selected progression">
            {stream.segments.map((segment, segmentIndex) => {
                const hasNextSegment = segmentIndex < stream.segments.length - 1;
                const isScrollActive = Boolean(segment.railEntryKey && segment.railEntryKey === activeRailEntryKey);
                const isActiveDebugSegment = activeRailEntryKey ? isScrollActive : segmentIndex === 0;
                return (
                    <section
                        className={`questExplorer-loreChronicleSegment${isScrollActive ? " is-scrollActive" : ""}`}
                        data-lore-segment-key={segment.segmentKey}
                        data-rail-entry-key={segment.railEntryKey ?? ""}
                        key={segment.segmentKey}
                    >
                        {segment.flow.renderedSteps.map((renderedStep) => (
                            <LoreStep
                                renderedStep={renderedStep}
                                entriesByKey={entriesByKey}
                                showRawHiddenRows={showRawHiddenRows}
                                debugChoiceDetails={debugQuestProgression && isActiveDebugSegment
                                    ? choiceDebugDetailsForStep(
                                        renderedStep.step,
                                        [...renderedStep.choices, ...renderedStep.revealedContinuations],
                                        renderedStep.choiceDiagnostics,
                                        segment.progression,
                                        fullProgression,
                                        entriesByKey,
                                        renderedStep.revealedContinuations
                                    )
                                    : undefined}
                                onChoose={(step, choice) => onChoose(segment, step, choice)}
                                key={`${segment.segmentKey}:${renderedStep.step.stepKey}`}
                            />
                        ))}
                        {hasNextSegment ? null : <LorePathState flow={segment.flow} entriesByKey={entriesByKey} />}
                    </section>
                );
            })}
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
        `branchKey=${selection.branchKey ?? "none"}`,
        `role=${selection.sectionRole ?? "none"}`,
        `choiceGroupKey=${selection.choiceGroupKey ?? "none"}`,
        `branchStepOrder=${selection.branchStepOrder ?? "none"}`,
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
    activeMode,
    activeChoicePath,
    debugChoicePathsByMode,
    loreContextKey,
    showRawHiddenRows,
    onToggleRawHiddenRows,
}: {
    selectedEntry: QuestExplorerEntry;
    progression: QuestDetailProgression | null;
    flow: QuestPathFlow | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    activeMode: QuestExplorerMode;
    activeChoicePath: QuestPathChoiceSelection[];
    debugChoicePathsByMode: QuestModeDebugChoicePaths;
    loreContextKey: string | null;
    showRawHiddenRows: boolean;
    onToggleRawHiddenRows: (value: boolean) => void;
}) {
    return (
        <section className="questExplorer-debugPanel" aria-label="Quest progression debug">
            <header className="questExplorer-debugPanelHeader">
                <div>
                    <span>Debug</span>
                    <h3>Debug progression</h3>
                </div>
                <label className="questExplorer-debugToggle">
                    <input
                        type="checkbox"
                        checked={showRawHiddenRows}
                        onChange={(event) => onToggleRawHiddenRows(event.currentTarget.checked)}
                    />
                    <span>Show raw hidden rows</span>
                </label>
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
                        label: "active mode",
                        value: activeMode,
                    },
                    {
                        label: "active selected choice path",
                        value: debugChoicePath(activeChoicePath),
                    },
                    {
                        label: "active selected branch path",
                        value: debugBranchPath(activeChoicePath),
                    },
                    {
                        label: "Lore context key",
                        value: loreContextKey ?? "none",
                    },
                    {
                        label: "Strategy selected choice path",
                        value: debugChoicePath(debugChoicePathsByMode.strategy),
                    },
                    {
                        label: "Lore selected choice path",
                        value: debugChoicePath(debugChoicePathsByMode.lore),
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
                                    label: "normal visible choice count",
                                    value: String(renderedStep.choiceDiagnostics.normalVisibleChoiceCount),
                                },
                                {
                                    label: "debug visible choice count",
                                    value: String(renderedStep.choiceDiagnostics.debugVisibleChoiceCount),
                                },
                                {
                                    label: "hidden artifact count",
                                    value: String(renderedStep.choiceDiagnostics.hiddenArtifactCount),
                                },
                                {
                                    label: "hidden unresolved count",
                                    value: String(renderedStep.choiceDiagnostics.hiddenUnresolvedCount),
                                },
                                {
                                    label: "hidden staged continuation count",
                                    value: String(renderedStep.choiceDiagnostics.hiddenContinuationCount),
                                },
                                {
                                    label: "selected choice",
                                    value: renderedStep.selectedChoice ? debugChoiceSelection(renderedStep.selectedChoice) : "none",
                                },
                                {
                                    label: "current beat",
                                    value: renderedStep.currentBeatChoice ? debugChoiceSelection(renderedStep.currentBeatChoice) : "none",
                                },
                                {
                                    label: "revealed continuations",
                                    value: renderedStep.revealedContinuations.length > 0
                                        ? renderedStep.revealedContinuations.map((choice) => choice.label).join(", ")
                                        : "none",
                                },
                                {
                                    label: "revealed continuation step",
                                    value: renderedStep.revealedContinuationsBecomeSteps ? "yes" : "no",
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
    const contentRef = useRef<HTMLElement | null>(null);

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
    const [strategyChoicePath, setStrategyChoicePath] = useState<QuestPathChoiceSelection[]>([]);
    const [loreChoicePathsByContext, setLoreChoicePathsByContext] = useState<LoreChoicePathsByContext>({});
    const [showRawHiddenRows, setShowRawHiddenRows] = useState(false);
    const [scrollActiveRailEntryKey, setScrollActiveRailEntryKey] = useState<string | null>(null);

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
        () => findDetailProgression(progression, selectedEntry, requestedEntryKey),
        [progression, requestedEntryKey, selectedEntry]
    );
    const selectedProgressionKey = useMemo(
        () => progressionContextKey(selectedProgression, selectedEntryKey),
        [selectedEntryKey, selectedProgression]
    );
    const choicePathResetKey = `${selectedEntryKey ?? "none"}:${selectedProgressionKey}`;
    const strategyPathFlow = useMemo(
        () => selectedProgression
            ? buildQuestPathFlow(selectedProgression, entriesByKey, strategyChoicePath, progression, {
                focusedStepIndex: selectedProgression.focusedStepIndex,
                showRawHiddenRows: debugQuestProgression && showRawHiddenRows,
            })
            : null,
        [debugQuestProgression, entriesByKey, progression, selectedProgression, showRawHiddenRows, strategyChoicePath]
    );
    const loreChronicleStream = useMemo(
        () => buildLoreChronicleStream({
            selectedProgression,
            fullProgression: progression,
            entriesByKey,
            loreChoicePathsByContext,
            showRawHiddenRows: debugQuestProgression && showRawHiddenRows,
        }),
        [debugQuestProgression, entriesByKey, loreChoicePathsByContext, progression, selectedProgression, showRawHiddenRows]
    );
    const activeLoreSegment = mode === "lore" && scrollActiveRailEntryKey
        ? loreChronicleStream.segments.find((segment) => segment.railEntryKey === scrollActiveRailEntryKey) ?? loreChronicleStream.segments[0] ?? null
        : loreChronicleStream.segments[0] ?? null;
    const activeDebugFlow = mode === "lore" ? activeLoreSegment?.flow ?? null : strategyPathFlow;
    const activeDebugProgression = mode === "lore" ? activeLoreSegment?.progression ?? selectedProgression : selectedProgression;
    const activeDebugLoreContextKey = mode === "lore" ? activeLoreSegment?.contextKey ?? selectedProgressionKey : selectedProgressionKey;
    const activeDebugLoreChoicePath = loreChoicePathsByContext[activeDebugLoreContextKey] ?? EMPTY_CHOICE_PATH;
    const activeDebugChoicePath = mode === "strategy" ? strategyChoicePath : activeDebugLoreChoicePath;
    const debugChoicePathsByMode = useMemo<QuestModeDebugChoicePaths>(
        () => ({ strategy: strategyChoicePath, lore: activeDebugLoreChoicePath }),
        [activeDebugLoreChoicePath, strategyChoicePath]
    );
    const loreSegmentObserverKey = useMemo(
        () => loreChronicleStream.segments.map((segment) => segment.segmentKey).join("|"),
        [loreChronicleStream.segments]
    );
    const strategyRailEntry = strategyPathFlow?.reachedContinuationEntryKey
        ? entriesByKey[strategyPathFlow.reachedContinuationEntryKey] ?? selectedEntry
        : selectedEntry;
    const activeRailEntry = mode === "lore"
        ? scrollActiveRailEntryKey
            ? entriesByKey[scrollActiveRailEntryKey] ?? selectedEntry
            : selectedEntry
        : strategyRailEntry;
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
        setScrollActiveRailEntryKey(null);
    }, [mode, selectedProgressionKey]);

    useEffect(() => {
        setStrategyChoicePath([]);
    }, [choicePathResetKey]);

    useEffect(() => {
        if (mode !== "lore") return;
        const rootElement = contentRef.current;
        if (!rootElement || typeof IntersectionObserver === "undefined") return;

        const segmentElements = Array.from(rootElement.querySelectorAll<HTMLElement>("[data-lore-segment-key]"));
        if (segmentElements.length === 0) return;

        const visibleEntriesByElement = new Map<Element, IntersectionObserverEntry>();
        const rootStyle = window.getComputedStyle(rootElement);
        const observerRoot = rootStyle.overflowY === "visible" ? null : rootElement;
        const selectVisibleSegment = () => {
            const visibleSegments = [...visibleEntriesByElement.values()]
                .filter((entry) => entry.isIntersecting)
                .sort((left, right) => {
                    const ratioDelta = right.intersectionRatio - left.intersectionRatio;
                    if (Math.abs(ratioDelta) > 0.05) return ratioDelta;
                    return Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top);
                });
            const railEntryKey = visibleSegments[0]?.target.getAttribute("data-rail-entry-key")?.trim() ?? "";
            if (railEntryKey) setScrollActiveRailEntryKey(railEntryKey);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleEntriesByElement.set(entry.target, entry);
                } else {
                    visibleEntriesByElement.delete(entry.target);
                }
            });
            selectVisibleSegment();
        }, {
            root: observerRoot,
            rootMargin: "-18% 0px -62% 0px",
            threshold: [0, 0.01, 0.25, 0.5],
        });

        segmentElements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [loreSegmentObserverKey, mode, selectedProgressionKey]);

    useEffect(() => {
        if (!debugQuestProgression) setShowRawHiddenRows(false);
    }, [debugQuestProgression]);

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

    const chooseQuestPathChoice = (
        step: QuestProgressionStep,
        choice: QuestPathChoice,
        choiceProgression = selectedProgression,
        loreContextKey = selectedProgressionKey
    ) => {
        if (!choiceProgression) return;
        const stepIndex = choiceProgression.chapter.steps.findIndex((candidate) => candidate.stepKey === step.stepKey);
        if (stepIndex < 0) return;
        const nextSelection = selectionForChoice(step.stepKey, choice);
        const nextBranchStepOrder = nextSelection.branchStepOrder ?? Number.MAX_SAFE_INTEGER;

        const nextChoicePath = (currentPath: QuestPathChoiceSelection[]) => {
            const retained = currentPath.filter((selection) => {
                const selectionIndex = choiceProgression.chapter.steps.findIndex((candidate) => candidate.stepKey === selection.stepKey);
                if (selectionIndex < 0 || selectionIndex > stepIndex) return false;
                if (selectionIndex < stepIndex) return true;
                return (selection.branchStepOrder ?? Number.MAX_SAFE_INTEGER) < nextBranchStepOrder;
            });
            return [...retained, nextSelection];
        };

        if (mode === "strategy") {
            setStrategyChoicePath(nextChoicePath);
            return;
        }

        setLoreChoicePathsByContext((current) => ({
            ...current,
            [loreContextKey]: nextChoicePath(current[loreContextKey] ?? []),
        }));
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

                            <section className={`questExplorer-content questExplorer-content--${mode}`} ref={contentRef}>
                                {mode === "strategy" ? (
                                    <>
                                        {!selectedProgression ? <StrategyOverview entry={selectedEntry} /> : null}
                                        {selectedProgression ? (
                                            <StrategyProgression
                                                progression={selectedProgression}
                                                fullProgression={progression}
                                                flow={strategyPathFlow}
                                                entriesByKey={entriesByKey}
                                                debugQuestProgression={debugQuestProgression}
                                                showRawHiddenRows={debugQuestProgression && showRawHiddenRows}
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
                                        {!selectedProgression ? <LoreOpening entry={selectedEntry} /> : null}
                                        {selectedProgression ? (
                                            <LoreContinuousProgression
                                                stream={loreChronicleStream}
                                                fullProgression={progression}
                                                entriesByKey={entriesByKey}
                                                debugQuestProgression={debugQuestProgression}
                                                showRawHiddenRows={debugQuestProgression && showRawHiddenRows}
                                                onChoose={(segment, step, choice) => chooseQuestPathChoice(step, choice, segment.progression, segment.contextKey)}
                                                activeRailEntryKey={scrollActiveRailEntryKey}
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
                                        progression={activeDebugProgression}
                                        flow={activeDebugFlow}
                                        entriesByKey={entriesByKey}
                                        activeMode={mode}
                                        activeChoicePath={activeDebugChoicePath}
                                        debugChoicePathsByMode={debugChoicePathsByMode}
                                        loreContextKey={activeDebugLoreContextKey}
                                        showRawHiddenRows={showRawHiddenRows}
                                        onToggleRawHiddenRows={setShowRawHiddenRows}
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
