import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
    INDEXABLE_PUBLIC_ROUTE_SEO,
    PUBLIC_ROUTE_SEO,
    SITE_URL,
} from "./routeSeo";

const firstJsonLdNode = (route: (typeof INDEXABLE_PUBLIC_ROUTE_SEO)[number]) => {
    const jsonLd = route.jsonLd;
    if (!jsonLd) return null;
    return Array.isArray(jsonLd) ? jsonLd[0] : jsonLd;
};

const readStaticRouteHtml = (routePath: string) => {
    const fileName = routePath === "/" ? "index.html" : `${routePath.slice(1)}.html`;
    return readFileSync(resolve(process.cwd(), fileName), "utf8");
};

describe("publicRouteSeo", () => {
    it("covers the expected public routes with unique titles and descriptions", () => {
        const indexablePaths = INDEXABLE_PUBLIC_ROUTE_SEO.map((route) => route.path);

        expect(PUBLIC_ROUTE_SEO.map((route) => route.path)).toEqual([
            "/",
            "/tech",
            "/units",
            "/codex",
            "/quests",
            "/summary",
            "/mods",
            "/info",
        ]);

        const titles = PUBLIC_ROUTE_SEO.map((route) => route.title);
        const descriptions = PUBLIC_ROUTE_SEO.map((route) => route.description);
        const robotsValues = INDEXABLE_PUBLIC_ROUTE_SEO.map((route) => route.robots ?? "index, follow");

        expect(new Set(titles).size).toBe(titles.length);
        expect(new Set(descriptions).size).toBe(descriptions.length);
        expect(INDEXABLE_PUBLIC_ROUTE_SEO.every((route) => !!route.jsonLd)).toBe(true);
        expect(robotsValues.every((robots) => robots === "index, follow")).toBe(true);
        expect(indexablePaths).not.toContain("/");
        expect(indexablePaths.some((path) => path.startsWith("/admin"))).toBe(false);
    });

    it("keeps frontend route SEO scoped to SPA shell routes", () => {
        const indexablePaths = INDEXABLE_PUBLIC_ROUTE_SEO.map((route) => route.path);

        expect(indexablePaths).toEqual([
            "/tech",
            "/units",
            "/codex",
            "/quests",
            "/summary",
            "/mods",
            "/info",
        ]);
        expect(indexablePaths.some((path) => path.split("/").length > 2)).toBe(false);
        expect(INDEXABLE_PUBLIC_ROUTE_SEO.every((route) => route.path.startsWith("/"))).toBe(true);
        expect(INDEXABLE_PUBLIC_ROUTE_SEO.every((route) => route.path.startsWith("/admin"))).toBe(false);
        expect(
            INDEXABLE_PUBLIC_ROUTE_SEO.every((route) =>
                String(firstJsonLdNode(route)?.url ?? "").startsWith(SITE_URL)
            )
        ).toBe(true);
    });

    it("keeps static public route files as empty React mount shells", () => {
        for (const route of INDEXABLE_PUBLIC_ROUTE_SEO) {
            const html = readStaticRouteHtml(route.path);

            expect(html).toContain('<div id="root"></div>');
            expect(html).toContain('<meta name="description"');
            expect(html).not.toContain('class="seo-shell"');
            expect(html).not.toContain("<main");
        }
    });
});
