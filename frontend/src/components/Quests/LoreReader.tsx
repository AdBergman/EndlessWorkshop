import { choicePresentationGroups } from "@/features/quests/questChoicePresentation";
import {
    isMinorFactionVariantQuest,
    isResolutionLoreSection,
    objectiveVariantLabel,
    phaseDisplayLabel,
    stepPositionLabel,
} from "@/features/quests/questDisplay";
import type {
    LoreFlowModel,
    LoreFlowSegment,
} from "@/features/quests/questLoreFlow";
import type {
    QuestPathChoice,
    QuestPathChoiceSelection,
    RenderedPathStep,
} from "@/features/quests/questPathFlow";
import type {
    LoreSection,
    QuestExplorerEntry,
    QuestProgressionStep,
    StrategyObjective,
} from "@/types/questTypes";

type LoreStepDebugDetailsBuilder = (
    segment: LoreFlowSegment,
    renderedStep: RenderedPathStep,
    isActiveDebugSegment: boolean
) => Map<string, string> | undefined;

export function LoreOpening({ entry }: { entry: QuestExplorerEntry }) {
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

function objectivePaths(entry: QuestExplorerEntry, sections: LoreSection[]): Array<{ objective: StrategyObjective; sections: LoreSection[] }> {
    return entry.strategyView.objectives.map((objective) => ({
        objective,
        sections: sections.filter((section) => (
            section.objectiveKey === objective.objectiveKey && !isResolutionLoreSection(section)
        )),
    }));
}

export function LoreSectionList({ entry, sections: scopedSections }: { entry: QuestExplorerEntry; sections?: LoreSection[] }) {
    const sections = scopedSections ?? entry.loreView.sections;

    if (sections.length === 0) {
        return entry.summaryLines.length > 0
            ? <StepSummary entry={entry} />
            : <p className="questExplorer-emptyState">No lore sections are attached to this step.</p>;
    }

    if (isMinorFactionVariantQuest(entry)) {
        const paths = objectivePaths(entry, sections);
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

function ChoiceStageHeading({ children }: { children: string }) {
    return <h4 className="questExplorer-choiceStageHeading">{children}</h4>;
}

function RepeatedDetailCheckpoint() {
    return (
        <div className="questExplorer-stepCheckpoint">
            <span>Chronicle Checkpoint</span>
            <p>This moment carries forward from the record already shown above.</p>
        </div>
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

    const presentation = choicePresentationGroups(
        step,
        choices,
        selectedChoice,
        displayEntry,
        entriesByKey,
        showRawHiddenRows
    );
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

function LoreStep({
    renderedStep,
    title,
    entriesByKey,
    showRawHiddenRows,
    debugChoiceDetails,
    loreSections,
    loreSectionsWereSuppressed,
    revealedLoreSections,
    onChoose,
}: {
    renderedStep: RenderedPathStep;
    title: string;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    debugChoiceDetails?: Map<string, string>;
    loreSections?: LoreSection[];
    loreSectionsWereSuppressed: boolean;
    revealedLoreSections: LoreSection[];
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
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

            {renderedStep.rendersRepeatedDetailContent || loreSectionsWereSuppressed ? (
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

function LorePathState({
    flow,
    entriesByKey,
}: {
    flow: LoreFlowSegment["flow"];
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

export function LoreContinuousProgression({
    model,
    entriesByKey,
    showRawHiddenRows,
    onChoose,
    activeRailEntryKey,
    getStepTitle,
    getDebugChoiceDetails,
}: {
    model: LoreFlowModel;
    entriesByKey: Record<string, QuestExplorerEntry>;
    showRawHiddenRows: boolean;
    onChoose: (segment: LoreFlowSegment, step: QuestProgressionStep, choice: QuestPathChoice) => void;
    activeRailEntryKey: string | null;
    getStepTitle: (step: QuestProgressionStep, entry: QuestExplorerEntry | null) => string;
    getDebugChoiceDetails?: LoreStepDebugDetailsBuilder;
}) {
    if (model.segments.length === 0) return null;

    return (
        <section className="questExplorer-questPathChronicle questExplorer-loreChronicle" aria-label="Selected progression">
            {model.segments.map((segment, segmentIndex) => {
                const hasNextSegment = segmentIndex < model.segments.length - 1;
                const isScrollActive = Boolean(segment.railEntryKey && segment.railEntryKey === activeRailEntryKey);
                const isActiveDebugSegment = activeRailEntryKey ? isScrollActive : segmentIndex === 0;
                return (
                    <section
                        className={`questExplorer-loreChronicleSegment${isScrollActive ? " is-scrollActive" : ""}`}
                        data-lore-segment-key={segment.segmentKey}
                        data-rail-entry-key={segment.railEntryKey ?? ""}
                        key={segment.segmentKey}
                    >
                        {segment.loreSteps.map((loreStep) => {
                            const { renderedStep } = loreStep;
                            return (
                                <LoreStep
                                    renderedStep={renderedStep}
                                    title={getStepTitle(renderedStep.step, renderedStep.displayEntry)}
                                    entriesByKey={entriesByKey}
                                    showRawHiddenRows={showRawHiddenRows}
                                    debugChoiceDetails={getDebugChoiceDetails?.(segment, renderedStep, isActiveDebugSegment)}
                                    loreSections={loreStep.loreSections}
                                    loreSectionsWereSuppressed={loreStep.loreSectionsWereSuppressed}
                                    revealedLoreSections={loreStep.revealedLoreSections}
                                    onChoose={(step, choice) => onChoose(segment, step, choice)}
                                    key={`${segment.segmentKey}:${renderedStep.step.stepKey}`}
                                />
                            );
                        })}
                        {hasNextSegment ? null : <LorePathState flow={segment.flow} entriesByKey={entriesByKey} />}
                    </section>
                );
            })}
        </section>
    );
}
