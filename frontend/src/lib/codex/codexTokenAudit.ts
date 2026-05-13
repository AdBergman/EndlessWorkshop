import { diagnoseDescriptionLine } from "@/lib/descriptionLine/descriptionDiagnostics";
import type { CodexEntry } from "@/types/dataTypes";
import { createCodexDiagnosticsReport, formatCodexDiagnosticsReport } from "./codexDiagnosticsReport";

type RawCodexEntry = {
    exportKind?: unknown;
    entryKey?: unknown;
    displayName?: unknown;
    descriptionLines?: unknown;
    referenceKeys?: unknown;
};

type CodexAuditWindow = Window & typeof globalThis & {
    __downloadCodexTokenAudit?: () => void;
    __downloadCodexDiagnosticsReport?: () => void;
};

let hasAutoDownloadedAuditForPageLoad = false;
let hasAutoDownloadedDiagnosticsReportForPageLoad = false;

function toDisplayName(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function shouldRunCodexAuditFromUrl(): boolean {
    if (!import.meta.env.DEV || typeof window === "undefined") {
        return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("codexAudit") === "1";
}

function shouldRunCodexDiagnosticsReportFromUrl(): boolean {
    if (!import.meta.env.DEV || typeof window === "undefined") {
        return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "1" && params.get("codexDiagnostics") === "1";
}

function countTokens(rawEntries: readonly RawCodexEntry[]) {
    const knownCounts = new Map<string, number>();
    const unknownCounts = new Map<string, number>();

    const addToken = (token: string, isKnown: boolean) => {
        const target = isKnown ? knownCounts : unknownCounts;
        target.set(token, (target.get(token) ?? 0) + 1);
    };

    const addLineDiagnostics = (line: string) => {
        diagnoseDescriptionLine(line).forEach((diagnostic) => {
            if (diagnostic.kind === "malformed-token" || !diagnostic.token) return;

            addToken(diagnostic.token, diagnostic.kind === "known-style-token");
        });
    };

    rawEntries.forEach((entry) => {
        const displayName = toDisplayName(entry.displayName);
        const descriptionLines = toStringArray(entry.descriptionLines);

        addLineDiagnostics(displayName);
        descriptionLines.forEach(addLineDiagnostics);
    });

    return { knownCounts, unknownCounts };
}

function formatSection(title: string, counts: Map<string, number>): string[] {
    const sortedLines = Array.from(counts.entries())
        .sort((left, right) => {
            const countDelta = right[1] - left[1];
            if (countDelta !== 0) return countDelta;
            return left[0].localeCompare(right[0]);
        })
        .map(([token, occurrences]) => `${token} (${occurrences})`);

    return [title, "-".repeat(title.length), ...sortedLines];
}

function installTextDownload(
    text: string,
    {
        assignDownload,
        downloadName,
        warningLabel,
    }: {
        assignDownload: (auditWindow: CodexAuditWindow, download: () => void) => void;
        downloadName: string;
        warningLabel: string;
    }
) {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const auditWindow = window as CodexAuditWindow;
    assignDownload(auditWindow, () => {
        if (typeof Blob === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
            console.warn(`[${warningLabel}] Automatic download is not available in this environment.`);
            return;
        }

        const blob = new Blob([text], {
            type: "text/plain;charset=utf-8",
        });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = href;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(href);
    });
}

function maybeInstallTokenAuditDownload(auditText: string) {
    installTextDownload(auditText, {
        assignDownload: (auditWindow, download) => {
            auditWindow.__downloadCodexTokenAudit = download;
        },
        downloadName: "codex-token-audit.txt",
        warningLabel: "codexAudit",
    });
}

function maybeInstallDiagnosticsReportDownload(reportText: string) {
    installTextDownload(reportText, {
        assignDownload: (auditWindow, download) => {
            auditWindow.__downloadCodexDiagnosticsReport = download;
        },
        downloadName: "codex-diagnostics-report.txt",
        warningLabel: "codexDiagnostics",
    });
}

function toCodexEntries(rawEntries: readonly RawCodexEntry[]): CodexEntry[] {
    return rawEntries
        .map((entry) => ({
            exportKind: toDisplayName(entry.exportKind).trim().toLowerCase(),
            entryKey: toDisplayName(entry.entryKey).trim(),
            displayName: toDisplayName(entry.displayName),
            descriptionLines: toStringArray(entry.descriptionLines),
            referenceKeys: toStringArray(entry.referenceKeys),
        }))
        .filter((entry) => entry.entryKey.length > 0);
}

export function createCodexTokenAuditText(rawEntries: readonly RawCodexEntry[]): string {
    const { knownCounts, unknownCounts } = countTokens(rawEntries);

    return [
        ...formatSection("UNKNOWN TOKENS", unknownCounts),
        "",
        ...formatSection("KNOWN TOKENS", knownCounts),
    ].join("\n");
}

export function createCodexDiagnosticsReportText(rawEntries: readonly RawCodexEntry[]): string {
    return formatCodexDiagnosticsReport(createCodexDiagnosticsReport(toCodexEntries(rawEntries)));
}

function maybePublishCodexDiagnosticsReport(rawEntries: readonly RawCodexEntry[]): string | null {
    if (!shouldRunCodexDiagnosticsReportFromUrl()) {
        return null;
    }

    const reportText = createCodexDiagnosticsReportText(rawEntries);
    const auditWindow = window as CodexAuditWindow;
    maybeInstallDiagnosticsReportDownload(reportText);

    if (!hasAutoDownloadedDiagnosticsReportForPageLoad) {
        hasAutoDownloadedDiagnosticsReportForPageLoad = true;
        auditWindow.__downloadCodexDiagnosticsReport?.();
        console.info("Codex diagnostics report downloaded");
    }

    return reportText;
}

function maybePublishTokenAudit(rawEntries: readonly RawCodexEntry[]): string | null {
    if (!shouldRunCodexAuditFromUrl()) {
        return null;
    }

    const auditText = createCodexTokenAuditText(rawEntries);
    const auditWindow = window as CodexAuditWindow;
    maybeInstallTokenAuditDownload(auditText);

    if (!hasAutoDownloadedAuditForPageLoad) {
        hasAutoDownloadedAuditForPageLoad = true;
        auditWindow.__downloadCodexTokenAudit?.();
        console.info("Codex token audit downloaded");
    }

    return auditText;
}

export function maybePublishCodexTokenAudit(rawEntries: readonly RawCodexEntry[]): string | null {
    const auditText = maybePublishTokenAudit(rawEntries);
    const reportText = maybePublishCodexDiagnosticsReport(rawEntries);

    return auditText ?? reportText;
}

export function resetCodexTokenAuditDevFlagsForTests() {
    hasAutoDownloadedAuditForPageLoad = false;
    hasAutoDownloadedDiagnosticsReportForPageLoad = false;
}
