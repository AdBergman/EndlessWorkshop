import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
    expectSourceToExclude,
    expectSourceToInclude,
    readSource,
} from "@/tests/sourceGuardTestUtils";

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(currentDir);
const readSrc = (file: string) => readSource(srcDir, file);

describe("route data hydration scope", () => {
    it("keeps data-backed routes owning the datasets they need on mount", () => {
        expectSourceToInclude(readSrc("components/Tech/TechContainer.tsx"), [
            /loadTechs/,
            /loadDistricts/,
            /loadImprovements/,
            /loadUnits/,
        ]);
        expectSourceToInclude(readSrc("components/Units/UnitEvolutionExplorer.tsx"), [/loadUnits/]);
        expectSourceToInclude(readSrc("pages/CodexPage.tsx"), [/loadEntries/]);
        expectSourceToInclude(readSrc("pages/QuestExplorerPage.tsx"), [/loadQuestExplorer/]);
    });

    it("keeps route chunk preloading separate from API/store data hydration", () => {
        expectSourceToExclude(readSrc("routeLoaders.ts"), [
            /apiClient/,
            /use[A-Z][A-Za-z]+Store/,
            /load(Techs|Units|Entries|QuestExplorer|Districts|Improvements)\s*\(/,
        ]);
    });
});
