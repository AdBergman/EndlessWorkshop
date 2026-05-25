import {
    continuationKeys,
    selectedChoiceContinuationKeys,
    type QuestDetailProgression,
    type QuestPathChoiceSelection,
    type QuestPathFlow,
} from "@/features/quests/questPathFlow";
import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";
import {
    chapterPositionLabel,
    stepPositionLabel,
} from "@/features/quests/questDisplay";
import type {
    QuestExplorerEntry,
} from "@/types/questTypes";

export type QuestModeDebugChoicePaths = Record<QuestExplorerMode, QuestPathChoiceSelection[]>;

function choiceSelectedBranchKeys(choicePath: QuestPathChoiceSelection[]): Set<string> {
    return new Set(choicePath.map((selection) => selection.branchKey).filter((branchKey): branchKey is string => Boolean(branchKey)));
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

function debugChoicePath(choicePath: QuestPathChoiceSelection[]): string {
    return choicePath.length > 0 ? choicePath.map(debugChoiceSelection).join(" || ") : "none";
}

function debugBranchPath(choicePath: QuestPathChoiceSelection[]): string {
    return debugList([...choiceSelectedBranchKeys(choicePath)]);
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

export function QuestProgressionDebugPanel({
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
