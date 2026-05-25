import type { ReactNode } from "react";

import {
    type StrategyDossierBranchComparisonGroup,
    type StrategyDossierBranchOption,
    type StrategyDossierMarker,
    type StrategyDossierModel,
    type StrategyDossierObjective,
    type StrategyDossierSelectedPathStep,
    type StrategyPathStatus,
} from "@/features/quests/questStrategyDossier";
import type { QuestPathChoice } from "@/features/quests/questPathFlow";
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
    const pathSectionTitle = pathChoiceSectionTitle(model.branchComparison.groups);

    return (
        <div className="questExplorer-strategyDossier">
            <StrategyDossierSection title="Compact Objective" variant="compactObjective">
                <div className="questExplorer-strategyDossierBrief">
                    <span>{model.brief.stepLabel} of {model.brief.totalSteps}</span>
                    {model.brief.summaryLines.length > 0 ? (
                        model.brief.summaryLines.map((line, index) => <p key={`${model.brief.title}:summary:${index}`}>{line}</p>)
                    ) : (
                        <p>No tactical summary is attached to this step.</p>
                    )}
                </div>

                <StrategyDossierObjectiveList
                    objectives={model.objectives}
                    emptyLabel="No strategy objectives are attached to this step."
                />
            </StrategyDossierSection>

            <StrategyDossierSection title={pathSectionTitle} variant="pathChoice">
                <StrategyPathPrompt
                    description={model.decision.description}
                    isAwaitingChoice={model.pathStatus.kind === "awaiting-choice"}
                />
                <StrategyBranchComparison
                    groups={model.branchComparison.groups}
                    emptyLabel={model.branchComparison.emptyLabel}
                    step={step}
                    projectedOutcome={model.projectedOutcome}
                    pathStatus={model.pathStatus}
                    debugChoiceDetails={debugChoiceDetails}
                    projectedDebugDetails={projectedDebugDetails}
                    onChoose={onChoose}
                />
            </StrategyDossierSection>

            <StrategyProgressionDetails
                summary={model.continuityStrip.summary}
                selectedPathSteps={model.selectedPathSteps}
            />
        </div>
    );
}

function StrategyPathPrompt({
    description,
    isAwaitingChoice,
}: {
    description: string;
    isAwaitingChoice: boolean;
}) {
    return (
        <div className="questExplorer-strategyPathPrompt">
            <p>{isAwaitingChoice ? "Select a path to preview its result and next destination." : description}</p>
        </div>
    );
}

function StrategyBranchComparison({
    groups,
    emptyLabel,
    step,
    projectedOutcome,
    pathStatus,
    debugChoiceDetails,
    projectedDebugDetails,
    onChoose,
}: {
    groups: StrategyDossierBranchComparisonGroup[];
    emptyLabel: string;
    step: QuestProgressionStep;
    projectedOutcome: StrategyDossierModel["projectedOutcome"];
    pathStatus: StrategyPathStatus;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-strategyDossierEmpty">{emptyLabel}</p>;
    }

    const optionCount = groups.reduce((sum, group) => sum + group.options.length, 0);
    const isRequiredPath = optionCount === 1;
    const showGroupHeadings = groups.length > 1;

    return (
        <div className="questExplorer-strategyComparisonGroups">
            {groups.map((group) => {
                const groupLabel = pathGroupAriaLabel(group.label, showGroupHeadings);

                return (
                    <section className="questExplorer-strategyComparisonGroup" key={group.id} aria-label={groupLabel}>
                        {showGroupHeadings ? <h4>{group.label}</h4> : null}
                        <div className="questExplorer-strategyComparisonGrid">
                            {group.options.map((option) => (
                                <StrategyBranchComparisonOption
                                    option={option}
                                    step={step}
                                    projectedOutcome={option.isSelected ? projectedOutcome : null}
                                    pathStatus={option.isSelected ? pathStatus : null}
                                    isRequiredPath={isRequiredPath}
                                    debugChoiceDetails={debugChoiceDetails}
                                    projectedDebugDetails={option.isSelected ? projectedDebugDetails : undefined}
                                    onChoose={onChoose}
                                    key={option.id}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function pathChoiceSectionTitle(groups: StrategyDossierBranchComparisonGroup[]): string {
    const optionCount = groups.reduce((sum, group) => sum + group.options.length, 0);
    return optionCount === 1 ? "Required Path" : "Choose a Path";
}

function pathGroupAriaLabel(label: string, showGroupHeadings: boolean): string | undefined {
    if (showGroupHeadings) return label;
    return isGenericPathGroupLabel(label) ? undefined : label;
}

function isGenericPathGroupLabel(label: string): boolean {
    return ["choice", "alternative", "decision options"].includes(normalizeValue(label).toLowerCase());
}

function StrategyPathBreadcrumbItem({ pathStep }: { pathStep: StrategyDossierSelectedPathStep }) {
    return (
        <li className={pathStep.isCurrent ? "is-current" : undefined}>
            <strong>{pathStep.label}</strong>
            {pathStep.isCurrent ? <em>Current simulation</em> : null}
        </li>
    );
}

function StrategyProgressionDetails({
    summary,
    selectedPathSteps,
}: {
    summary: string;
    selectedPathSteps: StrategyDossierSelectedPathStep[];
}) {
    return (
        <details className="questExplorer-strategyProgressionDetails">
            <summary>
                <span>Progression Details</span>
                {selectedPathSteps.length > 0 ? (
                    <em>{selectedPathSteps.map((pathStep) => pathStep.label).join(" -> ")}</em>
                ) : null}
            </summary>
            <p>{summary}</p>
            {selectedPathSteps.length > 0 ? (
                <ol className="questExplorer-strategyPathBreadcrumb">
                    {selectedPathSteps.map((pathStep) => (
                        <StrategyPathBreadcrumbItem pathStep={pathStep} key={pathStep.id} />
                    ))}
                </ol>
            ) : (
                <p className="questExplorer-strategyDossierEmpty">No path is being simulated yet.</p>
            )}
        </details>
    );
}

function StrategyBranchComparisonOption({
    option,
    step,
    projectedOutcome,
    pathStatus,
    isRequiredPath,
    debugChoiceDetails,
    projectedDebugDetails,
    onChoose,
}: {
    option: StrategyDossierBranchOption;
    step: QuestProgressionStep;
    projectedOutcome: StrategyDossierModel["projectedOutcome"];
    pathStatus: StrategyPathStatus | null;
    isRequiredPath: boolean;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const isActive = option.isSelected || option.isInSelectedPath;
    const supportingMarkers = option.markers.filter((marker) => marker.kind !== "leads");
    const statusLabel = option.isSelected ? "Selected" : option.isInSelectedPath ? "In Path" : isRequiredPath ? "Required Path" : "Option";
    const showLeadsTo = !(option.isSelected && pathStatus?.targetLabel);

    return (
        <button
            type="button"
            className={`questExplorer-strategyComparisonOption${option.isSelected ? " is-selected" : ""}${option.isInSelectedPath ? " is-inPath" : ""}`}
            aria-pressed={isActive}
            aria-current={option.isSelected ? "true" : undefined}
            onClick={() => onChoose(step, option.choice)}
        >
            <span className="questExplorer-strategyComparisonStatus">
                {statusLabel}
            </span>
            <span className="questExplorer-strategyComparisonHeader">
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
                {showLeadsTo ? <InlineMetaList label="Leads To" values={option.leadsTo} tone="objective" /> : null}
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
            {option.isSelected && pathStatus ? (
                <StrategySelectedOutcome
                    option={option}
                    outcome={projectedOutcome}
                    status={pathStatus}
                    projectedDebugDetails={projectedDebugDetails}
                />
            ) : null}
        </button>
    );
}

function StrategySelectedOutcome({
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
    const outcomeObjectives = outcome ? projectedObjectivesForInlineOutcome(option, outcome) : [];

    return (
        <div className="questExplorer-strategyInlineOutcome">
            {outcome && (showOutcomeSummary || hasProjectedMeta) ? (
                <div className="questExplorer-strategyOutcomeBlock">
                    <span>Outcome</span>
                    {showOutcomeSummary ? (
                        <>
                            <strong>{outcome.title}</strong>
                            {outcome.lines.map((line, index) => (
                                <p key={`${outcome.title}:line:${index}`}>{line}</p>
                            ))}
                            <StrategyDossierObjectiveList objectives={outcomeObjectives} />
                        </>
                    ) : null}
                    {hasProjectedMeta ? (
                        <div className="questExplorer-stepObjectiveMetaGrid">
                            {showProjectedRequirements ? (
                                <InlineMetaList
                                    label="Projected Requirements"
                                    values={outcome.requirements}
                                    tone="requirement"
                                />
                            ) : null}
                            {showProjectedRewards ? (
                                <InlineMetaList
                                    label="Projected Rewards"
                                    values={outcome.rewards}
                                    tone="reward"
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}
            <StrategyInlinePathStatus status={status} />
            {projectedDebugDetails?.map((detail, index) => (
                <span className="questExplorer-choiceDebugMeta" key={`projected-debug:${index}`}>{detail}</span>
            ))}
        </div>
    );
}

function StrategyInlinePathStatus({ status }: { status: StrategyPathStatus }) {
    const content = inlinePathStatusContent(status);

    return (
        <div className={`questExplorer-strategyOutcomeStatus questExplorer-strategyOutcomeStatus--${status.kind}`}>
            <span>{content.badge}</span>
            <strong>{content.title}</strong>
            {content.detail ? <em>{content.detail}</em> : null}
        </div>
    );
}

function inlinePathStatusContent(status: StrategyPathStatus): { badge: string; title: string; detail: string | null } {
    switch (status.kind) {
        case "chapter-exit":
            return {
                badge: "Continues",
                title: status.targetLabel ? `Continues in ${status.targetLabel}` : "Continues beyond this chapter",
                detail: "This chapter planning view stops here.",
            };
        case "continues-in-chapter":
            return {
                badge: "Continues",
                title: status.targetLabel ? `Continues at ${status.targetLabel}` : "Continues in this chapter",
                detail: null,
            };
        case "converges":
            return {
                badge: "Rejoins Path",
                title: status.targetLabel ? `Rejoins path at ${status.targetLabel}` : "Rejoins Path",
                detail: null,
            };
        case "failure":
            return {
                badge: "Fails",
                title: status.targetLabel ? `Fails at ${status.targetLabel}` : "Fails",
                detail: "Compare another option before committing.",
            };
        case "unresolved":
            return {
                badge: "Unknown Next Step",
                title: "Unknown Next Step",
                detail: "No explicit continuation is recorded for this branch.",
            };
        case "complete":
            return {
                badge: "No Further Branch",
                title: "No further branch is recorded",
                detail: status.targetLabel ? `Resolves at ${status.targetLabel}.` : null,
            };
        case "awaiting-choice":
            return {
                badge: "Preview",
                title: "Select a path to preview the next destination.",
                detail: null,
            };
    }
}

function StrategyDossierSection({
    title,
    variant,
    children,
}: {
    title: string;
    variant?: "compactObjective" | "pathChoice";
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

function hasDistinctProjectedSummary(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): boolean {
    return outcome.objectives.length > 0
        || normalizeValue(outcome.title) !== normalizeValue(option.label)
        || !sameValues(outcome.lines, option.outcomeLines);
}

function shouldShowProjectedRequirements(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): boolean {
    if (outcome.requirements.length === 0) return false;
    if (sameValues(outcome.requirements, option.requirements)) return false;
    if (sameValues(outcome.requirements, outcome.objectives.flatMap((objective) => objective.requirements))) return false;
    return true;
}

function shouldShowProjectedRewards(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): boolean {
    if (outcome.rewards.length === 0) return false;
    if (sameValues(outcome.rewards, option.rewards)) return false;
    if (sameValues(outcome.rewards, outcome.objectives.flatMap((objective) => objective.rewards))) return false;
    return true;
}

function projectedObjectivesForInlineOutcome(
    option: StrategyDossierBranchOption,
    outcome: NonNullable<StrategyDossierModel["projectedOutcome"]>
): StrategyDossierObjective[] {
    const hideRequirements = sameValues(outcome.requirements, option.requirements);
    const hideRewards = sameValues(outcome.rewards, option.rewards);

    if (!hideRequirements && !hideRewards) return outcome.objectives;

    return outcome.objectives.map((objective) => ({
        ...objective,
        requirements: hideRequirements ? [] : objective.requirements,
        rewards: hideRewards ? [] : objective.rewards,
    }));
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

function normalizeValue(value: string): string {
    return value.trim();
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

export function InlineMetaList({
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
