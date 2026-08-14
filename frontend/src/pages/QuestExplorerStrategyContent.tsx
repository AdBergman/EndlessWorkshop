import QuestExplorerModeSwitch from "@/components/Quests/QuestExplorerModeSwitch";
import { InlineMetaList } from "@/components/Quests/StrategyDossier";
import { InlineRewardMetaList, RewardFormulaDetail } from "@/components/Quests/QuestRewardMeta";
import { QuestCodexReferenceLink } from "@/components/Quests/QuestCodexReferenceLink";
import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";
import type { QuestDetailProgression } from "@/features/quests/questPathFlow";
import {
    isMinorFactionVariantQuest,
    objectiveVariantLabel,
    phaseDisplayLabel,
    questChapterDisplayLabel,
} from "@/features/quests/questDisplay";
import {
    rewardDisplaysFromRewards,
    uniqueRewardDisplays,
    type QuestRewardDisplay,
} from "@/features/quests/questRewardDisplay";
import {
    requirementDisplaysFromRequirements,
    uniqueRequirementDisplays,
    type QuestRequirementDisplay,
} from "@/features/quests/questRequirementDisplay";
import type { QuestExplorerEntry, StrategyObjective } from "@/types/questTypes";

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
            value: progression
                ? questChapterDisplayLabel(progression.chapter, { entry, questline: progression.questline })
                : entry.navigation.chapterLabel ?? "",
        },
        {
            label: "Progression",
            value: progression ? countLabel(progression.chapter.steps.length, "step") : entry.navigation.stepLabel ?? "",
        },
    ].filter((item) => item.value.trim().length > 0);
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

export function StrategyHeader({
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

export function LoreHeader({
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

export function StrategyOverview({ entry }: { entry: QuestExplorerEntry }) {
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
            <OverviewRequirementColumn
                title="Requirements"
                requirements={requirementDisplaysFromRequirements(requirements)}
                emptyLabel="No requirements recorded"
            />
            <OverviewRewardColumn
                title="Rewards"
                rewards={rewardDisplaysFromRewards(rewards)}
                emptyLabel="No rewards recorded"
            />
        </section>
    );
}

function OverviewRequirementColumn({
    title,
    requirements,
    emptyLabel,
}: {
    title: string;
    requirements: QuestRequirementDisplay[];
    emptyLabel: string;
}) {
    const visibleRequirements = uniqueRequirementDisplays(requirements).slice(0, 5);

    return (
        <section className="questExplorer-overviewColumn questExplorer-overviewColumn--requirement">
            <h3>
                <span>{title}</span>
                <small>{visibleRequirements.length}</small>
            </h3>
            <ul>
                {visibleRequirements.length > 0 ? visibleRequirements.map((requirement, index) => (
                    <li key={`${title}:${index}:${requirement.displayText}:${requirement.referenceKey ?? ""}:${requirement.codexEntryKey ?? ""}`}>
                        <QuestCodexReferenceLink source={requirement} showTooltip>
                            {requirement.displayText}
                        </QuestCodexReferenceLink>
                    </li>
                )) : <li className="is-empty">{emptyLabel}</li>}
            </ul>
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

function OverviewRewardColumn({
    title,
    rewards,
    emptyLabel,
}: {
    title: string;
    rewards: QuestRewardDisplay[];
    emptyLabel: string;
}) {
    const visibleRewards = uniqueRewardDisplays(rewards).slice(0, 5);

    return (
        <section className="questExplorer-overviewColumn questExplorer-overviewColumn--reward">
            <h3>
                <span>{title}</span>
                <small>{visibleRewards.length}</small>
            </h3>
            <ul>
                {visibleRewards.length > 0 ? visibleRewards.map((reward, index) => (
                    <li key={`${title}:${index}:${reward.displayText}:${reward.formulaText ?? ""}`}>
                        <QuestCodexReferenceLink source={reward}>
                            <span>{reward.displayText}</span>
                        </QuestCodexReferenceLink>
                        <RewardFormulaDetail formulaText={reward.formulaText} />
                    </li>
                )) : <li className="is-empty">{emptyLabel}</li>}
            </ul>
        </section>
    );
}

export function EntryStrategyContent({
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
                            items={requirementDisplaysFromRequirements(objective.requirements)}
                            tone="requirement"
                        />
                        <InlineRewardMetaList
                            label="Rewards"
                            rewards={rewardDisplaysFromRewards(objective.rewards)}
                            fallbackValues={objective.rewards.map((reward) => reward.displayText)}
                        />
                    </div>
                </section>
            ))}
        </div>
    );
}

