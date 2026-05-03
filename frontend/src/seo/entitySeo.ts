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

function renderFacts(entity: ResolvedFeaturedEntity): string {
    if (entity.kind === "tech") {
        return renderList([
            `Era ${entity.era}`,
            `${entity.techType} technology`,
            `Factions: ${entity.factions.join(", ")}`,
        ]);
    }

    const upgradeLabel = entity.upgradeFrom ? `Upgrades from ${entity.upgradeFrom}` : "Base roster unit";

    return renderList([
        `${entity.faction} faction`,
        `Tier ${entity.tier} ${entity.unitType.toLowerCase()} unit`,
        entity.requiredTechnology,
        upgradeLabel,
    ]);
}

function renderHighlights(entity: ResolvedFeaturedEntity): string {
    if (entity.kind === "tech") {
        const highlights = [...entity.unlocks, ...entity.effects];
        return highlights.length > 0
            ? renderList(highlights)
            : "<li>This featured page focuses on route visibility and the jump back into the interactive planner.</li>";
    }

    return renderList([
        `Health: ${entity.health}`,
        `Damage: ${entity.damage}`,
        `Defense: ${entity.defense}`,
        `Movement: ${entity.movement}`,
        `Cost: ${entity.cost}`,
        `Upkeep: ${entity.upkeep}`,
    ]);
}

function renderSecondaryHighlights(entity: ResolvedFeaturedEntity): string {
    if (entity.kind === "tech") {
        return "";
    }

    return `
        <section>
            <h2>Skills</h2>
            <ul>${renderList(entity.skills)}</ul>
        </section>
    `;
}

export function renderEntityHtml(entity: ResolvedFeaturedEntity): string {
    const canonicalUrl = toAbsoluteUrl(entity.routePath);
    const collectionLabel = getKindLabel(entity.kind);
    const collectionPageUrl = toAbsoluteUrl(entity.collectionPath);
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
    <style>
        :root {
            color-scheme: dark;
            --bg: #0b0e13;
            --panel: rgba(16, 22, 33, 0.9);
            --panel-border: rgba(112, 173, 255, 0.24);
            --text: #f3f7fb;
            --muted: #aec0d8;
            --accent: #87b9ff;
            --accent-strong: #d4e5ff;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at top, rgba(86, 131, 210, 0.34), transparent 36%),
                linear-gradient(180deg, #101825 0%, #0b0e13 62%);
        }

        main {
            max-width: 940px;
            margin: 0 auto;
            padding: 48px 20px 72px;
        }

        .eyebrow {
            color: var(--accent);
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        .hero,
        section,
        .cta {
            background: var(--panel);
            border: 1px solid var(--panel-border);
            border-radius: 20px;
            backdrop-filter: blur(8px);
            box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
        }

        .hero {
            padding: 28px;
            margin-bottom: 20px;
        }

        section,
        .cta {
            padding: 24px;
            margin-top: 20px;
        }

        h1,
        h2 {
            margin: 0 0 14px;
        }

        p,
        li {
            color: var(--muted);
            line-height: 1.65;
        }

        ul {
            margin: 0;
            padding-left: 20px;
        }

        .breadcrumbs {
            margin-bottom: 14px;
            font-size: 0.95rem;
            color: var(--muted);
        }

        .breadcrumbs a,
        .back-link {
            color: var(--accent);
            text-decoration: none;
        }

        .breadcrumbs a:hover,
        .back-link:hover,
        .cta a:hover {
            color: var(--accent-strong);
        }

        .cta-button {
            display: inline-block;
            margin-top: 8px;
            padding: 12px 18px;
            border-radius: 999px;
            background: linear-gradient(135deg, #6ea9ff, #87d1ff);
            color: #07111d;
            font-weight: 700;
            text-decoration: none;
        }

        .cta-copy {
            margin-top: 12px;
        }

        @media (max-width: 640px) {
            main {
                padding: 28px 16px 40px;
            }

            .hero,
            section,
            .cta {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
<main>
    <div class="breadcrumbs">
        <a href="/">Home</a> /
        <a href="${entity.collectionPath}">${collectionLabel}</a> /
        <span>${escapeHtml(entity.name)}</span>
    </div>

    <header class="hero">
        <div class="eyebrow">Endless Legend 2 ${collectionLabel}</div>
        <h1>${escapeHtml(entity.name)}</h1>
        <p>${escapeHtml(entity.overview)}</p>
    </header>

    <section>
        <h2>At a glance</h2>
        <ul>${renderFacts(entity)}</ul>
    </section>

    <section>
        <h2>${entity.kind === "tech" ? "Unlocks and effects" : "Key stats"}</h2>
        <ul>${renderHighlights(entity)}</ul>
    </section>

    ${renderSecondaryHighlights(entity)}

    <aside class="cta">
        <h2>Open the interactive ${entity.kind === "tech" ? "planner" : "explorer"}</h2>
        <p>
            This static page is an SEO landing page only. Use the full Endless Workshop app for filters,
            navigation, share links, and live browsing.
        </p>
        <a class="cta-button" href="${entity.ctaPath}">${escapeHtml(entity.ctaLabel)}</a>
        <p class="cta-copy">
            Prefer the category view first?
            <a class="back-link" href="${entity.collectionPath}">Go to ${collectionLabel.toLowerCase()}</a>.
        </p>
        <p class="cta-copy">Canonical route: <a href="${canonicalUrl}">${canonicalUrl}</a></p>
        <p class="cta-copy">Interactive route: <a href="${entity.ctaPath}">${escapeHtml(entity.ctaPath)}</a></p>
        <p class="cta-copy">Collection page: <a href="${collectionPageUrl}">${collectionPageUrl}</a></p>
    </aside>
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
