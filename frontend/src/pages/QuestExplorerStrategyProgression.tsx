import { StrategyChapterPlan } from "@/components/Quests/StrategyDossier";
import { InlineStageRewardMeta } from "@/components/Quests/QuestRewardMeta";
import { QuestCodexReferenceLink } from "@/components/Quests/QuestCodexReferenceLink";
import {
    type QuestDetailProgression,
    type QuestPathChoice,
    type QuestPathChoiceSelection,
} from "@/features/quests/questPathFlow";
import { stagePresentationGroups } from "@/features/quests/questChoicePresentation";
import { stepPositionLabel } from "@/features/quests/questDisplay";
import type { StrategyFlowModel } from "@/features/quests/questStrategyFlow";
import { uniqueRequirementDisplays, type QuestRequirementDisplay } from "@/features/quests/questRequirementDisplay";
import type { QuestExplorerEntry, QuestExplorerProgression, QuestProgressionStep } from "@/types/questTypes";
import { choiceDebugDetailsForStep } from "./QuestExplorerStrategyDebug";

function ProgressionPips({ total, activeIndex }: { total: number; activeIndex: number }) {
    return (
        <span className="questExplorer-stepPips" aria-hidden="true">
            {Array.from({ length: Math.max(total, 1) }).map((_, index) => (
                <span className={index <= activeIndex ? "is-lit" : ""} key={index} />
            ))}
        </span>
    );
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
