import { AnimatePresence, motion } from "framer-motion";

import type { ImportState } from "./adminImportTypes";

type SuccessfulImportState = Extract<ImportState, { status: "success" }>;

type ImportWarning = {
    code: string;
    count: number;
};

type ImportError = {
    code: string;
    entityKind?: string;
    entityKey?: string;
    displayName?: string;
    details?: string;
};

export default function AdminImportSingleResult({
    importState,
    showRaw,
    onToggleRaw,
}: {
    importState: SuccessfulImportState;
    showRaw: boolean;
    onToggleRaw: () => void;
}) {
    const summary: any = importState.summary ?? null;
    const warnings: ImportWarning[] =
        Array.isArray(summary?.diagnostics?.warnings) ? summary.diagnostics.warnings : [];
    const errors: ImportError[] =
        Array.isArray(summary?.diagnostics?.errors) ? summary.diagnostics.errors : [];
    const details: Record<string, any> | null = summary?.diagnostics?.details ?? null;

    const hasWarnings = warnings.length > 0;
    const hasErrors = errors.length > 0;
    const hasDetails = !!details && Object.keys(details).length > 0;

    return (
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
                                {warnings.map((warning) => (
                                    <div key={warning.code} className="admin-import-kv">
                                        <div className="admin-import-kvLabel">
                                            <span className="admin-import-codePill" title={warning.code}>
                                                {warning.code}
                                            </span>
                                        </div>
                                        <div className="admin-import-kvValue">{warning.count}</div>
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
                                    {errors.map((error, index) => (
                                        <tr key={`${error.code}-${error.entityKey ?? "?"}-${index}`}>
                                            <td>
                                                <span className="admin-import-mono">{error.entityKey ?? "—"}</span>
                                                <span className="admin-import-codePill" title={error.code}>
                                                    {error.code}
                                                </span>
                                            </td>
                                            <td>{error.displayName ?? "—"}</td>
                                            <td className="admin-import-muted">{error.details ?? "—"}</td>
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
                                {Object.entries(details!).map(([key, value]) => (
                                    <div key={key} className="admin-import-kv">
                                        <div className="admin-import-kvLabel">{key}</div>
                                        <div className="admin-import-kvValue">{String(value)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="admin-import-rawRow">
                        <button
                            type="button"
                            className="admin-import-btn admin-import-btn--ghost admin-import-rawBtn"
                            onClick={onToggleRaw}
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
    );
}
