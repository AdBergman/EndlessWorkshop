import { describe, expect, it } from "vitest";
import {
    buildSitemapXml,
    getResolvedFeaturedEntities,
    renderEntityHtml,
    validateFeaturedEntities,
} from "./entitySeo";
import {
    ENTITY_GENERATION_REPORT,
    FEATURED_TECH_SNAPSHOTS,
    FEATURED_UNIT_SNAPSHOTS,
} from "./featuredEntityCatalog";

describe("entitySeo", () => {
    it("resolves the generated entity catalog into safe routes within the scale window", () => {
        const entities = getResolvedFeaturedEntities();
        const expectedCount = FEATURED_TECH_SNAPSHOTS.length + FEATURED_UNIT_SNAPSHOTS.length;

        expect(entities).toHaveLength(expectedCount);
        expect(expectedCount).toBeGreaterThanOrEqual(100);
        expect(expectedCount).toBeLessThanOrEqual(300);
        expect(new Set(entities.map((entity) => entity.routePath)).size).toBe(entities.length);
        expect(entities.every((entity) => entity.routePath.startsWith(entity.collectionPath))).toBe(true);
    });

    it("keeps the generated corpus below the full local snapshot set and reports skip reasons", () => {
        expect(ENTITY_GENERATION_REPORT.includedCounts.techs).toBeLessThan(ENTITY_GENERATION_REPORT.rawCounts.techs);
        expect(ENTITY_GENERATION_REPORT.includedCounts.units).toBeLessThan(ENTITY_GENERATION_REPORT.rawCounts.units);
        expect(ENTITY_GENERATION_REPORT.excludedCounts.total).toBeGreaterThan(0);
        expect(Object.keys(ENTITY_GENERATION_REPORT.skippedByReason).length).toBeGreaterThan(0);
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
        const duplicatedTech = FEATURED_TECH_SNAPSHOTS[0];

        expect(() =>
            validateFeaturedEntities(
                [...FEATURED_TECH_SNAPSHOTS, ...FEATURED_UNIT_SNAPSHOTS, { ...duplicatedTech }],
                { techs: FEATURED_TECH_SNAPSHOTS, units: FEATURED_UNIT_SNAPSHOTS }
            )
        ).toThrow(`Duplicate generated route "/tech/${duplicatedTech.entryKey}".`);
    });

    it("rejects invalid CTA targets", () => {
        const invalidTechs = FEATURED_TECH_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "stonework"
                ? { ...snapshot, ctaPath: "/codex?entry=stonework" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities(
                [...invalidTechs, ...FEATURED_UNIT_SNAPSHOTS],
                {
                    techs: invalidTechs,
                    units: FEATURED_UNIT_SNAPSHOTS,
                }
            )
        ).toThrow('Invalid CTA link for "stonework": expected path "/tech" but got "/codex".');
    });

    it("accepts stable tech CTA links that resolve to the intended featured tech", () => {
        expect(() =>
            validateFeaturedEntities([...FEATURED_TECH_SNAPSHOTS, ...FEATURED_UNIT_SNAPSHOTS], {
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
            validateFeaturedEntities([...staleTechs, ...FEATURED_UNIT_SNAPSHOTS], {
                techs: staleTechs,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).toThrow(
            'Invalid CTA link for "stonework": tech param "stoneworks" does not resolve to a featured tech snapshot.'
        );
    });

    it("accepts stable unitKey CTA links that resolve to the intended featured unit", () => {
        expect(() =>
            validateFeaturedEntities([...FEATURED_TECH_SNAPSHOTS, ...FEATURED_UNIT_SNAPSHOTS], {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: FEATURED_UNIT_SNAPSHOTS,
            })
        ).not.toThrow();
    });

    it("keeps a human slug while validating against the canonical unitKey CTA target", () => {
        const sentinel = FEATURED_UNIT_SNAPSHOTS.find((snapshot) => snapshot.entryKey === "sentinel");

        expect(sentinel).toBeDefined();
        expect(sentinel?.unitKey).toBe("Unit_Sentinel");
        expect(sentinel?.entryKey).not.toBe(sentinel?.unitKey);
        expect(() =>
            validateFeaturedEntities([...FEATURED_TECH_SNAPSHOTS, ...FEATURED_UNIT_SNAPSHOTS], {
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
            validateFeaturedEntities([...FEATURED_TECH_SNAPSHOTS, ...legacyUnits], {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: legacyUnits,
            })
        ).toThrow(
            'Invalid CTA link for "sentinel": legacy unit display-name links are not allowed; use unitKey.'
        );
    });

    it("rejects stale slug-as-unitKey CTA links", () => {
        const staleUnits = FEATURED_UNIT_SNAPSHOTS.map((snapshot) =>
            snapshot.entryKey === "sentinel"
                ? { ...snapshot, ctaPath: "/units?faction=kin&unitKey=sentinel" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities([...FEATURED_TECH_SNAPSHOTS, ...staleUnits], {
                techs: FEATURED_TECH_SNAPSHOTS,
                units: staleUnits,
            })
        ).toThrow(
            'Invalid CTA link for "sentinel": unitKey "sentinel" does not match canonical unitKey "Unit_Sentinel".'
        );
    });

    it("renders the Sentinel page CTA with the canonical Unit_Sentinel query value", () => {
        const sentinel = getResolvedFeaturedEntities().find((entity) => entity.kind === "unit" && entity.entryKey === "sentinel");
        expect(sentinel).toBeDefined();

        const html = renderEntityHtml(sentinel!);
        expect(html).toContain('/units?faction=kin&unitKey=Unit_Sentinel');
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
        const staleScientificCharterTechs = ambiguousTechs.map((snapshot) =>
            snapshot.entryKey === "scientific-charter"
                ? { ...snapshot, ctaPath: "/tech?faction=kin&tech=scientific_charter" }
                : snapshot
        );

        expect(() =>
            validateFeaturedEntities([...staleScientificCharterTechs, ...FEATURED_UNIT_SNAPSHOTS], {
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
