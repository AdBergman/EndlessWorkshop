export interface TechOrderEntryV1 {
    empireIndex: number;
    turn: number;
    technologyDefinitionName: string;
    technologyDisplayName: string;
}

export interface TechOrderExportV1 {
    version: string;
    generatedAtUtc: string;
    empireCount: number;
    entryCount: number;
    entries: TechOrderEntryV1[];
}

export interface EndGameExportV1 {
    version: string;
    generatedAtUtc: string;

    // Keep unknown for now; we’ll type these later as we implement views
    allStats?: unknown;
    cityBreakdown?: unknown;

    techOrder?: TechOrderExportV1;
}

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