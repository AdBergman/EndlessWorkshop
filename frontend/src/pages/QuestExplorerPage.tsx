import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import QuestExplorerModeSwitch from "@/components/Quests/QuestExplorerModeSwitch";
import {
    InlineMetaList,
    StrategyDossier,
} from "@/components/Quests/StrategyDossier";
import {
    LoreContinuousProgression,
    LoreOpening,
    LoreSectionList,
} from "@/components/Quests/LoreReader";
import {
    QuestProgressionDebugPanel,
    type QuestModeDebugChoicePaths,
} from "@/components/Quests/QuestProgressionDebugPanel";
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
    choiceKindLabel,
    findDetailProgression,
    locationLabel,
    progressionContextKey,
    progressionLocationForKeys,
    selectedChoiceContinuationKeys,
    selectedChoiceTargetKeys,
    selectionForChoice,
    stepIndexForKeys,
    uniqueStrings,
    type ChoiceVisibilityDiagnostics,
    type NormalHiddenChoiceReason,
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
} from "@/features/quests/questPathFlow";
import {
    stagePresentationGroups,
} from "@/features/quests/questChoicePresentation";
import {
    chapterPositionLabel,
    isMinorFactionVariantQuest,
    objectiveVariantLabel,
    phaseDisplayLabel,
    stepPositionLabel,
} from "@/features/quests/questDisplay";
import {
    activeLoreSegmentForModel,
    buildLoreFlowModel,
} from "@/features/quests/questLoreFlow";
import {
    buildStrategyFlowModel,
    type StrategyFlowModel,
} from "@/features/quests/questStrategyFlow";
import {
    LORE_SCROLL_ENTRY_QUERY_PARAM,
    useQuestExplorerLoreScrollUrl,
} from "@/features/quests/useQuestExplorerLoreScrollUrl";
import { useQuestExplorerPathState } from "@/features/quests/useQuestExplorerPathState";
import {
    selectSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";
import { getEmpireLabel } from "@/lib/labels/empireLabels";
import type {
    QuestExplorerEntry,
    QuestExplorerProgression,
    QuestProgressionStep,
    StrategyObjective,
} from "@/types/questTypes";
import "@/components/Quests/QuestExplorer.css";

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

function countLabel(count: number, singular: string, plural = `${singular}s`): string {
    return `${count} ${count === 1 ? singular : plural}`;
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

function StageGroupHeading({ children }: { children: string }) {
    return <h4 className="questExplorer-choiceStageHeading">{children}</h4>;
}

function StrategyStageButton({
    step,
    choice,
    selectedChoice,
    selectedContextBranchKeys,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choice: QuestPathChoice;
    selectedChoice: QuestPathChoiceSelection | null;
    selectedContextBranchKeys: Set<string>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const isSelected = selectedChoice?.choiceId === choice.id;
    const isInSelectedContext = !isSelected && Boolean(choice.branchKey && selectedContextBranchKeys.has(choice.branchKey));
    const primaryLines = choice.strategyLines.length > 0 ? choice.strategyLines : choice.descriptionLines;

    return (
        <button
            type="button"
            className={`questExplorer-choiceCard questExplorer-choiceCard--${choice.accent}${isSelected ? " is-selected" : ""}${isInSelectedContext ? " is-inPath" : ""}`}
            aria-pressed={isSelected || isInSelectedContext}
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
                <InlineStageMeta label="Requires" values={choice.requirementLines} />
                <InlineStageMeta label="Rewards" values={choice.rewardLines} />
                <InlineStageMeta label="Leads to" values={choice.continuationTitle ? [choice.continuationTitle] : []} />
                {debugChoiceDetails?.get(choice.id) ? (
                    <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(choice.id)}</span>
                ) : null}
            </span>
        </button>
    );
}

function StrategyStageContext({ choice }: { choice: QuestPathChoice }) {
    const primaryLines = choice.strategyLines.length > 0 ? choice.strategyLines : choice.descriptionLines;

    return (
        <div className="questExplorer-choiceContext" key={choice.id}>
            <span className="questExplorer-choiceCardGlyph" aria-hidden="true" />
            <span className="questExplorer-choiceCardCopy">
                <small>{choice.eyebrow}</small>
                <strong>{choice.label}</strong>
                {primaryLines.length > 0 ? <span>{primaryLines.join(" ")}</span> : null}
                <InlineStageMeta label="Leads to" values={choice.continuationTitle ? [choice.continuationTitle] : []} />
            </span>
        </div>
    );
}

function StrategyStageGate({
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

    const presentation = stagePresentationGroups(step, choices, selectedChoice, displayEntry, entriesByKey, showRawHiddenRows);
    const hasActionableStages = presentation.primaryStages.length > 0 || presentation.activeContinuationStages.length > 0;
    const showPrimaryHeading = presentation.activeContinuationStages.length > 0 || presentation.structuralContextStages.length > 0;

    return (
        <section className="questExplorer-choiceGate questExplorer-strategyChoiceGate" aria-label={`${stepPositionLabel(step)} strategy stages`}>
            <h3>Strategy stages</h3>
            {presentation.structuralContextStages.length > 0 ? (
                <div className="questExplorer-choiceContextList">
                    {presentation.structuralContextStages.map((choice) => (
                        <StrategyStageContext choice={choice} key={choice.id} />
                    ))}
                </div>
            ) : null}
            {presentation.primaryStages.length > 0 ? (
                <div className="questExplorer-choiceStage">
                    {showPrimaryHeading ? <StageGroupHeading>Available decisions</StageGroupHeading> : null}
                    <div>
                        {presentation.primaryStages.map((choice) => (
                            <StrategyStageButton
                                step={step}
                                choice={choice}
                                selectedChoice={selectedChoice}
                                selectedContextBranchKeys={presentation.selectedContextBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {presentation.activeContinuationStages.length > 0 ? (
                <div className="questExplorer-choiceStage questExplorer-choiceStage--continuation">
                    <StageGroupHeading>Continuations</StageGroupHeading>
                    <div>
                        {presentation.activeContinuationStages.map((choice) => (
                            <StrategyStageButton
                                step={step}
                                choice={choice}
                                selectedChoice={selectedChoice}
                                selectedContextBranchKeys={presentation.selectedContextBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {!selectedChoice && hasActionableStages ? (
                <p className="questExplorer-choiceHint">Select an available decision or continuation to preview the result.</p>
            ) : null}
        </section>
    );
}

function InlineStageMeta({ label, values }: { label: string; values: string[] }) {
    const cleanValues = values.filter(Boolean);
    if (cleanValues.length === 0) return null;

    return (
        <span className="questExplorer-choiceCardMeta">
            <b>{label}</b> {cleanValues.join("; ")}
        </span>
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
    model,
    entriesByKey,
    showRawHiddenRows,
    debugChoiceDetails,
    projectedDebugDetails,
    onChoose,
}: {
    model: StrategyFlowModel;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const activeStage = model.activeStage;
    if (!activeStage) return null;

    const { renderedStep, dossier, title, totalStages } = activeStage;

    const fallbackChoiceGate = renderedStep.choices.length > 0 ? (
        <StrategyStageGate
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
                        <span>of {totalStages}</span>
                    </span>
                    <ProgressionPips total={totalStages} activeIndex={activeStage.stepIndex} />
                </div>
                <strong className="questExplorer-stepTitle">{title}</strong>
            </header>

            {renderedStep.rendersRepeatedDetailContent ? (
                <RepeatedDetailCheckpoint />
            ) : (
                renderedStep.displayEntry ? (
                    <div className="questExplorer-strategyStepBody">
                        <StrategyDossier
                            model={dossier}
                            step={renderedStep.step}
                            debugChoiceDetails={debugChoiceDetails}
                            onChoose={onChoose}
                            projectedDebugDetails={projectedDebugDetails}
                        />
                    </div>
                ) : (
                    <p className="questExplorer-emptyState">This progression stage has no entry-backed content in the current DTO.</p>
                )
            )}

            {!renderedStep.displayEntry ? fallbackChoiceGate : null}
        </article>
    );
}

function StrategyProgression({
    progression,
    fullProgression,
    model,
    entriesByKey,
    debugQuestProgression,
    showRawHiddenRows,
    onChoose,
}: {
    progression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    model: StrategyFlowModel | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugQuestProgression: boolean;
    showRawHiddenRows: boolean;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (!progression || !model?.activeStage) return null;

    const renderedStep = model.activeStage.renderedStep;
    const debugChoiceDetails = debugQuestProgression
        ? choiceDebugDetailsForStep(
            renderedStep.step,
            model.debugChoices,
            renderedStep.choiceDiagnostics,
            progression,
            fullProgression,
            entriesByKey,
            renderedStep.revealedContinuations
        )
        : undefined;
    const projectedDebugDetails = debugChoiceDetails
        ? model.projectedDebugChoices
            .map((choice) => debugChoiceDetails.get(choice.id))
            .filter((detail): detail is string => Boolean(detail))
        : undefined;

    return (
        <section className="questExplorer-questPathChronicle questExplorer-strategyChronicle" aria-label="Selected progression">
            <StrategyStep
                model={model}
                entriesByKey={entriesByKey}
                showRawHiddenRows={showRawHiddenRows}
                debugChoiceDetails={debugChoiceDetails}
                projectedDebugDetails={projectedDebugDetails}
                onChoose={onChoose}
            />
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
    const [showRawHiddenRows, setShowRawHiddenRows] = useState(false);

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
    const {
        strategyChoicePath,
        loreChoicePathsByContext,
        chooseExplicitChoice,
    } = useQuestExplorerPathState({
        mode,
        selectedEntryKey,
        selectedProgression,
        selectedProgressionKey,
    });
    const strategyFlowModel = useMemo(
        () => buildStrategyFlowModel({
            progression: selectedProgression,
            fullProgression: progression,
            entriesByKey,
            choicePath: strategyChoicePath,
            showRawHiddenRows: debugQuestProgression && showRawHiddenRows,
            getStepTitle: (step, entry) => stepTitle(step, entry, entriesByKey),
        }),
        [debugQuestProgression, entriesByKey, progression, selectedProgression, showRawHiddenRows, strategyChoicePath]
    );
    const loreFlowModel = useMemo(
        () => buildLoreFlowModel({
            selectedProgression,
            fullProgression: progression,
            entriesByKey,
            loreChoicePathsByContext,
            showRawHiddenRows: debugQuestProgression && showRawHiddenRows,
        }),
        [debugQuestProgression, entriesByKey, loreChoicePathsByContext, progression, selectedProgression, showRawHiddenRows]
    );
    const {
        scrollActiveRailEntryKey,
        applyPassiveScroll,
    } = useQuestExplorerLoreScrollUrl({
        mode: requestedMode,
        selectedEntryKey,
        selectedProgressionKey,
        segmentRailEntryKeys: loreFlowModel.segmentRailEntryKeys,
    });
    const activeLoreSegment = activeLoreSegmentForModel(loreFlowModel, mode === "lore" ? scrollActiveRailEntryKey : null);
    const activeDebugFlow = mode === "lore" ? activeLoreSegment?.flow ?? null : strategyFlowModel?.flow ?? null;
    const activeDebugProgression = mode === "lore" ? activeLoreSegment?.progression ?? selectedProgression : selectedProgression;
    const activeDebugLoreContextKey = mode === "lore" ? activeLoreSegment?.contextKey ?? selectedProgressionKey : selectedProgressionKey;
    const activeDebugLoreChoicePath = loreChoicePathsByContext[activeDebugLoreContextKey] ?? EMPTY_CHOICE_PATH;
    const activeDebugChoicePath = mode === "strategy" ? strategyChoicePath : activeDebugLoreChoicePath;
    const debugChoicePathsByMode = useMemo<QuestModeDebugChoicePaths>(
        () => ({ strategy: strategyChoicePath, lore: activeDebugLoreChoicePath }),
        [activeDebugLoreChoicePath, strategyChoicePath]
    );
    const loreSegmentObserverKey = useMemo(
        () => loreFlowModel.segments.map((segment) => segment.segmentKey).join("|"),
        [loreFlowModel.segments]
    );
    const strategyRailEntry = strategyFlowModel?.flow.reachedContinuationEntryKey
        ? entriesByKey[strategyFlowModel.flow.reachedContinuationEntryKey] ?? selectedEntry
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
            if (railEntryKey) applyPassiveScroll(railEntryKey);
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
    }, [applyPassiveScroll, loreSegmentObserverKey, mode, selectedProgressionKey]);

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

    const applyCanonicalNavigation = useCallback((entryKey: string) => {
        // Future rollback/default navigation inference should attach here so
        // intentional navigation stays separate from passive Lore scroll and explicit decisions.
        applyPassiveScroll(null);
        setSelectedEntryKey(entryKey);
        navigate(questPath(entryKey, mode, debugQuestProgression));
    }, [applyPassiveScroll, debugQuestProgression, mode, navigate, setSelectedEntryKey]);

    const changeMode = (nextMode: QuestExplorerMode) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete(LORE_SCROLL_ENTRY_QUERY_PARAM);
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
                        onSelectEntry={applyCanonicalNavigation}
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
                                                model={strategyFlowModel}
                                                entriesByKey={entriesByKey}
                                                debugQuestProgression={debugQuestProgression}
                                                showRawHiddenRows={debugQuestProgression && showRawHiddenRows}
                                                onChoose={chooseExplicitChoice}
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
                                                model={loreFlowModel}
                                                entriesByKey={entriesByKey}
                                                showRawHiddenRows={debugQuestProgression && showRawHiddenRows}
                                                onChoose={(segment, step, choice) => chooseExplicitChoice(step, choice, segment.progression, segment.contextKey)}
                                                activeRailEntryKey={scrollActiveRailEntryKey}
                                                getStepTitle={(step, entry) => stepTitle(step, entry, entriesByKey)}
                                                getDebugChoiceDetails={debugQuestProgression
                                                    ? (segment, renderedStep, isActiveDebugSegment) => (
                                                        isActiveDebugSegment
                                                            ? choiceDebugDetailsForStep(
                                                                renderedStep.step,
                                                                [...renderedStep.choices, ...renderedStep.revealedContinuations],
                                                                renderedStep.choiceDiagnostics,
                                                                segment.progression,
                                                                progression,
                                                                entriesByKey,
                                                                renderedStep.revealedContinuations
                                                            )
                                                            : undefined
                                                    )
                                                    : undefined}
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
