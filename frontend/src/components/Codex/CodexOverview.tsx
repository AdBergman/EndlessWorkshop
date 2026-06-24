import { CodexKindIcon } from "@/features/icons/CodexKindIcon";

type CodexOverviewOption = {
    kind: string;
    label: string;
    count: number;
};

export type CodexOverviewFreshness = {
    mainLine: string;
    snapshotDate: string;
};

type Props = {
    dataFreshness?: CodexOverviewFreshness | null;
    isLoading?: boolean;
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

const LOADING_PLACEHOLDERS = Array.from({ length: 8 }, (_, index) => index);

export default function CodexOverview({ dataFreshness, isLoading = false, options, onSelectKind }: Props) {
    return (
        <section className="codex-overview" aria-labelledby="codex-overview-title">
            <div className="codex-overview__header">
                <div>
                    <h2 className="codex-sectionLabel codex-overview__label" id="codex-overview-title">
                        Encyclopedia Index
                    </h2>
                    <p className="codex-overview__intro">
                        Browse categories, then inspect descriptions and resolved related links.
                    </p>
                </div>
                <div
                    className={`codex-overview__categoryTotal ${
                        isLoading ? "codex-overview__categoryTotal--loading" : ""
                    }`}
                    aria-label={isLoading ? "Loading categories" : `${options.length} categories`}
                >
                    {isLoading ? (
                        <>
                            <span aria-hidden="true">—</span>
                            <small>loading</small>
                        </>
                    ) : (
                        <>
                            <span>{options.length}</span>
                            <small>categories</small>
                        </>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div
                    className="codex-overview__index codex-overview__index--loading"
                    aria-busy="true"
                    aria-label="Codex category index loading"
                >
                    {LOADING_PLACEHOLDERS.map((index) => (
                        <div
                            key={index}
                            className="codex-overview__row codex-overview__row--loading"
                            aria-hidden="true"
                        >
                            <span className="codex-overview__rowTop">
                                <span className="codex-overview__kindWrap">
                                    <span className="codex-overview__skeletonIcon" />
                                    <span className="codex-overview__skeletonText codex-overview__skeletonText--title" />
                                </span>
                                <span className="codex-overview__skeletonText codex-overview__skeletonText--count" />
                            </span>
                            <span className="codex-overview__skeletonText codex-overview__skeletonText--description" />
                        </div>
                    ))}
                    <p className="codex-overview__loadingText">Loading encyclopedia categories…</p>
                </div>
            ) : (
                <div className="codex-overview__index" aria-label="Codex category index">
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
            )}

            {dataFreshness ? (
                <aside className="codex-overview__freshness" aria-label="Game data version">
                    <div className="codex-overview__freshnessPrimary">
                        <span className="codex-overview__freshnessLabel">Game Data Version</span>
                        <strong>{dataFreshness.mainLine}</strong>
                        <span>Snapshot date: {dataFreshness.snapshotDate}</span>
                    </div>
                    <p>
                        Data shown on Endless Workshop is generated from game files. Snapshot date indicates when this
                        data was last extracted from the game.
                    </p>
                </aside>
            ) : null}
        </section>
    );
}
