import type {
    QuestChoiceSummaryModel,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestMetadataModel,
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

export function QuestProgressGateRows({ rows }: { rows: QuestProgressGateRowModel[] }) {
    if (rows.length === 0) {
        return <p className="questExplorer-muted">No progress gates recorded.</p>;
    }

    return (
        <div className="questExplorer-progressGateRows">
            {rows.map((row, index) => (
                <div className="questExplorer-progressGateRow" key={row.id}>
                    <div className="questExplorer-progressGateRow__index">{`Threshold ${index + 1}`}</div>
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
                                    emptyLabel="No completion threshold"
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
                                        emptyLabel="No failure threshold"
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

export function QuestPathBranches({
    choice,
    onSelectQuest,
}: {
    choice: QuestChoiceSummaryModel | null;
    onSelectQuest: (questKey: string) => void;
}) {
    if (!choice || choice.nextQuestLinks.length === 0) {
        return <p className="questExplorer-muted">No outcome recorded for this path.</p>;
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
        return <p className="questExplorer-muted">No paths are attached to this quest.</p>;
    }

    return (
        <div className="questExplorer-choiceList">
            {choices.map((choice) => (
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

export function QuestRecordContext({ metadata }: { metadata: QuestMetadataModel }) {
    return (
        <details className="questExplorer-recordContext">
            <summary>Record Context</summary>
            {metadata.flags.length > 0 ? (
                <div className="questExplorer-metadata__flags" aria-label="Quest flags">
                    {metadata.flags.map((flag) => (
                        <span className="questExplorer-pill" key={flag}>
                            {flag}
                        </span>
                    ))}
                </div>
            ) : null}

            {metadata.sections.map((section) => (
                <section className="questExplorer-metadataSection" key={section.id}>
                    <h4>{section.label}</h4>
                    <dl>
                        {section.items.map((item) => (
                            <div key={`${section.id}:${item.label}`}>
                                <dt>{item.label}</dt>
                                <dd>{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            ))}
        </details>
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
