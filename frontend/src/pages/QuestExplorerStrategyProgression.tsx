import { StrategyChapterPlan } from "@/components/Quests/StrategyDossier";
import { InlineStageRewardMeta } from "@/components/Quests/QuestRewardMeta";
import { QuestCodexReferenceLink } from "@/components/Quests/QuestCodexReferenceLink";
import {
    choiceKindLabel,
    locationLabel,
    progressionLocationForKeys,
    selectedChoiceContinuationKeys,
    selectedChoiceTargetKeys,
    selectionForChoice,
    stepIndexForKeys,
    type ChoiceVisibilityDiagnostics,
    type NormalHiddenChoiceReason,
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
} from "@/features/quests/questPathFlow";
import { stagePresentationGroups } from "@/features/quests/questChoicePresentation";
import { chapterPositionLabel, stepPositionLabel } from "@/features/quests/questDisplay";
import type { StrategyFlowModel } from "@/features/quests/questStrategyFlow";
import { uniqueRequirementDisplays, type QuestRequirementDisplay } from "@/features/quests/questRequirementDisplay";
import type { QuestExplorerEntry, QuestExplorerProgression, QuestProgressionStep } from "@/types/questTypes";

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

export function choiceDebugDetailsForStep(
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

function ProgressionPips({ total, activeIndex }: { total: number; activeIndex: number }) {
    return (
        <span className="questExplorer-stepPips" aria-hidden="true">
            {Array.from({ length: Math.max(total, 1) }).map((_, index) => (
                <span className={index <= activeIndex ? "is-lit" : ""} key={index} />
            ))}
        </span>
    );
}

export function stepTitle(
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
                <InlineStageMeta label="Requires" values={choice.requirementLines} items={choice.requirementDetails} />
                <InlineStageRewardMeta
                    label="Rewards"
                    rewards={choice.rewardDetails}
                    fallbackValues={choice.rewardLines}
                />
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

function InlineStageMeta({
    label,
    values,
    items = [],
}: {
    label: string;
    values: string[];
    items?: QuestRequirementDisplay[];
}) {
    const displayItems = uniqueRequirementDisplays(items);
    const fallbackItems = displayItems.length > 0
        ? displayItems
        : values.filter(Boolean).map((value, index) => ({
            requirementKey: `stage:${label}:${index}:${value}`,
            displayText: value,
            kind: "",
            polarity: null,
            groupLabel: null,
            groupOrder: null,
            targetRole: null,
            targetLabel: null,
            requiredCount: null,
            durationTurns: null,
            state: null,
            referenceKind: null,
            referenceKey: null,
            referenceDisplayName: null,
            codexEntryKey: null,
        }));
    if (fallbackItems.length === 0) return null;

    return (
        <span className="questExplorer-choiceCardMeta">
            <b>{label}</b>{" "}
            {fallbackItems.map((item, index) => (
                <span key={`${label}:${index}:${item.displayText}:${item.referenceKey ?? ""}`}>
                    {index > 0 ? "; " : null}
                    <QuestCodexReferenceLink source={item} showTooltip={label === "Requires"}>
                        {item.displayText}
                    </QuestCodexReferenceLink>
                </span>
            ))}
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
    shortenRequirementLabels,
    onChoose,
}: {
    model: StrategyFlowModel;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
    shortenRequirementLabels: boolean;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const activeStage = model.activeStage;
    const renderedStep = activeStage?.renderedStep ?? model.renderedStep;
    if (!renderedStep) return null;

    const { title, totalStages } = activeStage ?? {
        title: model.title,
        totalStages: model.totalSteps,
    };

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
                        <span>Chapter plan</span>
                        <span>{totalStages} {totalStages === 1 ? "step" : "steps"}</span>
                    </span>
                    <ProgressionPips total={totalStages} activeIndex={Math.max(model.chapterTasks[0]?.stageOrder ?? 1, 1) - 1} />
                </div>
                <strong className="questExplorer-stepTitle">{title}</strong>
            </header>

            {renderedStep.rendersRepeatedDetailContent ? (
                <RepeatedDetailCheckpoint />
            ) : (
                renderedStep.displayEntry ? (
                    <div className="questExplorer-strategyStepBody">
                        <StrategyChapterPlan
                            tasks={model.chapterTasks}
                            decisionPoints={model.decisionPoints}
                            debugChoiceDetails={debugChoiceDetails}
                            shortenRequirementLabels={shortenRequirementLabels}
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

export function StrategyProgression({
    progression,
    fullProgression,
    model,
    entriesByKey,
    debugQuestProgression,
    showRawHiddenRows,
    shortenRequirementLabels,
    onChoose,
}: {
    progression: QuestDetailProgression | null;
    fullProgression: QuestExplorerProgression | null;
    model: StrategyFlowModel | null;
    entriesByKey: Record<string, QuestExplorerEntry>;
    debugQuestProgression: boolean;
    showRawHiddenRows: boolean;
    shortenRequirementLabels: boolean;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (!progression || !model) return null;

    const renderedStep = model.activeStage?.renderedStep ?? model.renderedStep;
    const debugChoiceDetails = debugQuestProgression
        && renderedStep
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
                shortenRequirementLabels={shortenRequirementLabels}
                onChoose={onChoose}
            />
        </section>
    );
}
