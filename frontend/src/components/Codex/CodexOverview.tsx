import { CodexKindIcon } from "@/features/icons/CodexKindIcon";

type CodexOverviewOption = {
    kind: string;
    label: string;
    count: number;
};

type Props = {
    options: CodexOverviewOption[];
    onSelectKind: (kind: string) => void;
};

const KIND_DESCRIPTIONS: Record<string, string> = {
    abilities: "Combat traits, passives, and tactical rules.",
    actions: "Army, empire, and faction actions.",
    counciloreffects: "Reference list of councilor mechanics and bonuses.",
    councilors: "Governors, advisors, and political specialists.",
    districts: "City tiles, exploitations, and terrain infrastructure.",
    diplomatictreaties: "Diplomatic declarations, treaties, and war states.",
    extractors: "Resource extraction districts and upgrades.",
    equipment: "Hero gear, relics, and battlefield artifacts.",
    factions: "Major empires and their defining systems.",
    heroes: "Named leaders, commanders, and recruitable champions.",
    improvements: "Constructed city upgrades and economic engines.",
    minorfactions: "Regional peoples, villages, and protectorates.",
    partnereffects: "Reference list of companion and partnership bonuses.",
    populations: "Citizen groups and settlement identities.",
    quests: "Faction, world, and event questlines.",
    resources: "Strategic and luxury resources with exact extractor links.",
    statuses: "Public conditions, reputation effects, and timed effects.",
    tech: "Technologies, unlocks, and progression systems.",
    traits: "Faction, hero, and systemic modifiers.",
    units: "Military units, heroes, and evolution lines.",
};

function descriptionFor(kind: string): string {
    return KIND_DESCRIPTIONS[kind] ?? "Indexed game entries.";
}

export default function CodexOverview({ options, onSelectKind }: Props) {
    const totalCount = options.reduce((sum, option) => sum + option.count, 0);

    return (
        <section className="codex-overview" aria-labelledby="codex-overview-title">
            <div className="codex-overview__hero">
                <div>
                    <div className="codex-sectionLabel">Encyclopedia index</div>
                    <h2 className="codex-detail__title codex-overview__title" id="codex-overview-title">
                        Codex Overview
                    </h2>
                </div>
                <div className="codex-overview__total">
                    <span>{totalCount}</span>
                    <small>entries</small>
                </div>
            </div>
            <p className="codex-overview__intro">
                Browse by category, then inspect descriptions and resolved related links.
            </p>

            <div className="codex-overview__indexHeader">
                <h3>Categories</h3>
                <span>{options.length}</span>
            </div>

            <div className="codex-overview__index" aria-label="Codex kinds">
                {options.map((option) => (
                    <button
                        key={option.kind}
                        type="button"
                        className="codex-overview__row"
                        onClick={() => onSelectKind(option.kind)}
                        aria-label={`${option.label} ${option.count} ${descriptionFor(option.kind)}`}
                    >
                        <span className="codex-overview__rowTop">
                            <span className="codex-overview__kindWrap">
                                <CodexKindIcon
                                    kind={option.kind}
                                    label={option.label}
                                    className="codex-kindIcon codex-kindIcon--overview"
                                    size={22}
                                />
                                <span className="codex-overview__kind">{option.label}</span>
                            </span>
                            <span className="codex-overview__count">{option.count}</span>
                        </span>
                        <span className="codex-overview__description">{descriptionFor(option.kind)}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
