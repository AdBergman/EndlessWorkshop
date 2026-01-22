export interface EndGameMeta {
    version: string;
    generatedAtUtc: string;
    gameId: string;
}

/* -----------------------------
 * Tech order
 * ----------------------------- */

export interface TechOrderEntry {
    empireIndex: number;
    turn: number;
    technologyDefinitionName: string;
    technologyDisplayName: string;
}

export interface TechOrderExport {
    empireCount: number;
    entryCount: number;
    entries: TechOrderEntry[];
    [key: string]: unknown;
}

/* -----------------------------
 * All-stats (game-wide)
 * ----------------------------- */

export interface AllStatsTurnSnapshot {
    turn: number;
    score: number;
    technologies: number;
    cities: number;
    territories: number;
    [key: string]: unknown;
}

export interface AllStatsEmpire {
    empireIndex: number;

    factionKey?: string;
    factionDisplayName?: string;

    techCount?: number;
    finalEraIndex?: number;
    firstTurnPerEra?: number[];

    perTurn: AllStatsTurnSnapshot[];
    [key: string]: unknown;
}

export interface AllStatsGameMeta {
    difficulty?: string;
    mapSize?: string;
    gameSpeed?: string;
    mapType?: string;
    [key: string]: unknown;
}

export interface AllStatsVictory {
    actualVictoryCondition?: string;
    victoryPreset?: string;
    victoryConditionsEnabled?: unknown;
    [key: string]: unknown;
}

export interface AllStats {
    maxTurn: number;
    empireCount?: number;

    game?: AllStatsGameMeta;
    victory?: AllStatsVictory;

    empires: AllStatsEmpire[];

    topScoreEmpire: number;
    topScore: number;

    [key: string]: unknown;
}

/* -----------------------------
 * Root export
 * ----------------------------- */

export interface EndGameExport {
    meta: EndGameMeta;

    allStats: AllStats;
    cityBreakdown?: unknown;
    techOrder?: TechOrderExport;

    [key: string]: unknown;
}

/* -----------------------------
 * Parsing result wrapper
 * ----------------------------- */

export interface ParseWarning {
    code: string;
    message: string;
}

export interface ParseResult<T> {
    ok: boolean;
    data?: T;
    warnings: ParseWarning[];
    error?: string;
}