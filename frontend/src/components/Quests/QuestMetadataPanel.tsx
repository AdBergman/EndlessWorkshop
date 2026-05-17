import type {
    QuestLinkModel,
    QuestMetadataModel,
} from "@/features/quests/questExplorerTypes";

type QuestMetadataPanelProps = {
    metadata: QuestMetadataModel;
    onSelectQuest: (questKey: string) => void;
};

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
                {links.map((link) => (
                    <button
                        type="button"
                        className="questExplorer-linkButton"
                        key={link.questKey}
                        onClick={() => onSelectQuest(link.questKey)}
                    >
                        {link.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function QuestMetadataPanel({ metadata, onSelectQuest }: QuestMetadataPanelProps) {
    const convergesIntoQuestLink = metadata.convergesIntoQuestLink;

    return (
        <aside className="questExplorer-metadata" aria-label="Quest metadata">
            <header>
                <div className="questExplorer-sectionLabel">Strategic Metadata</div>
                <h3>Index Record</h3>
            </header>

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

            <QuestLinkList
                label="Previous"
                links={metadata.previousQuestLinks}
                onSelectQuest={onSelectQuest}
            />
            <QuestLinkList
                label="Next"
                links={metadata.nextQuestLinks}
                onSelectQuest={onSelectQuest}
            />
            {convergesIntoQuestLink ? (
                <div className="questExplorer-metadataLinks">
                    <div className="questExplorer-metadataLinks__label">Converges</div>
                    <button
                        type="button"
                        className="questExplorer-linkButton"
                        onClick={() => onSelectQuest(convergesIntoQuestLink.questKey)}
                    >
                        {convergesIntoQuestLink.label}
                    </button>
                </div>
            ) : null}
        </aside>
    );
}
