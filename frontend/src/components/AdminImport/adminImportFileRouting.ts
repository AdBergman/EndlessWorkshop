import type {
    DropManyResult,
    ImportModuleDefinition,
    ModuleMetaKV,
} from "./adminImportTypes";

export type ActionMode = "none" | "ready" | "importing";

export type CodexImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    exportKind?: string;
    entries?: unknown[];
};

export type CodexFileImportStatus =
    | "ready"
    | "importing"
    | "imported"
    | "failed"
    | "validation_error";

export type BulkExportFileStatus =
    | CodexFileImportStatus
    | "skipped";

export type CodexSelectedFile = {
    fileName: string;
    exportKind?: string;
    batch?: CodexImportFile;
    rawText?: string;
    meta?: ModuleMetaKV[];
    status: CodexFileImportStatus;
    error?: string;
    summary?: any | null;
};

export type BulkExportSelectedFile = {
    fileName: string;
    exportKind?: string;
    moduleId?: string;
    moduleTitle?: string;
    endpoint?: string;
    rawText?: string;
    meta?: ModuleMetaKV[];
    status: BulkExportFileStatus;
    error?: string;
    summary?: any | null;
};

export type AdminImportBadge = {
    text: string;
    cls: string;
};

const QUEST_EXPLORER_EXPORT_KIND = "quest_explorer";
const QUEST_IMPORT_MODULE_ID = "quests";
const QUEST_IMPORT_ENDPOINT = "/api/admin/import/quests/explorer";

const BULK_EXPORT_KIND_BY_MODULE_ID: Record<string, string> = {
    districts: "districts",
    factions: "factions",
    heroes: "heroes",
    improvements: "improvements",
    skills: "skills",
    techs: "tech",
    units: "units",
};

const BULK_EXPORT_ARRAY_FIELD_BY_MODULE_ID: Record<string, string> = {
    districts: "districts",
    factions: "factions",
    heroes: "units",
    improvements: "improvements",
    skills: "skills",
    techs: "techs",
    units: "units",
};

type QuestBulkEntry = {
    fileName: string;
    rawText: string;
    json: any;
    exportKind: string;
};

export function normalizedExportKind(json: any): string | undefined {
    const value = typeof json?.exportKind === "string" ? json.exportKind.trim().toLowerCase() : "";
    return value || undefined;
}

export function isQuestExportKind(exportKind: string | undefined): boolean {
    return exportKind === QUEST_EXPLORER_EXPORT_KIND;
}

export function createQuestBulkRows(entries: QuestBulkEntry[]): BulkExportSelectedFile[] {
    if (entries.length === 0) return [];

    if (entries.length === 1) {
        const explorer = entries[0];

        return [
            {
                fileName: explorer.fileName,
                exportKind: QUEST_EXPLORER_EXPORT_KIND,
                moduleId: QUEST_IMPORT_MODULE_ID,
                moduleTitle: "Quests",
                endpoint: QUEST_IMPORT_ENDPOINT,
                rawText: explorer.rawText,
                status: "ready",
            },
        ];
    }

    return entries.map((entry) => ({
        fileName: entry.fileName,
        exportKind: entry.exportKind,
        rawText: entry.rawText,
        status: "validation_error",
        error: `Quest import requires exactly one quest_explorer file; found ${entries.length} file(s).`,
    }));
}

export function findBulkExportModule(
    json: any,
    modules: Array<ImportModuleDefinition<any>>
): ImportModuleDefinition<any> | null {
    const exportKind = normalizedExportKind(json);

    if (exportKind) {
        return modules.find((candidate) => BULK_EXPORT_KIND_BY_MODULE_ID[candidate.id] === exportKind) ?? null;
    }

    return modules.find((candidate) => {
        const arrayField = BULK_EXPORT_ARRAY_FIELD_BY_MODULE_ID[candidate.id];
        return arrayField ? Array.isArray(json?.[arrayField]) : false;
    }) ?? null;
}

export function createBulkExportSelectedFiles(
    result: DropManyResult<any>,
    modules: Array<ImportModuleDefinition<any>>
): BulkExportSelectedFile[] {
    const loadedEntries = result.loaded.map((entry) => ({
        entry,
        exportKind: normalizedExportKind(entry.json),
    }));
    const questEntries = loadedEntries
        .filter((loadedEntry) => isQuestExportKind(loadedEntry.exportKind))
        .map((loadedEntry) => ({
            fileName: loadedEntry.entry.file.name,
            rawText: loadedEntry.entry.rawText,
            json: loadedEntry.entry.json as any,
            exportKind: loadedEntry.exportKind!,
        }));
    const questRows = createQuestBulkRows(questEntries);
    let questRowsInserted = false;

    const loadedFiles = loadedEntries.flatMap((loadedEntry) => {
        const entry = loadedEntry.entry;
        const json = entry.json as any;
        const exportKind = loadedEntry.exportKind;

        if (isQuestExportKind(exportKind)) {
            if (questRowsInserted) return [];
            questRowsInserted = true;
            return questRows;
        }

        const importModule = findBulkExportModule(json, modules);

        if (!importModule) {
            return [{
                fileName: entry.file.name,
                exportKind,
                rawText: entry.rawText,
                status: "skipped",
                error: exportKind
                    ? `Unsupported raw export kind "${exportKind}".`
                    : "Unsupported raw export file.",
            } satisfies BulkExportSelectedFile];
        }

        const nextMeta = importModule.getMeta ? importModule.getMeta(entry.json) : undefined;
        const err = importModule.validate ? importModule.validate(entry.json) : null;
        const supportedKind = BULK_EXPORT_KIND_BY_MODULE_ID[importModule.id];

        return [{
            fileName: entry.file.name,
            exportKind: exportKind ?? supportedKind,
            moduleId: importModule.id,
            moduleTitle: importModule.title,
            endpoint: importModule.endpoint,
            rawText: entry.rawText,
            meta: nextMeta,
            status: err ? "validation_error" : "ready",
            error: err ?? undefined,
        } satisfies BulkExportSelectedFile];
    });

    const parseErrors = result.errors.map((entry) => ({
        fileName: entry.file.name,
        status: "validation_error",
        error: entry.message,
    } satisfies BulkExportSelectedFile));

    return [...loadedFiles, ...parseErrors];
}

export function createCodexSelectedFiles<TJson>(
    result: DropManyResult<TJson>,
    module: ImportModuleDefinition<TJson>
): CodexSelectedFile[] {
    const loadedFiles = result.loaded.map((entry) => {
        const batch = entry.json as CodexImportFile;
        const nextMeta = module.getMeta ? module.getMeta(entry.json) : undefined;
        const err = module.validate ? module.validate(entry.json) : null;
        const exportKind = normalizedExportKind(batch);

        return {
            fileName: entry.file.name,
            exportKind,
            batch,
            rawText: entry.rawText,
            meta: nextMeta,
            status: err ? "validation_error" : "ready",
            error: err ?? undefined,
        } satisfies CodexSelectedFile;
    });

    const parseErrors = result.errors.map((entry) => ({
        fileName: entry.file.name,
        status: "validation_error",
        error: entry.message,
    } satisfies CodexSelectedFile));

    return applyCodexDuplicateValidation([...loadedFiles, ...parseErrors]);
}

export function applyCodexDuplicateValidation(files: CodexSelectedFile[]): CodexSelectedFile[] {
    const counts = new Map<string, number>();

    for (const file of files) {
        if (!file.exportKind || file.status === "validation_error") continue;
        counts.set(file.exportKind, (counts.get(file.exportKind) ?? 0) + 1);
    }

    return files.map((file) => {
        if (!file.exportKind) return file;
        if ((counts.get(file.exportKind) ?? 0) < 2) return file;

        return {
            ...file,
            status: "validation_error",
            error: `Duplicate exportKind "${file.exportKind}" selected. Each Codex file must be unique per exportKind.`,
        };
    });
}

export function getActionMode(args: { canImport: boolean; isImporting: boolean; isEnabled: boolean }): ActionMode {
    if (!args.isEnabled) return "none";
    if (args.isImporting) return "importing";
    if (args.canImport) return "ready";
    return "none";
}

export function getAdminImportBadge({
    isBulkExportsModule,
    isCodexModule,
    isEnabled,
    isImporting,
    bulkExportFiles,
    codexFiles,
    importStatus,
    hasDrop,
    hasValidationError,
}: {
    isBulkExportsModule: boolean;
    isCodexModule: boolean;
    isEnabled: boolean;
    isImporting: boolean;
    bulkExportFiles: BulkExportSelectedFile[];
    codexFiles: CodexSelectedFile[];
    importStatus: "idle" | "importing" | "success" | "error";
    hasDrop: boolean;
    hasValidationError: boolean;
}): AdminImportBadge {
    if (isBulkExportsModule) {
        if (!isEnabled) return { text: "Coming soon", cls: "admin-import-badge admin-import-badge--disabled" };
        if (isImporting) return { text: "Importing…", cls: "admin-import-badge admin-import-badge--busy" };
        if (bulkExportFiles.length === 0) return { text: "Not loaded", cls: "admin-import-badge" };
        if (bulkExportFiles.some((file) => file.status === "failed")) {
            return { text: "Failed", cls: "admin-import-badge admin-import-badge--err" };
        }
        if (bulkExportFiles.some((file) => file.status === "ready")) {
            return { text: "Ready", cls: "admin-import-badge admin-import-badge--ready" };
        }
        if (bulkExportFiles.some((file) => file.status === "validation_error")) {
            return { text: "Needs review", cls: "admin-import-badge admin-import-badge--err" };
        }
        if (bulkExportFiles.some((file) => file.status === "imported")) {
            return { text: "Imported", cls: "admin-import-badge admin-import-badge--ok" };
        }
        return { text: "Skipped", cls: "admin-import-badge" };
    }

    if (isCodexModule) {
        if (!isEnabled) return { text: "Coming soon", cls: "admin-import-badge admin-import-badge--disabled" };
        if (isImporting) return { text: "Importing…", cls: "admin-import-badge admin-import-badge--busy" };
        if (codexFiles.length === 0) return { text: "Not loaded", cls: "admin-import-badge" };
        if (codexFiles.some((file) => file.status === "validation_error")) {
            return { text: "Needs review", cls: "admin-import-badge admin-import-badge--err" };
        }
        if (codexFiles.some((file) => file.status === "failed")) {
            return { text: "Failed", cls: "admin-import-badge admin-import-badge--err" };
        }
        if (codexFiles.some((file) => file.status === "ready")) {
            return { text: "Ready", cls: "admin-import-badge admin-import-badge--ready" };
        }
        if (codexFiles.every((file) => file.status === "imported")) {
            return { text: "Imported", cls: "admin-import-badge admin-import-badge--ok" };
        }
    }

    if (!isEnabled) return { text: "Coming soon", cls: "admin-import-badge admin-import-badge--disabled" };
    if (importStatus === "importing") return { text: "Importing…", cls: "admin-import-badge admin-import-badge--busy" };
    if (importStatus === "success") return { text: "Imported", cls: "admin-import-badge admin-import-badge--ok" };
    if (importStatus === "error") return { text: "Failed", cls: "admin-import-badge admin-import-badge--err" };
    if (hasDrop && !hasValidationError) return { text: "Ready", cls: "admin-import-badge admin-import-badge--ready" };
    return { text: "Not loaded", cls: "admin-import-badge" };
}
