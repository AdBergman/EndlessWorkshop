import type { ReactNode } from "react";

import {
    type StrategyDossierBranchComparisonGroup,
    type StrategyDossierBranchOption,
    type StrategyDossierMarker,
    type StrategyDossierModel,
    type StrategyDossierObjective,
    type StrategyPathStatus,
} from "@/features/quests/questStrategyDossier";
import type {
    StrategyChapterTask,
    StrategyDecisionPoint,
} from "@/features/quests/questStrategyFlow";
import type { QuestPathChoice } from "@/features/quests/questPathFlow";
import {
    sameRewardDisplays,
    uniqueRewardDisplays,
    type QuestRewardDisplay,
} from "@/features/quests/questRewardDisplay";
import {
    requirementDisplaysForList,
    sameRequirementDisplays,
    uniqueRequirementDisplays,
    type QuestRequirementDisplay,
} from "@/features/quests/questRequirementDisplay";
import { QuestCodexReferenceLink } from "@/components/Quests/QuestCodexReferenceLink";
import { InlineRewardMetaList } from "@/components/Quests/QuestRewardMeta";
import type {
    QuestProgressionStep,
} from "@/types/questTypes";

export function StrategyDossier({
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
    const presentation = strategyPresentation(model);

    return (
        <div className="questExplorer-strategyDossier">
            <StrategyDossierSection title="Current task" variant="currentTask">
                <StrategyCurrentTask
                    objectives={model.objectives}
                    soleOption={presentation.soleOption}
                    nextStatus={presentation.soleOptionNextStatus}
                    debugChoiceDetails={debugChoiceDetails}
                />
            </StrategyDossierSection>

            {presentation.hasDecision ? (
                <StrategyDossierSection title="Choose a path" variant="decision">
                    <StrategyBranchComparison
                        groups={model.decisionGroup.groups}
                        emptyLabel={model.decisionGroup.emptyLabel}
                        step={step}
                        outcomePreview={model.outcomePreview}
                        continuationStatus={model.continuationStatus}
                        debugChoiceDetails={debugChoiceDetails}
                        projectedDebugDetails={projectedDebugDetails}
                        onChoose={onChoose}
                    />
                </StrategyDossierSection>
            ) : null}

            {model.topologyAlternatives.length > 0 ? (
                <StrategyDossierSection title="Possible continuations" variant="continuations">
                    <StrategyTopologyAlternatives
                        alternatives={model.topologyAlternatives}
                        debugChoiceDetails={debugChoiceDetails}
                    />
                </StrategyDossierSection>
            ) : null}
        </div>
    );
}

export function StrategyChapterPlan({
    tasks,
    decisionPoints,
    onChoose,
    debugChoiceDetails,
    projectedDebugDetails,
}: {
    tasks: StrategyChapterTask[];
    decisionPoints: StrategyDecisionPoint[];
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
}) {
    if (tasks.length === 0 && decisionPoints.length === 0) {
        return <p className="questExplorer-strategyDossierEmpty">No strategy objectives are attached to this chapter.</p>;
    }

    return (
        <div className="questExplorer-strategyDossier questExplorer-strategyChapterPlan">
            {tasks.length > 0 ? (
                <StrategyDossierSection title="Chapter plan" variant="currentTask">
                    <div className="questExplorer-strategyTaskStack">
                        {tasks.map((task) => (
                            <StrategyChapterTaskBlock
                                task={task}
                                debugChoiceDetails={debugChoiceDetails}
                                key={task.id}
                            />
                        ))}
                    </div>
                </StrategyDossierSection>
            ) : null}

            {decisionPoints.map((point) => (
                <StrategyDecisionPointBlock
                    point={point}
                    onChoose={onChoose}
                    debugChoiceDetails={debugChoiceDetails}
                    projectedDebugDetails={projectedDebugDetails}
                    key={point.id}
                />
            ))}
        </div>
    );
}

function StrategyChapterTaskBlock({
    task,
    debugChoiceDetails,
}: {
    task: StrategyChapterTask;
    debugChoiceDetails?: Map<string, string>;
}) {
    const nextStatus = task.continuationStatus
        ? nextStatusContentForPathStatus(task.continuationStatus)
        : task.option ? nextStatusContentForOption(task.option) : null;
    const showCompactStatus = nextStatus && shouldRenderNextStatus(nextStatus);

    return (
        <section
            className={`questExplorer-strategyPlanTask questExplorer-strategyPlanTask--${task.status}`}
            aria-label={`${task.stageLabel}: ${task.title}`}
        >
            <header className="questExplorer-strategyPlanTaskHeader">
                <span>{task.stageLabel}</span>
            </header>
            <StrategyTaskSummary
                title={task.title}
                lines={task.lines}
                requirements={task.requirements}
                requirementDetails={task.requirementDetails}
                rewards={task.rewards}
                rewardDetails={task.rewardDetails}
                debugDetail={task.option ? debugChoiceDetails?.get(task.option.choice.id) : undefined}
            />
            {showCompactStatus ? <StrategyCompactNextStatus status={nextStatus} /> : null}
        </section>
    );
}

function StrategyDecisionPointBlock({
    point,
    onChoose,
    debugChoiceDetails,
    projectedDebugDetails,
}: {
    point: StrategyDecisionPoint;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
}) {
    const selectedOption = point.options.find((option) => option.isSelected) ?? null;
    const groupLabel = decisionPointGroupLabel(point.options);
    const showGroupRegion = Boolean(groupLabel && !isGenericDecisionGroupLabel(groupLabel));

    return (
        <StrategyDossierSection title={point.title} variant={point.kind === "topology_alternative" ? "continuations" : "decision"}>
            <section
                className="questExplorer-strategyComparisonGroup"
                aria-label={showGroupRegion ? groupLabel ?? undefined : undefined}
            >
                {showGroupRegion ? <h4>{groupLabel}</h4> : null}
                <div className="questExplorer-strategyComparisonGrid">
                    {point.options.map((option) => (
                        <StrategyBranchComparisonOption
                            option={option}
                            step={point.step}
                            debugChoiceDetails={debugChoiceDetails}
                            onChoose={onChoose}
                            key={option.id}
                        />
                    ))}
                </div>
            </section>
            {selectedOption ? (
                <StrategyChoiceResult
                    option={selectedOption}
                    outcome={point.outcomePreview}
                    status={point.continuationStatus}
                    projectedDebugDetails={projectedDebugDetails}
                />
            ) : null}
        </StrategyDossierSection>
    );
}

function StrategyCompactNextStatus({ status }: { status: StrategyNextStatusContent }) {
    return (
        <div className={`questExplorer-strategyNextChip questExplorer-strategyNextChip--${status.kind}`}>
            <span>{nextStatusEyebrow(status)}</span>
            <strong>{status.title}</strong>
        </div>
    );
}

function decisionPointGroupLabel(options: StrategyDossierBranchOption[]): string | null {
    const labels = uniqueDisplayValues(options.map((option) => option.choice.groupLabel ?? option.choice.eyebrow));
    return labels[0] ?? null;
}

type StrategyNextStatusContent = {
    kind: StrategyPathStatus["kind"];
    title: string;
    detail: string | null;
    isFinalOutcome?: boolean;
};

function shouldRenderNextStatus(status: StrategyNextStatusContent): boolean {
    return (status.kind !== "complete" || Boolean(status.isFinalOutcome))
        && status.kind !== "awaiting-choice"
        && status.kind !== "continues-in-chapter";
}

type StrategyPresentation = {
    hasDecision: boolean;
    soleOption: StrategyDossierBranchOption | null;
    soleOptionNextStatus: StrategyNextStatusContent | null;
};

function strategyPresentation(model: StrategyDossierModel): StrategyPresentation {
    const decisionOptions = strategyOptions(model.decisionGroup.groups);
    const soleOption = model.currentTask;
    const soleOptionNextStatus = soleOption
        ? soleOption.isSelected && model.continuationStatus.kind !== "awaiting-choice"
            ? nextStatusContentForPathStatus(model.continuationStatus)
            : nextStatusContentForOption(soleOption)
        : null;

    return {
        hasDecision: decisionOptions.length > 1,
        soleOption,
        soleOptionNextStatus,
    };
}

function strategyOptions(groups: StrategyDossierBranchComparisonGroup[]): StrategyDossierBranchOption[] {
    return groups.flatMap((group) => group.options);
}

function StrategyCurrentTask({
    objectives,
    soleOption,
    nextStatus,
    debugChoiceDetails,
}: {
    objectives: StrategyDossierObjective[];
    soleOption: StrategyDossierBranchOption | null;
    nextStatus: StrategyNextStatusContent | null;
    debugChoiceDetails?: Map<string, string>;
}) {
    if (!soleOption) {
        const task = taskSummaryForObjectives(objectives);
        if (!task) {
            return <p className="questExplorer-strategyDossierEmpty">No strategy objectives are attached to this step.</p>;
        }

        return <StrategyTaskSummary {...task} />;
    }

    const fallbackObjectiveLines = objectives.map((objective) => objective.text);
    const requirements = uniqueDisplayValues([
        ...soleOption.requirements,
        ...objectives.flatMap((objective) => objective.requirements),
    ]);
    const requirementDetails = uniqueRequirementDisplays([
        ...soleOption.requirementDetails,
        ...objectives.flatMap((objective) => objective.requirementDetails),
    ]);
    const rewards = uniqueDisplayValues([
        ...soleOption.rewards,
        ...objectives.flatMap((objective) => objective.rewards),
    ]);
    const rewardDetails = uniqueRewardDisplays([
        ...soleOption.rewardDetails,
        ...objectives.flatMap((objective) => objective.rewardDetails),
    ]);

    return (
        <div className="questExplorer-strategyCurrentTask">
            <StrategyTaskSummary
                title={soleOption.label}
                lines={soleOption.outcomeLines.length > 0 ? soleOption.outcomeLines : fallbackObjectiveLines}
                requirements={requirements}
                requirementDetails={requirementDetails}
                rewards={rewards}
                rewardDetails={rewardDetails}
                debugDetail={debugChoiceDetails?.get(soleOption.choice.id)}
            />
            {nextStatus && shouldRenderNextStatus(nextStatus) ? <StrategyNextStatus status={nextStatus} /> : null}
        </div>
    );
}

function StrategyBranchComparison({
    groups,
    emptyLabel,
    step,
    outcomePreview,
    continuationStatus,
    debugChoiceDetails,
    projectedDebugDetails,
    onChoose,
}: {
    groups: StrategyDossierBranchComparisonGroup[];
    emptyLabel: string;
    step: QuestProgressionStep;
    outcomePreview: StrategyDossierModel["outcomePreview"];
    continuationStatus: StrategyPathStatus;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-strategyDossierEmpty">{emptyLabel}</p>;
    }

    const showGroupHeadings = groups.length > 1;
    const selectedOption = groups.flatMap((group) => group.options).find((option) => option.isSelected) ?? null;

    return (
        <div className="questExplorer-strategyComparisonGroups">
            {groups.map((group) => {
                const groupLabel = decisionGroupAriaLabel(group.label, showGroupHeadings);

                return (
                    <section className="questExplorer-strategyComparisonGroup" key={group.id} aria-label={groupLabel}>
                        {showGroupHeadings ? <h4>{group.label}</h4> : null}
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
                );
            })}
            {selectedOption ? (
                <StrategyChoiceResult
                    option={selectedOption}
                    outcome={outcomePreview}
                    status={continuationStatus}
                    projectedDebugDetails={projectedDebugDetails}
                />
            ) : null}
        </div>
    );
}

function decisionGroupAriaLabel(label: string, showGroupHeadings: boolean): string | undefined {
    if (showGroupHeadings) return label;
    return isGenericDecisionGroupLabel(label) ? undefined : label;
}

function isGenericDecisionGroupLabel(label: string): boolean {
    return ["choice", "alternative", "decision options"].includes(normalizeValue(label).toLowerCase());
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
    const supportingMarkers = option.isSelected ? [] : option.markers.filter((marker) => marker.kind !== "leads");
    const statusLabel = option.isSelected ? "Selected" : option.isInSelectedPath ? "In sequence" : null;

    return (
        <button
            type="button"
            className={`questExplorer-strategyComparisonOption${option.isSelected ? " is-selected" : ""}${option.isInSelectedPath ? " is-inPath" : ""}`}
            aria-pressed={isActive}
            aria-current={option.isSelected ? "true" : undefined}
            onClick={() => onChoose(step, option.choice)}
        >
            {statusLabel ? (
                <span className="questExplorer-strategyComparisonStatus">
                    {statusLabel}
                </span>
            ) : null}
            <span className="questExplorer-strategyComparisonHeader">
                <strong>{option.label}</strong>
            </span>
            {option.outcomeLines.length > 0 ? (
                <span className="questExplorer-strategyComparisonOutcome">
                    {option.outcomeLines.join(" ")}
                </span>
            ) : null}
            <div className="questExplorer-strategyComparisonMeta">
                <InlineMetaList
                    label="Requires"
                    values={option.requirements}
                    items={option.requirementDetails}
                    tone="requirement"
                />
                <InlineRewardMetaList label="Rewards" rewards={option.rewardDetails} fallbackValues={option.rewards} />
            </div>
            {supportingMarkers.length > 0 ? (
                <div className="questExplorer-strategyComparisonMarkers">
                    {supportingMarkers.map((marker, index) => (
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

function StrategyTopologyAlternatives({
    alternatives,
    debugChoiceDetails,
}: {
    alternatives: StrategyDossierBranchOption[];
    debugChoiceDetails?: Map<string, string>;
}) {
    if (alternatives.length === 0) return null;

    return (
        <div className="questExplorer-strategyComparisonGrid">
            {alternatives.map((alternative) => (
                <article className="questExplorer-strategyTaskSummary" key={alternative.id}>
                    <strong>{alternative.label}</strong>
                    {uniqueDisplayValues(alternative.outcomeLines).map((line, index) => (
                        <p key={`${alternative.id}:line:${index}`}>{line}</p>
                    ))}
                    <div className="questExplorer-stepObjectiveMetaGrid">
                        <InlineMetaList
                            label="Requires"
                            values={alternative.requirements}
                            items={alternative.requirementDetails}
                            tone="requirement"
                        />
                        <InlineRewardMetaList
                            label="Rewards"
                            rewards={alternative.rewardDetails}
                            fallbackValues={alternative.rewards}
                        />
                    </div>
                    {alternative.markers.length > 0 ? (
                        <div className="questExplorer-strategyComparisonMarkers">
                            {alternative.markers.map((marker, index) => (
                                <StrategyDossierMarkerPill
                                    marker={marker}
                                    key={`${alternative.id}:${marker.kind}:${marker.detail}:${index}`}
                                />
                            ))}
                        </div>
                    ) : null}
                    {debugChoiceDetails?.get(alternative.choice.id) ? (
                        <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(alternative.choice.id)}</span>
                    ) : null}
                </article>
            ))}
        </div>
    );
}

function StrategyChoiceResult({
    option,
    outcome,
    status,
    projectedDebugDetails,
}: {
    option: StrategyDossierBranchOption;
    outcome: StrategyDossierModel["projectedOutcome"];
    status: StrategyPathStatus;
    projectedDebugDetails?: string[];
}) {
    const showOutcomeSummary = Boolean(outcome && hasDistinctProjectedSummary(option, outcome));
    const showProjectedRequirements = Boolean(outcome && shouldShowProjectedRequirements(option, outcome));
    const showProjectedRewards = Boolean(outcome && shouldShowProjectedRewards(option, outcome));
    const hasProjectedMeta = showProjectedRequirements || showProjectedRewards;
    const projectedLines = outcome ? projectedOutcomeLines(option, outcome) : [];
    const nextStatus = nextStatusContentForPathStatus(status);
    const showNextStatus = shouldRenderNextStatus(nextStatus);

    if (!showOutcomeSummary && !hasProjectedMeta && !showNextStatus) return null;

    const heading = nextStatus.isFinalOutcome && showNextStatus
        ? `Choosing ${option.label} completes this path`
        : showNextStatus
            ? `Choosing ${option.label} leads to...`
            : `Choosing ${option.label}`;
    const ariaLabel = nextStatus.isFinalOutcome && showNextStatus
        ? `Choosing ${option.label} completes this path`
        : showNextStatus
            ? `Choosing ${option.label} leads to`
            : `Choosing ${option.label}`;

    return (
        <section className="questExplorer-strategyChoiceResult" aria-label={ariaLabel}>
            <h4>{heading}</h4>
            {outcome && (showOutcomeSummary || hasProjectedMeta) ? (
                <div className="questExplorer-strategyOutcomeBlock">
                    {showOutcomeSummary ? <StrategyTaskSummary title={outcome.title} lines={projectedLines} /> : null}
                    {hasProjectedMeta ? (
                        <div className="questExplorer-stepObjectiveMetaGrid">
                            {showProjectedRequirements ? (
                                <InlineMetaList
                                    label="Requires"
                                    values={outcome.requirements}
                                    items={outcome.requirementDetails}
                                    tone="requirement"
                                />
                            ) : null}
                            {showProjectedRewards ? (
                                <InlineRewardMetaList
                                    label="Rewards"
                                    rewards={outcome.rewardDetails}
                                    fallbackValues={outcome.rewards}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}
            {showNextStatus ? <StrategyNextStatus status={nextStatus} /> : null}
            {projectedDebugDetails?.map((detail, index) => (
                <span className="questExplorer-choiceDebugMeta" key={`projected-debug:${index}`}>{detail}</span>
            ))}
        </section>
    );
}

function StrategyNextStatus({ status }: { status: StrategyNextStatusContent }) {
    return (
        <div className={`questExplorer-strategyNextStatus questExplorer-strategyNextStatus--${status.kind}`}>
            <span>{nextStatusEyebrow(status)}</span>
            <strong>{status.title}</strong>
            {status.detail ? <em>{status.detail}</em> : null}
        </div>
    );
}

function nextStatusEyebrow(status: StrategyNextStatusContent): string {
    switch (status.kind) {
        case "complete":
            return status.isFinalOutcome ? "Final outcome" : "Complete";
        case "failure":
            return "Failure";
        case "converges":
            return "Convergence";
        case "unresolved":
            return "Archive gap";
        default:
            return "Continuation";
    }
}

function nextStatusContentForPathStatus(status: StrategyPathStatus): StrategyNextStatusContent {
    switch (status.kind) {
        case "chapter-exit":
            return {
                kind: status.kind,
                title: status.targetLabel ? `Continues in ${status.targetLabel}` : "Continues beyond this chapter",
                detail: null,
            };
        case "continues-in-chapter":
            return {
                kind: status.kind,
                title: status.targetLabel ? `Continues at ${status.targetLabel}` : "Continues in this chapter",
                detail: null,
            };
        case "converges":
            return {
                kind: status.kind,
                title: status.targetLabel ? `Rejoins progression at ${status.targetLabel}` : "Rejoins progression",
                detail: null,
            };
        case "failure":
            return {
                kind: status.kind,
                title: status.targetLabel ? `Fails at ${status.targetLabel}` : "Fails",
                detail: null,
            };
        case "unresolved":
            return {
                kind: status.kind,
                title: "Unknown continuation",
                detail: "No explicit continuation is recorded for this stage.",
            };
        case "complete":
            return {
                kind: status.kind,
                title: "Story currently ends here",
                detail: "No later quest step is recorded for this path in the current archive.",
                isFinalOutcome: true,
            };
        case "awaiting-choice":
            return {
                kind: status.kind,
                title: "Awaiting decision",
                detail: null,
            };
    }
}

function nextStatusContentForOption(option: StrategyDossierBranchOption): StrategyNextStatusContent {
    const failure = option.markers.find((marker) => marker.kind === "failure");
    if (failure) {
        return {
            kind: "failure",
            title: `Fails at ${failure.detail}`,
            detail: null,
        };
    }

    const convergence = option.markers.find((marker) => marker.kind === "converges");
    if (convergence) {
        return {
            kind: "converges",
            title: `Rejoins progression at ${convergence.detail}`,
            detail: null,
        };
    }

    const unresolved = option.markers.find((marker) => marker.kind === "unresolved");
    if (unresolved) {
        return {
            kind: "unresolved",
            title: "Unknown continuation",
            detail: null,
        };
    }

    const complete = option.markers.find((marker) => marker.kind === "complete");
    if (complete) {
        return {
            kind: "complete",
            title: "Story currently ends here",
            detail: complete.detail,
            isFinalOutcome: true,
        };
    }

    const lead = option.leadsTo[0];
    if (lead) {
        return {
            kind: "chapter-exit",
            title: `Continues in ${lead}`,
            detail: null,
        };
    }

    if (option.choice.hasDependentContinuations) {
        return {
            kind: "continues-in-chapter",
            title: "Continues in this chapter",
            detail: "Complete this task to reveal the next continuation.",
        };
    }

    return {
        kind: "complete",
        title: "Story currently ends here",
        detail: "No later quest step is recorded for this outcome in the current archive.",
        isFinalOutcome: true,
    };
}

function StrategyDossierSection({
    title,
    variant,
    children,
}: {
    title: string;
    variant?: "currentTask" | "decision" | "continuations";
    children: ReactNode;
}) {
    const variantClass = variant ? ` questExplorer-strategyDossierSection--${variant}` : "";

    return (
        <section className={`questExplorer-strategyDossierSection${variantClass}`} aria-label={title}>
            <h3>{title}</h3>
            {children}
        </section>
    );
}

type StrategyTaskSummaryProps = {
    title?: string;
    lines: string[];
    requirements?: string[];
    requirementDetails?: QuestRequirementDisplay[];
    rewards?: string[];
    rewardDetails?: QuestRewardDisplay[];
    debugDetail?: string;
};

function StrategyTaskSummary({
    title,
    lines,
    requirements = [],
    requirementDetails = [],
    rewards = [],
    rewardDetails = [],
    debugDetail,
}: StrategyTaskSummaryProps) {
    return (
        <article className="questExplorer-strategyTaskSummary">
            {title ? <strong>{title}</strong> : null}
            {uniqueDisplayValues(lines).map((line, index) => (
                <p key={`strategy-task-line:${index}`}>{line}</p>
            ))}
            <div className="questExplorer-stepObjectiveMetaGrid">
                <InlineMetaList label="Requires" values={requirements} items={requirementDetails} tone="requirement" />
                <InlineRewardMetaList label="Rewards" rewards={rewardDetails} fallbackValues={rewards} />
            </div>
            {debugDetail ? <span className="questExplorer-choiceDebugMeta">{debugDetail}</span> : null}
        </article>
    );
}

function taskSummaryForObjectives(objectives: StrategyDossierObjective[]): StrategyTaskSummaryProps | null {
    if (objectives.length === 0) return null;

    return {
        lines: objectives.map((objective) => objective.text),
        requirements: uniqueDisplayValues(objectives.flatMap((objective) => objective.requirements)),
        requirementDetails: uniqueRequirementDisplays(objectives.flatMap((objective) => objective.requirementDetails)),
        rewards: uniqueDisplayValues(objectives.flatMap((objective) => objective.rewards)),
        rewardDetails: uniqueRewardDisplays(objectives.flatMap((objective) => objective.rewardDetails)),
    };
}

function hasDistinctProjectedSummary(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): boolean {
    return projectedOutcomeLines(option, outcome).length > 0
        || normalizeValue(outcome.title) !== normalizeValue(option.label)
        || !sameValues(outcome.lines, option.outcomeLines);
}

function shouldShowProjectedRequirements(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): boolean {
    if (outcome.requirements.length === 0) return false;
    if (
        (outcome.requirementDetails.length > 0 || option.requirementDetails.length > 0)
        && sameRequirementDisplays(outcome.requirementDetails, option.requirementDetails)
    ) return false;
    if (sameValues(outcome.requirements, option.requirements)) return false;
    return true;
}

function shouldShowProjectedRewards(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): boolean {
    if (outcome.rewards.length === 0) return false;
    if (
        (outcome.rewardDetails.length > 0 || option.rewardDetails.length > 0)
        && sameRewardDisplays(outcome.rewardDetails, option.rewardDetails)
    ) return false;
    if (sameValues(outcome.rewards, option.rewards)) return false;
    return true;
}

function projectedOutcomeLines(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): string[] {
    const title = normalizeValue(outcome.title);
    const optionLabel = normalizeValue(option.label);
    const optionLines = new Set(uniqueNormalizedValues(option.outcomeLines));

    return uniqueDisplayValues([
        ...outcome.lines,
        ...outcome.objectives.map((objective) => objective.text),
    ]).filter((line) => {
        const normalizedLine = normalizeValue(line);
        if (!normalizedLine) return false;
        if (normalizedLine === title) return false;
        if (normalizedLine === optionLabel) return false;
        if (optionLines.has(normalizedLine)) return false;
        return true;
    });
}

function sameValues(left: string[], right: string[]): boolean {
    const cleanLeft = uniqueNormalizedValues(left);
    const cleanRight = uniqueNormalizedValues(right);
    if (cleanLeft.length !== cleanRight.length) return false;

    const rightValues = new Set(cleanRight);
    return cleanLeft.every((value) => rightValues.has(value));
}

function uniqueNormalizedValues(values: string[]): string[] {
    return [...new Set(values.map(normalizeValue).filter(Boolean))];
}

function uniqueDisplayValues(values: string[]): string[] {
    const seen = new Set<string>();
    return values.reduce<string[]>((accumulator, value) => {
        const normalizedValue = normalizeValue(value);
        if (!normalizedValue || seen.has(normalizedValue)) return accumulator;
        seen.add(normalizedValue);
        accumulator.push(value.trim());
        return accumulator;
    }, []);
}

function normalizeValue(value: string): string {
    return value.trim();
}

function StrategyDossierMarkerPill({ marker }: { marker: StrategyDossierMarker }) {
    const label = marker.kind === "converges" ? "Converges" : marker.label;

    return (
        <span className={`questExplorer-strategyDossierMarker questExplorer-strategyDossierMarker--${marker.kind}`}>
            <span className="questExplorer-strategyDossierMarkerIcon" aria-hidden="true" />
            <strong>{label}</strong>
            <span className="questExplorer-strategyDossierMarkerDetail">{marker.detail}</span>
        </span>
    );
}

export function InlineMetaList({
    label,
    values = [],
    items = [],
    tone = "objective",
}: {
    label: string;
    values?: string[];
    items?: QuestRequirementDisplay[];
    tone?: "objective" | "requirement" | "reward";
}) {
    const displayItems = requirementDisplaysForList(items, values);
    if (displayItems.length === 0) return null;

    return (
        <div className={`questExplorer-inlineMeta questExplorer-inlineMeta--${tone}`}>
            <strong>{label}</strong>
            <ul>
                {displayItems.map((item, index) => (
                    <li key={`${label}:${index}:${item.displayText}:${item.referenceKey ?? ""}:${item.codexEntryKey ?? ""}`}>
                        <QuestCodexReferenceLink source={item} showTooltip={tone === "requirement"}>
                            {item.displayText}
                        </QuestCodexReferenceLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}
