import { diagnoseDescriptionLine } from "@/lib/descriptionLine/descriptionDiagnostics";

type RawCodexEntry = {
    exportKind?: unknown;
    entryKey?: unknown;
    displayName?: unknown;
    descriptionLines?: unknown;
    referenceKeys?: unknown;
};

type CodexAuditWindow = Window & typeof globalThis & {
    __downloadCodexTokenAudit?: () => void;
};

let hasAutoDownloadedAuditForPageLoad = false;

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

function maybeInstallDownload(auditText: string) {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const auditWindow = window as CodexAuditWindow;
    auditWindow.__downloadCodexTokenAudit = () => {
        if (typeof Blob === "undefined" || typeof URL?.createObjectURL !== "function") {
            console.warn("[codexAudit] Automatic download is not available in this environment.");
            return;
        }

        const blob = new Blob([auditText], {
            type: "text/plain;charset=utf-8",
        });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = href;
        link.download = "codex-token-audit.txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(href);
    };
}

export function createCodexTokenAuditText(rawEntries: readonly RawCodexEntry[]): string {
    const { knownCounts, unknownCounts } = countTokens(rawEntries);

    return [
        ...formatSection("UNKNOWN TOKENS", unknownCounts),
        "",
        ...formatSection("KNOWN TOKENS", knownCounts),
    ].join("\n");
}

export function maybePublishCodexTokenAudit(rawEntries: readonly RawCodexEntry[]): string | null {
    if (!shouldRunCodexAuditFromUrl()) {
        return null;
    }

    const auditText = createCodexTokenAuditText(rawEntries);
    const auditWindow = window as CodexAuditWindow;
    maybeInstallDownload(auditText);

    if (!hasAutoDownloadedAuditForPageLoad) {
        hasAutoDownloadedAuditForPageLoad = true;
        auditWindow.__downloadCodexTokenAudit?.();
        console.info("Codex token audit downloaded");
    }

    return auditText;
}

export function resetCodexTokenAuditDevFlagsForTests() {
    hasAutoDownloadedAuditForPageLoad = false;
}
