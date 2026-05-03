import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
    buildSitemapXml,
    getResolvedFeaturedEntities,
    listGeneratedEntityPaths,
    renderEntityHtml,
    validateFeaturedEntities,
} from "./entitySeo";
import {
    ENTITY_GENERATION_REPORT,
    FEATURED_TECH_SNAPSHOTS,
    FEATURED_UNIT_SNAPSHOTS,
} from "./featuredEntityCatalog";
import { SITE_URL } from "../components/Seo/routeSeo";

describe("entitySeo", () => {
    it("keeps workshop as the only generated entity page", () => {
        const entities = getResolvedFeaturedEntities();

        expect(entities).toHaveLength(1);
        expect(entities[0].kind).toBe("tech");
        expect(entities[0].entryKey).toBe("workshop");
        expect(entities[0].routePath).toBe("/tech/workshop");
        expect(FEATURED_TECH_SNAPSHOTS.map((entity) => entity.entryKey)).toEqual(["workshop"]);
        expect(FEATURED_UNIT_SNAPSHOTS).toEqual([]);
    });

    it("reports that the generator is running in single-page prototype mode", () => {
        expect(ENTITY_GENERATION_REPORT.includedCounts).toEqual({
            techs: 1,
            units: 0,
            total: 1,
        });
        expect(ENTITY_GENERATION_REPORT.excludedCounts.total).toBeGreaterThan(0);
        expect(ENTITY_GENERATION_REPORT.skippedByReason["prototype-template-only"]).toBeGreaterThan(0);
    });

    it("renders plain static html with shared css and no runtime bootstrapping", () => {
        const entity = getResolvedFeaturedEntities()[0];
        const html = renderEntityHtml(entity);

        expect(html).toContain(`<link rel="canonical" href="https://endlessworkshop.dev${entity.routePath}" />`);
        expect(html).toContain('<link rel="stylesheet" href="/seo/seo-shell.css" />');
        expect(html).toContain('<link rel="stylesheet" href="/seo/entity-page.css" />');
        expect(html).not.toContain("<style>");
        expect(html).not.toContain("src/index.tsx");
        expect(html).not.toContain("fetch(");
        expect(html).not.toContain("/api/");
        expect(html).not.toContain('type="module"');
        expect(html).not.toContain("Landing Page Prototype");
        expect(html).not.toContain("Snapshot");
        expect(html).not.toContain("Keep browsing the app");
        expect(html).not.toContain("Open in the interactive tech tree");
        expect(html).not.toContain("<style>");
    });

    it("rejects duplicate generated routes", () => {
        const duplicatedTech = FEATURED_TECH_SNAPSHOTS[0];

        expect(() =>
            validateFeaturedEntities(
                [...FEATURED_TECH_SNAPSHOTS, { ...duplicatedTech }],
                { techs: FEATURED_TECH_SNAPSHOTS, units: FEATURED_UNIT_SNAPSHOTS }
            )
        ).toThrow(`Duplicate generated route "/tech/${duplicatedTech.entryKey}".`);
    });

    it("rejects invalid CTA targets", () => {
        const invalidTechs = FEATURED_TECH_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "workshop"
                ? { ...snapshot, ctaPath: "/codex?entry=workshop" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(invalidTechs, {
                techs: invalidTechs,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).toThrow('Invalid CTA link for "workshop": expected path "/tech" but got "/codex".');
    });

    it("accepts the stable workshop CTA link", () => {
        expect(() =>
            validateFeaturedEntities(FEATURED_TECH_SNAPSHOTS, {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).not.toThrow();
    });

    it("rejects stale workshop CTA values", () => {
        const staleTechs = FEATURED_TECH_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "workshop"
                ? { ...snapshot, ctaPath: "/tech?faction=aspects&tech=workshops" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(staleTechs, {
                techs: staleTechs,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).toThrow(
            'Invalid CTA link for "workshop": tech param "workshops" does not resolve to a featured tech snapshot.'
        );
    });

    it("keeps the generated entity files aligned with the single-page catalog", () => {
        const publicDir = resolve(process.cwd(), "public");
        const generatedPaths = listGeneratedEntityPaths(publicDir);

        expect(generatedPaths).toEqual(["/tech/workshop"]);
    });

    it("audits the generated workshop page for static SEO output and shared styling", () => {
        const publicDir = resolve(process.cwd(), "public");
        const htmlPath = resolve(publicDir, "tech", "workshop", "index.html");
        const html = readFileSync(htmlPath, "utf8");
        const dom = new JSDOM(html);
        const { document } = dom.window;
        const canonicalUrl = `${SITE_URL}/tech/workshop`;

        expect(html).toContain('<link rel="stylesheet" href="/seo/seo-shell.css" />');
        expect(html).toContain('<link rel="stylesheet" href="/seo/entity-page.css" />');
        expect(html).not.toContain("<style>");
        expect(html).not.toContain("fetch(");
        expect(html).not.toContain("/api/");
        expect(html).not.toContain("__NEXT_DATA__");
        expect(html).not.toContain("src/index.tsx");
        expect(html).not.toContain("Landing Page Prototype");
        expect(html).not.toContain("fonts.googleapis.com/css2?family=Orbitron");
        expect(html).not.toContain("Snapshot");
        expect(html).not.toContain("Keep browsing the app");
        expect(html).not.toContain("What this entry covers");
        expect(html).not.toContain("Open in the interactive tech tree");
        expect(html).not.toContain("Browse the full tech tree");
        expect(html).not.toContain("Inspect the unit explorer");
        expect(html).not.toContain("Search the codex");

        expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(canonicalUrl);
        expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("index, follow");
        expect(document.title).toBe("Workshop Tech Guide | Endless Workshop");
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Workshop is an Endless Legend 2 era 1 economy technology that unlocks District: Works."
        );
        expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
            "Workshop Tech Guide | Endless Workshop"
        );
        expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(
            "Workshop Tech Guide | Endless Workshop"
        );

        expect(document.querySelector(".entity-page__title")?.textContent?.trim()).toBe("Workshop");
        expect(document.querySelector(".entity-page__kind")?.textContent?.trim()).toBe("Technology • Era 1 • Economy");
        expect(document.querySelector(".seo-brand__title")?.textContent?.trim()).toBe("Endless Workshop");
        expect(document.querySelector(".seo-button")?.getAttribute("href")).toBe("/tech?faction=aspects&tech=workshop");
        expect(document.querySelector(".seo-button")?.textContent?.trim()).toBe("Open in tech tree");
        expect([...document.querySelectorAll(".entity-page__section > .seo-heading")].map((heading) => heading.textContent?.trim())).toEqual(
            expect.arrayContaining(["Details", "Unlocks and effects", "Overview", "Reference keys", "Explore"])
        );

        expect([...document.querySelectorAll(".seo-nav a")].map((link) => link.getAttribute("href"))).toEqual(
            expect.arrayContaining(["/tech", "/units", "/codex", "/summary", "/mods", "/info"])
        );
        expect(document.querySelector('.seo-nav a[aria-current="page"]')?.getAttribute("href")).toBe("/tech");
        expect([...document.querySelectorAll(".seo-chip")].map((chip) => chip.textContent?.trim())).toEqual(
            expect.arrayContaining(["District: Works", "Action: Remove Forest"])
        );
        expect(document.querySelectorAll(".entity-page__references a")).toHaveLength(0);
        expect([...document.querySelectorAll(".entity-page__explore a")].map((link) => link.getAttribute("href"))).toEqual([
            "/tech",
            "/units",
            "/codex",
            "/mods",
        ]);
        expect(document.querySelector(".entity-page__breadcrumbs")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
            "Home / Tech / Workshop"
        );

        const nonLdScripts = [...document.querySelectorAll("script")].filter(
            (script) => script.getAttribute("type") !== "application/ld+json"
        );
        expect(nonLdScripts).toHaveLength(0);

        const jsonLdScripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
        expect(jsonLdScripts).toHaveLength(2);

        const jsonLdNodes = jsonLdScripts.map((script) => JSON.parse(script.textContent ?? ""));
        const webPageJsonLd = jsonLdNodes.find((node) => node["@type"] === "WebPage");
        const breadcrumbJsonLd = jsonLdNodes.find((node) => node["@type"] === "BreadcrumbList");

        expect(webPageJsonLd).toBeDefined();
        expect(webPageJsonLd.url).toBe(canonicalUrl);
        expect(webPageJsonLd.description).toBe(
            "Workshop is an Endless Legend 2 era 1 economy technology that unlocks District: Works."
        );
        expect(webPageJsonLd.breadcrumb?.["@id"]).toBe(`${canonicalUrl}#breadcrumb`);

        expect(breadcrumbJsonLd).toBeDefined();
        expect(breadcrumbJsonLd["@id"]).toBe(`${canonicalUrl}#breadcrumb`);
        expect(breadcrumbJsonLd.itemListElement).toHaveLength(3);
        expect(breadcrumbJsonLd.itemListElement[2].name).toBe("Workshop");
        expect(breadcrumbJsonLd.itemListElement[2].item).toBe(canonicalUrl);

        expect(document.body.textContent?.replace(/\s+/g, " ").trim().length ?? 0).toBeGreaterThan(350);
    });

    it("builds a sitemap with both static and generated routes", () => {
        const sitemap = buildSitemapXml(["/tech", "/units"], ["/tech/workshop"]);

        expect(sitemap).toContain("<loc>https://endlessworkshop.dev/tech</loc>");
        expect(sitemap).toContain("<loc>https://endlessworkshop.dev/tech/workshop</loc>");
        expect(sitemap).toContain("<loc>https://endlessworkshop.dev/units</loc>");
    });
});
