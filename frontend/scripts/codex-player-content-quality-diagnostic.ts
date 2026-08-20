import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
    createCodexPlayerContentQualityReport,
    formatCodexPlayerContentQualityReport,
    type CodexPlayerContentRichSource,
} from "../src/lib/codex/codexPlayerContentQualityDiagnostics.ts";
import type { CodexEntry } from "../src/types/dataTypes";

type CodexExportFile = {
    exportKind?: string;
    entries?: CodexEntry[];
};

type RichRecordIndex = Record<string, Record<string, CodexPlayerContentRichSource>>;

const RICH_COLLECTION_KIND_BY_ROOT: Record<string, string> = {
    districts: "districts",
    improvements: "improvements",
    populations: "populations",
    techs: "tech",
    units: "units",
};

async function collectJsonFiles(path: string): Promise<string[]> {
    const info = await stat(path);
    if (info.isFile()) return [path];

    const children = await readdir(path);
    return children
        .filter((file) => file.endsWith(".json"))
        .sort((left, right) => left.localeCompare(right))
        .map((file) => resolve(path, file));
}

async function readCodexEntries(file: string): Promise<CodexEntry[]> {
    const payload = JSON.parse(await readFile(file, "utf8")) as CodexExportFile;
    const exportKind = payload.exportKind?.trim();

    return (payload.entries ?? []).map((entry) => ({
        ...entry,
        exportKind: entry.exportKind?.trim() || exportKind || "unknown",
        descriptionLines: entry.descriptionLines ?? [],
        referenceKeys: entry.referenceKeys ?? [],
    }));
}

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeKind(value: unknown): string {
    return normalize(value).toLowerCase();
}

function putRichRecord(
    index: RichRecordIndex,
    kind: string,
    key: string,
    source: CodexPlayerContentRichSource
) {
    const normalizedKind = normalizeKind(kind);
    const normalizedKey = normalize(key);
    if (!normalizedKind || !normalizedKey) return;

    if (!index[normalizedKind]) index[normalizedKind] = {};
    index[normalizedKind][normalizedKey] = source;
}

function indexRichRecord(index: RichRecordIndex, kind: string, record: Record<string, unknown>, sourcePath: string) {
    const source = { kind, record, sourcePath };
    const keys = [
        record.entryKey,
        record.abilityKey,
        record.constructibleKey,
        record.districtKey,
        record.factionKey,
        record.heroKey,
        record.improvementKey,
        record.populationKey,
        record.skillKey,
        record.techKey,
        record.unitKey,
    ];

    for (const key of keys) {
        putRichRecord(index, kind, normalize(key), source);
    }
}

function richFactionCodexKind(record: Record<string, unknown>): string {
    return normalizeKind(record.factionKind) === "minor" ? "minorfactions" : "factions";
}

function richCodexKindForRoot(file: string, root: string): string | undefined {
    if (root === "entries" && file.includes("abilities")) return "abilities";
    if (root === "units" && file.includes("heroes")) return "heroes";

    return RICH_COLLECTION_KIND_BY_ROOT[root];
}

async function readRichRecords(path: string): Promise<RichRecordIndex> {
    const index: RichRecordIndex = {};
    const files = await collectJsonFiles(path);

    for (const file of files) {
        const payload = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
        for (const [root, value] of Object.entries(payload)) {
            if (!Array.isArray(value)) continue;
            if (root === "factions") {
                for (const record of value) {
                    if (record && typeof record === "object") {
                        const objectRecord = record as Record<string, unknown>;
                        indexRichRecord(index, richFactionCodexKind(objectRecord), objectRecord, file);
                    }
                }
                continue;
            }

            const kind = richCodexKindForRoot(file, root);
            if (!kind) continue;

            for (const record of value) {
                if (record && typeof record === "object") {
                    indexRichRecord(index, kind, record as Record<string, unknown>, file);
                }
            }
        }
    }

    return index;
}

function argumentValue(name: string): string | undefined {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string): boolean {
    return process.argv.includes(name);
}

function positionalInput(): string | undefined {
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg.startsWith("--")) {
            index += 1;
            continue;
        }

        return arg;
    }

    return undefined;
}

async function writeOutput(path: string, text: string) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text);
}

async function main() {
    const defaultCodexPath = resolve(process.cwd(), "../local-imports/codex");
    const defaultRichPath = resolve(process.cwd(), "../local-imports/exports");
    const inputPath = resolve(argumentValue("--input") ?? positionalInput() ?? defaultCodexPath);
    const richInput = argumentValue("--rich-input");
    const richInputPath = richInput === "none" ? null : resolve(richInput ?? defaultRichPath);
    const detailLimit = Number.parseInt(argumentValue("--limit") ?? "200", 10);
    const format = argumentValue("--format") ?? "text";
    const outputPath = argumentValue("--output");
    const files = await collectJsonFiles(inputPath);
    const entries = (await Promise.all(files.map(readCodexEntries))).flat();
    const richRecordsByKindKey = hasFlag("--no-rich") || richInputPath === null
        ? undefined
        : await readRichRecords(richInputPath);
    const report = createCodexPlayerContentQualityReport(entries, { richRecordsByKindKey });
    const output = format === "json"
        ? `${JSON.stringify(report, null, 2)}\n`
        : formatCodexPlayerContentQualityReport(report, {
            detailLimit: Number.isFinite(detailLimit) ? detailLimit : 200,
        });

    if (outputPath) {
        await writeOutput(resolve(outputPath), output);
    } else {
        console.log(output);
    }
}

await main();
