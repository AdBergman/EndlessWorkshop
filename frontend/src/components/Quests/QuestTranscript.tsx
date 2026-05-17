import type { QuestTranscriptBlockModel } from "@/features/quests/questExplorerTypes";

type QuestTranscriptProps = {
    blocks: QuestTranscriptBlockModel[];
};

export default function QuestTranscript({ blocks }: QuestTranscriptProps) {
    return (
        <section className="questExplorer-transcriptShell" aria-labelledby="quest-transcript-heading">
            <details className="questExplorer-transcript">
                <summary>
                    <span className="questExplorer-sectionLabel" id="quest-transcript-heading">
                        Archive Transcript
                    </span>
                </summary>

                {blocks.length === 0 ? (
                    <p className="questExplorer-muted">No transcript lines are attached to this selection.</p>
                ) : (
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
                )}
            </details>
        </section>
    );
}
