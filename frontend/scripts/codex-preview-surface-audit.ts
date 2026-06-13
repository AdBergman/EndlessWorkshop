import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { CodexEntry, CodexMetadataFact, CodexMetadataSectionItem } from "../src/types/dataTypes";

type CodexExportFile = {
    exportKind?: string;
    entries?: CodexEntry[];
};

type RefStats = {
    total: number;
    resolved: number;
    unresolved: number;
    duplicates: number;
};

type CategoryAudit = {
    category: string;
    entries: CodexEntry[];
    subcategories: Map<string, CodexEntry[]>;
    commonFacts: Map<string, number>;
    commonSections: Map<string, number>;
    commonItemLabels: Map<string, number>;
    relatedTargets: Map<string, number>;
    unresolvedRelated: number;
    structuredDuplicateRefs: number;
    factsOnlyEntries: CodexEntry[];
    directEffectsEntries: CodexEntry[];
};

type Candidate = {
    source: string;
    subcategory: string;
    relationship: string;
    surface: "inline clarification" | "compact rendered preview" | "one-line summary/card" | "no action";
    entries: number;
    refs: RefStats;
    playerValue: number;
    risk: number;
    owner: "EWShop" | "Exporter/editorial" | "Both" | "None";
    status: string;
    examples: CodexEntry[];
};

async function collectJsonFiles(path: string): Promise<string[]> {
    const info = await stat(path);
    if (info.isFile()) return [path];

    const children = await readdir(path);
    return children
        .filter((file) => file.endsWith(".json"))
        .sort((left, right) => left.localeCompare(right))
        .map((file) => resolve(path, file));
}

async function readCodexEntries(file: string): Promise<CodexEntry[]> {
    const payload = JSON.parse(await readFile(file, "utf8")) as CodexExportFile;
    const exportKind = normalize(payload.exportKind) || "unknown";

    return (payload.entries ?? []).map((entry) => ({
        ...entry,
        exportKind: normalize(entry.exportKind) || exportKind,
        displayName: entry.displayName ?? entry.entryKey,
        descriptionLines: entry.descriptionLines ?? [],
        referenceKeys: entry.referenceKeys ?? [],
        facts: entry.facts ?? [],
        sections: entry.sections ?? [],
        publicContextKeys: entry.publicContextKeys ?? [],
    }));
}

function argumentValue(name: string): string | undefined {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function positionalInput(): string | undefined {
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg.startsWith("--")) {
            index += 1;
            continue;
        }

        return arg;
    }

    return undefined;
}

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizedLower(value: unknown): string {
    return normalize(value).toLowerCase();
}

function visibleCategory(entry: CodexEntry): string {
    const exportKind = normalizedLower(entry.exportKind);
    if (exportKind !== "bonuses") return exportKind || "unknown";

    const category = `${entry.category ?? ""} ${entry.kind ?? ""}`.toLowerCase();
    if (category.includes("status")) return "statuses";
    if (category.includes("modifier")) return "modifiers";
    return "bonuses";
}

function subcategory(entry: CodexEntry): string {
    const category = normalize(entry.category);
    const kind = normalize(entry.kind);
    if (category && kind && category.toLowerCase() !== kind.toLowerCase()) {
        return `${category} / ${kind}`;
    }

    return category || kind || "(none)";
}

function increment(map: Map<string, number>, key: string, amount = 1) {
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + amount);
}

function topEntries(map: Map<string, number>, limit: number): string {
    const values = Array.from(map.entries())
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .slice(0, limit)
        .map(([key, count]) => `${key} (${count})`);

    return values.length > 0 ? values.join(", ") : "-";
}

function exampleList(entries: CodexEntry[], limit = 5): string {
    return entries
        .slice(0, limit)
        .map((entry) => `${entry.displayName} (${entry.entryKey})`)
        .join("<br>");
}

function allStructuredItems(entry: CodexEntry): CodexMetadataSectionItem[] {
    return (entry.sections ?? []).flatMap((section) => section.items ?? []);
}

function allStructuredFacts(entry: CodexEntry): CodexMetadataFact[] {
    return [
        ...(entry.facts ?? []),
        ...allStructuredItems(entry).flatMap((item) => item.facts ?? []),
    ];
}

function structuredReferenceKeys(entry: CodexEntry): string[] {
    return [
        ...allStructuredItems(entry).map((item) => item.referenceKey),
        ...allStructuredFacts(entry).map((fact) => fact.referenceKey),
    ].map(normalize).filter(Boolean);
}

function relationshipReferenceKeys(entry: CodexEntry): string[] {
    return [
        ...(entry.publicContextKeys ?? []),
        ...(entry.referenceKeys ?? []),
    ].map(normalize).filter(Boolean);
}

function directEffectsLineCount(entry: CodexEntry): number {
    return (entry.sections ?? [])
        .filter((section) => normalizedLower(section.title) === "effects")
        .reduce((count, section) => count + (section.lines ?? []).filter((line) => normalize(line)).length, 0);
}

function hasPlayerFacingMechanics(entry: CodexEntry): boolean {
    return (entry.sections ?? []).some((section) =>
        (section.lines ?? []).some((line) => normalize(line)) ||
        (section.items ?? []).some((item) =>
            normalize(item.referenceKey) ||
            (item.lines ?? []).some((line) => normalize(line)) ||
            (item.facts ?? []).some((fact) => normalize(fact.value))
        )
    );
}

function refStatsForEntries(
    entries: CodexEntry[],
    keyToEntry: Map<string, CodexEntry>,
    predicate: (entry: CodexEntry, refKey: string, target: CodexEntry | undefined) => boolean,
    structuredOnly = false
): RefStats {
    const stats: RefStats = { total: 0, resolved: 0, unresolved: 0, duplicates: 0 };

    for (const entry of entries) {
        const relationshipKeys = new Set(relationshipReferenceKeys(entry));
        const keys = structuredOnly ? structuredReferenceKeys(entry) : relationshipReferenceKeys(entry);

        for (const refKey of keys) {
            if (refKey === entry.entryKey) continue;

            const target = keyToEntry.get(refKey);
            if (!predicate(entry, refKey, target)) continue;

            stats.total += 1;
            if (target) {
                stats.resolved += 1;
            } else {
                stats.unresolved += 1;
            }
            if (structuredOnly && relationshipKeys.has(refKey)) {
                stats.duplicates += 1;
            }
        }
    }

    return stats;
}

function entriesWithSection(entries: CodexEntry[], title: string): CodexEntry[] {
    const expected = title.toLowerCase();
    return entries.filter((entry) =>
        (entry.sections ?? []).some((section) => normalizedLower(section.title) === expected)
    );
}

function entriesWithRelatedTarget(
    entries: CodexEntry[],
    keyToEntry: Map<string, CodexEntry>,
    targetCategory: string
): CodexEntry[] {
    return entries.filter((entry) =>
        relationshipReferenceKeys(entry).some((refKey) => {
            if (refKey === entry.entryKey) return false;
            const target = keyToEntry.get(refKey);
            return target ? visibleCategory(target) === targetCategory : false;
        })
    );
}

function entriesWithStructuredTarget(
    entries: CodexEntry[],
    keyToEntry: Map<string, CodexEntry>,
    targetCategory: string
): CodexEntry[] {
    return entries.filter((entry) =>
        structuredReferenceKeys(entry).some((refKey) => {
            const target = keyToEntry.get(refKey);
            return target ? visibleCategory(target) === targetCategory : false;
        })
    );
}

function createCategoryAudit(entries: CodexEntry[], keyToEntry: Map<string, CodexEntry>): CategoryAudit {
    const [firstEntry] = entries;
    const audit: CategoryAudit = {
        category: firstEntry ? visibleCategory(firstEntry) : "unknown",
        entries,
        subcategories: new Map(),
        commonFacts: new Map(),
        commonSections: new Map(),
        commonItemLabels: new Map(),
        relatedTargets: new Map(),
        unresolvedRelated: 0,
        structuredDuplicateRefs: 0,
        factsOnlyEntries: [],
        directEffectsEntries: [],
    };

    for (const entry of entries) {
        const sub = subcategory(entry);
        const subEntries = audit.subcategories.get(sub) ?? [];
        subEntries.push(entry);
        audit.subcategories.set(sub, subEntries);

        for (const fact of entry.facts ?? []) {
            increment(audit.commonFacts, normalize(fact.label));
        }

        for (const section of entry.sections ?? []) {
            increment(audit.commonSections, normalize(section.title));
            for (const item of section.items ?? []) {
                increment(audit.commonItemLabels, normalize(item.label));
            }
        }

        const relationKeys = new Set(relationshipReferenceKeys(entry));
        const structuredKeys = structuredReferenceKeys(entry);
        for (const refKey of relationKeys) {
            if (refKey === entry.entryKey) continue;

            const target = keyToEntry.get(refKey);
            if (target) {
                increment(audit.relatedTargets, visibleCategory(target));
            } else if (refKey !== entry.entryKey) {
                audit.unresolvedRelated += 1;
            }
        }

        for (const refKey of structuredKeys) {
            if (relationKeys.has(refKey)) {
                audit.structuredDuplicateRefs += 1;
            }
        }

        if (!hasPlayerFacingMechanics(entry)) {
            audit.factsOnlyEntries.push(entry);
        }

        if (directEffectsLineCount(entry) > 0) {
            audit.directEffectsEntries.push(entry);
        }
    }

    return audit;
}

function createCandidates(
    category: string,
    entries: CodexEntry[],
    keyToEntry: Map<string, CodexEntry>
): Candidate[] {
    const candidates: Candidate[] = [];
    const commonSubcategory = topSubcategories(entries, 1)[0]?.name ?? "(mixed)";
    const grantedEntries = entriesWithSection(entries, "granted abilities");
    const thresholdRewardEntries = entriesWithSection(entries, "threshold rewards");

    if (grantedEntries.length > 0) {
        const stats = refStatsForEntries(
            grantedEntries,
            keyToEntry,
            (_entry, _refKey, target) => !target || visibleCategory(target) === "abilities",
            true
        );
        const alreadyImplemented = category === "units" || category === "equipment";
        const mostlyUnresolved = stats.resolved < Math.max(2, stats.total / 2);
        candidates.push({
            source: category,
            subcategory: commonSubcategory,
            relationship: "Granted abilities",
            surface: mostlyUnresolved ? "no action" : "compact rendered preview",
            entries: grantedEntries.length,
            refs: stats,
            playerValue: alreadyImplemented ? 0 : mostlyUnresolved ? 3 : category === "heroes" ? 8 : 6,
            risk: alreadyImplemented ? 1 : mostlyUnresolved ? 7 : 3,
            owner: alreadyImplemented ? "None" : mostlyUnresolved ? "Exporter/editorial" : "EWShop",
            status: alreadyImplemented ? "Already covered by current preview pattern" : mostlyUnresolved ? "Blocked by unresolved Ability refs" : "Candidate",
            examples: grantedEntries,
        });
    }

    const statusRelatedEntries = entriesWithRelatedTarget(entries, keyToEntry, "statuses");
    if (statusRelatedEntries.length > 0) {
        const structuredStatusEntries = entriesWithStructuredTarget(entries, keyToEntry, "statuses");
        const stats = refStatsForEntries(
            statusRelatedEntries,
            keyToEntry,
            (_entry, _refKey, target) => !target || visibleCategory(target) === "statuses"
        );
        const directEffects = statusRelatedEntries.filter((entry) => directEffectsLineCount(entry) > 0).length;
        const alreadyImplemented = category === "abilities";
        candidates.push({
            source: category,
            subcategory: commonSubcategory,
            relationship: "Related Status/effect entries",
            surface: alreadyImplemented ? "inline clarification" : directEffects > statusRelatedEntries.length / 2 ? "one-line summary/card" : "compact rendered preview",
            entries: statusRelatedEntries.length,
            refs: {
                ...stats,
                duplicates: structuredStatusEntries.length,
            },
            playerValue: alreadyImplemented ? 0 : category === "diplomatictreaties" ? 5 : 6,
            risk: alreadyImplemented ? 1 : category === "diplomatictreaties" ? 6 : 5,
            owner: alreadyImplemented ? "None" : "Both",
            status: alreadyImplemented ? "Already covered for exact Ability prose mentions" : directEffects > 0 ? "Needs product review to avoid bloat" : "Needs exporter/editorial context first",
            examples: statusRelatedEntries,
        });
    }

    const unlockEntries = entriesWithSection(entries, "unlocks");
    if (unlockEntries.length > 0) {
        const stats = refStatsForEntries(
            unlockEntries,
            keyToEntry,
            () => true,
            true
        );
        const hasResolvedUnlockTargets = stats.resolved > 0;
        candidates.push({
            source: category,
            subcategory: commonSubcategory,
            relationship: "Unlock relationships",
            surface: hasResolvedUnlockTargets ? "one-line summary/card" : "no action",
            entries: unlockEntries.length,
            refs: stats,
            playerValue: hasResolvedUnlockTargets ? category === "tech" ? 7 : 5 : 2,
            risk: hasResolvedUnlockTargets ? 4 : 7,
            owner: hasResolvedUnlockTargets ? "EWShop" : "Exporter/editorial",
            status: hasResolvedUnlockTargets ? "Candidate after preview-surface product review" : "Needs exact exported unlock refs before UI work",
            examples: unlockEntries,
        });
    }

    if (thresholdRewardEntries.length > 0) {
        const stats = refStatsForEntries(
            thresholdRewardEntries,
            keyToEntry,
            () => true,
            true
        );
        const hasResolvedRewardTargets = stats.resolved > 0;
        candidates.push({
            source: category,
            subcategory: commonSubcategory,
            relationship: "Threshold reward targets",
            surface: hasResolvedRewardTargets ? "one-line summary/card" : "no action",
            entries: thresholdRewardEntries.length,
            refs: stats,
            playerValue: hasResolvedRewardTargets ? 7 : 2,
            risk: hasResolvedRewardTargets ? 4 : 7,
            owner: hasResolvedRewardTargets ? "EWShop" : "Exporter/editorial",
            status: hasResolvedRewardTargets ? "Candidate for exact reward-target summaries" : "Needs exact reward refs before UI work",
            examples: thresholdRewardEntries,
        });
    }

    const factionRelatedEntries = entriesWithRelatedTarget(entries, keyToEntry, "factions");
    if (factionRelatedEntries.length > 0) {
        const stats = refStatsForEntries(
            factionRelatedEntries,
            keyToEntry,
            (_entry, _refKey, target) => !target || visibleCategory(target) === "factions"
        );
        candidates.push({
            source: category,
            subcategory: commonSubcategory,
            relationship: "Faction references",
            surface: "one-line summary/card",
            entries: factionRelatedEntries.length,
            refs: stats,
            playerValue: 3,
            risk: 3,
            owner: "EWShop",
            status: "Usually already served by related-entry chips; avoid inline dossiers",
            examples: factionRelatedEntries,
        });
    }

    const factsOnly = entries.filter((entry) => !hasPlayerFacingMechanics(entry));
    if (factsOnly.length > 0) {
        candidates.push({
            source: category,
            subcategory: commonSubcategory,
            relationship: "Facts only, no player-facing mechanics",
            surface: "no action",
            entries: factsOnly.length,
            refs: { total: 0, resolved: 0, unresolved: 0, duplicates: 0 },
            playerValue: 1,
            risk: 8,
            owner: "Exporter/editorial",
            status: "Preview UI cannot create missing player context",
            examples: factsOnly,
        });
    }

    return candidates;
}

function topSubcategories(entries: CodexEntry[], limit = 5): Array<{ name: string; count: number; examples: CodexEntry[] }> {
    const groups = new Map<string, CodexEntry[]>();
    for (const entry of entries) {
        const key = subcategory(entry);
        const group = groups.get(key) ?? [];
        group.push(entry);
        groups.set(key, group);
    }

    return Array.from(groups.entries())
        .map(([name, groupEntries]) => ({ name, count: groupEntries.length, examples: groupEntries }))
        .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
        .slice(0, limit);
}

function formatStats(stats: RefStats): string {
    return `${stats.resolved}/${stats.total} resolved, ${stats.unresolved} unresolved, ${stats.duplicates} duplicate structured refs`;
}

function rankCandidates(candidates: Candidate[]): Candidate[] {
    return candidates
        .filter((candidate) => candidate.owner !== "None")
        .sort((left, right) =>
            (right.playerValue - right.risk / 3) - (left.playerValue - left.risk / 3) ||
            right.entries - left.entries ||
            left.source.localeCompare(right.source)
        );
}

function formatMarkdown(entries: CodexEntry[]): string {
    const keyToEntry = new Map(entries.map((entry) => [entry.entryKey, entry]));
    const categories = new Map<string, CodexEntry[]>();

    for (const entry of entries) {
        const category = visibleCategory(entry);
        const group = categories.get(category) ?? [];
        group.push(entry);
        categories.set(category, group);
    }

    const audits = Array.from(categories.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, categoryEntries]) => createCategoryAudit(categoryEntries, keyToEntry));
    const candidates = audits.flatMap((audit) => createCandidates(audit.category, audit.entries, keyToEntry));
    const ranked = rankCandidates(candidates);

    const lines: string[] = [
        "# Codex Preview-Surface Audit",
        "",
        "Status: active diagnostic report",
        "Generated: 2026-06-13",
        "Source: current local Codex imports in `local-imports/codex/`",
        "",
        "## Purpose",
        "",
        "This audit looks for future Codex preview-surface opportunities using only",
        "exported Codex metadata and exact resolved keys. It does not recommend a",
        "generic renderer, exporter contract changes, SEO work, or graph UI.",
        "",
        "Preview-surface meanings:",
        "",
        "- Inline clarification: exact mechanic references inside prose.",
        "- Compact rendered preview: relations that explain what the current entry does.",
        "- One-line summary/card: broad encyclopedia subjects such as factions or tech.",
        "- Related Entries remain exploration, not repetition.",
        "",
        "Already proven and covered: Ability -> applied Status inline links, Unit ->",
        "granted Ability compact previews, and Equipment -> granted Ability compact",
        "previews.",
        "",
        "## Top 10 Candidate Ranking",
        "",
        "| Rank | Source | Relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status | Examples |",
        "| ---: | --- | --- | --- | ---: | --- | ---: | ---: | --- | --- | --- |",
        ...ranked.slice(0, 10).map((candidate, index) =>
            `| ${index + 1} | ${candidate.source} | ${candidate.relationship} | ${candidate.surface} | ${candidate.entries} | ${formatStats(candidate.refs)} | ${candidate.playerValue} | ${candidate.risk} | ${candidate.owner} | ${candidate.status} | ${exampleList(candidate.examples, 3)} |`
        ),
        "",
        "## Recommended Next 3 Implementation Candidates After Equipment",
        "",
        "1. Heroes -> Granted abilities: compact preview rows. This reuses the proven",
        "   granted-Ability pattern, has mostly resolved data, and answers what a hero",
        "   actually brings to battle.",
        "2. Populations -> threshold reward targets: one-line summaries/cards for",
        "   exact reward refs. This helps players compare population breakpoints",
        "   without opening every reward target.",
        "3. Diplomatic Treaty -> related Status/effect entries: prototype only if a",
        "   focused treaty review still shows player confusion after direct Effects",
        "   text and related chips. Prefer one-line effect summaries over inline",
        "   expansion.",
        "",
        "Diplomatic Treaty -> Status/effect preview remains lower priority: the local",
        "data is narrow, several treaties already have direct Effects text, and the",
        "risk of repeating or bloating treaty pages is higher than for granted",
        "Ability surfaces.",
        "",
        "## Category And Subcategory Audit",
        "",
    ];

    for (const audit of audits) {
        lines.push(
            `### ${audit.category}`,
            "",
            `Entries: ${audit.entries.length}`,
            "",
            `Common facts: ${topEntries(audit.commonFacts, 8)}`,
            "",
            `Common sections: ${topEntries(audit.commonSections, 8)}`,
            "",
            `Common section item labels: ${topEntries(audit.commonItemLabels, 8)}`,
            "",
            `Related targets: ${topEntries(audit.relatedTargets, 8)}`,
            "",
            `Resolved-vs-unresolved related entries: ${audit.unresolvedRelated} unresolved public/reference keys observed.`,
            "",
            `Duplicated structured relationships: ${audit.structuredDuplicateRefs} structured reference keys also appear in public/reference keys.`,
            "",
            `Direct Effects section coverage: ${audit.directEffectsEntries.length}/${audit.entries.length} entries.`,
            "",
            `Facts-only/no mechanics entries: ${audit.factsOnlyEntries.length}/${audit.entries.length} entries.`,
            "",
            "| Useful subcategory | Entries | Example entries |",
            "| --- | ---: | --- |",
            ...topSubcategories(audit.entries, 5).map((sub) =>
                `| ${sub.name} | ${sub.count} | ${exampleList(sub.examples, 3)} |`
            ),
            "",
            "| Candidate relationship | Surface | Entries | Resolution | Player value | Risk | Owner | Status |",
            "| --- | --- | ---: | --- | ---: | ---: | --- | --- |",
            ...createCandidates(audit.category, audit.entries, keyToEntry).map((candidate) =>
                `| ${candidate.relationship} | ${candidate.surface} | ${candidate.entries} | ${formatStats(candidate.refs)} | ${candidate.playerValue} | ${candidate.risk} | ${candidate.owner} | ${candidate.status} |`
            ),
            ""
        );
    }

    lines.push(
        "## Ignore For Now",
        "",
        "- Faction references as inline expansion. They are large encyclopedia subjects;",
        "  keep them as one-line summaries/cards or related chips.",
        "- Modifiers top-level navigation or broad modifier preview work. Modifiers are",
        "  intentionally hidden from navigation and should stay exact-link targets.",
        "- Traits -> granted Ability preview until exporter/editorial resolves more",
        "  granted Ability keys. Current resolution is too low for a UI-first pass.",
        "- Tech unlock previews until exact unlock target refs are exported in the",
        "  Unlocks section. Current tech unlock text is useful but not linkable.",
        "- Diplomatic Treaty previews unless a focused browser review finds concrete",
        "  treaty pages where direct Effects plus related chips still fail the player.",
        "- Facts-only entries with no mechanics sections. Preview UI cannot manufacture",
        "  missing player context.",
        "",
        "## Ownership Split",
        "",
        "EWShop-owned opportunities:",
        "",
        "- Compact preview rows where exact structured refs are resolved and explain the",
        "  current entry, especially Heroes -> granted Abilities.",
        "- One-line summary/card treatment for exact unlock targets where the player is",
        "  choosing a plan, especially Tech unlocks.",
        "- Suppressing duplicate related cards only when the same target is already",
        "  shown in a local preview surface.",
        "",
        "DB exporter/editorial blockers:",
        "",
        "- Unresolved structured refs, especially Traits -> granted Abilities.",
        "- Facts-only entries with no player-facing mechanics or context.",
        "- Raw/internal text in public fields, tracked separately by the content-quality",
        "  diagnostic and exporter/editorial handoff.",
        "",
        "## Regenerate",
        "",
        "From `frontend/`:",
        "",
        "```bash",
        "npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md",
        "```",
        ""
    );

    return lines.join("\n");
}

async function main() {
    const defaultPath = resolve(process.cwd(), "../local-imports/codex");
    const inputPath = resolve(argumentValue("--input") ?? positionalInput() ?? defaultPath);
    const outputPath = argumentValue("--output");
    const files = await collectJsonFiles(inputPath);
    const entries = (await Promise.all(files.map(readCodexEntries))).flat();
    const markdown = formatMarkdown(entries);

    if (outputPath) {
        const resolvedOutputPath = resolve(outputPath);
        await mkdir(dirname(resolvedOutputPath), { recursive: true });
        await writeFile(resolvedOutputPath, markdown, "utf8");
        console.log(`Wrote ${resolvedOutputPath}`);
        return;
    }

    console.log(markdown);
}

await main();
