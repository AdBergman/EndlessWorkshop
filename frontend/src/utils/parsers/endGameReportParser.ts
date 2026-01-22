import type {
    EndGameExport,
    ParseResult,
    ParseWarning,
    TechOrderEntry,
    TechOrderExport,
} from "../../types/endGameReport";

type Path = string;

/**
 * Supports dot-paths and bracket indices:
 * - "techOrder.entries[0].turn"
 * - "allStats.game.difficulty"
 */
function get(obj: any, path: Path): unknown {
    if (!path) return obj;

    const parts = path
        .split(".")
        .flatMap((seg) => seg.split(/\[|\]/).filter(Boolean)); // "entries[0]" -> ["entries","0"]

    let cur: any = obj;
    for (const key of parts) {
        if (cur == null) return undefined;

        if (/^\d+$/.test(key)) {
            const idx = Number(key);
            cur = Array.isArray(cur) ? cur[idx] : (cur as any)[idx];
        } else {
            cur = cur[key];
        }
    }
    return cur;
}

function keysPreview(v: unknown): string[] | null {
    if (!v || typeof v !== "object") return null;
    try {
        return Object.keys(v as any).slice(0, 40);
    } catch {
        return null;
    }
}

function typeOf(v: unknown): string {
    if (Array.isArray(v)) return "array";
    if (v === null) return "null";
    return typeof v;
}

function parentPath(path: Path): Path | "" {
    const i = path.lastIndexOf(".");
    if (i === -1) return "";
    return path.slice(0, i);
}

function parentObj(root: any, path: Path): any {
    const p = parentPath(path);
    return p ? get(root, p) : root;
}

function fail(root: any, path: Path, value: unknown, expected?: string): never {
    const parent = parentObj(root, path);
    const available = keysPreview(parent);

    console.error(`[schema] Missing/invalid required field: ${path}`, {
        expected: expected ?? "(unspecified)",
        got: typeOf(value),
        value,
        parentPath: parentPath(path) || "(root)",
        parentKeys: available,
    });

    const expectedTxt = expected ? ` expected=${expected};` : "";
    const gotTxt = ` got=${typeOf(value)}`;
    const keysTxt = available ? ` parentKeys=[${available.join(", ")}]` : "";

    throw new Error(`Missing/invalid required field: ${path};${expectedTxt}${gotTxt}${keysTxt}`);
}

function reqString(root: any, path: Path): string {
    const v = get(root, path);
    if (typeof v === "string" && v.trim()) return v;
    return fail(root, path, v, "non-empty string");
}

function reqNumber(root: any, path: Path): number {
    const v = get(root, path);
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return fail(root, path, v, "finite number");
}

function reqArray<T = any>(root: any, path: Path): T[] {
    const v = get(root, path);
    if (Array.isArray(v)) return v as T[];
    return fail(root, path, v, "array");
}

function requireAll(root: any, paths: Path[]) {
    for (const p of paths) {
        const v = get(root, p);
        if (v === undefined) fail(root, p, v, "present");
    }
}

/* ----------------------------
 * Tech order (optional section)
 * ---------------------------- */

function isLocKey(s: unknown): s is string {
    return typeof s === "string" && s.startsWith("%");
}

function guessEmpireCount(entries: TechOrderEntry[]): number {
    if (entries.length === 0) return 0;
    let max = -1;
    for (const e of entries) if (e.empireIndex > max) max = e.empireIndex;
    return max + 1;
}

function parseTechOrder(rawRoot: any, warnings: ParseWarning[]): TechOrderExport | undefined {
    const sectionPath = "techOrder";
    const section = get(rawRoot, sectionPath);

    // Optional section (if absent, exporter didn't include it — that's fine)
    if (!section || typeof section !== "object") return undefined;

    const rawEntries = reqArray<any>(rawRoot, `${sectionPath}.entries`);

    const entries: TechOrderEntry[] = rawEntries.map((_, i) => {
        const base = `${sectionPath}.entries[${i}]`;

        const empireIndex = reqNumber(rawRoot, `${base}.empireIndex`);
        const turn = reqNumber(rawRoot, `${base}.turn`);
        const defName = reqString(rawRoot, `${base}.technologyDefinitionName`);

        const dn = get(rawRoot, `${base}.technologyDisplayName`);
        const displayName = typeof dn === "string" && dn.trim() ? dn.trim() : defName;

        // If exporter ever leaks localization keys, warn + fall back safely.
        if (isLocKey(displayName)) {
            warnings.push({
                code: "techorder_loc_key_displayname",
                message: `TechOrder displayName is a localization key for '${defName}'. Falling back to definition name.`,
            });
        }

        return {
            empireIndex,
            turn,
            technologyDefinitionName: defName,
            technologyDisplayName: isLocKey(displayName) ? defName : displayName,
        };
    });

    const empireCountRaw = get(rawRoot, `${sectionPath}.empireCount`);
    const entryCountRaw = get(rawRoot, `${sectionPath}.entryCount`);

    return {
        empireCount: typeof empireCountRaw === "number" ? empireCountRaw : guessEmpireCount(entries),
        entryCount: typeof entryCountRaw === "number" ? entryCountRaw : entries.length,
        entries,
    };
}

/* ----------------------------
 * Required root contract (current truth)
 * ---------------------------- */

// Per your current exporter: meta fields live at ROOT (not inside `meta`).
const REQUIRED_ROOT_META: Path[] = ["version", "generatedAtUtc", "gameId"];

const REQUIRED_FOR_DAY1: Path[] = [
    "allStats",
    "allStats.maxTurn",
    "allStats.game",
    "allStats.game.difficulty",
    "allStats.game.mapSize",
    "allStats.game.gameSpeed",
    "allStats.topScoreEmpire",
    "allStats.topScore",
    "allStats.empires",
];

export function parseEndGameExport(jsonText: string): ParseResult<EndGameExport> {
    const warnings: ParseWarning[] = [];

    try {
        const raw = JSON.parse(jsonText);
        if (!raw || typeof raw !== "object") {
            return { ok: false, warnings, error: "JSON root must be an object." };
        }

        requireAll(raw, [...REQUIRED_ROOT_META, ...REQUIRED_FOR_DAY1]);

        const version = reqString(raw, "version");
        if (version !== "1.0") {
            console.error(`[schema] Expected version "1.0" but got: ${version}`);
        }

        const report: EndGameExport = {
            // We still normalize into report.meta for the app’s internal shape,
            // but we do NOT require a 'meta' object in the JSON.
            meta: {
                version,
                generatedAtUtc: reqString(raw, "generatedAtUtc"),
                gameId: reqString(raw, "gameId"),
            },
            allStats: get(raw, "allStats") as any,
            cityBreakdown: get(raw, "cityBreakdown"),
            techOrder: parseTechOrder(raw, warnings),
        };

        return { ok: true, data: report, warnings };
    } catch (e: any) {
        return { ok: false, warnings, error: e?.message ?? "Invalid JSON." };
    }
}