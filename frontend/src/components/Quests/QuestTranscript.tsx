import type { QuestTranscriptBlockModel } from "@/features/quests/questExplorerTypes";

type QuestTranscriptProps = {
    blocks: QuestTranscriptBlockModel[];
    heading?: string;
    variant?: "disclosure" | "flow";
};

function TranscriptContent({ blocks }: { blocks: QuestTranscriptBlockModel[] }) {
    if (blocks.length === 0) {
        return <p className="questExplorer-muted">No transcript lines are attached to this selection.</p>;
    }

    return (
        <div className="questExplorer-transcriptBlocks">
            {blocks.map((block) => (
                <article className="questExplorer-transcriptBlock" key={block.identity}>
                    <header className="questExplorer-transcriptBlock__header">
                        <div>
                            <h4>{block.title}</h4>
                            {block.archiveLabel ? <span>{block.archiveLabel}</span> : null}
                        </div>
                        {block.phaseLabel ? (
                            <span className="questExplorer-pill">{block.phaseLabel}</span>
                        ) : null}
                    </header>

                    {block.lines.length === 0 ? (
                        <p className="questExplorer-muted">This archive block has no public lines.</p>
                    ) : (
                        <div className="questExplorer-transcriptRows">
                            {block.lines.map((line) => (
                                <div className="questExplorer-transcriptRow" key={line.id}>
                                    <div className="questExplorer-transcriptRow__meta">
                                        <span>{line.speakerLabel || line.role || "Archive"}</span>
                                        {line.sourceLineIndex !== null ? (
                                            <span>{`Line ${line.sourceLineIndex}`}</span>
                                        ) : null}
                                    </div>
                                    <p>{line.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}

export default function QuestTranscript({
    blocks,
    heading = "Archive Transcript",
    variant = "disclosure",
}: QuestTranscriptProps) {
    const headingId = variant === "flow" ? "quest-lore-transcript-heading" : "quest-transcript-heading";

    if (variant === "flow") {
        return (
            <section
                className="questExplorer-transcriptShell questExplorer-transcriptShell--flow"
                aria-label="Lore transcript"
            >
                <div className="questExplorer-transcript">
                    <div className="questExplorer-sectionLabel" id={headingId}>
                        {heading}
                    </div>
                    <TranscriptContent blocks={blocks} />
                </div>
            </section>
        );
    }

    return (
        <section className="questExplorer-transcriptShell" aria-labelledby={headingId}>
            <details className="questExplorer-transcript">
                <summary>
                    <span className="questExplorer-sectionLabel" id={headingId}>
                        {heading}
                    </span>
                </summary>

                <TranscriptContent blocks={blocks} />
            </details>
        </section>
    );
}
