import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir, "..");

const migrationFiles = [
    "stores/unitStore.ts",
    "context/GameDataProvider.tsx",
    "components/Tech/views/HoverableItem.tsx",
    "components/Tech/views/SpreadSheetView.tsx",
    "components/Tech/views/SpreadsheetToolbar.tsx",
    "components/Tech/views/UnlockLine.tsx",
    "components/Tooltips/TechTooltip.tsx",
    "components/Tooltips/UnitTooltip.tsx",
    "utils/unlocks.ts",
    "components/Units/UnitEvolutionExplorer.tsx",
    "components/Units/EvolutionTreeViewer.tsx",
    "components/Units/unitEvolution.ts",
];

describe("unit migration scope", () => {
    it("does not add hero import, store, API, or UI plumbing", () => {
        const forbiddenHeroPlumbing =
            /\b(getHeroes|loadHeroes|refreshHeroes|invalidateHeroes|heroesByKey|heroStore|HeroStore)\b|\/heroes\b/;

        for (const file of migrationFiles) {
            const source = readFileSync(resolve(srcDir, file), "utf8");
            expect(source).not.toMatch(forbiddenHeroPlumbing);
        }
    });

    it("keeps unit page internals decoupled from codexStore", () => {
        for (const file of [
            "components/Units/UnitEvolutionExplorer.tsx",
            "components/Units/EvolutionTreeViewer.tsx",
            "components/Units/unitEvolution.ts",
        ]) {
            const source = readFileSync(resolve(srcDir, file), "utf8");
            expect(source).not.toMatch(/codexStore|useCodexStore/);
        }
    });

    it("keeps UnitEvolutionExplorer on direct store ownership instead of GameDataContext", () => {
        const source = readFileSync(resolve(srcDir, "components/Units/UnitEvolutionExplorer.tsx"), "utf8");

        expect(source).not.toMatch(/GameDataContext|useGameData|useContext/);
        expect(source).toMatch(/useUnitStore/);
        expect(source).toMatch(/useFactionSelectionStore/);
        expect(source).toMatch(/selectSelectedFaction/);
        expect(source).toMatch(/selectSetSelectedFaction/);
    });

    it("keeps the units page chrome on the orange app accent rather than the old teal theme", () => {
        const appSource = readFileSync(resolve(srcDir, "App.tsx"), "utf8");
        const unitChromeSources = [
            "components/Units/UnitEvolutionExplorer.css",
            "components/Units/UnitCarousel.css",
        ].map((file) => readFileSync(resolve(srcDir, file), "utf8"));

        expect(appSource).not.toMatch(/pathname\.startsWith\(["']\/units["']\)[\s\S]{0,120}appHue\s*=\s*["']teal["']/);

        for (const source of unitChromeSources) {
            expect(source).not.toMatch(/#20b897|rgba\(\s*32\s*,\s*184\s*,\s*151/i);
        }
    });

    it("keeps unit card faction icons pinned and colored by the card faction token", () => {
        const cardSource = readFileSync(resolve(srcDir, "components/Units/UnitCard/UnitCard.tsx"), "utf8");
        const cardCss = readFileSync(resolve(srcDir, "components/Units/UnitCard/UnitCard.css"), "utf8");
        const iconSource = readFileSync(resolve(srcDir, "components/Units/UnitCard/FactionIcon.tsx"), "utf8");
        const factionColors = readFileSync(resolve(srcDir, "types/factionColors.ts"), "utf8");

        expect(cardSource).toMatch(/<FactionIcon\s+faction=\{d\.majorEnumFaction\}\s+color=\{colors\.border\}/);
        expect(cardCss).toMatch(/\.fortIcon\s*\{[\s\S]*position:\s*absolute;[\s\S]*top:\s*8px;[\s\S]*right:\s*10px;/);
        expect(iconSource).toMatch(/color\s*=\s*"currentColor"/);
        expect(factionColors).toMatch(/NECROPHAGES:\s*\{[\s\S]*border:\s*"#8BC34A"/);
    });
});
