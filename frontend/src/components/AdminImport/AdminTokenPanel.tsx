import React, { useEffect, useMemo, useState } from "react";

type TokenStatus = "missing" | "checking" | "valid" | "invalid";

type Props = {
    token: string;
    status: TokenStatus;
    errorMessage?: string | null;
    onTokenChange: (token: string) => void;
};

export default function AdminTokenPanel({ token, status, errorMessage, onTokenChange }: Props) {
    const [tokenInput, setTokenInput] = useState<string>(token ?? "");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [confirmClear, setConfirmClear] = useState<boolean>(false);

    // Keep input in sync with parent token (e.g. from localStorage on mount)
    useEffect(() => {
        setTokenInput(token ?? "");
    }, [token]);

    // Auto-collapse edit mode once we’re valid (unless user explicitly opened it)
    useEffect(() => {
        if (status === "valid") {
            setConfirmClear(false);
            // If we reached valid state, default back to collapsed mode.
            // User can still click "Change" to reopen.
            setIsEditing(false);
        }
    }, [status]);

    // If token becomes invalid/missing, open editor automatically.
    useEffect(() => {
        if (status === "invalid" || status === "missing") {
            setIsEditing(true);
        }
    }, [status]);

    const trimmed = useMemo(() => tokenInput.trim(), [tokenInput]);

    const statusLabel = useMemo(() => {
        switch (status) {
            case "missing":
                return { text: "missing", cls: "admin-import-status is-warn" };
            case "checking":
                return { text: "checking…", cls: "admin-import-status is-warn" };
            case "valid":
                return { text: "valid", cls: "admin-import-status is-ok" };
            case "invalid":
                return { text: "invalid", cls: "admin-import-status is-warn" };
            default:
                return { text: "missing", cls: "admin-import-status is-warn" };
        }
    }, [status]);

    // Collapsed view: shown when token is valid AND user is not editing.
    if (status === "valid" && !isEditing) {
        return (
            <div className="admin-import-panel admin-import-section">
                <div className="admin-import-row" style={{ justifyContent: "space-between", width: "100%" }}>
                    <div className="admin-import-row" style={{ gap: 10 }}>
                        <div style={{ fontWeight: 800 }}>Admin token</div>
                        <span className={statusLabel.cls}>{statusLabel.text}</span>
                        <span className="admin-import-muted">Stored in localStorage.</span>
                    </div>

                    <div className="admin-import-row" style={{ gap: 10 }}>
                        <button
                            type="button"
                            className="admin-import-btn admin-import-btn--ghost"
                            onClick={() => {
                                setConfirmClear(false);
                                setIsEditing(true);
                            }}
                            title="Change admin token"
                        >
                            Change…
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Expanded editor view (shown when missing/invalid/checking, or user clicked Change…)
    return (
        <div className="admin-import-panel admin-import-section">
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Admin token</div>
            <div className="admin-import-muted" style={{ marginBottom: 10 }}>
                Required for API calls (sent as <code>X-Admin-Token</code> header).
            </div>

            <div className="admin-import-row">
                <input
                    className="admin-import-input"
                    value={tokenInput}
                    onChange={(e) => {
                        setTokenInput(e.target.value);
                        setConfirmClear(false);
                    }}
                    placeholder="Paste admin token…"
                    autoComplete="off"
                    spellCheck={false}
                />

                <button
                    type="button"
                    className="admin-import-btn admin-import-btn--ghost"
                    onClick={() => {
                        setConfirmClear(false);
                        onTokenChange(trimmed);
                    }}
                    disabled={status === "checking"}
                    title="Save token to localStorage and validate"
                >
                    Save
                </button>

                {!confirmClear ? (
                    <button
                        type="button"
                        className="admin-import-btn admin-import-btn--ghost"
                        onClick={() => setConfirmClear(true)}
                        disabled={status === "checking"}
                        title="Clear token (requires confirmation)"
                    >
                        Clear
                    </button>
                ) : (
                    <button
                        type="button"
                        className="admin-import-btn admin-import-btn--ghost"
                        onClick={() => {
                            setConfirmClear(false);
                            setTokenInput("");
                            onTokenChange("");
                        }}
                        disabled={status === "checking"}
                        title="Confirm clear"
                    >
                        Confirm clear
                    </button>
                )}

                {confirmClear ? (
                    <button
                        type="button"
                        className="admin-import-btn admin-import-btn--ghost"
                        onClick={() => setConfirmClear(false)}
                        disabled={status === "checking"}
                        title="Cancel clear"
                    >
                        Cancel
                    </button>
                ) : null}

                <span className="admin-import-hint">
                    Status: <span className={statusLabel.cls}>{statusLabel.text}</span>
                </span>

                {status === "valid" ? (
                    <button
                        type="button"
                        className="admin-import-btn admin-import-btn--ghost"
                        onClick={() => {
                            setConfirmClear(false);
                            setIsEditing(false);
                        }}
                        title="Hide token editor"
                    >
                        Done
                    </button>
                ) : null}
            </div>

            {status === "invalid" && errorMessage ? (
                <div className="admin-import-error" style={{ marginTop: 12 }}>
                    <div className="admin-import-errorTitle">Access denied</div>
                    <div className="admin-import-muted">{errorMessage}</div>
                </div>
            ) : null}
        </div>
    );
}