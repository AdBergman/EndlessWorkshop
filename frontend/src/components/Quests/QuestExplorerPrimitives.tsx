import type {
    QuestChoiceSummaryModel,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestMetadataModel,
    QuestObjectiveGroupModel,
    QuestProgressGateRowModel,
} from "@/features/quests/questExplorerTypes";

export function QuestTextLines({
    lines,
    emptyLabel,
}: {
    lines: string[];
    emptyLabel: string;
}) {
    if (lines.length === 0) {
        return <p className="questExplorer-muted">{emptyLabel}</p>;
    }

    return (
        <div className="questExplorer-lines">
            {lines.map((line, index) => (
                <p key={`${line}:${index}`}>{line}</p>
            ))}
        </div>
    );
}

export function QuestLineGroups({ groups }: { groups: QuestLineGroupModel[] }) {
    if (groups.length === 0) {
        return <p className="questExplorer-muted">No requirements recorded.</p>;
    }

    return (
        <div className="questExplorer-lineGroups">
            {groups.map((group) => (
                <section className="questExplorer-lineGroup" key={group.id}>
                    <h5>{group.label}</h5>
                    <QuestTextLines lines={group.lines} emptyLabel="No lines recorded." />
                </section>
            ))}
        </div>
    );
}

export function QuestReferenceLink({
    link,
    onSelectQuest,
    quiet = false,
}: {
    link: QuestLinkModel;
    onSelectQuest: (questKey: string) => void;
    quiet?: boolean;
}) {
    return (
        <button
            type="button"
            className={`questExplorer-referenceLink${quiet ? " questExplorer-referenceLink--quiet" : ""}`}
            onClick={() => onSelectQuest(link.questKey)}
        >
            <span className="questExplorer-referenceLink__main">
                <span className="questExplorer-referenceLink__label">{link.label}</span>
            </span>
            {link.contextLabel ? (
                <span className="questExplorer-referenceLink__context">{link.contextLabel}</span>
            ) : null}
        </button>
    );
}

export function QuestOutcomeBranches({
    nextQuestLink,
    failQuestLink,
    onSelectQuest,
    emptyLabel = "No outcome recorded.",
}: {
    nextQuestLink: QuestLinkModel | null;
    failQuestLink: QuestLinkModel | null;
    onSelectQuest: (questKey: string) => void;
    emptyLabel?: string;
}) {
    if (!nextQuestLink && !failQuestLink) {
        return <p className="questExplorer-muted">{emptyLabel}</p>;
    }

    return (
        <dl className="questExplorer-branchList">
            {nextQuestLink ? (
                <div>
                    <dt>Continues to</dt>
                    <dd>
                        <QuestReferenceLink link={nextQuestLink} onSelectQuest={onSelectQuest} />
                    </dd>
                </div>
            ) : null}
            {failQuestLink ? (
                <div>
                    <dt>Failure leads to</dt>
                    <dd>
                        <QuestReferenceLink link={failQuestLink} onSelectQuest={onSelectQuest} />
                    </dd>
                </div>
            ) : null}
        </dl>
    );
}

function QuestLineSummary({
    lines,
    emptyLabel,
}: {
    lines: string[];
    emptyLabel: string;
}) {
    return <span>{lines.length > 0 ? lines.join(" / ") : emptyLabel}</span>;
}

export function QuestProgressGateRows({
    rows,
    rowLabelPrefix = "Threshold",
    completionEmptyLabel = "No completion threshold",
    failureEmptyLabel = "No failure threshold",
}: {
    rows: QuestProgressGateRowModel[];
    rowLabelPrefix?: string;
    completionEmptyLabel?: string;
    failureEmptyLabel?: string;
}) {
    if (rows.length === 0) {
        return <p className="questExplorer-muted">No progress gates recorded.</p>;
    }

    return (
        <div className="questExplorer-progressGateRows">
            {rows.map((row, index) => (
                <div className="questExplorer-progressGateRow" key={row.id}>
                    <div className="questExplorer-progressGateRow__index">{`${rowLabelPrefix} ${index + 1}`}</div>
                    <dl>
                        <div>
                            <dt>Available</dt>
                            <dd>
                                <QuestLineSummary lines={row.selectionLines} emptyLabel="Start" />
                            </dd>
                        </div>
                        <div>
                            <dt>Completes</dt>
                            <dd>
                                <QuestLineSummary
                                    lines={row.completionLines}
                                    emptyLabel={completionEmptyLabel}
                                />
                            </dd>
                        </div>
                        {row.forbiddenLines.length > 0 ? (
                            <div>
                                <dt>Blocked</dt>
                                <dd>
                                    <QuestLineSummary lines={row.forbiddenLines} emptyLabel="No limit" />
                                </dd>
                            </div>
                        ) : null}
                        {row.failureLines.length > 0 ? (
                            <div>
                                <dt>Fails</dt>
                                <dd>
                                    <QuestLineSummary
                                        lines={row.failureLines}
                                        emptyLabel={failureEmptyLabel}
                                    />
                                </dd>
                            </div>
                        ) : null}
                        {row.rewardLines.length > 0 ? (
                            <div>
                                <dt>Reward</dt>
                                <dd>
                                    <QuestLineSummary lines={row.rewardLines} emptyLabel="No reward" />
                                </dd>
                            </div>
                        ) : null}
                    </dl>
                </div>
            ))}
        </div>
    );
}

type QuestStepVariantKind = Exclude<QuestObjectiveGroupModel["kind"], "objective">;

const stepVariantLabels: Record<QuestStepVariantKind, {
    section: string;
    row: string;
    descriptionEmpty: string;
    completionEmpty: string;
    failureEmpty: string;
}> = {
    progressGate: {
        section: "Progress Gates",
        row: "Threshold",
        descriptionEmpty: "No progress requirement description recorded.",
        completionEmpty: "No completion threshold",
        failureEmpty: "No failure threshold",
    },
    completionOption: {
        section: "Completion Options",
        row: "Option",
        descriptionEmpty: "No completion option description recorded.",
        completionEmpty: "No completion option",
        failureEmpty: "No failure option",
    },
};

export function QuestStepVariantGroups({
    kind,
    groups,
    headingId,
    onSelectQuest,
}: {
    kind: QuestStepVariantKind;
    groups: QuestObjectiveGroupModel[];
    headingId: string;
    onSelectQuest: (questKey: string) => void;
}) {
    if (groups.length === 0) return null;
    const labels = stepVariantLabels[kind];

    return (
        <section className="questExplorer-chronicleSection" aria-labelledby={headingId}>
            <div className="questExplorer-sectionLabel" id={headingId}>
                {labels.section}
            </div>
            <div className="questExplorer-progressRequirementList">
                {groups.map((group) => (
                    <div className="questExplorer-progressRequirement" key={group.id}>
                        <header>
                            <h3>{group.title}</h3>
                            {group.summaryLabel ? <span>{group.summaryLabel}</span> : null}
                        </header>
                        <QuestTextLines
                            lines={group.descriptionLines}
                            emptyLabel={labels.descriptionEmpty}
                        />
                        <QuestProgressGateRows
                            rows={group.gateRows}
                            rowLabelPrefix={labels.row}
                            completionEmptyLabel={labels.completionEmpty}
                            failureEmptyLabel={labels.failureEmpty}
                        />
                        {group.rewardLines.length > 0 ? (
                            <QuestTextLines
                                lines={group.rewardLines}
                                emptyLabel="No rewards recorded."
                            />
                        ) : null}
                        <QuestOutcomeBranches
                            nextQuestLink={group.nextQuestLink}
                            failQuestLink={group.failQuestLink}
                            onSelectQuest={onSelectQuest}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export function QuestPathBranches({
    choice,
    onSelectQuest,
}: {
    choice: QuestChoiceSummaryModel | null;
    onSelectQuest: (questKey: string) => void;
}) {
    if (!choice || choice.nextQuestLinks.length === 0) {
        return <p className="questExplorer-muted">No outcome recorded for this branch.</p>;
    }

    return (
        <dl className="questExplorer-branchList">
            {choice.nextQuestLinks.map((link, index) => (
                <div key={`${link.provenance}:${link.questKey}:${index}`}>
                    <dt>Leads to</dt>
                    <dd>
                        <QuestReferenceLink link={link} onSelectQuest={onSelectQuest} quiet />
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function QuestPathSelector({
    choices,
    onSelectChoice,
}: {
    choices: QuestChoiceSummaryModel[];
    onSelectChoice: (choiceKey: string) => void;
}) {
    if (choices.length === 0) {
        return <p className="questExplorer-muted">No branches are attached to this quest.</p>;
    }

    const selectorChoices = choices.filter((choice) => choice.title);
    if (selectorChoices.length <= 1) return null;

    return (
        <div className="questExplorer-choiceList">
            {selectorChoices.map((choice) => (
                <button
                    type="button"
                    className={`questExplorer-choiceButton${choice.isSelected ? " is-selected" : ""}`}
                    key={choice.choiceKey}
                    aria-pressed={choice.isSelected}
                    onClick={() => onSelectChoice(choice.choiceKey)}
                >
                    <span>{choice.title}</span>
                    {choice.subtitle ? <small aria-hidden="true">{choice.subtitle}</small> : null}
                </button>
            ))}
        </div>
    );
}

function QuestLinkList({
    label,
    links,
    onSelectQuest,
}: {
    label: string;
    links: QuestLinkModel[];
    onSelectQuest: (questKey: string) => void;
}) {
    if (links.length === 0) return null;

    return (
        <div className="questExplorer-metadataLinks">
            <div className="questExplorer-metadataLinks__label">{label}</div>
            <div className="questExplorer-metadataLinks__items">
                {links.map((link, index) => (
                    <QuestReferenceLink
                        key={`${link.provenance}:${link.questKey}:${index}`}
                        link={link}
                        onSelectQuest={onSelectQuest}
                        quiet
                    />
                ))}
            </div>
        </div>
    );
}

export function QuestReferenceTrail({
    metadata,
    onSelectQuest,
}: {
    metadata: QuestMetadataModel;
    onSelectQuest: (questKey: string) => void;
}) {
    const convergesIntoQuestLink = metadata.convergesIntoQuestLink;
    const hasReferenceLinks =
        metadata.previousQuestLinks.length > 0 ||
        metadata.nextQuestLinks.length > 0 ||
        Boolean(convergesIntoQuestLink);

    if (!hasReferenceLinks) return null;

    return (
        <details className="questExplorer-referenceTrail">
            <summary>Reference Trail</summary>
            <QuestLinkList
                label="Previous"
                links={metadata.previousQuestLinks}
                onSelectQuest={onSelectQuest}
            />
            <QuestLinkList
                label="Continues"
                links={metadata.nextQuestLinks}
                onSelectQuest={onSelectQuest}
            />
            {convergesIntoQuestLink ? (
                <div className="questExplorer-metadataLinks">
                    <div className="questExplorer-metadataLinks__label">Converges with</div>
                    <QuestReferenceLink
                        link={convergesIntoQuestLink}
                        onSelectQuest={onSelectQuest}
                        quiet
                    />
                </div>
            ) : null}
        </details>
    );
}
