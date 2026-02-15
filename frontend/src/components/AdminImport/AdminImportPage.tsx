import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AdminImportPage.css";

import AdminTokenPanel from "./AdminTokenPanel";
import ImportModuleRow from "./ImportModuleRow";
import { ImportModuleDefinition, ModuleMetaKV } from "./adminImportTypes";

type TechImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    techs?: unknown[];
};

type TokenStatus = "missing" | "checking" | "valid" | "invalid";

function metaFromTechFile(json: TechImportFile): ModuleMetaKV[] {
    const techCount = Array.isArray(json.techs) ? json.techs.length : 0;

    return [
        { label: "Game", value: json.game ?? "—" },
        { label: "Game version", value: json.gameVersion ?? "—" },
        { label: "Exporter version", value: json.exporterVersion ?? "—" },
        { label: "Exported at (UTC)", value: json.exportedAtUtc ?? "—" },
        { label: "Tech count", value: String(techCount) },
    ];
}

function validateTechFile(json: TechImportFile): string | null {
    if (!json || !Array.isArray(json.techs) || json.techs.length === 0) {
        return "File parsed, but it does not contain a non-empty 'techs' array.";
    }
    return null;
}

type DistrictImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    districts?: unknown[];
};

function metaFromDistrictFile(json: DistrictImportFile): ModuleMetaKV[] {
    const count = Array.isArray(json.districts) ? json.districts.length : 0;

    return [
        { label: "Game", value: json.game ?? "—" },
        { label: "Game version", value: json.gameVersion ?? "—" },
        { label: "Exporter version", value: json.exporterVersion ?? "—" },
        { label: "Exported at (UTC)", value: json.exportedAtUtc ?? "—" },
        { label: "District count", value: String(count) },
    ];
}

function validateDistrictFile(json: DistrictImportFile): string | null {
    if (!json || !Array.isArray(json.districts) || json.districts.length === 0) {
        return "File parsed, but it does not contain a non-empty 'districts' array.";
    }
    return null;
}

type ImprovementImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    improvements?: unknown[];
};

function metaFromImprovementFile(json: ImprovementImportFile): ModuleMetaKV[] {
    const count = Array.isArray(json.improvements) ? json.improvements.length : 0;

    return [
        { label: "Game", value: json.game ?? "—" },
        { label: "Game version", value: json.gameVersion ?? "—" },
        { label: "Exporter version", value: json.exporterVersion ?? "—" },
        { label: "Exported at (UTC)", value: json.exportedAtUtc ?? "—" },
        { label: "Improvement count", value: String(count) },
    ];
}

function validateImprovementFile(json: ImprovementImportFile): string | null {
    if (!json || !Array.isArray(json.improvements) || json.improvements.length === 0) {
        return "File parsed, but it does not contain a non-empty 'improvements' array.";
    }
    return null;
}

async function checkAdminToken(token: string): Promise<{ ok: boolean; message?: string }> {
    try {
        const res = await fetch("/api/admin/import/check-token", {
            method: "GET",
            headers: {
                "X-Admin-Token": token,
            },
        });

        if (res.status === 204) {
            return { ok: true };
        }

        // 401/403 expected for invalid token
        return {
            ok: false,
            message: `Admin token rejected (HTTP ${res.status}).`,
        };
    } catch (e) {
        return {
            ok: false,
            message: (e as Error)?.message ?? "Failed to reach backend.",
        };
    }
}

export default function AdminImportPage() {
    const [params] = useSearchParams();
    const isAdminMode = params.get("admin") === "1";

    const [token, setToken] = useState<string>(() => (localStorage.getItem("ewshop_admin_token") ?? "").trim());
    const [tokenStatus, setTokenStatus] = useState<TokenStatus>(() => (token ? "checking" : "missing"));
    const [tokenError, setTokenError] = useState<string | null>(null);

    const modules = useMemo<Array<ImportModuleDefinition<any>>>(() => {
        return [
            {
                id: "districts",
                title: "Districts",
                description: "Upload a district export and import it into the database.",
                enabled: true,
                endpoint: "/api/admin/import/districts",
                getMeta: metaFromDistrictFile,
                validate: validateDistrictFile,
                importButtonLabel: "Import districts",
            },
            {
                id: "improvements",
                title: "Improvements",
                description: "Upload an improvement export and import it into the database.",
                enabled: true,
                endpoint: "/api/admin/import/improvements",
                getMeta: metaFromImprovementFile,
                validate: validateImprovementFile,
                importButtonLabel: "Import improvements",
            },
            { id: "units", title: "Units", description: "Not implemented yet.", enabled: false },
            {
                id: "techs",
                title: "Techs",
                description: "Upload a tech export and import it into the database.",
                enabled: true,
                endpoint: "/api/admin/import/techs",
                getMeta: metaFromTechFile,
                validate: validateTechFile,
                importButtonLabel: "Import techs",
            },
        ];
    }, []);

    const defaultOpenId = useMemo(() => {
        const enabled = modules.find((m) => m.enabled);
        return enabled?.id ?? null;
    }, [modules]);

    const [openModuleId, setOpenModuleId] = useState<string | null>(defaultOpenId);

    const runTokenValidation = useCallback(async (t: string) => {
        const trimmed = t.trim();

        if (!trimmed) {
            setTokenStatus("missing");
            setTokenError(null);
            return;
        }

        setTokenStatus("checking");
        setTokenError(null);

        const result = await checkAdminToken(trimmed);

        if (result.ok) {
            setTokenStatus("valid");
            setTokenError(null);
        } else {
            setTokenStatus("invalid");
            setTokenError(result.message ?? "Invalid admin token.");
        }
    }, []);

    // Validate stored token once on mount
    useEffect(() => {
        if (token) {
            void runTokenValidation(token);
        } else {
            setTokenStatus("missing");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isAdminMode) {
        // Don’t reveal how to enable admin mode
        return (
            <div className="admin-import-page">
                <h2 className="admin-import-title">Admin Import</h2>

                <div className="admin-import-panel admin-import-section">
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Not available</div>
                    <div className="admin-import-muted">This page is restricted.</div>
                </div>
            </div>
        );
    }

    const isUnlocked = tokenStatus === "valid";

    return (
        <div className="admin-import-page">
            <h2 className="admin-import-title">Admin Import</h2>

            <AdminTokenPanel
                token={token}
                status={tokenStatus}
                errorMessage={tokenError}
                onTokenChange={(t) => {
                    const next = t.trim();
                    setToken(next);
                    localStorage.setItem("ewshop_admin_token", next);
                    void runTokenValidation(next);
                }}
            />

            {tokenStatus === "checking" ? (
                <div className="admin-import-panel admin-import-section">
                    <div style={{ fontWeight: 800 }}>Validating token…</div>
                    <div className="admin-import-muted">Checking admin access.</div>
                </div>
            ) : null}

            {!isUnlocked ? null : (
                <div className="admin-import-section">
                    <div className="admin-import-pipelineTitle">Import pipeline</div>
                    <div className="admin-import-muted">
                        Run imports top-to-bottom as modules become available.
                    </div>

                    <div className="admin-import-pipeline">
                        {modules.map((m, idx) => (
                            <ImportModuleRow
                                key={m.id}
                                index={idx + 1}
                                token={token}
                                module={m}
                                isOpen={openModuleId === m.id}
                                onToggle={() => setOpenModuleId((cur) => (cur === m.id ? null : m.id))}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}