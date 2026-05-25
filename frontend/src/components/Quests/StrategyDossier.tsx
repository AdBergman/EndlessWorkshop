import type { ReactNode } from "react";

import {
    buildStrategyPathStatus,
    type StrategyDossierBranchComparisonGroup,
    type StrategyDossierBranchOption,
    type StrategyContinuityStrip,
    type StrategyContinuityStripItem,
    type StrategyDossierMarker,
    type StrategyDossierModel,
    type StrategyDossierObjective,
    type StrategyDossierSelectedPathStep,
    type StrategyPathStatus,
} from "@/features/quests/questStrategyDossier";
import type {
    QuestPathChoice,
    QuestPathFlow,
} from "@/features/quests/questPathFlow";
import type {
    QuestExplorerEntry,
    QuestProgressionStep,
} from "@/types/questTypes";

export function StrategyDossier({
    model,
    step,
    onChoose,
    debugChoiceDetails,
    projectedDebugDetails,
    showContinuityStrip = true,
}: {
    model: StrategyDossierModel;
    step: QuestProgressionStep;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
    debugChoiceDetails?: Map<string, string>;
    projectedDebugDetails?: string[];
    showContinuityStrip?: boolean;
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

            {showContinuityStrip ? (
                <StrategyDossierSection title="Continuity Strip">
                    <StrategyContinuityStripView strip={model.continuityStrip} />
                </StrategyDossierSection>
            ) : null}

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

function StrategyContinuityStripView({ strip }: { strip: StrategyContinuityStrip }) {
    return (
        <div className="questExplorer-strategyContinuity">
            <p className="questExplorer-strategyContinuitySummary">{strip.summary}</p>
            <ol className={`questExplorer-strategyContinuityStrip questExplorer-strategyContinuityStrip--${strip.statusKind}`}>
                {strip.items.map((item) => (
                    <StrategyContinuityStripNode item={item} key={item.id} />
                ))}
            </ol>
        </div>
    );
}

function StrategyContinuityStripNode({ item }: { item: StrategyContinuityStripItem }) {
    const className = [
        "questExplorer-strategyContinuityNode",
        `questExplorer-strategyContinuityNode--${item.kind}`,
        item.isCurrent ? "is-current" : "",
        item.isSelectedPath ? "is-selectedPath" : "",
        item.isDecisionPoint ? "is-decisionPoint" : "",
        item.isTerminal ? "is-terminal" : "",
    ].filter(Boolean).join(" ");

    return (
        <li className={className}>
            <span className="questExplorer-strategyContinuityKnot" aria-hidden="true" />
            <div className="questExplorer-strategyContinuityNodeBody">
                <span className="questExplorer-strategyContinuityEyebrow">{item.eyebrow}</span>
                <strong>{item.title}</strong>
                {item.detail ? <p>{item.detail}</p> : null}
                {item.markers.length > 0 ? (
                    <div className="questExplorer-strategyContinuityMarkers">
                        {item.markers.map((marker, index) => (
                            <StrategyDossierMarkerPill marker={marker} key={`${item.id}:${marker.kind}:${marker.detail}:${index}`} />
                        ))}
                    </div>
                ) : null}
            </div>
        </li>
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

export function StrategyPathState({
    flow,
    entriesByKey,
}: {
    flow: QuestPathFlow;
    entriesByKey: Record<string, QuestExplorerEntry>;
}) {
    const status = buildStrategyPathStatus(flow, entriesByKey);
    if (status.kind === "awaiting-choice") return null;

    return (
        <StrategyPathStatusCard status={status} />
    );
}

function StrategyPathStatusCard({ status }: { status: StrategyPathStatus }) {
    return (
        <section
            className={`questExplorer-pathState questExplorer-strategyPathState questExplorer-strategyPathStatus questExplorer-pathState--${status.kind}`}
            aria-label="What Happens Next"
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
            {status.markers.length > 0 ? (
                <div className="questExplorer-strategyDossierMarkers">
                    {status.markers.map((marker, index) => (
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
