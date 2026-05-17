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
                {links.map((link, index) => (
                    <button
                        type="button"
                        className="questExplorer-linkButton"
                        key={`${link.provenance}:${link.questKey}:${index}`}
                        onClick={() => onSelectQuest(link.questKey)}
                    >
                        <span className="questExplorer-linkButton__main">
                            <span className="questExplorer-linkButton__label">{link.label}</span>
                            <span className="questExplorer-provenanceBadge">{link.provenanceLabel}</span>
                        </span>
                        {link.contextLabel ? (
                            <span className="questExplorer-linkButton__context">{link.contextLabel}</span>
                        ) : null}
                        {link.debugLabel ? (
                            <span className="questExplorer-linkButton__debug">{link.debugLabel}</span>
                        ) : null}
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
                label="Listed previous"
                links={metadata.previousQuestLinks}
                onSelectQuest={onSelectQuest}
            />
            <QuestLinkList
                label="Quest graph next"
                links={metadata.nextQuestLinks}
                onSelectQuest={onSelectQuest}
            />
            {convergesIntoQuestLink ? (
                <div className="questExplorer-metadataLinks">
                    <div className="questExplorer-metadataLinks__label">Converges into</div>
                    <button
                        type="button"
                        className="questExplorer-linkButton"
                        onClick={() => onSelectQuest(convergesIntoQuestLink.questKey)}
                    >
                        <span className="questExplorer-linkButton__main">
                            <span className="questExplorer-linkButton__label">{convergesIntoQuestLink.label}</span>
                            <span className="questExplorer-provenanceBadge">
                                {convergesIntoQuestLink.provenanceLabel}
                            </span>
                        </span>
                        {convergesIntoQuestLink.contextLabel ? (
                            <span className="questExplorer-linkButton__context">
                                {convergesIntoQuestLink.contextLabel}
                            </span>
                        ) : null}
                        {convergesIntoQuestLink.debugLabel ? (
                            <span className="questExplorer-linkButton__debug">{convergesIntoQuestLink.debugLabel}</span>
                        ) : null}
                    </button>
                </div>
            ) : null}
        </aside>
    );
}
