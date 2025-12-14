import {
    EndGameExportV1,
    ParseResult,
    ParseWarning,
    TechOrderEntryV1,
    TechOrderExportV1,
} from "../../types/endGameReport";

function isLocKey(s: unknown): s is string {
    return typeof s === "string" && s.startsWith("%");
}

function parseTechOrderSection(rawTechOrder: any, warnings: ParseWarning[]): TechOrderExportV1 | undefined {
    if (!rawTechOrder || typeof rawTechOrder !== "object") return undefined;

    // Support both casing styles
    const version = rawTechOrder.version ?? rawTechOrder.Version;
    const generatedAtUtc = rawTechOrder.generatedAtUtc ?? rawTechOrder.GeneratedAtUtc;
    const empireCount = rawTechOrder.empireCount ?? rawTechOrder.EmpireCount;
    const entryCount = rawTechOrder.entryCount ?? rawTechOrder.EntryCount;
    const rawEntries = rawTechOrder.entries ?? rawTechOrder.Entries;

    if (!Array.isArray(rawEntries)) {
        warnings.push({
            code: "techorder_missing_entries",
            message: "techOrder section exists but 'Entries/entries' is missing or not an array.",
        });
        return undefined;
    }

    const entries: TechOrderEntryV1[] = rawEntries
        .map((e: any): TechOrderEntryV1 | null => {
            const empireIndex = e.empireIndex ?? e.EmpireIndex;
            const turn = e.turn ?? e.Turn;
            const defName = e.technologyDefinitionName ?? e.TechnologyDefinitionName;
            const displayName = e.technologyDisplayName ?? e.TechnologyDisplayName;

            if (typeof empireIndex !== "number" || typeof turn !== "number" || typeof defName !== "string") {
                return null;
            }

            const safeDisplay = typeof displayName === "string" ? displayName : defName;

            if (isLocKey(safeDisplay)) {
                warnings.push({
                    code: "techorder_loc_key_displayname",
                    message: `TechOrder has localization-key display name for '${defName}' (will show fallback).`,
                });
            }

            return {
                empireIndex,
                turn,
                technologyDefinitionName: defName,
                technologyDisplayName: safeDisplay,
            };
        })
        .filter((x: TechOrderEntryV1 | null): x is TechOrderEntryV1 => x !== null);

    const final: TechOrderExportV1 = {
        version: typeof version === "string" ? version : "unknown",
        generatedAtUtc: typeof generatedAtUtc === "string" ? generatedAtUtc : "unknown",
        empireCount: typeof empireCount === "number" ? empireCount : guessEmpireCount(entries),
        entryCount: typeof entryCount === "number" ? entryCount : entries.length,
        entries,
    };

    return final;
}

function guessEmpireCount(entries: TechOrderEntryV1[]): number {
    if (entries.length === 0) return 0;
    const maxIdx = Math.max(...entries.map(e => e.empireIndex));
    return maxIdx + 1;
}

export function parseEndGameExport(jsonText: string): ParseResult<EndGameExportV1> {
    const warnings: ParseWarning[] = [];

    try {
        const raw = JSON.parse(jsonText);

        if (!raw || typeof raw !== "object") {
            return { ok: false, warnings, error: "JSON root must be an object." };
        }

        const version = (raw as any).version;
        const generatedAtUtc = (raw as any).generatedAtUtc;

        if (typeof version !== "string") {
            warnings.push({ code: "missing_version", message: "Missing or invalid 'version'." });
        }

        if (typeof generatedAtUtc !== "string") {
            warnings.push({ code: "missing_generatedAtUtc", message: "Missing or invalid 'generatedAtUtc'." });
        }

        const techOrder = parseTechOrderSection((raw as any).techOrder, warnings);

        const result: EndGameExportV1 = {
            version: typeof version === "string" ? version : "unknown",
            generatedAtUtc: typeof generatedAtUtc === "string" ? generatedAtUtc : "unknown",
            allStats: (raw as any).allStats,
            cityBreakdown: (raw as any).cityBreakdown,
            techOrder,
        };

        if (!techOrder) {
            warnings.push({
                code: "missing_techorder",
                message: "No techOrder section was parsed (Tech Progress will be empty).",
            });
        }

        return { ok: true, data: result, warnings };
    } catch (e: any) {
        return { ok: false, warnings, error: e?.message ?? "Invalid JSON." };
    }
}