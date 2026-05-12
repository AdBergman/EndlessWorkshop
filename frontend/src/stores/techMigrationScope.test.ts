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

    it("keeps factionSelectionStore limited to selected faction state", () => {
        const source = readSrc("stores/factionSelectionStore.ts");

        expect(source).toMatch(/selectedFaction/);
        expect(source).toMatch(/setSelectedFaction/);
        expect(source).not.toMatch(
            /\b(selectedTechs|setSelectedTechs|SavedTechBuild|createSavedBuild|getSavedBuild|share|useNavigate|react-router|codexStore|useCodexStore|techStore|useTechStore|apiClient)\b/
        );
    });

    it("does not add hero import, store, API, or UI plumbing", () => {
        const forbiddenHeroPlumbing =
            /\b(getHeroes|loadHeroes|refreshHeroes|invalidateHeroes|heroesByKey|heroStore|HeroStore)\b|\/heroes\b/;

        for (const file of [
            "stores/techStore.ts",
            "context/GameDataProvider.tsx",
            "components/Tech/TechContainer.tsx",
            "components/Tech/useTechRouteHydration.ts",
            "components/Tech/TechTree.tsx",
            "components/Tech/views/SpreadSheetView.tsx",
            "components/GameSummary/GameSummaryPage.tsx",
        ]) {
            expect(readSrc(file)).not.toMatch(forbiddenHeroPlumbing);
        }
    });

    it("leaves share orchestration and saved builds in GameDataProvider", () => {
        const source = readSrc("context/GameDataProvider.tsx");
        const contextSource = readSrc("context/GameDataContext.ts");

        expect(source).toMatch(/useFactionSelectionStore\(selectSelectedFaction\)/);
        expect(source).toMatch(/useFactionSelectionStore\(selectSetSelectedFaction\)/);
        expect(source).toMatch(/useTechPlannerStore\(selectSelectedTechs\)/);
        expect(source).toMatch(/useTechPlannerStore\(selectSetSelectedTechs\)/);
        expect(source).toMatch(/const \[isProcessingSharedBuild, setIsProcessingSharedBuild\] = useState/);
        expect(source).toMatch(/apiClient\.createSavedBuild/);
        expect(source).toMatch(/apiClient\.getSavedBuild/);
        expect(contextSource).not.toMatch(/refreshTechs/);
    });

    it("keeps TechTree on direct stores while owning admin refresh locally", () => {
        const treeSource = readSrc("components/Tech/TechTree.tsx");
        const containerSource = readSrc("components/Tech/TechContainer.tsx");
        const hydrationSource = readSrc("components/Tech/useTechRouteHydration.ts");

        expect(treeSource).not.toMatch(/useGameData\(\)/);
        expect(treeSource).toMatch(/selectedTechs/);
        expect(treeSource).toMatch(/setSelectedTechs/);
        expect(treeSource).toMatch(/refreshTechs/);
        expect(treeSource).toMatch(/useTechStore/);
        expect(treeSource).toMatch(/useTechPlannerStore/);
        expect(treeSource).toMatch(/useFactionSelectionStore/);

        expect(containerSource).not.toMatch(/useGameData\(\)/);
        expect(containerSource).not.toMatch(/useSharedBuildLoader|useDeepLinkedTech|useImportedTechListLoader/);
        expect(containerSource).toMatch(/useTechRouteHydration/);

        expect(hydrationSource).toMatch(/useTechStore/);
        expect(hydrationSource).toMatch(/useTechPlannerStore/);
        expect(hydrationSource).toMatch(/useFactionSelectionStore/);
        expect(hydrationSource).not.toMatch(/useCodexStore|codexStore/);
    });

    it("keeps TopContainer using context only for share-processing gating", () => {
        const source = readSrc("components/TopContainer/TopContainer.tsx");

        expect(source).toMatch(/useGameData\(\)/);
        expect(source).toMatch(/isProcessingSharedBuild/);
        expect(source).toMatch(/useFactionSelectionStore/);
        expect(source).toMatch(/useTechPlannerStore/);
        expect(source).not.toMatch(/const \{ selectedFaction, setSelectedFaction, setSelectedTechs/);
    });

    it("keeps route declarations unchanged for tech and summary pages", () => {
        const source = readSrc("App.tsx");

        expect(source).toMatch(/<Route\s+path="tech"/);
        expect(source).toMatch(/<Route\s+path="summary"/);
        expect(source).not.toMatch(/techStore|useTechStore/);
    });
});
