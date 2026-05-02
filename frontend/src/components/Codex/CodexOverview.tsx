type CodexOverviewOption = {
    kind: string;
    label: string;
    count: number;
};

type Props = {
    options: CodexOverviewOption[];
    onSelectKind: (kind: string) => void;
};

export default function CodexOverview({ options, onSelectKind }: Props) {
    return (
        <section className="codex-overview" aria-labelledby="codex-overview-title">
            <div className="codex-sectionLabel">Encyclopedia index</div>
            <h2 className="codex-detail__title codex-overview__title" id="codex-overview-title">
                Codex Overview
            </h2>
            <p className="codex-overview__intro">
                Codex is a searchable encyclopedia of game data.
            </p>

            <div className="codex-overview__index" aria-label="Codex kinds">
                {options.map((option) => (
                    <button
                        key={option.kind}
                        type="button"
                        className="codex-overview__row"
                        onClick={() => onSelectKind(option.kind)}
                    >
                        <span className="codex-overview__kind">{option.label}</span>
                        <span className="codex-overview__count">{option.count}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
