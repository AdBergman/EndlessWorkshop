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
    const selectedOption = model.branchComparison.selectedOption;
    const showDestination = model.pathStatus.kind !== "awaiting-choice";

    return (
        <div className="questExplorer-strategyDossier">
            <StrategyDossierSection title="Chapter Objective">
                <div className="questExplorer-strategyDossierBrief">
                    <span>{model.brief.stepLabel} of {model.brief.totalSteps}</span>
                    <strong>{model.brief.title}</strong>
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

            <StrategyDossierSection title="Active Decision">
                <StrategyDecisionSummary
                    title={model.decision.title}
                    description={model.decision.description}
                    isAwaitingChoice={model.pathStatus.kind === "awaiting-choice"}
                />
            </StrategyDossierSection>

            <StrategyDossierSection title="Available Paths">
                <StrategyBranchComparison
                    groups={model.branchComparison.groups}
                    emptyLabel={model.branchComparison.emptyLabel}
                    step={step}
                    debugChoiceDetails={debugChoiceDetails}
                    onChoose={onChoose}
                />
            </StrategyDossierSection>

            {selectedOption ? (
                <StrategyDossierSection title="Selected Simulation">
                    <StrategySelectedSimulation option={selectedOption} />
                </StrategyDossierSection>
            ) : null}

            {selectedOption && model.projectedOutcome ? (
                <StrategyDossierSection title="Projected Result">
                    <StrategyProjectedResult
                        outcome={model.projectedOutcome}
                        projectedDebugDetails={projectedDebugDetails}
                    />
                </StrategyDossierSection>
            ) : null}

            {showDestination ? <StrategyPathStatusCard status={model.pathStatus} /> : null}

            <StrategyDossierSection title="Progression Details">
                <StrategyProgressionDetails
                    summary={model.continuityStrip.summary}
                    selectedPathSteps={model.selectedPathSteps}
                />
            </StrategyDossierSection>
        </div>
    );
}

function StrategyDecisionSummary({
    title,
    description,
    isAwaitingChoice,
}: {
    title: string;
    description: string;
    isAwaitingChoice: boolean;
}) {
    return (
        <div className="questExplorer-strategyDecisionSummary">
            <strong>{title}</strong>
            <p>{description}</p>
            {isAwaitingChoice ? (
                <span>Select a path to simulate its result.</span>
            ) : null}
        </div>
    );
}

function StrategyBranchComparison({
    groups,
    emptyLabel,
    step,
    debugChoiceDetails,
    onChoose,
}: {
    groups: StrategyDossierBranchComparisonGroup[];
    emptyLabel: string;
    step: QuestProgressionStep;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    if (groups.length === 0) {
        return <p className="questExplorer-strategyDossierEmpty">{emptyLabel}</p>;
    }

    return (
        <div className="questExplorer-strategyComparisonGroups">
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
            <strong>{pathStep.label}</strong>
            {pathStep.isCurrent ? <em>Current simulation</em> : null}
        </li>
    );
}

function StrategySelectedSimulation({
    option,
}: {
    option: StrategyDossierBranchOption;
}) {
    return (
        <div className="questExplorer-strategySelectedSummary">
            <header>
                <span>You Chose</span>
                <strong>{option.label}</strong>
            </header>
            <div className="questExplorer-stepObjectiveMetaGrid">
                <InlineMetaList label="To Do" values={option.requirements} tone="requirement" />
                <InlineMetaList label="Reward" values={option.rewards} tone="reward" />
            </div>
        </div>
    );
}

function StrategyProjectedResult({
    outcome,
    projectedDebugDetails,
}: {
    outcome: StrategyDossierModel["projectedOutcome"];
    projectedDebugDetails?: string[];
}) {
    if (!outcome) return null;

    return (
        <div className="questExplorer-strategyProjectedOutcome">
            <strong>{outcome.title}</strong>
            {outcome.lines.map((line, index) => (
                <p key={`${outcome.title}:line:${index}`}>{line}</p>
            ))}
            <StrategyDossierObjectiveList objectives={outcome.objectives} />
            <div className="questExplorer-stepObjectiveMetaGrid">
                <InlineMetaList
                    label="Requirements"
                    values={outcome.requirements}
                    tone="requirement"
                />
                <InlineMetaList
                    label="Rewards"
                    values={outcome.rewards}
                    tone="reward"
                />
            </div>
            {projectedDebugDetails?.map((detail, index) => (
                <span className="questExplorer-choiceDebugMeta" key={`projected-debug:${index}`}>{detail}</span>
            ))}
        </div>
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
        <div className="questExplorer-strategyProgressionDetails">
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
        </div>
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
    const supportingMarkers = option.markers.filter((marker) => marker.kind !== "leads");

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

function StrategyDossierMarkerPill({ marker }: { marker: StrategyDossierMarker }) {
    return (
        <span className={`questExplorer-strategyDossierMarker questExplorer-strategyDossierMarker--${marker.kind}`}>
            <span className="questExplorer-strategyDossierMarkerIcon" aria-hidden="true" />
            <strong>{marker.label}</strong>
            <span className="questExplorer-strategyDossierMarkerDetail">{marker.detail}</span>
        </span>
    );
}

function StrategyPathStatusCard({ status }: { status: StrategyPathStatus }) {
    const supportingMarkers = status.markers.filter((marker) => (
        marker.detail !== status.targetLabel
        && marker.detail !== status.choiceLabel
    ));

    return (
        <section
            className={`questExplorer-pathState questExplorer-strategyPathState questExplorer-strategyPathStatus questExplorer-pathState--${status.kind}`}
            aria-label="Next Destination"
        >
            <header>
                <span>{status.label}</span>
                <strong>{status.title}</strong>
            </header>
            <p>{status.description}</p>
            <div className="questExplorer-strategyPathStatusMeta">
                {status.choiceLabel ? (
                    <span>
                        <strong>Simulated Choice</strong>
                        {status.choiceLabel}
                    </span>
                ) : null}
                {status.targetLabel ? (
                    <span>
                        <strong>Target</strong>
                        {status.targetLabel}
                    </span>
                ) : null}
            </div>
            {supportingMarkers.length > 0 ? (
                <div className="questExplorer-strategyDossierMarkers">
                    {supportingMarkers.map((marker, index) => (
                        <StrategyDossierMarkerPill marker={marker} key={`${status.kind}:${marker.kind}:${marker.detail}:${index}`} />
                    ))}
                </div>
            ) : null}
        </section>
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
