import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JsonDropzone from "./JsonDropzone";
import { DropManyResult, DropResult, ImportModuleDefinition, ImportState, ModuleMetaKV } from "./adminImportTypes";
import { refreshStoresAfterAdminImport } from "./adminImportRefresh";

function nowUtcIso() {
    return new Date().toISOString();
}

type ActionMode = "none" | "ready" | "importing";

type CodexImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    exportKind?: string;
    entries?: unknown[];
};

type CodexFileImportStatus =
    | "ready"
    | "importing"
    | "imported"
    | "failed"
    | "validation_error";

type BulkExportFileStatus =
    | CodexFileImportStatus
    | "skipped";

type CodexSelectedFile = {
    fileName: string;
    exportKind?: string;
    batch?: CodexImportFile;
    rawText?: string;
    meta?: ModuleMetaKV[];
    status: CodexFileImportStatus;
    error?: string;
    summary?: any | null;
};

type BulkExportSelectedFile = {
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

const QUEST_GRAPH_EXPORT_KIND = "quest_graph";
const QUEST_DIALOG_EXPORT_KIND = "quest_dialog";
const QUEST_PAIR_EXPORT_LABEL = "quest_graph + quest_dialog";
const QUEST_IMPORT_MODULE_ID = "quests";
const QUEST_IMPORT_ENDPOINT = "/api/admin/import/quests";

const BULK_EXPORT_KIND_BY_MODULE_ID: Record<string, string> = {
    districts: "districts",
    improvements: "improvements",
    techs: "tech",
    units: "units",
};

const BULK_EXPORT_ARRAY_FIELD_BY_MODULE_ID: Record<string, string> = {
    districts: "districts",
    improvements: "improvements",
    techs: "techs",
    units: "units",
};

function normalizedExportKind(json: any): string | undefined {
    const value = typeof json?.exportKind === "string" ? json.exportKind.trim().toLowerCase() : "";
    return value || undefined;
}

function isQuestExportKind(exportKind: string | undefined) {
    return exportKind === QUEST_GRAPH_EXPORT_KIND || exportKind === QUEST_DIALOG_EXPORT_KIND;
}

type QuestBulkEntry = {
    fileName: string;
    rawText: string;
    json: any;
    exportKind: string;
};

function questPairValidationError(graphCount: number, dialogCount: number) {
    if (graphCount === 0) {
        return "Quest import requires both quest_graph and quest_dialog files. Missing quest_graph file.";
    }
    if (dialogCount === 0) {
        return "Quest import requires both quest_graph and quest_dialog files. Missing quest_dialog file.";
    }
    return `Quest import requires exactly one quest_graph and one quest_dialog file; found ${graphCount} graph file(s) and ${dialogCount} dialog file(s).`;
}

function createQuestBulkRows(entries: QuestBulkEntry[]): BulkExportSelectedFile[] {
    if (entries.length === 0) return [];

    const graphEntries = entries.filter((entry) => entry.exportKind === QUEST_GRAPH_EXPORT_KIND);
    const dialogEntries = entries.filter((entry) => entry.exportKind === QUEST_DIALOG_EXPORT_KIND);

    if (graphEntries.length === 1 && dialogEntries.length === 1) {
        const graph = graphEntries[0];
        const dialog = dialogEntries[0];

        return [
            {
                fileName: `${graph.fileName} + ${dialog.fileName}`,
                exportKind: QUEST_PAIR_EXPORT_LABEL,
                moduleId: QUEST_IMPORT_MODULE_ID,
                moduleTitle: "Quests",
                endpoint: QUEST_IMPORT_ENDPOINT,
                rawText: JSON.stringify({ graph: graph.json, dialog: dialog.json }),
                status: "ready",
            },
        ];
    }

    const error = questPairValidationError(graphEntries.length, dialogEntries.length);
    return entries.map((entry) => ({
        fileName: entry.fileName,
        exportKind: entry.exportKind,
        rawText: entry.rawText,
        status: "validation_error",
        error,
    }));
}

function findBulkExportModule(
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

function getActionMode(args: { canImport: boolean; isImporting: boolean; isEnabled: boolean }): ActionMode {
    if (!args.isEnabled) return "none";
    if (args.isImporting) return "importing";
    if (args.canImport) return "ready";
    return "none";
}

// Keep it admin-ish: show code, but allow light label mapping where it helps.
// You can expand this later without changing the backend.
const warningLabels: Record<string, string> = {
    HIDDEN_TECH_IN_FILE: "Hidden techs in file",
    EMPTY_LORE_IN_FILE: "Empty lore in file",
    TBD_NAME_IN_FILE: "TBD names in file",
    MISSING_EXPORTER_VERSION: "Missing exporterVersion",
    MISSING_EXPORTED_AT_UTC: "Missing exportedAtUtc",
};

type Props<TJson> = {
    index: number;
    token: string;
    module: ImportModuleDefinition<TJson>;
    isOpen: boolean;
    onToggle: () => void;
};

export default function ImportModuleRow<TJson>({ index, token, module, isOpen, onToggle }: Props<TJson>) {
    const isCodexModule = module.id === "codex";
    const isBulkExportsModule = module.id === "exports" && !!module.bulkExportModules?.length;
    const [drop, setDrop] = useState<DropResult<TJson> | null>(null);
    const [codexFiles, setCodexFiles] = useState<CodexSelectedFile[]>([]);
    const [bulkExportFiles, setBulkExportFiles] = useState<BulkExportSelectedFile[]>([]);
    const [meta, setMeta] = useState<ModuleMetaKV[] | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [importState, setImportState] = useState<ImportState>({ status: "idle" });
    const [codexNotice, setCodexNotice] = useState<{ tone: "success" | "warning" | "error"; message: string } | null>(null);
    const [bulkExportNotice, setBulkExportNotice] = useState<{ tone: "success" | "warning" | "error"; message: string } | null>(null);
    const [showRaw, setShowRaw] = useState(false);

    const hasToken = token.length > 0;
    const isImporting = importState.status === "importing";

    const isEnabled = module.enabled;
    const endpoint = module.endpoint;

    const onLoaded = useCallback(
        (result: DropResult<TJson>) => {
            if (isCodexModule || isBulkExportsModule) return;
            setDrop(result);
            setCodexFiles([]);
            setBulkExportFiles([]);
            setShowRaw(false);
            setImportState({ status: "idle" });
            setCodexNotice(null);
            setBulkExportNotice(null);

            const nextMeta = module.getMeta ? module.getMeta(result.json) : null;
            setMeta(nextMeta);

            const err = module.validate ? module.validate(result.json) : null;
            setValidationError(err);
        },
        [isBulkExportsModule, isCodexModule, module]
    );

    const applyCodexDuplicateValidation = useCallback((files: CodexSelectedFile[]): CodexSelectedFile[] => {
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
    }, []);

    const onLoadedMany = useCallback(
        (result: DropManyResult<TJson>) => {
            setDrop(null);
            setMeta(null);
            setValidationError(null);
            setShowRaw(false);
            setImportState({ status: "idle" });
            setCodexNotice(null);
            setBulkExportNotice(null);

            if (isBulkExportsModule) {
                const modules = module.bulkExportModules ?? [];

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

                setBulkExportFiles([...loadedFiles, ...parseErrors]);
                setCodexFiles([]);
                return;
            }

            if (!isCodexModule) return;

            const loadedFiles = result.loaded.map((entry) => {
                const batch = entry.json as CodexImportFile;
                const nextMeta = module.getMeta ? module.getMeta(entry.json) : undefined;
                const err = module.validate ? module.validate(entry.json) : null;
                const normalizedKind = (batch.exportKind ?? "").trim().toLowerCase() || undefined;

                return {
                    fileName: entry.file.name,
                    exportKind: normalizedKind,
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

            setCodexFiles(applyCodexDuplicateValidation([...loadedFiles, ...parseErrors]));
            setBulkExportFiles([]);
        },
        [applyCodexDuplicateValidation, isBulkExportsModule, isCodexModule, module]
    );

    const clearLoadedFile = useCallback(() => {
        setDrop(null);
        setCodexFiles([]);
        setBulkExportFiles([]);
        setMeta(null);
        setValidationError(null);
        setCodexNotice(null);
        setBulkExportNotice(null);
    }, []);

    const onCleared = useCallback(() => {
        clearLoadedFile();
        setShowRaw(false);
        setImportState({ status: "idle" });
    }, [clearLoadedFile]);

    const canImport = useMemo(() => {
        if (isBulkExportsModule) {
            if (!isEnabled) return false;
            if (!hasToken) return false;
            if (isImporting) return false;
            return bulkExportFiles.some((file) => file.status === "ready" && !!file.endpoint);
        }

        if (isCodexModule) {
            if (!isEnabled) return false;
            if (!endpoint) return false;
            if (!hasToken) return false;
            if (isImporting) return false;
            if (codexFiles.length === 0) return false;
            if (codexFiles.some((file) => file.status === "validation_error")) return false;
            return codexFiles.some((file) => file.status === "ready");
        }

        if (!isEnabled) return false;
        if (!endpoint) return false;
        if (!hasToken) return false;
        if (!drop) return false;
        if (validationError) return false;
        if (isImporting) return false;
        return true;
    }, [bulkExportFiles, codexFiles, drop, endpoint, hasToken, isBulkExportsModule, isCodexModule, isEnabled, isImporting, validationError]);

    const importLabel = isBulkExportsModule
        ? module.importButtonLabel ?? "Import supported exports"
        : isCodexModule
        ? "Import all codex"
        : module.importButtonLabel ?? `Import ${module.title.toLowerCase()}`;

    const badge = useMemo(() => {
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
        if (importState.status === "importing") return { text: "Importing…", cls: "admin-import-badge admin-import-badge--busy" };
        if (importState.status === "success") return { text: "Imported", cls: "admin-import-badge admin-import-badge--ok" };
        if (importState.status === "error") return { text: "Failed", cls: "admin-import-badge admin-import-badge--err" };
        if (drop && !validationError) return { text: "Ready", cls: "admin-import-badge admin-import-badge--ready" };
        return { text: "Not loaded", cls: "admin-import-badge" };
    }, [bulkExportFiles, codexFiles, drop, importState.status, isBulkExportsModule, isCodexModule, isEnabled, isImporting, validationError]);

    const summarizeCodexSummary = useCallback((summary: any | null | undefined) => {
        if (!summary?.counts) return null;

        const parts = [
            `received ${summary.counts.received ?? 0}`,
            `inserted ${summary.counts.inserted ?? 0}`,
            `updated ${summary.counts.updated ?? 0}`,
            `unchanged ${summary.counts.unchanged ?? 0}`,
            `deleted ${summary.counts.deleted ?? 0}`,
            `invalid ${summary.counts.failed ?? 0}`,
        ];

        return parts.join(" · ");
    }, []);

    const doImport = useCallback(async () => {
        if (!endpoint || !drop) return;

        setShowRaw(false);
        setImportState({ status: "importing" });

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Token": token,
                },
                body: drop.rawText,
            });

            const contentType = res.headers.get("content-type") ?? "";
            const isJson = contentType.includes("application/json");

            if (res.ok) {
                const summary = isJson ? await res.json() : null;
                const refreshResult = await refreshStoresAfterAdminImport(module.id);

                setImportState({
                    status: "success",
                    atUtc: nowUtcIso(),
                    httpStatus: res.status,
                    summary,
                    refreshError: refreshResult.ok ? undefined : refreshResult.message,
                });

                clearLoadedFile();
                return;
            }

            const text = await res.text().catch(() => "");
            const msg = text?.trim() ? `HTTP ${res.status}: ${text.trim()}` : `HTTP ${res.status}.`;

            setImportState({ status: "error", message: msg, httpStatus: res.status });
        } catch (e) {
            console.error(e);
            setImportState({
                status: "error",
                message: (e as Error)?.message ?? "Network error while importing.",
            });
        }
    }, [clearLoadedFile, drop, endpoint, module.id, token]);

    const doCodexImport = useCallback(async () => {
        if (!endpoint) return;

        const nextReadyIndex = codexFiles.findIndex((file) => file.status === "ready");
        if (nextReadyIndex === -1) return;

        setShowRaw(false);
        setCodexNotice(null);
        setImportState({ status: "importing" });

        for (let idx = 0; idx < codexFiles.length; idx++) {
            const current = codexFiles[idx];
            if (current.status !== "ready" || !current.rawText) continue;

            setCodexFiles((prev) =>
                prev.map((file, fileIdx) =>
                    fileIdx === idx ? { ...file, status: "importing", error: undefined } : file
                )
            );

            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Admin-Token": token,
                    },
                    body: current.rawText,
                });

                const contentType = res.headers.get("content-type") ?? "";
                const isJson = contentType.includes("application/json");

                if (res.ok) {
                    const summary = isJson ? await res.json() : null;
                    setCodexFiles((prev) =>
                        prev.map((file, fileIdx) =>
                            fileIdx === idx
                                ? { ...file, status: "imported", summary, error: undefined }
                                : file
                        )
                    );
                    continue;
                }

                const text = await res.text().catch(() => "");
                const msg = text?.trim() ? `HTTP ${res.status}: ${text.trim()}` : `HTTP ${res.status}.`;

                setCodexFiles((prev) =>
                    prev.map((file, fileIdx) =>
                        fileIdx === idx ? { ...file, status: "failed", error: msg } : file
                    )
                );
                setCodexNotice({
                    tone: "error",
                    message: `Import stopped after ${current.exportKind ?? current.fileName} failed.`,
                });
                setImportState({ status: "idle" });
                return;
            } catch (e) {
                console.error(e);
                const msg = (e as Error)?.message ?? "Network error while importing.";

                setCodexFiles((prev) =>
                    prev.map((file, fileIdx) =>
                        fileIdx === idx ? { ...file, status: "failed", error: msg } : file
                    )
                );
                setCodexNotice({
                    tone: "error",
                    message: `Import stopped after ${current.exportKind ?? current.fileName} failed.`,
                });
                setImportState({ status: "idle" });
                return;
            }
        }

        const refreshResult = await refreshStoresAfterAdminImport(module.id);
        setCodexNotice({
            tone: refreshResult.ok ? "success" : "warning",
            message: refreshResult.ok
                ? "All selected Codex files imported successfully."
                : `All selected Codex files imported, but refreshing frontend data failed: ${refreshResult.message}`,
        });
        setImportState({ status: "idle" });
    }, [codexFiles, endpoint, module.id, token]);

    const doBulkExportImport = useCallback(async () => {
        const readyFiles = bulkExportFiles.filter((file) => file.status === "ready" && file.endpoint && file.rawText);
        if (readyFiles.length === 0) return;

        setShowRaw(false);
        setBulkExportNotice(null);
        setImportState({ status: "importing" });

        const importedModuleIds = new Set<string>();
        let importedCount = 0;
        let failedCount = 0;

        for (let idx = 0; idx < bulkExportFiles.length; idx++) {
            const current = bulkExportFiles[idx];
            if (current.status !== "ready" || !current.endpoint || !current.rawText) continue;

            setBulkExportFiles((prev) =>
                prev.map((file, fileIdx) =>
                    fileIdx === idx ? { ...file, status: "importing", error: undefined } : file
                )
            );

            try {
                const res = await fetch(current.endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Admin-Token": token,
                    },
                    body: current.rawText,
                });

                const contentType = res.headers.get("content-type") ?? "";
                const isJson = contentType.includes("application/json");

                if (res.ok) {
                    const summary = isJson ? await res.json() : null;
                    importedCount++;
                    if (current.moduleId) {
                        importedModuleIds.add(current.moduleId);
                    }
                    setBulkExportFiles((prev) =>
                        prev.map((file, fileIdx) =>
                            fileIdx === idx
                                ? { ...file, status: "imported", summary, error: undefined }
                                : file
                        )
                    );
                    continue;
                }

                const text = await res.text().catch(() => "");
                const msg = text?.trim() ? `HTTP ${res.status}: ${text.trim()}` : `HTTP ${res.status}.`;
                failedCount++;

                setBulkExportFiles((prev) =>
                    prev.map((file, fileIdx) =>
                        fileIdx === idx ? { ...file, status: "failed", error: msg } : file
                    )
                );
            } catch (e) {
                console.error(e);
                failedCount++;
                const msg = (e as Error)?.message ?? "Network error while importing.";

                setBulkExportFiles((prev) =>
                    prev.map((file, fileIdx) =>
                        fileIdx === idx ? { ...file, status: "failed", error: msg } : file
                    )
                );
            }
        }

        const refreshFailures: string[] = [];
        for (const moduleId of importedModuleIds) {
            const refreshResult = await refreshStoresAfterAdminImport(moduleId);
            if (!refreshResult.ok) {
                refreshFailures.push(refreshResult.message);
            }
        }

        const skippedCount = bulkExportFiles.filter((file) => file.status === "skipped").length;
        const validationCount = bulkExportFiles.filter((file) => file.status === "validation_error").length;
        const problems = failedCount + validationCount + refreshFailures.length;

        setBulkExportNotice({
            tone: problems > 0 ? "warning" : "success",
            message:
                problems > 0
                    ? `${importedCount} supported export file(s) imported. ${skippedCount} skipped, ${validationCount} validation issue(s), ${failedCount} import failure(s).${refreshFailures.length > 0 ? ` Refresh warning: ${refreshFailures.join(" | ")}` : ""}`
                    : `${importedCount} supported export file(s) imported. ${skippedCount} unsupported file(s) skipped.`,
        });
        setBulkExportFiles((prev) => prev.filter((file) => file.status !== "skipped"));
        setImportState({ status: "idle" });
    }, [bulkExportFiles, token]);

    const actionMode = useMemo(
        () => getActionMode({ canImport, isImporting, isEnabled }),
        [canImport, isImporting, isEnabled]
    );

    const bodyHint = useMemo(() => {
        if (isCodexModule) {
            if (!isEnabled) return "Not implemented yet.";
            if (!hasToken) return "Set admin token first.";
            if (codexFiles.length === 0) return "Load one or more Codex JSON files to enable import.";
            if (codexFiles.some((file) => file.status === "validation_error")) {
                return "Resolve Codex file validation issues before importing.";
            }
            if (codexFiles.every((file) => file.status === "imported")) {
                return "All selected Codex files are already imported.";
            }
            return null;
        }

        if (isBulkExportsModule) {
            if (!isEnabled) return "Not implemented yet.";
            if (!hasToken) return "Set admin token first.";
            if (bulkExportFiles.length === 0) return "Load raw exporter JSON files to import supported kinds, including paired Quest graph/dialog files.";
            if (bulkExportFiles.some((file) => file.status === "ready")) return null;
            return "No supported export files are ready to import.";
        }

        if (!isEnabled) return "Not implemented yet.";
        if (!hasToken) return "Set admin token first.";
        if (!drop) return "Load a JSON file to enable import.";
        if (validationError) return "Fix file format issues to enable import.";
        return null;
    }, [bulkExportFiles, codexFiles, drop, hasToken, isBulkExportsModule, isCodexModule, isEnabled, validationError]);

    const summary: any = importState.status === "success" ? (importState as any).summary : null;

    const warnings: Array<{ code: string; count: number }> =
        Array.isArray(summary?.diagnostics?.warnings) ? summary.diagnostics.warnings : [];

    const errors: Array<{ code: string; entityKind?: string; entityKey?: string; displayName?: string; details?: string }> =
        Array.isArray(summary?.diagnostics?.errors) ? summary.diagnostics.errors : [];

    const details: Record<string, any> | null = summary?.diagnostics?.details ?? null;

    const hasWarnings = warnings.length > 0;
    const hasErrors = errors.length > 0;
    const hasDetails = !!details && Object.keys(details).length > 0;
    const toggleOnKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            onToggle();
        },
        [onToggle]
    );

    return (
        <div className={`admin-import-pipelineRow ${!isEnabled ? "is-disabled" : ""}`}>
            <div
                role="button"
                tabIndex={0}
                className="admin-import-pipelineRowHeader"
                onClick={onToggle}
                onKeyDown={toggleOnKeyDown}
                aria-expanded={isOpen}
            >
                <div className="admin-import-pipelineLeft">
                    <div className="admin-import-step">{index}</div>

                    <div className="admin-import-pipelineText">
                        <div className="admin-import-pipelineRowTitle">{module.title}</div>
                        {module.description ? (
                            <div className="admin-import-muted admin-import-pipelineRowDesc">{module.description}</div>
                        ) : null}
                    </div>
                </div>

                <div className="admin-import-pipelineRight">
                    <span className={badge.cls}>{badge.text}</span>

                    <AnimatePresence mode="popLayout" initial={false}>
                        {actionMode === "ready" ? (
                            <motion.button
                                key="ready"
                                type="button"
                                className="admin-import-btn admin-import-btn--primary admin-import-pipelineImportBtn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isCodexModule) {
                                        void doCodexImport();
                                        return;
                                    }
                                    if (isBulkExportsModule) {
                                        void doBulkExportImport();
                                        return;
                                    }
                                    void doImport();
                                }}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                title="Import"
                            >
                                {importLabel}
                            </motion.button>
                        ) : actionMode === "importing" ? (
                            <motion.button
                                key="importing"
                                type="button"
                                className="admin-import-btn admin-import-btn--primary admin-import-pipelineImportBtn"
                                disabled
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                title="Importing…"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                Importing…
                            </motion.button>
                        ) : null}
                    </AnimatePresence>

                    <motion.span
                        className="admin-import-chevron"
                        aria-hidden
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        ▾
                    </motion.span>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="admin-import-pipelineRowBody">
                            <JsonDropzone<TJson>
                                disabled={!isEnabled || isImporting}
                                multiple={isCodexModule || isBulkExportsModule}
                                titleIdle={
                                    isBulkExportsModule
                                        ? "Drag & drop raw exporter JSON files here"
                                        :
                                    isCodexModule
                                        ? "Drag & drop your Codex JSON files here"
                                        : "Drag & drop your JSON here"
                                }
                                titleDragging={
                                    isBulkExportsModule
                                        ? "Drop your exporter files to load them"
                                        :
                                    isCodexModule
                                        ? "Drop your Codex files to load them"
                                        : "Drop your file to load it"
                                }
                                onLoaded={onLoaded}
                                onLoadedMany={isCodexModule || isBulkExportsModule ? onLoadedMany : undefined}
                                onCleared={onCleared}
                            />

                            {bodyHint ? (
                                <div className="admin-import-muted" style={{ marginTop: 10 }}>
                                    {bodyHint}
                                </div>
                            ) : null}

                            {!isCodexModule && validationError ? (
                                <div className="admin-import-error">
                                    <div className="admin-import-errorTitle">File format issue</div>
                                    <div className="admin-import-muted">{validationError}</div>
                                </div>
                            ) : null}

                            {isBulkExportsModule && bulkExportFiles.length > 0 ? (
                                <div className="admin-import-section">
                                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Exporter files</div>

                                    <div className="admin-import-tableWrap">
                                        <table className="admin-import-table">
                                            <thead>
                                            <tr>
                                                <th>Export kind</th>
                                                <th>File</th>
                                                <th>Status</th>
                                                <th>Details</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {bulkExportFiles.map((file, fileIdx) => (
                                                <tr key={`${file.fileName}-${file.exportKind ?? "unknown"}-${fileIdx}`}>
                                                    <td>{file.exportKind ?? "—"}</td>
                                                    <td className="admin-import-mono">{file.fileName}</td>
                                                    <td>
                                                        <span
                                                            className={`admin-import-inlineStatus admin-import-inlineStatus--${file.status}`}
                                                        >
                                                            {file.status.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td className="admin-import-muted">
                                                        {file.error
                                                            ? file.error
                                                            : summarizeCodexSummary(file.summary) ??
                                                            (file.moduleTitle ? `Ready to import ${file.moduleTitle.toLowerCase()}` : "Ready to import")}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : null}

                            {isBulkExportsModule && bulkExportNotice ? (
                                <div
                                    className={
                                        bulkExportNotice.tone === "success" ? "admin-import-success" : "admin-import-error"
                                    }
                                >
                                    <div style={{ fontWeight: 800 }}>{bulkExportNotice.message}</div>
                                </div>
                            ) : null}

                            {isCodexModule && codexFiles.length > 0 ? (
                                <div className="admin-import-section">
                                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Codex files</div>

                                    <div className="admin-import-tableWrap">
                                        <table className="admin-import-table">
                                            <thead>
                                            <tr>
                                                <th>Export kind</th>
                                                <th>File</th>
                                                <th>Status</th>
                                                <th>Details</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {codexFiles.map((file) => (
                                                <tr key={`${file.fileName}-${file.exportKind ?? "unknown"}`}>
                                                    <td>{file.exportKind ?? "—"}</td>
                                                    <td className="admin-import-mono">{file.fileName}</td>
                                                    <td>
                                                        <span
                                                            className={`admin-import-inlineStatus admin-import-inlineStatus--${file.status}`}
                                                        >
                                                            {file.status.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td className="admin-import-muted">
                                                        {file.error
                                                            ? file.error
                                                            : summarizeCodexSummary(file.summary) ?? "Ready to import"}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : null}

                            {isCodexModule && codexNotice ? (
                                <div
                                    className={
                                        codexNotice.tone === "success" ? "admin-import-success" : "admin-import-error"
                                    }
                                >
                                    <div style={{ fontWeight: 800 }}>{codexNotice.message}</div>
                                    {codexNotice.tone === "error" ? (
                                        <div className="admin-import-muted">Fix the failing file and re-run the remaining ready imports.</div>
                                    ) : null}
                                </div>
                            ) : null}

                            {!isCodexModule && !isBulkExportsModule && meta && meta.length > 0 ? (
                                <div className="admin-import-section">
                                    <div style={{ fontWeight: 800, marginBottom: 8 }}>File metadata</div>
                                    <div className="admin-import-kvGrid">
                                        {meta.map((kv) => (
                                            <div key={kv.label} className="admin-import-kv">
                                                <div className="admin-import-kvLabel">{kv.label}</div>
                                                <div className="admin-import-kvValue">{kv.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {!isCodexModule && !isBulkExportsModule && importState.status === "success" ? (
                                <div className="admin-import-success">
                                    <div style={{ fontWeight: 900 }}>
                                        Imported ✓ (HTTP {importState.httpStatus}) — ran at{" "}
                                        <code>{importState.atUtc}</code>
                                    </div>

                                    {importState.refreshError ? (
                                        <div className="admin-import-error" style={{ marginTop: 10 }}>
                                            <div className="admin-import-errorTitle">Frontend refresh failed</div>
                                            <div className="admin-import-muted">{importState.refreshError}</div>
                                        </div>
                                    ) : null}

                                    {summary ? (
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ fontWeight: 800, marginBottom: 6 }}>Summary</div>

                                            <div className="admin-import-kvGrid">
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Received</div>
                                                    <div className="admin-import-kvValue">{summary.counts?.received}</div>
                                                </div>
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Inserted</div>
                                                    <div className="admin-import-kvValue">{summary.counts?.inserted}</div>
                                                </div>
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Updated</div>
                                                    <div className="admin-import-kvValue">{summary.counts?.updated}</div>
                                                </div>
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Unchanged</div>
                                                    <div className="admin-import-kvValue">{summary.counts?.unchanged}</div>
                                                </div>
                                                {summary.counts?.deleted !== undefined ? (
                                                    <div className="admin-import-kv">
                                                        <div className="admin-import-kvLabel">Deleted</div>
                                                        <div className="admin-import-kvValue">{summary.counts?.deleted}</div>
                                                    </div>
                                                ) : null}
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Invalid</div>
                                                    <div className="admin-import-kvValue">{summary.counts?.failed}</div>
                                                </div>
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Duration</div>
                                                    <div className="admin-import-kvValue">{summary.durationMs} ms</div>
                                                </div>
                                            </div>

                                            {hasWarnings ? (
                                                <div style={{ marginTop: 12 }}>
                                                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Warnings</div>

                                                    <div className="admin-import-kvGrid">
                                                        {warnings.map((w) => (
                                                            <div key={w.code} className="admin-import-kv">
                                                                <div className="admin-import-kvLabel">
                                                                    <span className="admin-import-codePill" title={w.code}>
                                                                        {w.code}
                                                                    </span>
                                                                </div>
                                                                <div className="admin-import-kvValue">{w.count}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {hasErrors ? (
                                                <div style={{ marginTop: 12 }}>
                                                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Errors</div>

                                                    <div className="admin-import-tableWrap">
                                                        <table className="admin-import-table">
                                                            <thead>
                                                            <tr>
                                                                <th>Key</th>
                                                                <th>Name</th>
                                                                <th>Message</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {errors.map((e, i) => (
                                                                <tr key={`${e.code}-${e.entityKey ?? "?"}-${i}`}>
                                                                    <td>
                                                                        <span className="admin-import-mono">{e.entityKey ?? "—"}</span>
                                                                        <span className="admin-import-codePill" title={e.code}>
                                                                                {e.code}
                                                                            </span>
                                                                    </td>
                                                                    <td>{e.displayName ?? "—"}</td>
                                                                    <td className="admin-import-muted">{e.details ?? "—"}</td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {hasDetails ? (
                                                <div style={{ marginTop: 12 }}>
                                                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Details</div>

                                                    <div className="admin-import-kvGrid">
                                                        {Object.entries(details!).map(([k, v]) => (
                                                            <div key={k} className="admin-import-kv">
                                                                <div className="admin-import-kvLabel">{k}</div>
                                                                <div className="admin-import-kvValue">{String(v)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Raw JSON: tucked away */}
                                            <div className="admin-import-rawRow">
                                                <button
                                                    type="button"
                                                    className="admin-import-btn admin-import-btn--ghost admin-import-rawBtn"
                                                    onClick={() => setShowRaw((v) => !v)}
                                                >
                                                    {showRaw ? "Hide raw JSON" : "Show raw JSON"}
                                                </button>
                                            </div>

                                            <AnimatePresence initial={false}>
                                                {showRaw ? (
                                                    <motion.pre
                                                        className="admin-import-json"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.18, ease: "easeOut" }}
                                                    >
                                                        {JSON.stringify(summary, null, 2)}
                                                    </motion.pre>
                                                ) : null}
                                            </AnimatePresence>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {!isCodexModule && !isBulkExportsModule && importState.status === "error" ? (
                                <div className="admin-import-error">
                                    <div className="admin-import-errorTitle">Import failed</div>
                                    <div className="admin-import-muted">{(importState as any).message}</div>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
