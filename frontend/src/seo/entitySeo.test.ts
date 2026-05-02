import { describe, expect, it } from "vitest";
import {
    buildSitemapXml,
    getResolvedFeaturedEntities,
    renderEntityHtml,
    validateFeaturedEntities,
} from "./entitySeo";
import {
    FEATURED_ENTITY_ALLOWLIST,
    FEATURED_TECH_SNAPSHOTS,
    FEATURED_UNIT_SNAPSHOTS,
} from "./featuredEntityCatalog";

describe("entitySeo", () => {
    it("resolves the featured allowlist into safe entity routes", () => {
        const entities = getResolvedFeaturedEntities();

        expect(entities).toHaveLength(FEATURED_ENTITY_ALLOWLIST.length);
        expect(new Set(entities.map((entity) => entity.routePath)).size).toBe(entities.length);
        expect(entities.every((entity) => entity.routePath.startsWith(entity.collectionPath))).toBe(true);
    });

    it("renders plain static html without React bootstrapping or API fetches", () => {
        const entity = getResolvedFeaturedEntities()[0];
        const html = renderEntityHtml(entity);

        expect(html).toContain(`<link rel="canonical" href="https://endlessworkshop.dev${entity.routePath}" />`);
        expect(html).toContain(entity.ctaLabel);
        expect(html).not.toContain("src/index.tsx");
        expect(html).not.toContain("fetch(");
        expect(html).not.toContain('type="module"');
    });

    it("rejects duplicate generated routes", () => {
        expect(() =>
            validateFeaturedEntities(
                [...FEATURED_ENTITY_ALLOWLIST, { kind: "tech", entryKey: "stonework" }],
                { techs: FEATURED_TECH_SNAPSHOTS, units: FEATURED_UNIT_SNAPSHOTS }
            )
        ).toThrow('Duplicate generated route "/tech/stonework".');
    });

    it("rejects invalid CTA targets", () => {
        const invalidTechs = FEATURED_TECH_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "stonework"
                ? { ...snapshot, ctaPath: "/codex?entry=stonework" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(
                FEATURED_ENTITY_ALLOWLIST,
                {
                    techs: invalidTechs,
                    units: FEATURED_UNIT_SNAPSHOTS,
                }
            )
        ).toThrow('Invalid CTA link for "stonework": expected path "/tech" but got "/codex".');
    });

    it("accepts stable tech CTA links that resolve to the intended featured tech", () => {
        expect(() =>
            validateFeaturedEntities(FEATURED_ENTITY_ALLOWLIST, {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).not.toThrow();
    });

    it("rejects stale tech CTA values that do not resolve to a featured tech snapshot", () => {
        const staleTechs = FEATURED_TECH_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "stonework"
                ? { ...snapshot, ctaPath: "/tech?faction=kin&tech=stoneworks" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(FEATURED_ENTITY_ALLOWLIST, {
                techs: staleTechs,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).toThrow(
            'Invalid CTA link for "stonework": tech param "stoneworks" does not resolve to a featured tech snapshot.'
        );
    });

    it("accepts stable unitKey CTA links that resolve to the intended featured unit", () => {
        expect(() =>
            validateFeaturedEntities(FEATURED_ENTITY_ALLOWLIST, {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).not.toThrow();
    });

    it("rejects legacy unit display-name CTA links", () => {
        const legacyUnits = FEATURED_UNIT_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "sentinel"
                ? { ...snapshot, ctaPath: "/units?faction=kin&unit=sentinel" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(FEATURED_ENTITY_ALLOWLIST, {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: legacyUnits,
            })
        ).toThrow(
            'Invalid CTA link for "sentinel": legacy unit display-name links are not allowed; use unitKey.'
        );
    });

    it("rejects ambiguous normalized tech-name fallback links", () => {
        const ambiguousTechs = [
            ...FEATURED_TECH_SNAPSHOTS,
            {
                ...FEATURED_TECH_SNAPSHOTS[2],
                entryKey: "scientific-charter-copy",
                name: "Scientific Charter",
                ctaPath: "/tech?faction=kin&tech=scientific-charter-copy",
            },
        ];
        const ambiguousAllowlist = [
            ...FEATURED_ENTITY_ALLOWLIST,
            { kind: "tech" as const, entryKey: "scientific-charter-copy" },
        ];
        const staleScientificCharterTechs = ambiguousTechs.map((snapshot) =>
            snapshot.entryKey === "scientific-charter"
                ? { ...snapshot, ctaPath: "/tech?faction=kin&tech=scientific_charter" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(ambiguousAllowlist, {
                techs: staleScientificCharterTechs,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).toThrow(
            'Invalid CTA link for "scientific-charter": tech param "scientific_charter" ambiguously matches multiple featured tech snapshots.'
        );
    });

    it("builds a sitemap with both static and generated routes", () => {
        const sitemap = buildSitemapXml(["/tech", "/units"], ["/tech/stonework", "/units/sentinel"]);

        expect(sitemap).toContain("<loc>https://endlessworkshop.dev/tech</loc>");
        expect(sitemap).toContain("<loc>https://endlessworkshop.dev/tech/stonework</loc>");
        expect(sitemap).toContain("<loc>https://endlessworkshop.dev/units/sentinel</loc>");
    });
});
