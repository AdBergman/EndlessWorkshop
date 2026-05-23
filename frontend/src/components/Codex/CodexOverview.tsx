type CodexOverviewOption = {
    kind: string;
    label: string;
    count: number;
};

type Props = {
    options: CodexOverviewOption[];
    onSelectKind: (kind: string) => void;
};

type OverviewShelf = {
    id: string;
    title: string;
    description: string;
    kinds: string[];
};

const KIND_DESCRIPTIONS: Record<string, string> = {
    abilities: "Combat traits, passives, and tactical rules.",
    councilors: "Governors, advisors, and political specialists.",
    districts: "City tiles, exploitations, and terrain infrastructure.",
    equipment: "Hero gear, relics, and battlefield artifacts.",
    factions: "Major empires and their defining systems.",
    heroes: "Named leaders, commanders, and recruitable champions.",
    improvements: "Constructed city upgrades and economic engines.",
    minorfactions: "Regional peoples, villages, and protectorates.",
    populations: "Citizen groups and settlement identities.",
    quests: "Faction, world, and event quest records.",
    tech: "Technologies, unlocks, and progression systems.",
    traits: "Faction, hero, and systemic modifiers.",
    units: "Military units, heroes, and evolution lines.",
};

const OVERVIEW_SHELVES: OverviewShelf[] = [
    {
        id: "world",
        title: "World & Factions",
        description: "Empires, peoples, quest records, and settlement identities.",
        kinds: ["factions", "minorfactions", "populations", "quests"],
    },
    {
        id: "progression",
        title: "Progression",
        description: "Technologies, districts, improvements, and city-building unlocks.",
        kinds: ["tech", "districts", "improvements"],
    },
    {
        id: "people",
        title: "People & Forces",
        description: "Commanders, units, councilors, and battlefield rosters.",
        kinds: ["heroes", "units", "councilors"],
    },
    {
        id: "systems",
        title: "Systems & Items",
        description: "Rules, equipment, traits, abilities, and modifiers.",
        kinds: ["abilities", "traits", "equipment"],
    },
];

function descriptionFor(kind: string): string {
    return KIND_DESCRIPTIONS[kind] ?? "Indexed game-data records.";
}

export default function CodexOverview({ options, onSelectKind }: Props) {
    const totalCount = options.reduce((sum, option) => sum + option.count, 0);
    const optionsByKind = new Map(options.map((option) => [option.kind, option]));
    const shelvedKinds = new Set(OVERVIEW_SHELVES.flatMap((shelf) => shelf.kinds));
    const shelves = OVERVIEW_SHELVES
        .map((shelf) => ({
            ...shelf,
            options: shelf.kinds.map((kind) => optionsByKind.get(kind)).filter((option): option is CodexOverviewOption => Boolean(option)),
        }))
        .filter((shelf) => shelf.options.length > 0);
    const additionalOptions = options.filter((option) => !shelvedKinds.has(option.kind));

    if (additionalOptions.length > 0) {
        shelves.push({
            id: "additional",
            title: "Additional Records",
            description: "Imported record families that do not yet have a dedicated archive shelf.",
            kinds: additionalOptions.map((option) => option.kind),
            options: additionalOptions,
        });
    }

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
                    <small>records</small>
                </div>
            </div>
            <p className="codex-overview__intro">
                Browse the archive by record family, then inspect descriptions and resolved related links.
            </p>

            <div className="codex-overview__shelves" aria-label="Codex kinds">
                {shelves.map((shelf) => {
                    const shelfCount = shelf.options.reduce((sum, option) => sum + option.count, 0);
                    const headingId = `codex-overview-shelf-${shelf.id}`;

                    return (
                        <section className="codex-overview__shelf" aria-labelledby={headingId} key={shelf.id}>
                            <div className="codex-overview__shelfHeader">
                                <div>
                                    <h3 id={headingId}>{shelf.title}</h3>
                                    <p>{shelf.description}</p>
                                </div>
                                <span>{shelfCount}</span>
                            </div>

                            <div className="codex-overview__index">
                                {shelf.options.map((option) => (
                                    <button
                                        key={option.kind}
                                        type="button"
                                        className="codex-overview__row"
                                        onClick={() => onSelectKind(option.kind)}
                                    >
                                        <span className="codex-overview__rowTop">
                                            <span className="codex-overview__kind">{option.label}</span>
                                            <span className="codex-overview__count">{option.count}</span>
                                        </span>
                                        <span className="codex-overview__description">{descriptionFor(option.kind)}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </section>
    );
}
