import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminImportFileTable from "./AdminImportFileTable";
import AdminImportSingleResult from "./AdminImportSingleResult";
import JsonDropzone from "./JsonDropzone";
import { DropManyResult, DropResult, ImportModuleDefinition, ImportState, ModuleMetaKV } from "./adminImportTypes";
import { refreshStoresAfterAdminImport } from "./adminImportRefresh";
import {
    createBulkExportSelectedFiles,
    createCodexSelectedFiles,
    getActionMode,
    getAdminImportBadge,
    type BulkExportSelectedFile,
    type CodexSelectedFile,
} from "./adminImportFileRouting";

function nowUtcIso() {
    return new Date().toISOString();
}

function importHeaders(token: string, fileName?: string): HeadersInit {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Admin-Token": token,
    };

    if (fileName?.trim()) {
        headers["X-Import-Filename"] = fileName.trim();
    }

    return headers;
}

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
                setBulkExportFiles(createBulkExportSelectedFiles(result, modules));
                setCodexFiles([]);
                return;
            }

            if (!isCodexModule) return;

            setCodexFiles(createCodexSelectedFiles(result, module));
            setBulkExportFiles([]);
        },
        [isBulkExportsModule, isCodexModule, module]
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

    const badge = useMemo(() => getAdminImportBadge({
        isBulkExportsModule,
        isCodexModule,
        isEnabled,
        isImporting,
        bulkExportFiles,
        codexFiles,
        importStatus: importState.status,
        hasDrop: Boolean(drop),
        hasValidationError: Boolean(validationError),
    }), [bulkExportFiles, codexFiles, drop, importState.status, isBulkExportsModule, isCodexModule, isEnabled, isImporting, validationError]);

    const doImport = useCallback(async () => {
        if (!endpoint || !drop) return;

        setShowRaw(false);
        setImportState({ status: "importing" });

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: importHeaders(token, drop.file.name),
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
                    headers: importHeaders(token, current.fileName),
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
                    headers: importHeaders(token, current.fileName),
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
                                <AdminImportFileTable
                                    title="Exporter files"
                                    files={bulkExportFiles}
                                    readyDetail={(file) => (
                                        file.moduleTitle ? `Ready to import ${file.moduleTitle.toLowerCase()}` : "Ready to import"
                                    )}
                                />
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
                                <AdminImportFileTable
                                    title="Codex files"
                                    files={codexFiles}
                                    readyDetail={() => "Ready to import"}
                                />
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
                                <AdminImportSingleResult
                                    importState={importState}
                                    showRaw={showRaw}
                                    onToggleRaw={() => setShowRaw((value) => !value)}
                                />
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
