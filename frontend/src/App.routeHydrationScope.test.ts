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
const readRepoDoc = (file: string) => readSource(resolve(srcDir, "../.."), file);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const publicRouteContracts = [
    {
        route: "`/tech`",
        ownerFile: "components/Tech/TechContainer.tsx",
        ownerPatterns: [/loadTechs/, /loadDistricts/, /loadImprovements/, /loadUnits/],
        frontendParams: ["share", "faction", "tech"],
    },
    {
        route: "`/units`",
        ownerFile: "components/Units/UnitEvolutionExplorer.tsx",
        ownerPatterns: [/loadUnits/],
        frontendParams: ["faction", "unitKey"],
    },
    {
        route: "`/codex`",
        ownerFile: "pages/CodexPage.tsx",
        ownerPatterns: [/loadEntries/],
        frontendParams: ["entry"],
    },
    {
        route: "`/quests/{entryKey}`",
        ownerFile: "pages/QuestExplorerPage.tsx",
        ownerPatterns: [/loadQuestExplorer/],
        frontendParams: ["mode"],
    },
] as const;

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

    it("keeps copyable public route params owned by their route components", () => {
        const routeContract = readRepoDoc("docs/frontend/public-route-contract.md");

        for (const contract of publicRouteContracts) {
            expectSourceToInclude(readSrc(contract.ownerFile), [...contract.ownerPatterns]);

            for (const param of contract.frontendParams) {
                expect(routeContract).toMatch(new RegExp(`${escapeRegExp(contract.route)}[^\\n]*${param}`));
            }
        }
    });
});
