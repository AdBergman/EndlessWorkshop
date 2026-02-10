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

    const hasToken = token.length > 0;
    const isImporting = importState.status === "importing";
    const isImported = importState.status === "success";

    const isEnabled = module.enabled;
    const endpoint = module.endpoint;

    const onLoaded = useCallback(
        (result: DropResult<TJson>) => {
            setDrop(result);
            // New file loaded => reset import state for this module
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

            if (res.status === 204) {
                setImportState({ status: "success", atUtc: nowUtcIso() });

                // UX: prevent accidental double-import
                clearLoadedFile();
                return;
            }

            const text = await res.text().catch(() => "");
            const msg = text?.trim()
                ? `Import failed (HTTP ${res.status}): ${text.trim()}`
                : `Import failed (HTTP ${res.status}).`;

            setImportState({ status: "error", message: msg });
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

                    {/* Action slot: only show real action buttons (no header hints) */}
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

                    {/* Motion-driven chevron rotation */}
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

            {/* Motion-driven body expand/collapse */}
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

                            {/* Summary persists even after file is cleared */}
                            {importState.status === "success" ? (
                                <div className="admin-import-success">
                                    Imported ✓ (HTTP 204) — ran at <code>{importState.atUtc}</code>
                                </div>
                            ) : null}

                            {importState.status === "error" ? (
                                <div className="admin-import-error">
                                    <div className="admin-import-errorTitle">Import failed</div>
                                    <div className="admin-import-muted">{importState.message}</div>
                                </div>
                            ) : null}

                            {/* Optional: keep this for later summaries when backend returns details */}
                            {isImported ? null : null}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}