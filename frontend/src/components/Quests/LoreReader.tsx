import {
    isMinorFactionVariantQuest,
    isResolutionLoreSection,
    lorePhaseKey,
    objectiveVariantLabel,
    phaseDisplayLabel,
    stepPositionLabel,
} from "@/features/quests/questDisplay";
import { getQuestCategoryKey } from "@/features/quests/questCategories";
import type {
    ChronicleBranchMoment,
    ChronicleChoiceItem,
    ChronicleContinuationStageGroup,
    ChronicleStage,
    LoreFlowModel,
    LoreFlowSegment,
    LorePathConclusion,
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

type LoreNarrativeLead = {
    section: LoreSection;
    lines: LoreSection["lines"];
    remainingSection: LoreSection | null;
};

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

function isMajorFactionQuest(entry: QuestExplorerEntry): boolean {
    return getQuestCategoryKey(entry.questType) === "faction";
}

function isOpeningLoreSection(section: LoreSection): boolean {
    const phase = lorePhaseKey(section.phase);
    return phase === "start" || phase === "intro" || phase === "opening";
}

function splitLeadSentence(line: LoreSection["lines"][number]): {
    leadLine: LoreSection["lines"][number];
    remainingLine: LoreSection["lines"][number] | null;
} {
    const sentenceMatch = line.text.trim().match(/^(.+?[.!?]["')\]\u201d\u2019]?)(\s+.+)$/s);
    if (!sentenceMatch) {
        return { leadLine: line, remainingLine: null };
    }

    const leadText = sentenceMatch[1]?.trim();
    const remainingText = sentenceMatch[2]?.trim();
    if (!leadText || !remainingText) {
        return { leadLine: line, remainingLine: null };
    }

    return {
        leadLine: { ...line, text: leadText },
        remainingLine: { ...line, text: remainingText },
    };
}

function campaignNarrativeLead(entry: QuestExplorerEntry, sections: LoreSection[]): LoreNarrativeLead | null {
    if (!isMajorFactionQuest(entry)) return null;

    const [firstSection] = sections;
    if (!firstSection || !isOpeningLoreSection(firstSection)) return null;
    if (firstSection.lines.length === 0) return null;

    const { leadLine, remainingLine } = splitLeadSentence(firstSection.lines[0]);
    const leadLines = [leadLine];
    const remainingLines = [
        ...(remainingLine ? [remainingLine] : []),
        ...firstSection.lines.slice(1),
    ];

    return {
        section: firstSection,
        lines: leadLines,
        remainingSection: remainingLines.length > 0
            ? { ...firstSection, lines: remainingLines }
            : null,
    };
}

function LoreChronicleIntro({ lead }: { lead: LoreNarrativeLead }) {
    return (
        <section className="questExplorer-loreIntro" aria-label="Chapter narrative lead">
            {lead.lines.map((line, index) => (
                <p
                    className={`questExplorer-loreIntroLine questExplorer-loreIntroLine--${line.role || "narrator"}${line.speakerLabel ? " questExplorer-loreIntroLine--hasSpeaker" : ""}`}
                    key={`${lead.section.sectionKey}:lead:${index}`}
                >
                    {line.speakerLabel ? <strong className="questExplorer-loreSpeaker">{line.speakerLabel}:</strong> : null}
                    <span className="questExplorer-loreIntroText">{line.text}</span>
                </p>
            ))}
        </section>
    );
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

    const narrativeLead = campaignNarrativeLead(entry, sections);
    const displaySections = narrativeLead
        ? [
            ...(narrativeLead.remainingSection ? [narrativeLead.remainingSection] : []),
            ...sections.slice(1),
        ]
        : sections;

    return (
        <div className={`questExplorer-loreSectionList${narrativeLead ? " questExplorer-loreSectionList--campaign" : ""}`}>
            {narrativeLead ? <LoreChronicleIntro lead={narrativeLead} /> : null}
            {displaySections.map((section) => (
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

function StageGroupHeading({ children }: { children: string }) {
    return <h4 className="questExplorer-choiceStageHeading">{children}</h4>;
}

function RepeatedDetailCheckpoint() {
    return (
        <div className="questExplorer-stepCheckpoint">
            <span>Chronicle carry-forward</span>
            <p>This moment continues from the record already shown above.</p>
        </div>
    );
}

function LoreStageButton({
    step,
    choiceItem,
    selectedChoice,
    selectedContextBranchKeys,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    choiceItem: ChronicleChoiceItem;
    selectedChoice: QuestPathChoiceSelection | null;
    selectedContextBranchKeys: Set<string>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const { choice, stageLabel } = choiceItem;
    const isSelected = selectedChoice?.choiceId === choice.id;
    const isInSelectedContext = !isSelected && Boolean(choice.branchKey && selectedContextBranchKeys.has(choice.branchKey));
    const previewLines = choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines;

    return (
        <button
            type="button"
            className={`questExplorer-loreChoice questExplorer-loreChoice--${choice.accent}${isSelected ? " is-selected" : ""}${isInSelectedContext ? " is-inPath" : ""}`}
            aria-pressed={isSelected || isInSelectedContext}
            aria-current={isSelected ? "true" : undefined}
            onClick={() => onChoose(step, choice)}
            key={`${step.stepKey}:${choice.id}`}
        >
            <span className="questExplorer-loreChoiceMark" aria-hidden="true" />
            <span className="questExplorer-loreChoiceCopy">
                <small>{stageLabel}</small>
                <strong>{choice.label}</strong>
                {previewLines.length > 0 ? <span>{previewLines.join(" ")}</span> : null}
                {debugChoiceDetails?.get(choice.id) ? (
                    <span className="questExplorer-choiceDebugMeta">{debugChoiceDetails.get(choice.id)}</span>
                ) : null}
            </span>
        </button>
    );
}

function LoreStageContext({ choiceItem }: { choiceItem: ChronicleChoiceItem }) {
    const { choice, stageLabel } = choiceItem;
    const previewLines = choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines;

    return (
        <div className="questExplorer-loreChoiceContext" key={choice.id}>
            <span className="questExplorer-loreChoiceMark" aria-hidden="true" />
            <span className="questExplorer-loreChoiceCopy">
                <small>{stageLabel}</small>
                <strong>{choice.label}</strong>
                {previewLines.length > 0 ? <span>{previewLines.join(" ")}</span> : null}
            </span>
        </div>
    );
}

function LoreContinuationStageGroup({
    step,
    group,
    selectedChoice,
    selectedContextBranchKeys,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    group: ChronicleContinuationStageGroup;
    selectedChoice: QuestPathChoiceSelection | null;
    selectedContextBranchKeys: Set<string>;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    return (
        <section
            className={`questExplorer-continuationStageGroup questExplorer-continuationStageGroup--${group.relation}`}
            aria-label={group.heading}
        >
            <StageGroupHeading>{group.heading}</StageGroupHeading>
            <div>
                {group.choices.map((choiceItem) => (
                    <LoreStageButton
                        step={step}
                        choiceItem={choiceItem}
                        selectedChoice={selectedChoice}
                        selectedContextBranchKeys={selectedContextBranchKeys}
                        debugChoiceDetails={debugChoiceDetails}
                        onChoose={onChoose}
                        key={`${step.stepKey}:${choiceItem.choice.id}`}
                    />
                ))}
            </div>
        </section>
    );
}

function LoreRevealedContinuation({
    choiceItem,
    debugChoiceDetails,
}: {
    choiceItem: ChronicleChoiceItem;
    debugChoiceDetails?: Map<string, string>;
}) {
    const { choice } = choiceItem;
    const previewLines = (choice.loreLines.length > 0 ? choice.loreLines : choice.descriptionLines)
        .filter((line) => line !== choice.label && line !== choice.targetSummaryLine);

    return (
        <section className="questExplorer-revealedContinuation questExplorer-revealedContinuation--lore" key={choice.id}>
            <span className="questExplorer-revealedContinuationLabel">Continuation revealed</span>
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
    continuationStages,
    debugChoiceDetails,
}: {
    continuationStages: ChronicleChoiceItem[];
    debugChoiceDetails?: Map<string, string>;
}) {
    if (continuationStages.length === 0) return null;

    return (
        <div className="questExplorer-revealedContinuationList">
            {continuationStages.map((choiceItem) => (
                <LoreRevealedContinuation choiceItem={choiceItem} debugChoiceDetails={debugChoiceDetails} key={choiceItem.choice.id} />
            ))}
        </div>
    );
}

function LoreBranchMoment({
    step,
    branchMoment,
    selectedChoice,
    debugChoiceDetails,
    onChoose,
}: {
    step: QuestProgressionStep;
    branchMoment: ChronicleBranchMoment | null;
    selectedChoice: QuestPathChoiceSelection | null;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const continuationStageGroups = branchMoment?.branchingContinuationStageGroups ?? [];
    const usesStagedContinuations = continuationStageGroups.length > 1;
    const stageCount = [
        branchMoment?.decisionChoices.length ?? 0,
        branchMoment?.continuationChoices.length ?? 0,
        branchMoment?.branchingContinuationChoices.length ?? 0,
    ].filter((count) => count > 0).length;
    if (!branchMoment || (!branchMoment.hasActionableStages && branchMoment.structuralContextStages.length === 0)) return null;

    return (
        <section className="questExplorer-loreBranchMoment" aria-label={`${stepPositionLabel(step)} ${branchMoment.ariaNoun}`}>
            <h3>{branchMoment.title}</h3>
            {branchMoment.structuralContextStages.length > 0 ? (
                <div className="questExplorer-choiceContextList">
                    {branchMoment.structuralContextStages.map((choiceItem) => (
                        <LoreStageContext choiceItem={choiceItem} key={choiceItem.choice.id} />
                    ))}
                </div>
            ) : null}
            {branchMoment.decisionChoices.length > 0 ? (
                <div className="questExplorer-choiceStage">
                    {stageCount > 1 || branchMoment.structuralContextStages.length > 0 ? (
                        <StageGroupHeading>Decision options</StageGroupHeading>
                    ) : null}
                    <div>
                        {branchMoment.decisionChoices.map((choiceItem) => (
                            <LoreStageButton
                                step={step}
                                choiceItem={choiceItem}
                                selectedChoice={selectedChoice}
                                selectedContextBranchKeys={branchMoment.selectedContextBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choiceItem.choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {branchMoment.continuationChoices.length > 0 ? (
                <div className="questExplorer-choiceStage questExplorer-choiceStage--continuation">
                    {stageCount > 1 ? <StageGroupHeading>Continue the chronicle</StageGroupHeading> : null}
                    <div>
                        {branchMoment.continuationChoices.map((choiceItem) => (
                            <LoreStageButton
                                step={step}
                                choiceItem={choiceItem}
                                selectedChoice={selectedChoice}
                                selectedContextBranchKeys={branchMoment.selectedContextBranchKeys}
                                debugChoiceDetails={debugChoiceDetails}
                                onChoose={onChoose}
                                key={`${step.stepKey}:${choiceItem.choice.id}`}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
            {branchMoment.branchingContinuationChoices.length > 0 ? (
                <div className="questExplorer-choiceStage questExplorer-choiceStage--continuation">
                    {usesStagedContinuations ? (
                        <div className="questExplorer-continuationStageStack">
                            {continuationStageGroups.map((group) => (
                                <LoreContinuationStageGroup
                                    step={step}
                                    group={group}
                                    selectedChoice={selectedChoice}
                                    selectedContextBranchKeys={branchMoment.selectedContextBranchKeys}
                                    debugChoiceDetails={debugChoiceDetails}
                                    onChoose={onChoose}
                                    key={group.key}
                                />
                            ))}
                        </div>
                    ) : (
                        <>
                            {stageCount > 1 ? <StageGroupHeading>Possible continuations</StageGroupHeading> : null}
                            <div>
                                {branchMoment.branchingContinuationChoices.map((choiceItem) => (
                                    <LoreStageButton
                                        step={step}
                                        choiceItem={choiceItem}
                                        selectedChoice={selectedChoice}
                                        selectedContextBranchKeys={branchMoment.selectedContextBranchKeys}
                                        debugChoiceDetails={debugChoiceDetails}
                                        onChoose={onChoose}
                                        key={`${step.stepKey}:${choiceItem.choice.id}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : null}
            {!selectedChoice && branchMoment.decisionChoices.length > 0 ? (
                <p className="questExplorer-choiceHint">The chronicle waits for your choice.</p>
            ) : null}
        </section>
    );
}

function LoreStep({
    stage,
    title,
    debugChoiceDetails,
    onChoose,
}: {
    stage: ChronicleStage;
    title: string;
    debugChoiceDetails?: Map<string, string>;
    onChoose: (step: QuestProgressionStep, choice: QuestPathChoice) => void;
}) {
    const { renderedStep } = stage;
    const suppressCarryForward = Boolean(
        stage.branchMoment
        || stage.selectedChoiceLoreSections.length > 0
        || stage.revealedLoreSections.length > 0
        || stage.revealedContinuationStages.length > 0
    );
    const showCarryForward = (renderedStep.rendersRepeatedDetailContent || stage.loreSectionsWereSuppressed)
        && !suppressCarryForward;

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

            {showCarryForward ? (
                <RepeatedDetailCheckpoint />
            ) : renderedStep.rendersRepeatedDetailContent || stage.loreSectionsWereSuppressed ? (
                null
            ) : (
                renderedStep.displayEntry ? (
                    <LoreSectionList entry={renderedStep.displayEntry} sections={stage.loreSections} />
                ) : (
                    <p className="questExplorer-emptyState">This chronicle stage has no entry-backed content in the current DTO.</p>
                )
            )}

            <LoreBranchMoment
                step={renderedStep.step}
                branchMoment={stage.branchMoment}
                selectedChoice={renderedStep.selectedChoice}
                debugChoiceDetails={debugChoiceDetails}
                onChoose={onChoose}
            />

            {stage.selectedChoiceLoreEntry && stage.selectedChoiceLoreSections.length > 0 ? (
                <div className="questExplorer-revealedBeatBody questExplorer-revealedBeatBody--lore">
                    <LoreSectionList entry={stage.selectedChoiceLoreEntry} sections={stage.selectedChoiceLoreSections} />
                </div>
            ) : null}

            <LoreRevealedContinuations
                continuationStages={stage.revealedContinuationStages}
                debugChoiceDetails={debugChoiceDetails}
            />

            {renderedStep.displayEntry && stage.revealedLoreSections.length > 0 && !renderedStep.revealedContinuationsBecomeSteps ? (
                <div className="questExplorer-revealedBeatBody questExplorer-revealedBeatBody--lore">
                    <LoreSectionList entry={renderedStep.displayEntry} sections={stage.revealedLoreSections} />
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
        ? `The chronicle continues in ${chapter}: ${title}.`
        : `The chronicle continues with ${title}.`;
}

function LoreNarrativeConclusion({ conclusion }: { conclusion: LorePathConclusion }) {
    const needsClosingPeriod = !/[.!?]$/.test(conclusion.choiceLabel.trim());

    return (
        <section className="questExplorer-loreConclusion questExplorer-loreConclusion--ending" aria-label="Chronicle conclusion">
            <p>
                The story concludes here with <span className="questExplorer-loreConclusionChoice">"{conclusion.choiceLabel}"</span>{needsClosingPeriod ? "." : null}
            </p>
            <strong>The End</strong>
        </section>
    );
}

function LoreArchiveGap({ conclusion }: { conclusion: LorePathConclusion }) {
    return (
        <section className="questExplorer-pathState questExplorer-lorePathState questExplorer-pathState--unresolved" aria-label="Archive gap">
            <span>Archive gap</span>
            <p>The selected continuation "{conclusion.choiceLabel}" is preserved, but the archive does not identify the next chronicle step. The chronicle closes this page rather than guessing.</p>
        </section>
    );
}

function LorePathState({
    segment,
    entriesByKey,
}: {
    segment: LoreFlowSegment;
    entriesByKey: Record<string, QuestExplorerEntry>;
}) {
    const { flow, pathConclusion } = segment;

    return (
        <>
            {pathConclusion?.kind === "chronicle_end" ? <LoreNarrativeConclusion conclusion={pathConclusion} /> : null}
            {pathConclusion?.kind === "archive_gap" ? <LoreArchiveGap conclusion={pathConclusion} /> : null}

            {flow.reachedContinuationEntryKey ? (
                <section className="questExplorer-pathState questExplorer-lorePathState questExplorer-pathState--chapter">
                    <span>Chronicle continues</span>
                    <p>{continuationChapterMessage(entriesByKey[flow.reachedContinuationEntryKey] ?? null)}</p>
                </section>
            ) : null}
        </>
    );
}

export function LoreContinuousProgression({
    model,
    entriesByKey,
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
                        {segment.loreSteps.map((stage) => {
                            const { renderedStep } = stage;
                            return (
                                <LoreStep
                                    stage={stage}
                                    title={getStepTitle(renderedStep.step, renderedStep.displayEntry)}
                                    debugChoiceDetails={getDebugChoiceDetails?.(segment, renderedStep, isActiveDebugSegment)}
                                    onChoose={(step, choice) => onChoose(segment, step, choice)}
                                    key={`${segment.segmentKey}:${renderedStep.step.stepKey}`}
                                />
                            );
                        })}
                        {hasNextSegment ? null : <LorePathState segment={segment} entriesByKey={entriesByKey} />}
                    </section>
                );
            })}
        </section>
    );
}
