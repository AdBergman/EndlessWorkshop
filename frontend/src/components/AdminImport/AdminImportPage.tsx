import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AdminImportPage.css";
import { apiClient, type SeoRegenerationResult } from "@/api/apiClient";
import {
    createCodexDiagnosticsReportText,
    downloadCodexDiagnosticsReportText,
} from "@/lib/codex/codexTokenAudit";

import AdminTokenPanel from "./AdminTokenPanel";
import ImportModuleRow from "./ImportModuleRow";
import { ImportModuleDefinition, ModuleMetaKV } from "./adminImportTypes";
import { Helmet } from "react-helmet-async";

type TokenStatus = "missing" | "checking" | "valid" | "invalid";
type SeoActionState =
    | { status: "idle" }
    | { status: "running" }
    | { status: "success"; result: SeoRegenerationResult }
    | { status: "error"; message: string };
type CodexDiagnosticsActionState =
    | { status: "idle" }
    | { status: "running" }
    | { status: "success"; entryCount: number }
    | { status: "error"; message: string };

type TechImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    techs?: unknown[];
};

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

type UnitImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    units?: unknown[];
};

function metaFromUnitFile(json: UnitImportFile): ModuleMetaKV[] {
    const count = Array.isArray(json.units) ? json.units.length : 0;

    return [
        { label: "Game", value: json.game ?? "—" },
        { label: "Game version", value: json.gameVersion ?? "—" },
        { label: "Exporter version", value: json.exporterVersion ?? "—" },
        { label: "Exported at (UTC)", value: json.exportedAtUtc ?? "—" },
        { label: "Unit count", value: String(count) },
    ];
}

function validateUnitFile(json: UnitImportFile): string | null {
    if (!json || !Array.isArray(json.units) || json.units.length === 0) {
        return "File parsed, but it does not contain a non-empty 'units' array.";
    }
    return null;
}

type CodexImportFile = {
    game?: string;
    gameVersion?: string;
    exporterVersion?: string;
    exportedAtUtc?: string;
    exportKind?: string;
    entries?: unknown[];
};

const CODEX_KIND_LABELS = [
    "abilities",
    "councilors",
    "districts",
    "equipment",
    "factions",
    "heroes",
    "improvements",
    "minorFactions",
    "populations",
    "tech",
    "traits",
    "units",
];
const ALLOWED_CODEX_KINDS = CODEX_KIND_LABELS.map((kind) => kind.toLowerCase());

function metaFromCodexFile(json: CodexImportFile): ModuleMetaKV[] {
    const count = Array.isArray(json.entries) ? json.entries.length : 0;

    return [
        { label: "Game", value: json.game ?? "—" },
        { label: "Game version", value: json.gameVersion ?? "—" },
        { label: "Exporter version", value: json.exporterVersion ?? "—" },
        { label: "Exported at (UTC)", value: json.exportedAtUtc ?? "—" },
        { label: "Export kind", value: json.exportKind ?? "—" },
        { label: "Entry count", value: String(count) },
    ];
}

function validateCodexFile(json: CodexImportFile): string | null {
    if (!json || !Array.isArray(json.entries) || json.entries.length === 0) {
        return "File parsed, but it does not contain a non-empty 'entries' array.";
    }
    const normalizedExportKind = json.exportKind?.trim().toLowerCase();
    if (!normalizedExportKind || !ALLOWED_CODEX_KINDS.includes(normalizedExportKind)) {
        return `Invalid exportKind. Expected one of: [${CODEX_KIND_LABELS.join(", ")}], but found "${json.exportKind ?? 'missing'}".`;
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

function formatSeoKindCounts(result: SeoRegenerationResult): string | null {
    const counts = result.exportKindCounts;
    if (!counts || Object.keys(counts).length === 0) {
        return null;
    }

    return Object.entries(counts)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([kind, kindCounts]) => {
            const parts = [`${kind}: ${kindCounts.generatedCount} generated`];
            if (kindCounts.skippedCount > 0) {
                parts.push(`${kindCounts.skippedCount} skipped`);
            }
            if (kindCounts.duplicateCount > 0) {
                parts.push(`${kindCounts.duplicateCount} duplicate`);
            }
            return parts.join(", ");
        })
        .join(" | ");
}

function formatOwnershipBuckets(audit: NonNullable<SeoRegenerationResult["missingReferenceAudit"]>): string | null {
    const buckets = audit.ownershipBuckets ?? [];
    if (buckets.length === 0) {
        return null;
    }

    return buckets
        .map((bucket) => {
            return `${bucket.classification}: ${bucket.unresolvedCount} unresolved / ${bucket.uniqueReferenceKeys} key(s), owner: ${bucket.owner}`;
        })
        .join(" | ");
}

function formatPresentButFilteredReasons(audit: NonNullable<SeoRegenerationResult["missingReferenceAudit"]>): string | null {
    const reasons = audit.presentButFilteredReasons ?? [];
    if (reasons.length === 0) {
        return null;
    }

    return reasons.map((reason) => `${reason.reason}: ${reason.unresolvedCount}`).join(" | ");
}

function formatDuplicateAliasImpact(audit: NonNullable<SeoRegenerationResult["missingReferenceAudit"]>): string | null {
    const impact = audit.duplicateAliasImpact;
    if (!impact || impact.resolvedReferences <= 0) {
        return null;
    }

    const examples = impact.examples.length > 0 ? ` Examples: ${impact.examples.join(", ")}.` : "";
    return `${impact.resolvedReferences} in-app reference(s) can resolve through ${impact.uniqueReferenceKeys} duplicate-slug alias target(s).${examples}`;
}

export default function AdminImportPage() {
    const [params] = useSearchParams();
    const isAdminMode = params.get("admin") === "1";

    const [token, setToken] = useState<string>(() => (localStorage.getItem("ewshop_admin_token") ?? "").trim());
    const [tokenStatus, setTokenStatus] = useState<TokenStatus>(() => (token ? "checking" : "missing"));
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [seoActionState, setSeoActionState] = useState<SeoActionState>({ status: "idle" });
    const [codexDiagnosticsActionState, setCodexDiagnosticsActionState] =
        useState<CodexDiagnosticsActionState>({ status: "idle" });
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const individualModules = useMemo<Array<ImportModuleDefinition<any>>>(() => {
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
            {
                id: "units",
                title: "Units",
                description: "Upload a unit export and import it into the database.",
                enabled: true,
                endpoint: "/api/admin/import/units",
                getMeta: metaFromUnitFile,
                validate: validateUnitFile,
                importButtonLabel: "Import units",
            },
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
            {
                id: "codex",
                title: "Codex",
                description: "Upload a generic codex export and import it into the database.",
                enabled: true,
                endpoint: "/api/admin/import/codex",
                getMeta: metaFromCodexFile,
                validate: validateCodexFile,
                importButtonLabel: "Import codex",
            },
        ];
    }, []);

    const bulkModules = useMemo<Array<ImportModuleDefinition<any>>>(() => {
        const rawExportModules = individualModules.filter((module) => module.id !== "codex");
        const codexModule = individualModules.find((module) => module.id === "codex");

        return [
            {
                id: "exports",
                title: "Import supported exports",
                description: "Drop raw exporter JSON files together. Supported now: tech, units, districts, improvements. Other raw exports are skipped.",
                enabled: true,
                bulkExportModules: rawExportModules,
                importButtonLabel: "Import supported exports",
            },
            ...(codexModule
                ? [
                    {
                        ...codexModule,
                        title: "Import codex files",
                        description: "Drop supported Codex JSON files together.",
                        importButtonLabel: "Import all codex",
                    },
                ]
                : []),
        ];
    }, [individualModules]);

    const defaultOpenId = useMemo(() => {
        const enabled = bulkModules.find((m) => m.enabled);
        return enabled?.id ?? null;
    }, [bulkModules]);

    const [openModuleId, setOpenModuleId] = useState<string | null>(defaultOpenId);
    const [advancedOpenModuleId, setAdvancedOpenModuleId] = useState<string | null>(null);

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

    const runSeoRegeneration = useCallback(async () => {
        if (!token.trim()) return;

        setSeoActionState({ status: "running" });

        try {
            const result = await apiClient.regenerateSeoPagesAdmin(token.trim());
            setSeoActionState({ status: "success", result });
        } catch (error) {
            setSeoActionState({
                status: "error",
                message: (error as Error)?.message ?? "Failed to regenerate SEO pages.",
            });
        }
    }, [token]);

    const downloadCodexDiagnosticsReport = useCallback(async () => {
        setCodexDiagnosticsActionState({ status: "running" });

        try {
            const rawEntries = await apiClient.getCodex();
            const reportText = createCodexDiagnosticsReportText(rawEntries);
            const downloaded = downloadCodexDiagnosticsReportText(reportText);

            if (!downloaded) {
                throw new Error("Codex diagnostics download is not available in this environment.");
            }

            setCodexDiagnosticsActionState({ status: "success", entryCount: rawEntries.length });
        } catch (error) {
            setCodexDiagnosticsActionState({
                status: "error",
                message: (error as Error)?.message ?? "Failed to download codex diagnostics report.",
            });
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
                <h1 className="admin-import-title">Admin Import</h1>

                <div className="admin-import-panel admin-import-section">
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Not available</div>
                    <div className="admin-import-muted">This page is restricted.</div>
                </div>
            </div>
        );
    }

    const isUnlocked = tokenStatus === "valid";

    return (
        <>
            <Helmet>
                <title>Admin Import – Endless Workshop</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Helmet>

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
                        <div className="admin-import-panel admin-import-section">
                            <div className="admin-import-row">
                                <div style={{ flex: "1 1 320px" }}>
                                    <div style={{ fontWeight: 800, marginBottom: 6 }}>SEO regeneration</div>
                                    <div className="admin-import-muted">
                                        Rebuild the current static SEO prototype page from canonical backend data after imports finish.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="admin-import-btn admin-import-btn--primary"
                                    disabled={seoActionState.status === "running"}
                                    onClick={() => void runSeoRegeneration()}
                                >
                                    {seoActionState.status === "running" ? "Regenerating…" : "Regenerate SEO pages"}
                                </button>
                            </div>

                            {seoActionState.status === "success" ? (
                                <div className="admin-import-success">
                                    <div style={{ fontWeight: 800, marginBottom: 6 }}>SEO pages regenerated</div>
                                    <div>
                                        Generated {seoActionState.result.generatedCount} page(s), skipped {seoActionState.result.skippedCount}
                                        {seoActionState.result.duplicateCount ? `, duplicates ${seoActionState.result.duplicateCount}` : ""}, sitemap updated:{" "}
                                        {seoActionState.result.sitemapUpdated ? "yes" : "no"}.
                                    </div>
                                    {formatSeoKindCounts(seoActionState.result) ? (
                                        <div className="admin-import-seoSummary">
                                            By kind: {formatSeoKindCounts(seoActionState.result)}
                                        </div>
                                    ) : null}
                                    {seoActionState.result.missingReferenceAudit ? (
                                        <div className="admin-import-seoSummary">
                                            Missing-reference audit: {seoActionState.result.missingReferenceAudit.unresolvedReferences} unresolved,{" "}
                                            {seoActionState.result.missingReferenceAudit.resolutionPercentage}% resolved. Top categories:{" "}
                                            {seoActionState.result.missingReferenceAudit.topUnresolvedCategories.join(", ") || "none"}.
                                        </div>
                                    ) : null}
                                    {seoActionState.result.missingReferenceAudit &&
                                    formatOwnershipBuckets(seoActionState.result.missingReferenceAudit) ? (
                                        <div className="admin-import-seoSummary">
                                            Ownership buckets: {formatOwnershipBuckets(seoActionState.result.missingReferenceAudit)}
                                        </div>
                                    ) : null}
                                    {seoActionState.result.missingReferenceAudit &&
                                    formatDuplicateAliasImpact(seoActionState.result.missingReferenceAudit) ? (
                                        <div className="admin-import-seoSummary">
                                            Duplicate alias impact:{" "}
                                            {formatDuplicateAliasImpact(seoActionState.result.missingReferenceAudit)}
                                        </div>
                                    ) : null}
                                    {seoActionState.result.missingReferenceAudit &&
                                    formatPresentButFilteredReasons(seoActionState.result.missingReferenceAudit) ? (
                                        <div className="admin-import-seoSummary">
                                            Present-but-filtered reasons:{" "}
                                            {formatPresentButFilteredReasons(seoActionState.result.missingReferenceAudit)}
                                        </div>
                                    ) : null}
                                    {seoActionState.result.warnings.length > 0 ? (
                                        <div className="admin-import-seoSummary">
                                            Warnings: {seoActionState.result.warnings.join(" | ")}
                                        </div>
                                    ) : null}
                                    {seoActionState.result.errors.length > 0 ? (
                                        <div className="admin-import-seoSummary">
                                            Errors: {seoActionState.result.errors.join(" | ")}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {seoActionState.status === "error" ? (
                                <div className="admin-import-error">
                                    <div className="admin-import-errorTitle">SEO regeneration failed</div>
                                    <div>{seoActionState.message}</div>
                                </div>
                            ) : null}

                            <div className="admin-import-row admin-import-diagnosticsRow">
                                <div style={{ flex: "1 1 320px" }}>
                                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Codex diagnostics</div>
                                    <div className="admin-import-muted">
                                        Download the current codex reference and descriptor diagnostics report.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="admin-import-btn admin-import-btn--ghost"
                                    disabled={codexDiagnosticsActionState.status === "running"}
                                    onClick={() => void downloadCodexDiagnosticsReport()}
                                >
                                    {codexDiagnosticsActionState.status === "running"
                                        ? "Preparing diagnostics…"
                                        : "Download codex diagnostics"}
                                </button>
                            </div>

                            {codexDiagnosticsActionState.status === "success" ? (
                                <div className="admin-import-success">
                                    {`Codex diagnostics report downloaded for ${codexDiagnosticsActionState.entryCount} ${
                                        codexDiagnosticsActionState.entryCount === 1 ? "entry" : "entries"
                                    }.`}
                                </div>
                            ) : null}

                            {codexDiagnosticsActionState.status === "error" ? (
                                <div className="admin-import-error">
                                    <div className="admin-import-errorTitle">Codex diagnostics download failed</div>
                                    <div>{codexDiagnosticsActionState.message}</div>
                                </div>
                            ) : null}
                        </div>

                        <div className="admin-import-pipelineTitle">Import pipeline</div>
                        <div className="admin-import-muted">
                            Use the two bulk rows for the normal local workflow, then open advanced rows only when a single file needs attention.
                        </div>

                        <div className="admin-import-pipeline">
                            {bulkModules.map((m, idx) => (
                                <ImportModuleRow
                                    key={m.id}
                                    index={idx + 1}
                                    token={token}
                                    module={m}
                                    isOpen={openModuleId === m.id}
                                    onToggle={() =>
                                        setOpenModuleId((cur) => (cur === m.id ? null : m.id))
                                    }
                                />
                            ))}
                        </div>

                        <div className="admin-import-advanced">
                            <button
                                type="button"
                                className="admin-import-advancedHeader"
                                aria-expanded={isAdvancedOpen}
                                onClick={() => setIsAdvancedOpen((value) => !value)}
                            >
                                <span>Advanced / individual imports</span>
                                <span className="admin-import-muted">
                                    {isAdvancedOpen ? "Hide rows" : "Show one-by-one rows"}
                                </span>
                            </button>

                            {isAdvancedOpen ? (
                                <div className="admin-import-pipeline admin-import-advancedPipeline">
                                    {individualModules.map((m, idx) => (
                                        <ImportModuleRow
                                            key={m.id}
                                            index={idx + 1}
                                            token={token}
                                            module={m}
                                            isOpen={advancedOpenModuleId === m.id}
                                            onToggle={() =>
                                                setAdvancedOpenModuleId((cur) => (cur === m.id ? null : m.id))
                                            }
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
