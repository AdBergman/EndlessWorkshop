import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
    expectFilesToExclude,
    expectSourceToExclude,
    expectSourceToInclude,
    listProductionSourceFiles,
    readSource,
} from "@/tests/sourceGuardTestUtils";

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir, "..");

const readSrc = (file: string) => readSource(srcDir, file);

describe("tech data ownership migration scope", () => {
    it("keeps techStore limited to tech data ownership", () => {
        const source = readSrc("stores/techStore.ts");

        expectSourceToExclude(source, [
            /\b(selectedFaction|setSelectedFaction|selectedTechs|setSelectedTechs|SavedTechBuild|createSavedBuild|getSavedBuild|share|useNavigate|react-router|codexStore|useCodexStore)\b/,
        ]);
    });

    it("keeps techPlannerStore limited to selected tech key interaction state", () => {
        const source = readSrc("stores/techPlannerStore.ts");

        expectSourceToInclude(source, [/selectedTechs/, /setSelectedTechs/]);
        expectSourceToExclude(source, [
            /\b(selectedFaction|setSelectedFaction|SavedTechBuild|createSavedBuild|getSavedBuild|share|useNavigate|react-router|codexStore|useCodexStore|techStore|useTechStore|apiClient)\b/,
        ]);
    });

    it("keeps factionSelectionStore limited to selected faction state", () => {
        const source = readSrc("stores/factionSelectionStore.ts");

        expectSourceToInclude(source, [/selectedFaction/, /setSelectedFaction/]);
        expectSourceToExclude(source, [
            /\b(selectedTechs|setSelectedTechs|SavedTechBuild|createSavedBuild|getSavedBuild|share|useNavigate|react-router|codexStore|useCodexStore|techStore|useTechStore|apiClient)\b/,
        ]);
    });

    it("does not add hero import, store, API, or UI plumbing", () => {
        const forbiddenHeroPlumbing =
            /\b(getHeroes|loadHeroes|refreshHeroes|invalidateHeroes|heroesByKey|heroStore|HeroStore)\b|\/heroes\b/;

        expectFilesToExclude(srcDir, [
            "stores/techStore.ts",
            "context/GameDataProvider.tsx",
            "components/Tech/TechContainer.tsx",
            "components/Tech/useTechRouteHydration.ts",
            "components/Tech/TechTree.tsx",
            "components/Tech/views/SpreadSheetView.tsx",
            "components/GameSummary/GameSummaryPage.tsx",
        ], [forbiddenHeroPlumbing]);
    });

    it("leaves share orchestration and saved builds in GameDataProvider", () => {
        const source = readSrc("context/GameDataProvider.tsx");
        const contextSource = readSrc("context/GameDataContext.ts");

        expectSourceToInclude(source, [
            /useFactionSelectionStore/,
            /useTechPlannerStore/,
            /isProcessingSharedBuild/,
            /apiClient\.createSavedBuild/,
            /apiClient\.getSavedBuild/,
        ]);
        expectSourceToExclude(contextSource, [/refreshTechs/]);
        const contextInterface =
            contextSource.match(/export interface GameDataContextType \{[\s\S]*?\n\}/)?.[0] ?? "";
        expect(contextInterface).not.toMatch(
            /^\s+(codex|entries|entriesByKey|entriesByKind|districts|districtsByKey|improvements|improvementsByKey|techs|techsByKey|units|unitsByKey|selectedFaction|setSelectedFaction|selectedTechs|setSelectedTechs)\??:/m
        );
    });

    it("keeps direct production useGameData calls limited to the orchestration facade", () => {
        const callSites = listProductionSourceFiles(srcDir)
            .filter((file) => readSrc(file).match(/\buseGameData\(\)/))
            .sort();

        expect(callSites).toEqual(["context/appOrchestration.ts"]);
    });

    it("keeps production GameDataContext imports inside context internals", () => {
        const importSites = listProductionSourceFiles(srcDir)
            .filter((file) => file !== "context/GameDataContext.ts")
            .filter((file) => readSrc(file).match(/from ["'].*GameDataContext["']/))
            .sort();

        expect(importSites).toEqual([
            "context/GameDataProvider.tsx",
            "context/appOrchestration.ts",
        ]);
    });

    it("keeps TechTree on direct stores while owning admin refresh locally", () => {
        const treeSource = readSrc("components/Tech/TechTree.tsx");
        const containerSource = readSrc("components/Tech/TechContainer.tsx");
        const hydrationSource = readSrc("components/Tech/useTechRouteHydration.ts");

        expectSourceToExclude(treeSource, [/useGameData\(\)/]);
        expectSourceToInclude(treeSource, [
            /selectedTechs/,
            /setSelectedTechs/,
            /refreshTechs/,
            /useTechStore/,
            /useTechPlannerStore/,
            /useFactionSelectionStore/,
        ]);

        expectSourceToExclude(containerSource, [/useGameData\(\)/, /useSharedBuildLoader|useDeepLinkedTech|useImportedTechListLoader/]);
        expectSourceToInclude(containerSource, [/useTechRouteHydration/]);

        expectSourceToInclude(hydrationSource, [/useTechStore/, /useTechPlannerStore/, /useFactionSelectionStore/]);
        expectSourceToExclude(hydrationSource, [/useCodexStore|codexStore/]);
    });

    it("keeps narrow app orchestration hooks over the compatibility provider", () => {
        const source = readSrc("context/appOrchestration.ts");

        expectSourceToInclude(source, [
            /useGameData\(\)/,
            /useShareProcessingGate/,
            /useSavedTechBuildCommands/,
            /isProcessingSharedBuild/,
            /createSavedTechBuild/,
        ]);
        expectSourceToExclude(source, [/useTechStore|useTechPlannerStore|useFactionSelectionStore|useNavigate/]);
    });

    it("keeps TopContainer using the narrow share-processing gate", () => {
        const source = readSrc("components/TopContainer/TopContainer.tsx");

        expectSourceToExclude(source, [/useGameData\(\)|GameDataContext/, /const \{ selectedFaction, setSelectedFaction, setSelectedTechs/]);
        expectSourceToInclude(source, [
            /useShareProcessingGate/,
            /isProcessingSharedBuild/,
            /useFactionSelectionStore/,
            /useTechPlannerStore/,
        ]);
    });

    it("keeps SpreadSheetView on the narrow saved-build command hook", () => {
        const source = readSrc("components/Tech/views/SpreadSheetView.tsx");

        expectSourceToExclude(source, [/useGameData\(\)|GameDataContext/]);
        expectSourceToInclude(source, [
            /useSavedTechBuildCommands/,
            /createSavedTechBuild/,
            /useTechPlannerStore/,
            /useFactionSelectionStore/,
        ]);
    });

    it("keeps tooltips off the compatibility provider with scoped faction ownership", () => {
        const techTooltipSource = readSrc("components/Tooltips/TechTooltip.tsx");
        const unitTooltipSource = readSrc("components/Tooltips/UnitTooltip.tsx");

        expectSourceToExclude(techTooltipSource, [/useGameData\(\)|GameDataContext/]);
        expectSourceToInclude(techTooltipSource, [/useFactionSelectionStore/, /selectSelectedFaction/]);

        expectSourceToExclude(unitTooltipSource, [/useGameData\(\)|GameDataContext/, /useFactionSelectionStore|selectSelectedFaction/]);
        expectSourceToInclude(unitTooltipSource, [/deriveUnit/, /getFactionIconPath/]);
    });

    it("keeps route declarations unchanged for tech and summary pages", () => {
        const source = readSrc("App.tsx");

        expect(source).toMatch(/<Route\s+path="tech"/);
        expect(source).toMatch(/<Route\s+path="summary"/);
        expect(source).not.toMatch(/techStore|useTechStore/);
    });
});
