import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JsonDropzone from "./JsonDropzone";
import { DropManyResult, DropResult, ImportModuleDefinition, ImportState, ModuleMetaKV } from "./adminImportTypes";

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
    const [drop, setDrop] = useState<DropResult<TJson> | null>(null);
    const [codexFiles, setCodexFiles] = useState<CodexSelectedFile[]>([]);
    const [meta, setMeta] = useState<ModuleMetaKV[] | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [importState, setImportState] = useState<ImportState>({ status: "idle" });
    const [codexNotice, setCodexNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
    const [showRaw, setShowRaw] = useState(false);

    const hasToken = token.length > 0;
    const isImporting = importState.status === "importing";

    const isEnabled = module.enabled;
    const endpoint = module.endpoint;

    const onLoaded = useCallback(
        (result: DropResult<TJson>) => {
            if (isCodexModule) return;
            setDrop(result);
            setCodexFiles([]);
            setShowRaw(false);
            setImportState({ status: "idle" });
            setCodexNotice(null);

            const nextMeta = module.getMeta ? module.getMeta(result.json) : null;
            setMeta(nextMeta);

            const err = module.validate ? module.validate(result.json) : null;
            setValidationError(err);
        },
        [isCodexModule, module]
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
            if (!isCodexModule) return;

            setDrop(null);
            setMeta(null);
            setValidationError(null);
            setShowRaw(false);
            setImportState({ status: "idle" });
            setCodexNotice(null);

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
        },
        [applyCodexDuplicateValidation, isCodexModule, module]
    );

    const clearLoadedFile = useCallback(() => {
        setDrop(null);
        setCodexFiles([]);
        setMeta(null);
        setValidationError(null);
        setCodexNotice(null);
    }, []);

    const onCleared = useCallback(() => {
        clearLoadedFile();
        setShowRaw(false);
        setImportState({ status: "idle" });
    }, [clearLoadedFile]);

    const canImport = useMemo(() => {
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
    }, [codexFiles, drop, endpoint, hasToken, isCodexModule, isEnabled, isImporting, validationError]);

    const importLabel = isCodexModule
        ? "Import all codex"
        : module.importButtonLabel ?? `Import ${module.title.toLowerCase()}`;

    const badge = useMemo(() => {
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
    }, [codexFiles, drop, importState.status, isCodexModule, isEnabled, isImporting, validationError]);

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

                setImportState({
                    status: "success",
                    atUtc: nowUtcIso(),
                    httpStatus: res.status,
                    summary,
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
    }, [clearLoadedFile, drop, endpoint, token]);

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

        setCodexNotice({ tone: "success", message: "All selected Codex files imported successfully." });
        setImportState({ status: "idle" });
    }, [codexFiles, endpoint, token]);

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

        if (!isEnabled) return "Not implemented yet.";
        if (!hasToken) return "Set admin token first.";
        if (!drop) return "Load a JSON file to enable import.";
        if (validationError) return "Fix file format issues to enable import.";
        return null;
    }, [codexFiles, drop, hasToken, isCodexModule, isEnabled, validationError]);

    const summary: any = importState.status === "success" ? (importState as any).summary : null;

    const warnings: Array<{ code: string; count: number }> =
        Array.isArray(summary?.diagnostics?.warnings) ? summary.diagnostics.warnings : [];

    const errors: Array<{ code: string; entityKind?: string; entityKey?: string; displayName?: string; details?: string }> =
        Array.isArray(summary?.diagnostics?.errors) ? summary.diagnostics.errors : [];

    const details: Record<string, any> | null = summary?.diagnostics?.details ?? null;

    const hasWarnings = warnings.length > 0;
    const hasErrors = errors.length > 0;
    const hasDetails = !!details && Object.keys(details).length > 0;

    return (
        <div className={`admin-import-pipelineRow ${!isEnabled ? "is-disabled" : ""}`}>
            <button type="button" className="admin-import-pipelineRowHeader" onClick={onToggle} aria-expanded={isOpen}>
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
            </button>

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
                                multiple={isCodexModule}
                                titleIdle={
                                    isCodexModule
                                        ? "Drag & drop your Codex JSON files here"
                                        : "Drag & drop your JSON here"
                                }
                                titleDragging={
                                    isCodexModule
                                        ? "Drop your Codex files to load them"
                                        : "Drop your file to load it"
                                }
                                onLoaded={onLoaded}
                                onLoadedMany={isCodexModule ? onLoadedMany : undefined}
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

                            {!isCodexModule && meta && meta.length > 0 ? (
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

                            {!isCodexModule && importState.status === "success" ? (
                                <div className="admin-import-success">
                                    <div style={{ fontWeight: 900 }}>
                                        Imported ✓ (HTTP {(importState as any).httpStatus}) — ran at{" "}
                                        <code>{(importState as any).atUtc}</code>
                                    </div>

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

                            {!isCodexModule && importState.status === "error" ? (
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
