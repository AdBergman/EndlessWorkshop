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
});
