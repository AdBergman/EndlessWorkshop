import type {
    QuestChronicleModel,
    QuestChoiceSummaryModel,
    QuestLineGroupModel,
    QuestLinkModel,
    QuestMetadataModel,
} from "@/features/quests/questExplorerTypes";

type QuestMetadataPanelProps = {
    chronicle: QuestChronicleModel;
    metadata: QuestMetadataModel;
    onSelectChoice: (choiceKey: string) => void;
    onSelectQuest: (questKey: string) => void;
};

function TextLines({ lines, emptyLabel }: { lines: string[]; emptyLabel: string }) {
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

function LineGroups({ groups }: { groups: QuestLineGroupModel[] }) {
    if (groups.length === 0) {
        return <p className="questExplorer-muted">No requirements recorded.</p>;
    }

    return (
        <div className="questExplorer-lineGroups">
            {groups.map((group) => (
                <section className="questExplorer-lineGroup" key={group.id}>
                    <h5>{group.label}</h5>
                    <TextLines lines={group.lines} emptyLabel="No lines recorded." />
                </section>
            ))}
        </div>
    );
}

function QuestReferenceLink({
    link,
    onSelectQuest,
}: {
    link: QuestLinkModel;
    onSelectQuest: (questKey: string) => void;
}) {
    return (
        <button
            type="button"
            className="questExplorer-referenceLink questExplorer-referenceLink--quiet"
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
                    />
                ))}
            </div>
        </div>
    );
}

function PathBranches({
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
                        <QuestReferenceLink link={link} onSelectQuest={onSelectQuest} />
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function PathSelector({
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

export default function QuestMetadataPanel({
    chronicle,
    metadata,
    onSelectChoice,
    onSelectQuest,
}: QuestMetadataPanelProps) {
    const convergesIntoQuestLink = metadata.convergesIntoQuestLink;
    const hasReferenceLinks =
        metadata.previousQuestLinks.length > 0 ||
        metadata.nextQuestLinks.length > 0 ||
        Boolean(convergesIntoQuestLink);

    return (
        <aside className="questExplorer-metadata questExplorer-pathPanel" aria-label="Path and outcomes">
            <header>
                <div className="questExplorer-sectionLabel">Selected Quest</div>
                <h3>Path & Outcomes</h3>
            </header>

            <section className="questExplorer-metadataSection" aria-labelledby="quest-paths-heading">
                <h4 id="quest-paths-heading">Paths</h4>
                <PathSelector choices={chronicle.choices} onSelectChoice={onSelectChoice} />
            </section>

            <section className="questExplorer-metadataSection" aria-labelledby="quest-selected-path-heading">
                <h4 id="quest-selected-path-heading">Selected Path</h4>
                {chronicle.selectedChoice ? (
                    <div className="questExplorer-pathPanel__selectedPath">
                        <p className="questExplorer-pathTitle">{chronicle.selectedChoice.title}</p>
                        <TextLines
                            lines={chronicle.selectedChoice.descriptionLines}
                            emptyLabel="No choice description recorded."
                        />
                        <LineGroups groups={chronicle.selectedChoice.requirementGroups} />
                        <TextLines
                            lines={chronicle.selectedChoice.rewardLines}
                            emptyLabel="No choice rewards recorded."
                        />
                        <PathBranches choice={chronicle.selectedChoice} onSelectQuest={onSelectQuest} />
                    </div>
                ) : (
                    <p className="questExplorer-muted">No path selected.</p>
                )}
            </section>

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

            {hasReferenceLinks ? (
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
                            <button
                                type="button"
                                className="questExplorer-referenceLink questExplorer-referenceLink--quiet"
                                onClick={() => onSelectQuest(convergesIntoQuestLink.questKey)}
                            >
                                <span className="questExplorer-referenceLink__main">
                                    <span className="questExplorer-referenceLink__label">
                                        {convergesIntoQuestLink.label}
                                    </span>
                                </span>
                                {convergesIntoQuestLink.contextLabel ? (
                                    <span className="questExplorer-referenceLink__context">
                                        {convergesIntoQuestLink.contextLabel}
                                    </span>
                                ) : null}
                            </button>
                        </div>
                    ) : null}
                </details>
            ) : null}
        </aside>
    );
}
