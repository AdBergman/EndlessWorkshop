import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JsonDropzone from "./JsonDropzone";
import { DropResult, ImportModuleDefinition, ImportState, ModuleMetaKV } from "./adminImportTypes";

function nowUtcIso() {
    return new Date().toISOString();
}

type ActionMode = "none" | "ready" | "importing";

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
    const [drop, setDrop] = useState<DropResult<TJson> | null>(null);
    const [meta, setMeta] = useState<ModuleMetaKV[] | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [importState, setImportState] = useState<ImportState>({ status: "idle" });
    const [showRaw, setShowRaw] = useState(false);

    const hasToken = token.length > 0;
    const isImporting = importState.status === "importing";

    const isEnabled = module.enabled;
    const endpoint = module.endpoint;

    const onLoaded = useCallback(
        (result: DropResult<TJson>) => {
            setDrop(result);
            setShowRaw(false);
            setImportState({ status: "idle" });

            const nextMeta = module.getMeta ? module.getMeta(result.json) : null;
            setMeta(nextMeta);

            const err = module.validate ? module.validate(result.json) : null;
            setValidationError(err);
        },
        [module]
    );

    const clearLoadedFile = useCallback(() => {
        setDrop(null);
        setMeta(null);
        setValidationError(null);
    }, []);

    const onCleared = useCallback(() => {
        clearLoadedFile();
        setShowRaw(false);
        setImportState({ status: "idle" });
    }, [clearLoadedFile]);

    const canImport = useMemo(() => {
        if (!isEnabled) return false;
        if (!endpoint) return false;
        if (!hasToken) return false;
        if (!drop) return false;
        if (validationError) return false;
        if (isImporting) return false;
        return true;
    }, [drop, endpoint, hasToken, isEnabled, isImporting, validationError]);

    const importLabel = module.importButtonLabel ?? `Import ${module.title.toLowerCase()}`;

    const badge = useMemo(() => {
        if (!isEnabled) return { text: "Coming soon", cls: "admin-import-badge admin-import-badge--disabled" };
        if (importState.status === "importing") return { text: "Importing…", cls: "admin-import-badge admin-import-badge--busy" };
        if (importState.status === "success") return { text: "Imported", cls: "admin-import-badge admin-import-badge--ok" };
        if (importState.status === "error") return { text: "Failed", cls: "admin-import-badge admin-import-badge--err" };
        if (drop && !validationError) return { text: "Ready", cls: "admin-import-badge admin-import-badge--ready" };
        return { text: "Not loaded", cls: "admin-import-badge" };
    }, [drop, importState.status, isEnabled, validationError]);

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

    const actionMode = useMemo(
        () => getActionMode({ canImport, isImporting, isEnabled }),
        [canImport, isImporting, isEnabled]
    );

    const bodyHint = useMemo(() => {
        if (!isEnabled) return "Not implemented yet.";
        if (!hasToken) return "Set admin token first.";
        if (!drop) return "Load a JSON file to enable import.";
        if (validationError) return "Fix file format issues to enable import.";
        return null;
    }, [drop, hasToken, isEnabled, validationError]);

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
                            <JsonDropzone<TJson> disabled={!isEnabled || isImporting} onLoaded={onLoaded} onCleared={onCleared} />

                            {bodyHint ? (
                                <div className="admin-import-muted" style={{ marginTop: 10 }}>
                                    {bodyHint}
                                </div>
                            ) : null}

                            {validationError ? (
                                <div className="admin-import-error">
                                    <div className="admin-import-errorTitle">File format issue</div>
                                    <div className="admin-import-muted">{validationError}</div>
                                </div>
                            ) : null}

                            {meta && meta.length > 0 ? (
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

                            {importState.status === "success" ? (
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
                                                <div className="admin-import-kv">
                                                    <div className="admin-import-kvLabel">Failed</div>
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
                                                                    {warningLabels[w.code] ?? w.code}
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

                            {importState.status === "error" ? (
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