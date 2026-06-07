import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSource } from "@/tests/sourceGuardTestUtils";

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir, "../..");
const frontendDir = resolve(srcDir, "..");
const topContainerSource = readSource(srcDir, "components/TopContainer/TopContainer.tsx");

function topNavMajorFactionLabels(): string[] {
    const factionBlock = topContainerSource.match(/const factions = \[[\s\S]*?];/)?.[0] ?? "";
    return Array.from(factionBlock.matchAll(/uiLabel:\s*"([^"]+)"/g))
        .map((match) => match[1])
        .filter((label) => label.trim().length > 0);
}

function techBackgroundPath(factionLabel: string, era: number): string {
    return resolve(
        frontendDir,
        "public",
        "graphics",
        "techEraScreens",
        `${factionLabel.toLowerCase()}_era_${era}.webp`
    );
}

describe("tech background assets", () => {
    it("has era background screenshots for every hardcoded top-nav major faction", () => {
        const factionLabels = topNavMajorFactionLabels();

        expect(factionLabels).toEqual(["Kin", "Lords", "Tahuk", "Aspects", "Necrophages"]);

        const missingAssets = factionLabels.flatMap((label) =>
            [1, 2, 3, 4, 5, 6]
                .map((era) => ({ label, era, path: techBackgroundPath(label, era) }))
                .filter((asset) => !existsSync(asset.path))
                .map((asset) => `${asset.label} era ${asset.era}: ${asset.path}`)
        );

        expect(missingAssets).toEqual([]);
    });
});
