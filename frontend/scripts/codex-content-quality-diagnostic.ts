import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import {
    createCodexContentQualityReport,
    formatCodexContentQualityReport,
} from "../src/lib/codex/codexContentQualityDiagnostics.ts";
import type { CodexEntry } from "../src/types/dataTypes";

type CodexExportFile = {
    exportKind?: string;
    entries?: CodexEntry[];
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

function argumentValue(name: string): string | undefined {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
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

async function main() {
    const defaultPath = resolve(process.cwd(), "../local-imports/codex");
    const inputPath = resolve(argumentValue("--input") ?? positionalInput() ?? defaultPath);
    const detailLimit = Number.parseInt(argumentValue("--limit") ?? "200", 10);
    const files = await collectJsonFiles(inputPath);
    const entries = (await Promise.all(files.map(readCodexEntries))).flat();
    const report = createCodexContentQualityReport(entries);

    console.log(formatCodexContentQualityReport(report, {
        detailLimit: Number.isFinite(detailLimit) ? detailLimit : 200,
    }));
}

await main();
