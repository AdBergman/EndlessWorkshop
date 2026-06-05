import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
    expectFilesToExclude,
    expectSourceToExclude,
    expectSourceToInclude,
    readSource,
} from "@/tests/sourceGuardTestUtils";

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir, "..");
const readSrc = (file: string) => readSource(srcDir, file);

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

        expectFilesToExclude(srcDir, migrationFiles, [forbiddenHeroPlumbing]);
    });

    it("keeps unit page internals decoupled from codexStore", () => {
        for (const file of [
            "components/Units/UnitEvolutionExplorer.tsx",
            "components/Units/EvolutionTreeViewer.tsx",
            "components/Units/unitEvolution.ts",
        ]) {
            expectSourceToExclude(readSrc(file), [/codexStore|useCodexStore/]);
        }
    });

    it("keeps UnitEvolutionExplorer on direct store ownership instead of GameDataContext", () => {
        const source = readSrc("components/Units/UnitEvolutionExplorer.tsx");

        expectSourceToExclude(source, [/GameDataContext|useGameData|useContext/]);
        expectSourceToInclude(source, [
            /useUnitStore/,
            /useFactionSelectionStore/,
            /selectSelectedFaction/,
            /selectSetSelectedFaction/,
        ]);
    });

    it("keeps the units page chrome on the orange app accent rather than the old teal theme", () => {
        const appSource = readSrc("App.tsx");
        const unitChromeSources = [
            "components/Units/UnitEvolutionExplorer.css",
            "components/Units/UnitCarousel.css",
        ].map(readSrc);

        expect(appSource).not.toMatch(/pathname\.startsWith\(["']\/units["']\)[\s\S]{0,120}appHue\s*=\s*["']teal["']/);

        for (const source of unitChromeSources) {
            expectSourceToExclude(source, [/#20b897|rgba\(\s*32\s*,\s*184\s*,\s*151/i]);
        }
    });

    it("keeps unit card faction icons pinned with major tinting and minor EW accent tinting", () => {
        const cardSource = readSrc("components/Units/UnitCard/UnitCard.tsx");
        const cardCss = readSrc("components/Units/UnitCard/UnitCard.css");
        const iconResolverSource = readSrc("features/icons/factionIconResolver.ts");
        const factionColors = readSrc("types/factionColors.ts");

        expectSourceToInclude(cardSource, [
            /getFactionIconPath/,
            /factionIconPath/,
            /factionIconColor/,
            /minorFactionIcon/,
            /--faction-icon-path/,
            /--faction-icon-color/,
        ]);
        expectSourceToInclude(cardCss, [
            /\.fortIcon\s*\{[\s\S]*position:\s*absolute;[\s\S]*top:\s*8px;[\s\S]*right:\s*10px;/,
            /\.factionIcon\s*\{[\s\S]*mask-image:\s*var\(--faction-icon-path\);/,
            /--unit-card-minor-accent:\s*var\(--ew-accent, #ff7f32\);/,
            /\.factionIcon\.minorFactionIcon\s*\{[\s\S]*background:\s*var\(--unit-card-minor-accent/,
        ]);
        expectSourceToInclude(iconResolverSource, [
            /factionQuest_KinOfSheredyn_Chapter02_Step01_Choice1/,
            /factionAffinity_Mukag_210fe287/,
        ]);
        expectSourceToInclude(factionColors, [
            /NECROPHAGES:\s*\{[\s\S]*border:\s*"#8BC34A"/,
            /MINOR:\s*\{[\s\S]*border:\s*"#ff7f32"/,
        ]);
    });
});
