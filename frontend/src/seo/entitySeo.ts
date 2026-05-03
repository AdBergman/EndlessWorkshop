import { existsSync, readdirSync } from "node:fs";
import {
    INDEXABLE_PUBLIC_ROUTE_PATHS,
    SITE_NAME,
    SITE_URL,
    DEFAULT_IMAGE_URL,
} from "../components/Seo/routeSeo.ts";
import {
    FEATURED_TECH_SNAPSHOTS,
    FEATURED_UNIT_SNAPSHOTS,
    type FeaturedEntitySnapshot,
    type FeaturedEntityKind,
    type FeaturedTechSnapshot,
    type FeaturedUnitSnapshot,
} from "./featuredEntityCatalog.ts";

export const SAFE_ENTRY_KEY_PATTERN = /^[a-z0-9-]+$/;

export type ResolvedFeaturedEntity = FeaturedEntitySnapshot & {
    routePath: string;
    collectionPath: string;
    pageTitle: string;
};

type SnapshotCollections = {
    techs: FeaturedTechSnapshot[];
    units: FeaturedUnitSnapshot[];
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(path: string): string {
    return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

function getCollectionPath(kind: FeaturedEntityKind): string {
    return kind === "tech" ? "/tech" : "/units";
}

function getKindLabel(kind: FeaturedEntityKind): string {
    return kind === "tech" ? "Tech" : "Unit";
}

function getPageTitle(entity: FeaturedEntitySnapshot): string {
    return entity.kind === "tech"
        ? `${entity.name} Tech Guide | Endless Workshop`
        : `${entity.name} Unit Guide | Endless Workshop`;
}

function normalizeTechParam(value: string): string {
    return String(value ?? "").toLowerCase().replace(/\s+/g, "_");
}

function normalizeFactionParam(value: string): string {
    return String(value ?? "").toLowerCase().replace(/[\s_-]+/g, "");
}

function buildSnapshotMap<T extends FeaturedEntitySnapshot>(snapshots: T[]): Map<string, T> {
    return new Map(snapshots.map((snapshot) => [snapshot.entryKey, snapshot]));
}

export function validateFeaturedEntities(
    entities: FeaturedEntitySnapshot[],
    collections: SnapshotCollections
): ResolvedFeaturedEntity[] {
    const techsByEntryKey = buildSnapshotMap(collections.techs);
    const unitsByEntryKey = buildSnapshotMap(collections.units);
    const routes = new Set<string>();

    return entities.map((snapshot) => {
        const resolvedSnapshot =
            snapshot.kind === "tech"
                ? techsByEntryKey.get(snapshot.entryKey)
                : unitsByEntryKey.get(snapshot.entryKey);

        if (!resolvedSnapshot) {
            throw new Error(`Featured ${snapshot.kind} snapshot is missing for entryKey "${snapshot.entryKey}".`);
        }

        if (!SAFE_ENTRY_KEY_PATTERN.test(resolvedSnapshot.entryKey)) {
            throw new Error(`Unsafe entryKey "${resolvedSnapshot.entryKey}" for ${resolvedSnapshot.kind} page generation.`);
        }

        const collectionPath = getCollectionPath(resolvedSnapshot.kind);
        const routePath = `${collectionPath}/${resolvedSnapshot.entryKey}`;

        if (routes.has(routePath)) {
            throw new Error(`Duplicate generated route "${routePath}".`);
        }
        routes.add(routePath);

        validateCtaPath(resolvedSnapshot, collections);

        return {
            ...resolvedSnapshot,
            collectionPath,
            routePath,
            pageTitle: getPageTitle(resolvedSnapshot),
        };
    });
}

function validateCtaPath(entity: FeaturedEntitySnapshot, collections: SnapshotCollections): void {
    const target = new URL(entity.ctaPath, SITE_URL);
    const expectedCollectionPath = getCollectionPath(entity.kind);
    const params = target.searchParams;

    if (target.origin !== SITE_URL) {
        throw new Error(`Invalid CTA link for "${entity.entryKey}": external origins are not allowed.`);
    }

    if (target.pathname !== expectedCollectionPath) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": expected path "${expectedCollectionPath}" but got "${target.pathname}".`
        );
    }

    if (!params.has("faction")) {
        throw new Error(`Invalid CTA link for "${entity.entryKey}": faction query param is required.`);
    }

    const factionParam = params.get("faction");
    if (!factionParam) {
        throw new Error(`Invalid CTA link for "${entity.entryKey}": faction query param is required.`);
    }

    if (entity.kind === "tech") {
        validateTechCta(entity, collections.techs, params, factionParam);
        return;
    }

    validateUnitCta(entity, params, factionParam);
}

function validateTechCta(
    entity: FeaturedTechSnapshot,
    techs: FeaturedTechSnapshot[],
    params: URLSearchParams,
    factionParam: string
): void {
    const techParam = params.get("tech");
    if (!techParam) {
        throw new Error(`Invalid CTA link for "${entity.entryKey}": tech query param is required.`);
    }

    const expectedFactions = new Set(entity.factions.map(normalizeFactionParam));
    if (!expectedFactions.has(normalizeFactionParam(factionParam))) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": faction "${factionParam}" does not match the tech snapshot.`
        );
    }

    if (techParam === entity.entryKey) {
        return;
    }

    const normalizedTechParam = normalizeTechParam(techParam);
    const matchingTechs = techs.filter((tech) => normalizeTechParam(tech.name) === normalizedTechParam);

    if (matchingTechs.length === 0) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": tech param "${techParam}" does not resolve to a featured tech snapshot.`
        );
    }

    if (matchingTechs.length > 1) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": tech param "${techParam}" ambiguously matches multiple featured tech snapshots.`
        );
    }

    if (matchingTechs[0].entryKey !== entity.entryKey) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": tech param "${techParam}" resolves to "${matchingTechs[0].entryKey}".`
        );
    }
}

function validateUnitCta(entity: FeaturedUnitSnapshot, params: URLSearchParams, factionParam: string): void {
    const unitKeyParam = params.get("unitKey");
    const legacyUnitParam = params.get("unit");

    if (legacyUnitParam) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": legacy unit display-name links are not allowed; use unitKey.`
        );
    }

    if (!unitKeyParam) {
        throw new Error(`Invalid CTA link for "${entity.entryKey}": unitKey query param is required.`);
    }

    if (normalizeFactionParam(factionParam) !== normalizeFactionParam(entity.faction)) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": faction "${factionParam}" does not match the unit snapshot.`
        );
    }

    if (unitKeyParam !== entity.unitKey) {
        throw new Error(
            `Invalid CTA link for "${entity.entryKey}": unitKey "${unitKeyParam}" does not match canonical unitKey "${entity.unitKey}".`
        );
    }
}

function renderBreadcrumbJsonLd(entity: ResolvedFeaturedEntity): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Endless Workshop",
                item: SITE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: entity.kind === "tech" ? "Tech" : "Units",
                item: toAbsoluteUrl(entity.collectionPath),
            },
            {
                "@type": "ListItem",
                position: 3,
                name: entity.name,
                item: toAbsoluteUrl(entity.routePath),
            },
        ],
    };
}

function renderWebPageJsonLd(entity: ResolvedFeaturedEntity): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: entity.pageTitle,
        description: entity.seoDescription,
        url: toAbsoluteUrl(entity.routePath),
        isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
        },
        breadcrumb: {
            "@id": `${toAbsoluteUrl(entity.routePath)}#breadcrumb`,
        },
    };
}

function renderList(items: string[]): string {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

type EntityTemplateViewModel = {
    displayName: string;
    kindLabel: string;
    summary: string;
    details: string[];
    unlocks: string[];
    effects: string[];
    overviewLines: string[];
    referenceKeys: string[];
    primaryCtaLabel: string;
};

function renderBrandNav(activePath: string): string {
    const links = [
        { href: "/tech", label: "Tech" },
        { href: "/units", label: "Units" },
        { href: "/codex", label: "Codex" },
        { href: "/summary", label: "Summary" },
        { href: "/mods", label: "Mods" },
        { href: "/info", label: "Info" },
    ];

    return `
        <nav class="seo-nav" aria-label="Primary">
            ${links
                .map(
                    (link) =>
                        `<a href="${link.href}"${link.href === activePath ? ' aria-current="page"' : ""}>${link.label}</a>`
                )
                .join("")}
        </nav>
    `;
}

function buildEntityTemplateViewModel(entity: ResolvedFeaturedEntity): EntityTemplateViewModel {
    if (entity.kind === "tech") {
        return {
            displayName: entity.name,
            kindLabel: `Technology • Era ${entity.era} • ${entity.techType}`,
            summary: entity.overview,
            details: [
                `Era ${entity.era}`,
                `${entity.techType} technology`,
                `Factions: ${entity.factions.join(", ")}`,
            ],
            unlocks: entity.unlocks,
            effects: entity.effects,
            overviewLines: [
                `${entity.name} is listed here as a static reference snapshot for the EWShop tech tree.`,
                `Use the interactive tree for pathing, faction state, and adjacent-node context.`,
            ],
            referenceKeys: [...entity.unlocks, ...entity.effects],
            primaryCtaLabel: "Open in tech tree",
        };
    }

    const upgradeLabel = entity.upgradeFrom ? `Upgrades from ${entity.upgradeFrom}` : "Base roster unit";
    const referenceKeys = [...entity.skills];
    if (entity.requiredTechnology !== "Starting roster") referenceKeys.unshift(entity.requiredTechnology);

    return {
        displayName: entity.name,
        kindLabel: `Unit • Tier ${entity.tier} • ${entity.unitType}`,
        summary: entity.overview,
        details: [
            `${entity.faction} faction`,
            `Tier ${entity.tier} ${entity.unitType.toLowerCase()} unit`,
            entity.requiredTechnology,
            `Health ${entity.health} • Damage ${entity.damage} • Defense ${entity.defense}`,
        ],
        unlocks: [upgradeLabel],
        effects: [],
        overviewLines: [
            `${entity.name} is listed here as a static roster reference for EWShop.`,
            `Use the interactive explorer for comparisons, upgrades, and faction browsing.`,
        ],
        referenceKeys,
        primaryCtaLabel: "Open in unit explorer",
    };
}

function renderReferenceChips(referenceKeys: string[]): string {
    if (referenceKeys.length === 0) {
        return `<p class="entity-page__referencesEmpty">No linked reference keys are exposed in this prototype snapshot.</p>`;
    }

    return `
        <ul class="seo-chipList">
            ${referenceKeys.map((referenceKey) => `<li class="seo-chip">${escapeHtml(referenceKey)}</li>`).join("")}
        </ul>
    `;
}

function renderResourceLinks(): string {
    return `
        <section class="seo-section entity-page__section entity-page__explore">
            <p class="seo-label">Explore</p>
            <h2 class="seo-heading">Explore</h2>
            <ul class="seo-list">
                <li><a href="/tech">Tech tree</a></li>
                <li><a href="/units">Units</a></li>
                <li><a href="/codex">Codex</a></li>
                <li><a href="/mods">Mods</a></li>
            </ul>
        </section>
    `;
}

function renderEntityPageContent(entity: ResolvedFeaturedEntity): string {
    const viewModel = buildEntityTemplateViewModel(entity);
    const hasOverview = viewModel.overviewLines.length > 0;
    const hasUnlocks = viewModel.unlocks.length > 0;
    const hasEffects = viewModel.effects.length > 0;

    return `
        <header class="entity-page__header">
            <p class="seo-label entity-page__kind">${escapeHtml(viewModel.kindLabel)}</p>
            <h1 class="seo-heading entity-page__title">${escapeHtml(viewModel.displayName)}</h1>
            <p class="seo-text entity-page__summary">${escapeHtml(viewModel.summary)}</p>
            <div class="seo-buttonRow">
                <a class="seo-button" href="${entity.ctaPath}">${escapeHtml(viewModel.primaryCtaLabel)}</a>
                <a class="seo-linkButton" href="${entity.collectionPath}">Back to ${escapeHtml(getKindLabel(entity.kind))}</a>
            </div>
        </header>

        <section class="seo-section entity-page__section entity-page__details">
            <p class="seo-label">Details</p>
            <h2 class="seo-heading">Details</h2>
            <ul class="seo-list">
                ${renderList(viewModel.details)}
            </ul>
        </section>

        <section class="seo-section entity-page__section entity-page__outcomes">
            <p class="seo-label">Unlocks And Effects</p>
            <h2 class="seo-heading">Unlocks and effects</h2>
            <div class="entity-page__columns">
                <div class="entity-page__column">
                    <h3 class="entity-page__subheading">Unlocks</h3>
                    ${
                        hasUnlocks
                            ? `<ul class="seo-list">${renderList(viewModel.unlocks)}</ul>`
                            : '<p class="seo-text entity-page__empty">No unlocks recorded in this prototype snapshot.</p>'
                    }
                </div>
                <div class="entity-page__column">
                    <h3 class="entity-page__subheading">Effects</h3>
                    ${
                        hasEffects
                            ? `<ul class="seo-list">${renderList(viewModel.effects)}</ul>`
                            : '<p class="seo-text entity-page__empty">No direct effects recorded in this prototype snapshot.</p>'
                    }
                </div>
            </div>
        </section>

        ${
            hasOverview
                ? `
        <section class="seo-section entity-page__section entity-page__overview">
            <p class="seo-label">Overview</p>
            <h2 class="seo-heading">Overview</h2>
            <ul class="seo-list">
                ${renderList(viewModel.overviewLines)}
            </ul>
        </section>`
                : ""
        }

        <section class="seo-section entity-page__section entity-page__references">
            <p class="seo-label">Reference Keys</p>
            <h2 class="seo-heading">Reference keys</h2>
            ${renderReferenceChips(viewModel.referenceKeys)}
        </section>

        ${renderResourceLinks()}
    `;
}

export function renderEntityHtml(entity: ResolvedFeaturedEntity): string {
    const canonicalUrl = toAbsoluteUrl(entity.routePath);
    const collectionLabel = getKindLabel(entity.kind);
    const webPageJsonLd = renderWebPageJsonLd(entity);
    const breadcrumbJsonLd = renderBreadcrumbJsonLd(entity);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b0e13" />
    <title>${escapeHtml(entity.pageTitle)}</title>
    <meta name="description" content="${escapeHtml(entity.seoDescription)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/seo/seo-shell.css" />
    <link rel="stylesheet" href="/seo/entity-page.css" />
    <link rel="icon" href="/favicon.ico" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(entity.pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(entity.seoDescription)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${DEFAULT_IMAGE_URL}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(entity.pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(entity.seoDescription)}" />
    <meta name="twitter:image" content="${DEFAULT_IMAGE_URL}" />
    <script type="application/ld+json">${JSON.stringify(webPageJsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify({
        ...breadcrumbJsonLd,
        "@id": `${canonicalUrl}#breadcrumb`,
    })}</script>
</head>
<body class="seo-page">
<header class="seo-topbar">
    <div class="seo-topbar__inner">
        <a class="seo-brand" href="/">
            <img class="seo-brand__icon" src="/graphics/cog.svg" alt="Endless Workshop icon" />
            <span class="seo-brand__copy">
                <span class="seo-brand__eyebrow">EWShop</span>
                <span class="seo-brand__title">Endless Workshop</span>
            </span>
        </a>
        ${renderBrandNav(entity.collectionPath)}
    </div>
</header>

<main class="seo-shell entity-page">
    <div class="seo-hidden">${escapeHtml(entity.pageTitle)}</div>
    <div class="entity-page__breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <a href="${entity.collectionPath}">${collectionLabel}</a>
        <span>/</span>
        <span>${escapeHtml(entity.name)}</span>
    </div>

    <div class="entity-page__layout">
        ${renderEntityPageContent(entity)}
    </div>
</main>
</body>
</html>`;
}

export function listGeneratedEntityPaths(publicRoot: string): string[] {
    const paths: string[] = [];

    for (const kind of ["tech", "units"] as const) {
        const dirPath = `${publicRoot}/${kind}`;
        let entries: string[] = [];

        try {
            entries = readdirSync(dirPath, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => entry.name)
                .sort();
        } catch {
            entries = [];
        }

        for (const entryKey of entries) {
            if (existsSync(`${dirPath}/${entryKey}/index.html`)) {
                paths.push(`/${kind}/${entryKey}`);
            }
        }
    }

    return paths;
}

export function buildSitemapXml(staticPaths: string[], generatedEntityPaths: string[]): string {
    const uniquePaths = Array.from(new Set([...staticPaths, ...generatedEntityPaths]));
    const urls = uniquePaths
        .map((path) => `    <url>\n        <loc>${toAbsoluteUrl(path)}</loc>\n    </url>`)
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function getResolvedFeaturedEntities(): ResolvedFeaturedEntity[] {
    return validateFeaturedEntities([...FEATURED_TECH_SNAPSHOTS, ...FEATURED_UNIT_SNAPSHOTS], {
        techs: FEATURED_TECH_SNAPSHOTS,
        units: FEATURED_UNIT_SNAPSHOTS,
    });
}

export function getExpectedSitemapPaths(generatedEntityPaths: string[]): string[] {
    return [...INDEXABLE_PUBLIC_ROUTE_PATHS, ...generatedEntityPaths];
}
