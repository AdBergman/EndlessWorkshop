import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { INDEXABLE_PUBLIC_ROUTE_PATHS } from "../components/Seo/routeSeo.ts";
import {
    buildSitemapXml,
    getResolvedFeaturedEntities,
    listGeneratedEntityPaths,
    renderEntityHtml,
} from "../seo/entitySeo.ts";
import { ENTITY_GENERATION_REPORT } from "../seo/featuredEntityCatalog.ts";

function cleanGeneratedDirectory(directory: string): void {
    mkdirSync(directory, { recursive: true });

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        rmSync(join(directory, entry.name), { recursive: true, force: true });
    }
}

function writeEntityPages(publicRoot: string): string[] {
    const entities = getResolvedFeaturedEntities();

    cleanGeneratedDirectory(join(publicRoot, "tech"));
    cleanGeneratedDirectory(join(publicRoot, "units"));

    for (const entity of entities) {
        const outputDir = join(publicRoot, entity.collectionPath.slice(1), entity.entryKey);
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(join(outputDir, "index.html"), renderEntityHtml(entity), "utf8");
    }

    return listGeneratedEntityPaths(publicRoot);
}

function main(): void {
    const publicRoot = resolve(process.cwd(), "public");
    const generatedEntityPaths = writeEntityPages(publicRoot);
    const sitemapXml = buildSitemapXml(INDEXABLE_PUBLIC_ROUTE_PATHS, generatedEntityPaths);

    writeFileSync(join(publicRoot, "sitemap.xml"), sitemapXml, "utf8");
    console.log(
        `Generated ${generatedEntityPaths.length} SEO entity pages (${ENTITY_GENERATION_REPORT.includedCounts.techs} tech, ${ENTITY_GENERATION_REPORT.includedCounts.units} units).`
    );
    console.log(
        `Excluded ${ENTITY_GENERATION_REPORT.excludedCounts.total} snapshot entries (${ENTITY_GENERATION_REPORT.excludedCounts.techs} tech, ${ENTITY_GENERATION_REPORT.excludedCounts.units} units).`
    );
    console.log(
        `Skip reasons: ${Object.entries(ENTITY_GENERATION_REPORT.skippedByReason)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([reason, count]) => `${reason}=${count}`)
            .join(", ")}`
    );
}

main();
