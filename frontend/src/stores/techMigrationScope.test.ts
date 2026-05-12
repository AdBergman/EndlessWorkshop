import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir, "..");

const readSrc = (file: string) => readFileSync(resolve(srcDir, file), "utf8");

describe("tech data ownership migration scope", () => {
    it("keeps techStore limited to tech data ownership", () => {
        const source = readSrc("stores/techStore.ts");

        expect(source).not.toMatch(
            /\b(selectedFaction|setSelectedFaction|selectedTechs|setSelectedTechs|SavedTechBuild|createSavedBuild|getSavedBuild|share|useNavigate|react-router|codexStore|useCodexStore)\b/
        );
    });

    it("keeps techPlannerStore limited to selected tech key interaction state", () => {
        const source = readSrc("stores/techPlannerStore.ts");

        expect(source).toMatch(/selectedTechs/);
        expect(source).toMatch(/setSelectedTechs/);
        expect(source).not.toMatch(
            /\b(selectedFaction|setSelectedFaction|SavedTechBuild|createSavedBuild|getSavedBuild|share|useNavigate|react-router|codexStore|useCodexStore|techStore|useTechStore|apiClient)\b/
        );
    });

    it("does not add hero import, store, API, or UI plumbing", () => {
        const forbiddenHeroPlumbing =
            /\b(getHeroes|loadHeroes|refreshHeroes|invalidateHeroes|heroesByKey|heroStore|HeroStore)\b|\/heroes\b/;

        for (const file of [
            "stores/techStore.ts",
            "context/GameDataProvider.tsx",
            "components/Tech/TechContainer.tsx",
            "components/Tech/TechTree.tsx",
            "components/Tech/views/SpreadSheetView.tsx",
            "components/GameSummary/GameSummaryPage.tsx",
        ]) {
            expect(readSrc(file)).not.toMatch(forbiddenHeroPlumbing);
        }
    });

    it("leaves faction, share orchestration, and saved builds in GameDataProvider", () => {
        const source = readSrc("context/GameDataProvider.tsx");

        expect(source).toMatch(/const \[selectedFaction, setSelectedFaction\] = useState<FactionInfo>/);
        expect(source).toMatch(/useTechPlannerStore\(selectSelectedTechs\)/);
        expect(source).toMatch(/useTechPlannerStore\(selectSetSelectedTechs\)/);
        expect(source).toMatch(/const \[isProcessingSharedBuild, setIsProcessingSharedBuild\] = useState/);
        expect(source).toMatch(/apiClient\.createSavedBuild/);
        expect(source).toMatch(/apiClient\.getSavedBuild/);
    });

    it("leaves tech tree interaction, share imports, and deep links on the context adapter", () => {
        const treeSource = readSrc("components/Tech/TechTree.tsx");
        const containerSource = readSrc("components/Tech/TechContainer.tsx");

        expect(treeSource).toMatch(/useGameData\(\)/);
        expect(treeSource).toMatch(/selectedTechs/);
        expect(treeSource).toMatch(/setSelectedTechs/);
        expect(treeSource).toMatch(/refreshTechs/);
        expect(treeSource).not.toMatch(/useTechStore/);

        expect(containerSource).toMatch(/useSharedBuildLoader\(setSelectedTechs\)/);
        expect(containerSource).toMatch(/useDeepLinkedTech/);
        expect(containerSource).toMatch(/useImportedTechListLoader/);
        expect(containerSource).toMatch(/techs: Map<string, Tech>/);
    });

    it("keeps route declarations unchanged for tech and summary pages", () => {
        const source = readSrc("App.tsx");

        expect(source).toMatch(/<Route\s+path="tech"/);
        expect(source).toMatch(/<Route\s+path="summary"/);
        expect(source).not.toMatch(/techStore|useTechStore/);
    });
});
