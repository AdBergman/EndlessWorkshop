import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
    createCodexReferenceDiagnosticReport,
    formatCodexReferenceDiagnosticReport,
} from "../src/lib/codex/codexReferenceDiagnosticReport.ts";
import type { CodexEntry } from "../src/types/dataTypes";

type CodexExportFile = {
    exportKind?: string;
    entries?: CodexEntry[];
};

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
    const exportKind = payload.exportKind?.trim() || "unknown";

    return (payload.entries ?? []).map((entry) => ({
        ...entry,
        exportKind: entry.exportKind?.trim() || exportKind,
        displayName: entry.displayName ?? entry.entryKey,
        descriptionLines: entry.descriptionLines ?? [],
        referenceKeys: entry.referenceKeys ?? [],
        publicContextKeys: entry.publicContextKeys ?? [],
    }));
}

async function main() {
    const defaultPath = resolve(process.cwd(), "../local-imports/codex");
    const inputPath = resolve(argumentValue("--input") ?? positionalInput() ?? defaultPath);
    const outputPath = argumentValue("--output");
    const limit = Number.parseInt(argumentValue("--limit") ?? "500", 10);
    const format = argumentValue("--format") ?? "markdown";
    const files = await collectJsonFiles(inputPath);
    const entries = (await Promise.all(files.map(readCodexEntries))).flat();
    const report = createCodexReferenceDiagnosticReport(entries);
    const output = format === "json"
        ? `${JSON.stringify(report, null, 2)}\n`
        : formatCodexReferenceDiagnosticReport(report, {
                limit: Number.isFinite(limit) ? limit : 500,
            });

    if (outputPath) {
        const resolvedOutputPath = resolve(outputPath);
        await mkdir(dirname(resolvedOutputPath), { recursive: true });
        await writeFile(resolvedOutputPath, output, "utf8");
        console.log(`Wrote ${resolvedOutputPath}`);
        return;
    }

    console.log(output);
}

await main();
