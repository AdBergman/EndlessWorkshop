import { getCodexEntryIconPath } from "@/features/icons/codexEntryIcons";
import { getConfiguredCodexKindIconPaths } from "@/features/icons/codexKindIcons";
import { getDescriptionTokenIcon } from "@/features/icons/descriptionTokenIcons";
import { getRawIconEntries } from "@/features/icons/iconManifest";
import { getConfiguredUnitCardStatIconPaths } from "@/features/icons/unitStatIcons";
import {
    extractBracketTokenMatches,
    type TokenMatch,
} from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type IconUsageSource =
    | "codex-entry"
    | "description-token"
    | "configured-codex-kind"
    | "configured-unit-stat";

type IconUsageCount = {
    path: string;
    count: number;
    sources: Partial<Record<IconUsageSource, number>>;
};

type IconTokenCount = {
    token: string;
    count: number;
    path?: string;
    examples: string[];
};

export type IconCategoryUsage = {
    category: string;
    manifestPathCount: number;
    usedPathCount: number;
    unusedPathCount: number;
    unusedExamples: string[];
};

export type IconUsageDiagnosticsReport = {
    manifestPathCount: number;
    usedPathCount: number;
    iconUsages: IconUsageCount[];
    resolvedTokens: IconTokenCount[];
    unresolvedTokens: IconTokenCount[];
    categories: IconCategoryUsage[];
    unusedCategories: IconCategoryUsage[];
};

function addPathUsage(
    usages: Map<string, IconUsageCount>,
    path: string,
    source: IconUsageSource
) {
    const existing = usages.get(path);

    if (existing) {
        existing.count += 1;
        existing.sources[source] = (existing.sources[source] ?? 0) + 1;
        return;
    }

    usages.set(path, {
        path,
        count: 1,
        sources: {
            [source]: 1,
        },
    });
}

function addTokenCount(
    counts: Map<string, IconTokenCount>,
    token: string,
    line: string,
    path?: string
) {
    const key = path ? `${token}\u0000${path}` : token;
    const existing = counts.get(key);

    if (existing) {
        existing.count += 1;
        if (existing.examples.length < 3 && !existing.examples.includes(line)) {
            existing.examples.push(line);
        }
        return;
    }

    counts.set(key, {
        token,
        count: 1,
        ...(path ? { path } : {}),
        examples: line ? [line] : [],
    });
}

function categoryForPath(path: string): string {
    const match = path.match(/^\/svg\/([^/]+)\//);
    return match?.[1] ?? "unknown";
}

function sortedIconUsages(usages: Map<string, IconUsageCount>): IconUsageCount[] {
    return Array.from(usages.values()).sort((left, right) => {
        const countDelta = right.count - left.count;
        if (countDelta !== 0) return countDelta;
        return left.path.localeCompare(right.path);
    });
}

function sortedTokenCounts(counts: Map<string, IconTokenCount>): IconTokenCount[] {
    return Array.from(counts.values()).sort((left, right) => {
        const countDelta = right.count - left.count;
        if (countDelta !== 0) return countDelta;
        return left.token.localeCompare(right.token);
    });
}

function addLineTokenUsages(
    line: string,
    usages: Map<string, IconUsageCount>,
    resolvedTokens: Map<string, IconTokenCount>,
    unresolvedTokens: Map<string, IconTokenCount>
) {
    const matches: TokenMatch[] = extractBracketTokenMatches(line);

    matches.forEach((match) => {
        const icon = getDescriptionTokenIcon(match.token, {
            line,
            tokenIndex: match.index,
        });

        if (icon) {
            addPathUsage(usages, icon.path, "description-token");
            addTokenCount(resolvedTokens, match.token, line, icon.path);
            return;
        }

        addTokenCount(unresolvedTokens, match.token, line);
    });
}

function buildCategoryUsage(usedPaths: Set<string>): IconCategoryUsage[] {
    const pathsByCategory = new Map<string, Set<string>>();

    for (const { path } of getRawIconEntries()) {
        const category = categoryForPath(path);
        const paths = pathsByCategory.get(category) ?? new Set<string>();
        paths.add(path);
        pathsByCategory.set(category, paths);
    }

    return Array.from(pathsByCategory.entries())
        .map(([category, manifestPaths]) => {
            const manifestPathList = Array.from(manifestPaths).sort((left, right) => left.localeCompare(right));
            const usedPathCount = manifestPathList.filter((path) => usedPaths.has(path)).length;
            const unusedExamples = manifestPathList.filter((path) => !usedPaths.has(path)).slice(0, 5);

            return {
                category,
                manifestPathCount: manifestPathList.length,
                usedPathCount,
                unusedPathCount: manifestPathList.length - usedPathCount,
                unusedExamples,
            };
        })
        .sort((left, right) => left.category.localeCompare(right.category));
}

export function createIconUsageDiagnosticsReport(entries: readonly CodexEntry[]): IconUsageDiagnosticsReport {
    const usages = new Map<string, IconUsageCount>();
    const resolvedTokens = new Map<string, IconTokenCount>();
    const unresolvedTokens = new Map<string, IconTokenCount>();

    getConfiguredCodexKindIconPaths().forEach((path) => addPathUsage(usages, path, "configured-codex-kind"));
    getConfiguredUnitCardStatIconPaths().forEach((path) => addPathUsage(usages, path, "configured-unit-stat"));

    entries.forEach((entry) => {
        const entryIconPath = getCodexEntryIconPath(entry);
        if (entryIconPath) {
            addPathUsage(usages, entryIconPath, "codex-entry");
        }

        addLineTokenUsages(entry.displayName, usages, resolvedTokens, unresolvedTokens);
        entry.descriptionLines.forEach((line) => addLineTokenUsages(line, usages, resolvedTokens, unresolvedTokens));
    });

    const usedPaths = new Set(usages.keys());
    const categories = buildCategoryUsage(usedPaths);
    const manifestPathCount = new Set(getRawIconEntries().map((entry) => entry.path)).size;

    return {
        manifestPathCount,
        usedPathCount: usedPaths.size,
        iconUsages: sortedIconUsages(usages),
        resolvedTokens: sortedTokenCounts(resolvedTokens),
        unresolvedTokens: sortedTokenCounts(unresolvedTokens),
        categories,
        unusedCategories: categories.filter((category) => category.usedPathCount === 0),
    };
}

function formatSourceCounts(sources: Partial<Record<IconUsageSource, number>>): string {
    return Object.entries(sources)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([source, count]) => `${source}: ${count}`)
        .join("; ");
}

function formatTokenCount(tokenCount: IconTokenCount): string {
    const path = tokenCount.path ? ` -> ${tokenCount.path}` : "";
    const examples = tokenCount.examples.length > 0 ? ` examples: ${tokenCount.examples.join(" | ")}` : "";
    return `- ${tokenCount.token}: ${tokenCount.count}${path}${examples}`;
}

export function formatIconUsageDiagnosticsReport(report: IconUsageDiagnosticsReport): string[] {
    const unusedCategorySummary = report.unusedCategories.length > 0
        ? report.unusedCategories.map((category) => `${category.category} (${category.manifestPathCount})`).join(", ")
        : "none";

    return [
        "ICON USAGE SUMMARY",
        "------------------",
        `- manifest unique SVG paths: ${report.manifestPathCount}`,
        `- frontend observed/configured SVG paths: ${report.usedPathCount}`,
        `- resolved icon tokens: ${report.resolvedTokens.reduce((sum, token) => sum + token.count, 0)}`,
        `- unresolved icon tokens: ${report.unresolvedTokens.reduce((sum, token) => sum + token.count, 0)}`,
        `- manifest categories with no observed/configured frontend use: ${unusedCategorySummary}`,
        "",
        "ICON USAGE BY CATEGORY",
        "----------------------",
        ...report.categories.map((category) =>
            `- ${category.category}: used ${category.usedPathCount}/${category.manifestPathCount}, unused ${category.unusedPathCount}`
        ),
        "",
        "TOP ICON PATH USAGE",
        "-------------------",
        ...(report.iconUsages.length > 0
            ? report.iconUsages.slice(0, 60).map((usage) =>
                `- ${usage.path}: ${usage.count} (${formatSourceCounts(usage.sources)})`
            )
            : ["- none"]),
        "",
        "RESOLVED ICON TOKENS",
        "--------------------",
        ...(report.resolvedTokens.length > 0 ? report.resolvedTokens.slice(0, 80).map(formatTokenCount) : ["- none"]),
        "",
        "UNRESOLVED ICON TOKENS",
        "----------------------",
        ...(report.unresolvedTokens.length > 0 ? report.unresolvedTokens.slice(0, 80).map(formatTokenCount) : ["- none"]),
        "",
        "UNUSED MANIFEST CATEGORY EXAMPLES",
        "---------------------------------",
        ...report.categories
            .filter((category) => category.unusedPathCount > 0)
            .map((category) => {
                const examples = category.unusedExamples.length > 0 ? category.unusedExamples.join(", ") : "none";
                return `- ${category.category}: ${category.unusedPathCount} unused example(s): ${examples}`;
            }),
    ];
}
