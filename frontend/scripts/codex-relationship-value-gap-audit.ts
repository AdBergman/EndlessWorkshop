import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { CodexEntry } from "../src/types/dataTypes";

type CodexExportFile = {
    exportKind?: string;
    entries?: CodexEntry[];
};

type EntryWithKind = CodexEntry & { exportKind: string };

type RelationshipGap = {
    area: string;
    playerQuestion: string;
    currentDataShape: string;
    owner: string;
    productTreatment: string;
};

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

async function collectJsonFiles(path: string): Promise<string[]> {
    const info = await stat(path);
    if (info.isFile()) return [path];

    const children = await readdir(path);
    return children
        .filter((file) => file.endsWith(".json"))
        .sort((left, right) => left.localeCompare(right))
        .map((file) => resolve(path, file));
}

async function readCodexEntries(file: string): Promise<EntryWithKind[]> {
    const payload = JSON.parse(await readFile(file, "utf8")) as CodexExportFile;
    const exportKind = payload.exportKind?.trim() || "unknown";

    return (payload.entries ?? []).map((entry) => ({
        ...entry,
        exportKind: entry.exportKind?.trim() || exportKind,
        displayName: entry.displayName ?? entry.entryKey,
        descriptionLines: entry.descriptionLines ?? [],
        referenceKeys: entry.referenceKeys ?? [],
        facts: entry.facts ?? [],
        sections: entry.sections ?? [],
        publicContextKeys: entry.publicContextKeys ?? [],
    }));
}

function normalize(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function lower(value: unknown): string {
    return normalize(value).toLowerCase();
}

function sectionHasContent(section: NonNullable<CodexEntry["sections"]>[number]): boolean {
    return (section.lines ?? []).some((line) => normalize(line)) ||
        (section.items ?? []).some((item) =>
            normalize(item.referenceKey) ||
            (item.lines ?? []).some((line) => normalize(line)) ||
            (item.facts ?? []).some((fact) => normalize(fact.value))
        );
}

function hasSectionContent(entry: CodexEntry): boolean {
    return (entry.sections ?? []).some(sectionHasContent);
}

function hasDescription(entry: CodexEntry): boolean {
    return (entry.descriptionLines ?? []).some((line) => normalize(line));
}

function isThin(entry: CodexEntry): boolean {
    return !hasDescription(entry) && !hasSectionContent(entry);
}

function isStatus(entry: EntryWithKind): boolean {
    const key = entry.entryKey ?? "";
    return lower(entry.category) === "status" ||
        lower(entry.kind) === "status" ||
        key.startsWith("Status_") ||
        key.startsWith("HeroStatus_");
}

function visibleCategory(entry: EntryWithKind): string {
    if (entry.exportKind !== "bonuses") return entry.exportKind;
    if (isStatus(entry)) return "statuses";
    if (`${entry.category ?? ""} ${entry.kind ?? ""}`.toLowerCase().includes("modifier")) {
        return "modifiers";
    }

    return "bonuses";
}

function allLines(entry: CodexEntry): string[] {
    return [
        ...(entry.descriptionLines ?? []),
        ...(entry.sections ?? []).flatMap((section) => [
            section.title ?? "",
            ...(section.lines ?? []),
            ...(section.items ?? []).flatMap((item) => [
                item.label ?? "",
                ...(item.lines ?? []),
                ...(item.facts ?? []).flatMap((fact) => [fact.label ?? "", fact.value ?? ""]),
            ]),
        ]),
    ].map(normalize).filter(Boolean);
}

function relationshipKeys(entry: CodexEntry): string[] {
    return [...(entry.referenceKeys ?? []), ...(entry.publicContextKeys ?? [])]
        .map(normalize)
        .filter(Boolean);
}

function unique<T>(values: T[]): T[] {
    return Array.from(new Set(values));
}

function example(entry: CodexEntry | undefined): string {
    return entry ? `${entry.displayName} (${entry.entryKey})` : "-";
}

function exampleList(entries: CodexEntry[], limit = 3): string {
    return entries.slice(0, limit).map(example).join("<br>") || "-";
}

function targetLabel(key: string, keyToEntry: Map<string, EntryWithKind>): string {
    const target = keyToEntry.get(key);
    return target ? `${target.displayName} (${target.entryKey})` : key;
}

function renderList(items: string[]): string[] {
    return items.map((item) => `- ${item}`);
}

function renderNumbered(items: string[]): string[] {
    return items.map((item, index) => `${index + 1}. ${item}`);
}

function entriesByKind(entries: EntryWithKind[], kind: string): EntryWithKind[] {
    return entries.filter((entry) => visibleCategory(entry) === kind);
}

function thresholdItems(entry: CodexEntry): Array<{
    label: string;
    ref: string;
    value: string;
}> {
    return (entry.sections ?? [])
        .filter((section) => lower(section.title).includes("threshold"))
        .flatMap((section) => (section.items ?? []).map((item) => ({
            label: normalize(item.label),
            ref: normalize(item.referenceKey),
            value: (item.facts ?? [])
                .map((fact) => `${fact.label}: ${fact.value}`)
                .concat(item.lines ?? [])
                .map(normalize)
                .filter(Boolean)
                .join("; "),
        })));
}

function hasDirectEffects(entry: CodexEntry): boolean {
    return (entry.sections ?? []).some((section) =>
        lower(section.title) === "effects" && sectionHasContent(section)
    );
}

function subcategory(entry: CodexEntry): string {
    const category = normalize(entry.category);
    const kind = normalize(entry.kind);
    if (category && kind && category.toLowerCase() !== kind.toLowerCase()) {
        return `${category} / ${kind}`;
    }

    return category || kind || "(none)";
}

function thinSummary(entries: EntryWithKind[]): string {
    const byKind = new Map<string, EntryWithKind[]>();
    for (const entry of entries) {
        const kind = visibleCategory(entry);
        const group = byKind.get(kind) ?? [];
        group.push(entry);
        byKind.set(kind, group);
    }

    return Array.from(byKind.entries())
        .map(([kind, group]) => ({
            kind,
            total: group.length,
            thin: group.filter(isThin).length,
            examples: group.filter(isThin),
        }))
        .filter((row) => row.thin > 0)
        .sort((left, right) => (right.thin / right.total) - (left.thin / left.total))
        .map((row) => `${row.kind}: ${row.thin}/${row.total} thin (${exampleList(row.examples)})`)
        .join("; ");
}

function formatMarkdown(entries: EntryWithKind[]): string {
    const keyToEntry = new Map(entries.map((entry) => [entry.entryKey, entry]));
    const tech = entriesByKind(entries, "tech");
    const populations = entriesByKind(entries, "populations");
    const districts = entriesByKind(entries, "districts");
    const actions = entriesByKind(entries, "actions");
    const treaties = entriesByKind(entries, "diplomaticTreaties");
    const statuses = entriesByKind(entries, "statuses");
    const improvements = entriesByKind(entries, "improvements");
    const abilities = entriesByKind(entries, "abilities");

    const techUnlockSections = tech.filter((entry) =>
        (entry.sections ?? []).some((section) => lower(section.title).includes("unlock"))
    );
    const techUnlockItemRefs = techUnlockSections
        .flatMap((entry) => entry.sections ?? [])
        .filter((section) => lower(section.title).includes("unlock"))
        .flatMap((section) => section.items ?? [])
        .map((item) => normalize(item.referenceKey))
        .filter(Boolean);
    const uniqueTechUnlockRefs = unique(techUnlockItemRefs);
    const resolvedTechUnlockRefs = uniqueTechUnlockRefs.filter((key) => keyToEntry.has(key));
    const techUnlockText = tech.filter((entry) =>
        allLines(entry).some((line) => /\bunlock/i.test(line))
    );
    const techUnlockLikeRefs = tech.filter((entry) =>
        relationshipKeys(entry).some((key) => {
            const target = keyToEntry.get(key);
            return target && ["units", "improvements", "districts", "equipment", "heroes", "traits"].includes(visibleCategory(target));
        })
    );
    const decipheringStone = tech.find((entry) => entry.entryKey === "Mukag_Technology_03");
    const keystones = tech.find((entry) => entry.entryKey === "Technology_District_Tier1_Bridge_00");
    const choralAmplifier = tech.find((entry) => entry.entryKey === "Aspect_Technology_Unit_Specialization_00");

    const populationThresholdRows = populations.flatMap((entry) =>
        thresholdItems(entry).map((item) => ({ entry, ...item }))
    );
    const exactThresholdRows = populationThresholdRows.filter((item) => item.ref);
    const textThresholdRows = populationThresholdRows.filter((item) => !item.ref);
    const uniqueThresholdRefs = unique(exactThresholdRows.map((item) => item.ref));
    const aspectPopulation = populations.find((entry) => entry.entryKey === "Population_Aspect");
    const daughterOfBor = populations.find((entry) => entry.entryKey === "Population_Minor_DaughterOfBor");
    const horatio = populations.find((entry) => entry.entryKey === "Population_Minor_Horatio");
    const kin = populations.find((entry) => entry.entryKey === "Population_KinOfSheredyn");
    const lastLord = populations.find((entry) => entry.entryKey === "Population_LastLord");

    const extractors = districts.filter((entry) =>
        lower(entry.category) === "resource" ||
        lower(entry.displayName).includes("extractor") ||
        entry.entryKey.startsWith("Extractor_")
    );
    const extractorResolvedRefs = extractors
        .flatMap((entry) => relationshipKeys(entry).filter((key) => key !== entry.entryKey))
        .filter((key) => keyToEntry.has(key)).length;
    const resourceExportEntries = entries.filter((entry) => visibleCategory(entry) === "resources");
    const resourcesWithEffects = resourceExportEntries.filter(hasDirectEffects);
    const thinResources = resourceExportEntries.filter(isThin);
    const klaxExtractor = extractors.find((entry) => entry.entryKey === "Extractor_Luxury01");
    const advancedKlax = extractors.find((entry) => entry.entryKey === "Extractor_Luxury01_Tier2");

    const actionWithSections = actions.filter(hasSectionContent);
    const thinActions = actions.filter(isThin);
    const absorbCity = actions.find((entry) => entry.entryKey === "ActionTypeAbsorbCity");
    const closeRift = actions.find((entry) => entry.entryKey === "ActionTypeCloseRift");
    const razeDistrict = actions.find((entry) => entry.entryKey === "ConstructibleAction_RazeDistrict");
    const buildObservatory = actions.find((entry) => entry.entryKey === "ActionTypeBuildObservatory");
    const buildCoralSpore = actions.find((entry) => entry.entryKey === "FactionActionTypeAspect_BuildCoralSpore");

    const treatyDirectEffects = treaties.filter(hasDirectEffects);
    const treatyStatusRefs = treaties.filter((entry) =>
        relationshipKeys(entry).some((key) => {
            const target = keyToEntry.get(key);
            return target ? visibleCategory(target) === "statuses" : false;
        })
    );
    const treatyBoth = treaties.filter((entry) =>
        hasDirectEffects(entry) && treatyStatusRefs.includes(entry)
    );
    const treatyNeither = treaties.filter((entry) =>
        !hasDirectEffects(entry) && !treatyStatusRefs.includes(entry)
    );
    const closeBorders = treaties.find((entry) => entry.entryKey === "Declaration_CloseBorders");
    const sharedResearch = treaties.find((entry) => entry.entryKey === "Treaty_SharedResearch");
    const sharedVictory = treaties.find((entry) => entry.entryKey === "Treaty_SharedVictory");
    const surrenderDemand = treaties.find((entry) => entry.entryKey === "Treaty_AskToSurrender");
    const surrenderOffer = treaties.find((entry) => entry.entryKey === "Treaty_ProposeSurrender");

    const statusGroups = new Map<string, number>();
    for (const status of statuses) {
        const group = subcategory(status);
        statusGroups.set(group, (statusGroups.get(group) ?? 0) + 1);
    }
    const statusWithMechanics = statuses.filter(hasSectionContent);
    const thinStatuses = statuses.filter(isThin);
    const goodStatus = statuses.find((entry) => entry.entryKey === "Status_City_Approval_High");
    const thinStatus = statuses.find((entry) => entry.entryKey === "HeroStatus_Loss");

    const thinDistricts = districts.filter(isThin);
    const thinImprovements = improvements.filter(isThin);
    const thinAbilities = abilities.filter(isThin);

    const gaps: RelationshipGap[] = [
        {
            area: "Tech unlocks",
            playerQuestion: "What does this tech unlock?",
            currentDataShape: `${tech.length} Tech entries; ${techUnlockSections.length} have Unlocks sections; ${resolvedTechUnlockRefs.length}/${uniqueTechUnlockRefs.length} unique Unlock refs resolve; ${techUnlockText.length} have unlock text.`,
            owner: "EWShop/product, with exporter/editorial for unresolved or text-only unlocks",
            productTreatment: "Keep Tech top-level; review one-line unlock summaries using exact refs only.",
        },
        {
            area: "Major faction Population thresholds",
            playerQuestion: "What does this breakpoint reward actually unlock?",
            currentDataShape: `${populationThresholdRows.length} threshold items; ${uniqueThresholdRefs.length} exact unique refs are usable, ${textThresholdRows.length} rewards remain text-only.`,
            owner: "DB exporter/editorial",
            productTreatment: "Keep Population top-level; EWShop can only summarize exact refs.",
        },
        {
            area: "Extractor -> Resource",
            playerQuestion: "Which resource does this extractor produce?",
            currentDataShape: `${extractors.length} Resource-category extractor Districts; ${extractorResolvedRefs} resolved extractor refs; ${resourceExportEntries.length} Resource export entries.`,
            owner: "EWShop/product, with exporter/editorial for thin entries",
            productTreatment: "Keep Extractors under Districts; keep Resources searchable/linkable; defer top-level Resource promotion until browser QA.",
        },
        {
            area: "Resource Codex surface",
            playerQuestion: "What does this resource do?",
            currentDataShape: `${resourceExportEntries.length} Resource export entries; ${resourcesWithEffects.length} have direct Effects; ${thinResources.length} are facts-only/thin.`,
            owner: "EWShop/product, with exporter/editorial for thin entries",
            productTreatment: "Keep Resources searchable/linkable now; decide top-level navigation only after browser QA.",
        },
        {
            area: "Thin Actions",
            playerQuestion: "What does this action do and when should I use it?",
            currentDataShape: `${actions.length} Actions; ${thinActions.length} have only facts and no public description/mechanics section.`,
            owner: "DB exporter/editorial",
            productTreatment: "Keep exact-link/search targets; avoid promoting thin Actions as rich browse content.",
        },
        {
            area: "Action cost/mechanic context",
            playerQuestion: "Why is this cost modifier relevant?",
            currentDataShape: `${actionWithSections.length} Actions have sections, mostly cost modifiers or formula notes.`,
            owner: "Both",
            productTreatment: "Exporter summaries first; EWShop can later group/highlight useful mechanics.",
        },
        {
            area: "Diplomatic Treaty impact",
            playerQuestion: "What changes when I sign or declare this?",
            currentDataShape: `${treaties.length} Treaties; ${treatyDirectEffects.length} direct Effects, ${treatyStatusRefs.length} Status refs, ${treatyBoth.length} with both, ${treatyNeither.length} with neither.`,
            owner: "Both",
            productTreatment: "Keep browseable; preview only exact Status refs after product review.",
        },
        {
            area: "Treaty placeholder/unfinished text",
            playerQuestion: "What tribute/cost/status is involved?",
            currentDataShape: "Some treaty text is incomplete, especially surrender tribute prose.",
            owner: "DB exporter/editorial",
            productTreatment: "Fix public prose/data before EWShop polish.",
        },
        {
            area: "Status grouping",
            playerQuestion: "Which statuses are combat, city, empire, public opinion, or hero effects?",
            currentDataShape: `${statuses.length} derived Status entries; ${statusWithMechanics.length} have mechanics, ${thinStatuses.length} are thin, and current subcategory is ${Array.from(statusGroups.keys()).join(", ") || "missing"}.`,
            owner: "DB exporter/editorial, then EWShop",
            productTreatment: "Keep Status top-level; add exported sub-kind before grouping redesign.",
        },
        {
            area: "Thin browse rows",
            playerQuestion: "Why should I click or compare this entry?",
            currentDataShape: thinSummary(entries),
            owner: "DB exporter/editorial",
            productTreatment: "Valid searchable/linkable entities; avoid promoting thin subcategories as rich browse surfaces.",
        },
    ];

    const lines = [
        "# Codex Relationship Value Gap Audit",
        "",
        "Status: active generated diagnostic report",
        "Generated: current script run",
        "Source: current local Codex imports in `local-imports/codex/`",
        "",
        "## Purpose",
        "",
        "This report identifies player-important Codex relationships that are currently",
        "missing, text-only, unresolved, or not linkable. It is not a UI",
        "implementation plan, generic renderer proposal, exporter contract change, SEO",
        "plan, or diagnostic framework.",
        "",
        "EWShop should continue to use exact exported refs, `referenceKeys`,",
        "`publicContextKeys`, facts, and sections. It should not infer links from prose.",
        "",
        "## Top 10 Relationship And Value Gaps",
        "",
        "| Rank | Area | Player question blocked | Current data shape | Owner | Product treatment |",
        "| ---: | --- | --- | --- | --- | --- |",
        ...gaps.map((gap, index) =>
            `| ${index + 1} | ${gap.area} | ${gap.playerQuestion} | ${gap.currentDataShape} | ${gap.owner} | ${gap.productTreatment} |`
        ),
        "",
        "## Area Reviews",
        "",
        "### 1. Tech Unlocks",
        "",
        `Player question blocked: "If I research this, what new unit, district, improvement, action, or mechanic becomes available?"`,
        "",
        `Current data shape: ${tech.length} Tech entries; ${techUnlockLikeRefs.length} have unlock-like related targets, ${techUnlockSections.length} have an Unlocks section, ${resolvedTechUnlockRefs.length}/${uniqueTechUnlockRefs.length} unique Unlock refs resolve, and ${techUnlockText.length} contain unlock text.`,
        "",
        "Good or partially useful examples:",
        ...renderList([
            `${example(choralAmplifier)} references several Unit targets.`,
            `${example(keystones)} references Bridge but lacks an explanatory Unlocks section.`,
        ]),
        "",
        "Blocked examples:",
        ...renderList([
            `${example(decipheringStone)} says "Unlocks an evolution of the Observatory" but lacks an exact unlock target ref.`,
            `Observatory-like targets exist elsewhere (${targetLabel("ActionTypeBuildObservatory", keyToEntry)}, ${targetLabel("DistrictImprovement_Science_01", keyToEntry)}), but EWShop must not infer the link.`,
        ]),
        "",
        "Remaining exact-ref gap: unresolved or text-only Unlock targets and optional unlock type/classification.",
        "EWShop frontend opportunity: product-review one-line unlock summaries for exact resolved Unlock refs.",
        "DB exporter/editorial request: fill unresolved or text-only Unlock refs where public targets exist.",
        "Product treatment: keep top-level browseable; do not infer unresolved unlocks from prose.",
        "",
        "### 2. Population Thresholds",
        "",
        `Current data shape: ${populations.length} Population entries; ${populationThresholdRows.length} threshold items; ${uniqueThresholdRefs.length} exact unique threshold refs; ${textThresholdRows.length} text-only threshold rewards.`,
        "",
        "Good entries already suitable for EWShop:",
        ...renderList([
            `${example(daughterOfBor)} resolves At 5 population to ${targetLabel("DistrictImprovement_MinorFaction_06", keyToEntry)}.`,
            `${example(horatio)} resolves At 5 population to ${targetLabel("Unit_HoratioBeta", keyToEntry)}.`,
        ]),
        "",
        "Blocked examples:",
        ...renderList([
            `${example(aspectPopulation)} says "Nutrient Extractor" but has no exact target ref.`,
            `${example(kin)} says "Military Press"; ${targetLabel("KinOfSheredyn_DistrictImprovement_01", keyToEntry)} exists but is not linked from the threshold item.`,
            `${example(lastLord)} says "Altar of Channeling"; ${targetLabel("LastLord_DistrictImprovement_03", keyToEntry)} exists but is not linked from the threshold item.`,
        ]),
        "",
        "EWShop frontend opportunity: already scoped to exact refs only; no prose inference.",
        "DB exporter/editorial request: add exact threshold reward refs where real targets exist.",
        "Product treatment: keep Population top-level; exact refs can be previewed, text-only rewards wait for exporter data.",
        "",
        "### 3. Extractors And Resources",
        "",
        `Current data shape: ${extractors.length} Extractor entries appear as Districts with category Resource; ${extractorResolvedRefs} resolved extractor refs; ${resourceExportEntries.length} Resource export/category entries.`,
        "",
        "Good entries:",
        ...renderList([
            `${example(klaxExtractor)} has Effects for Klax production and stock capacity.`,
        ]),
        "",
        "Low-value/thin entries:",
        ...renderList([
            `${example(advancedKlax)} has no Effects lines.`,
        ]),
        "",
        "Resolved exact refs or entity category: Resource entries now exist, Extractor -> Resource refs resolve, and Resource -> Extractor reverse refs are present.",
        "EWShop frontend opportunity: browser QA for Resources and Extractors; keep Resources searchable/linkable while top-level promotion stays deferred.",
        "DB exporter/editorial request: fill thin Resource/Extractor entries where players need effect context.",
        "Product treatment: keep Extractors as District entries; do not promote Resource Codex surfaces until browser QA confirms player value.",
        "",
        "### 4. Actions",
        "",
        `Current data shape: ${actions.length} Action entries; ${actionWithSections.length} have sections; ${thinActions.length} are facts-only; no Actions have descriptionLines in the current import.`,
        "",
        "Good or partially useful examples:",
        ...renderList([
            `${example(absorbCity)} has a Cost modifiers section.`,
            `${example(closeRift)} has Turn cost modifiers.`,
            `${example(razeDistrict)} has Action mechanics and a Production cost item.`,
        ]),
        "",
        "Low-value/thin examples:",
        ...renderList([
            `${example(buildObservatory)} is facts-only.`,
            `${example(buildCoralSpore)} is facts-only.`,
        ]),
        "",
        "Missing exact refs or entity category: player-facing purpose/availability summaries and exact affected-target refs.",
        "EWShop frontend opportunity: after summaries exist, group/highlight useful cost and mechanics sections.",
        "DB exporter/editorial request: add concise public gameplay summaries and exact affected-target refs.",
        "Product treatment: keep searchable/linkable exact targets; avoid prominent browse promotion for thin generic Actions.",
        "",
        "### 5. Diplomatic Treaties",
        "",
        `Current data shape: ${treaties.length} Diplomatic Treaty entries; ${treatyDirectEffects.length} have direct Effects; ${treatyStatusRefs.length} have related Status refs; ${treatyBoth.length} have both; ${treatyNeither.length} have neither.`,
        "",
        "Good entries:",
        ...renderList([
            `${example(sharedResearch)} has a direct Effects section explaining Science bonuses and the 20% technology-cost interaction.`,
            `${example(treaties.find((entry) => entry.entryKey === "Treaty_ConjoinedResearch"))} explains the extra Shared Research reduction.`,
        ]),
        "",
        "Useful but preview-sensitive entries:",
        ...renderList([
            `${example(closeBorders)} has strong prose and a related Status ref, but no direct Effects section.`,
        ]),
        "",
        "Low-value or incomplete examples:",
        ...renderList([
            `${example(surrenderDemand)} has incomplete tribute text.`,
            `${example(surrenderOffer)} has incomplete tribute text.`,
            `${example(sharedVictory)} has useful prose but no Effects section or refs.`,
        ]),
        "",
        "EWShop frontend opportunity: potential exact Status preview prototype only where prose does not already answer the question.",
        "DB exporter/editorial request: add direct Effects summaries and fix incomplete public text.",
        "Product treatment: keep Diplomatic Treaties browseable; avoid broad preview expansion.",
        "",
        "### 6. Status Sub-Kinds",
        "",
        `Current data shape: EWShop derives ${statuses.length} Status entries from bonuses; ${statusWithMechanics.length} have mechanics; ${thinStatuses.length} are thin; current subcategory grouping is ${Array.from(statusGroups.entries()).map(([group, count]) => `${group} (${count})`).join(", ") || "missing"}.`,
        "",
        "Good entries:",
        ...renderList([
            `${example(goodStatus)} has player-facing Approval text and mechanics.`,
        ]),
        "",
        "Low-value/thin examples:",
        ...renderList([
            `${example(thinStatus)} is thin.`,
        ]),
        "",
        "Missing exact refs or entity category: exported Status sub-kind/scope, such as City, Army, Empire, Combat, Hero, Public Opinion, Map, or Treaty.",
        "EWShop frontend opportunity: grouping/filtering after sub-kind appears.",
        "DB exporter/editorial request: add player-facing sub-kind/scope and fill thin entries.",
        "Product treatment: keep Status top-level; avoid broad grouping redesign until sub-kind data exists.",
        "",
        "### 7. Thin Classification-Only Entries",
        "",
        "Current data shape:",
        ...renderList([
            `Actions: ${thinActions.length}/${actions.length} thin (${exampleList(thinActions)}).`,
            `Districts: ${thinDistricts.length}/${districts.length} thin (${exampleList(thinDistricts)}).`,
            `Improvements: ${thinImprovements.length}/${improvements.length} thin (${exampleList(thinImprovements)}).`,
            `Abilities: ${thinAbilities.length}/${abilities.length} thin (${exampleList(thinAbilities)}).`,
            `Statuses: ${thinStatuses.length}/${statuses.length} thin (${exampleList(thinStatuses)}).`,
            `Resources: ${thinResources.length}/${resourceExportEntries.length} thin (${exampleList(thinResources)}).`,
        ]),
        "",
        "EWShop frontend opportunity: none for missing mechanics. EWShop can avoid over-promoting thin rows, but it should not create placeholder gameplay text.",
        "DB exporter/editorial request: add minimal public mechanics summaries where entries are intended browse destinations.",
        "Product treatment: valid searchable/linkable entities; avoid promoting thin subcategories as rich browse surfaces.",
        "",
        "## Top 5 DB Exporter / Backend / Editorial Requests",
        "",
        ...renderNumbered([
            "Fill unresolved or text-only Tech Unlock refs where public targets exist.",
            "Export exact Population threshold reward refs for major faction and other text-only rewards where targets already exist.",
            "Fill thin Resource and Extractor entries where current facts do not explain player impact.",
            "Add concise gameplay summaries and affected-target refs for thin Actions.",
            "Add direct Effects summaries and fix incomplete public text for Diplomatic Treaties, especially surrender/tribute entries.",
        ]),
        "",
        "## Top 5 EWShop Frontend Opportunities",
        "",
        ...renderNumbered([
            "Tech unlock summaries after product review of exact Unlock refs.",
            "Browser QA Resources and Extractors before deciding whether Resources deserve top-level navigation.",
            "Treaty -> Status preview prototype for exact high-value Status refs, limited to pages where prose does not already answer the question.",
            "Status grouping/filtering after exporter provides Status sub-kind/scope.",
            "Continue suppressing duplicate Related Entries only when a local exact-ref preview already shows the target.",
        ]),
        "",
        "No immediate frontend-only UI change is recommended from this audit. The remaining high-value work is mostly exporter/editorial data shape.",
        "",
        "## Demote Or Avoid Promoting While Thin",
        "",
        ...renderList([
            "Generic thin Actions: keep searchable/linkable; avoid treating them as rich top-level browse destinations until summaries exist.",
            "Advanced/Grand Extractor entries with no Effects: keep under Districts; do not present as Resource pages.",
            "Resource Codex category: keep searchable/linkable; do not top-level promote until browser QA confirms pages are useful.",
            "Tech Unlock preview work: review row density first and never infer unresolved targets.",
            "Broad Status grouping redesign: wait for exported sub-kind/scope.",
            "Diplomatic Treaty preview expansion: avoid broad prototype; many pages need editorial Effects first.",
        ]),
        "",
        "## Suggested Next Path",
        "",
        "Prepare an exporter/editorial handoff from this report, focused on unresolved",
        "Tech Unlock refs, Population threshold refs, thin Resource/Extractor rows, and",
        "thin Action/Treaty gameplay summaries.",
        "",
        "EWShop should pause new preview-surface UI until one of those exact-ref data",
        "improvements lands, except for small bug fixes or browser QA regressions.",
        "",
        "## Regenerate",
        "",
        "From `frontend/`:",
        "",
        "```bash",
        "npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md",
        "```",
        "",
    ];

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
