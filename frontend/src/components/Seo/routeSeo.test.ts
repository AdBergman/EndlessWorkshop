import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getExpectedSitemapPaths, listGeneratedEntityPaths } from "@/seo/entitySeo";
import {
    INDEXABLE_PUBLIC_ROUTE_PATHS,
    INDEXABLE_PUBLIC_ROUTE_SEO,
    PUBLIC_ROUTE_SEO,
    SITE_URL,
} from "./routeSeo";

describe("publicRouteSeo", () => {
    it("covers the expected public routes with unique titles and descriptions", () => {
        expect(PUBLIC_ROUTE_SEO.map((route) => route.path)).toEqual([
            "/",
            "/tech",
            "/units",
            "/codex",
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
        expect(INDEXABLE_PUBLIC_ROUTE_PATHS).not.toContain("/");
        expect(INDEXABLE_PUBLIC_ROUTE_PATHS.some((path) => path.startsWith("/admin"))).toBe(false);
    });

    it("keeps the sitemap aligned with indexable public routes only", () => {
        const publicDir = resolve(process.cwd(), "public");
        const sitemap = readFileSync(resolve(publicDir, "sitemap.xml"), "utf8");
        const generatedEntityPaths = listGeneratedEntityPaths(publicDir);
        const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) =>
            match[1].replace(SITE_URL, "")
        );

        expect(locs).toEqual(getExpectedSitemapPaths(generatedEntityPaths));
        expect(new Set(locs).size).toBe(locs.length);
        expect(locs.every((path) => path.startsWith("/"))).toBe(true);
        expect(locs.some((path) => path.includes("?"))).toBe(false);
        expect(locs.some((path) => path.includes("#"))).toBe(false);
        expect(locs.some((path) => path.startsWith("/admin"))).toBe(false);
        expect(generatedEntityPaths.every((path) => locs.includes(path))).toBe(true);
        expect(locs.filter((path) => path.startsWith("/tech/") || path.startsWith("/units/")).sort()).toEqual(
            generatedEntityPaths
        );
    });
});
