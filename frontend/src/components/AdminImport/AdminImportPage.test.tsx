import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import AdminImportPage from "./AdminImportPage";
import { refreshStoresAfterAdminImport } from "./adminImportRefresh";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getCodex: vi.fn(),
        regenerateSeoPagesAdmin: vi.fn(),
    },
}));

vi.mock("./adminImportRefresh", () => ({
    refreshStoresAfterAdminImport: vi.fn(),
}));

const mockedApiClient = vi.mocked(apiClient);
const mockedRefreshStoresAfterAdminImport = vi.mocked(refreshStoresAfterAdminImport);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const importSummary = (importKind: string) => ({
    importKind,
    counts: {
        received: 1,
        inserted: 1,
        updated: 0,
        unchanged: 0,
        deleted: 0,
        failed: 0,
    },
    durationMs: 1,
});

const seoResult = () => ({
    generatedCount: 3,
    generatedRoutes: [
        "/codex/units/Unit_Roving_Clans_Trade_Master_That_Should_Not_Render",
        "/codex/tech/Technology_Era_01_Workshop_That_Should_Not_Render",
        "/codex/districts/District_Market_That_Should_Not_Render",
    ],
    skippedCount: 1,
    duplicateCount: 0,
    skippedByReason: {},
    missingReferenceAudit: {
        artifact: "codex-missing-references-audit.json",
        unresolvedReferences: 4,
        resolutionPercentage: 56.4,
        topUnresolvedCategories: ["UnitAbility: 2", "MinorFaction: 1", "Missing: 1"],
        ownershipBuckets: [
            {
                classification: "internal/noise",
                unresolvedCount: 2,
                uniqueReferenceKeys: 2,
                percentageOfTotalUnresolved: 50.0,
                owner: "C# exporter / EL2 mapping policy",
            },
            {
                classification: "near-match / present-under-other-key",
                unresolvedCount: 1,
                uniqueReferenceKeys: 1,
                percentageOfTotalUnresolved: 25.0,
                owner: "C# exporter / EL2 mapping",
            },
            {
                classification: "present-but-filtered",
                unresolvedCount: 1,
                uniqueReferenceKeys: 1,
                percentageOfTotalUnresolved: 25.0,
                owner: "EWShop codex diagnostics/filtering",
            },
        ],
        duplicateAliasImpact: {
            resolvedReferences: 1,
            uniqueReferenceKeys: 1,
            examples: ["UnitAbility_Fly -> UnitAbility_FlightBase: 1"],
        },
        presentButFilteredReasons: [{ reason: "duplicate-slug", unresolvedCount: 1 }],
    },
    exportKindCounts: {
        units: { generatedCount: 1, skippedCount: 0, duplicateCount: 0 },
        tech: { generatedCount: 1, skippedCount: 1, duplicateCount: 0 },
        districts: { generatedCount: 1, skippedCount: 0, duplicateCount: 0 },
    },
    warnings: [],
    errors: [],
    sitemapUpdated: true,
});

function jsonResponse(body: unknown, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: {
            get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
        },
        json: vi.fn().mockResolvedValue(body),
        text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    };
}

function createJsonFile(name: string, text: string) {
    const file = new File([text], name, { type: "application/json" });
    Object.defineProperty(file, "text", {
        value: vi.fn().mockResolvedValue(text),
    });
    return file;
}

function fixtureFile(relativePath: string, fallback: unknown) {
    const absolutePath = resolve(repoRoot, relativePath);
    const text = existsSync(absolutePath)
        ? readFileSync(absolutePath, "utf8")
        : JSON.stringify(fallback);
    return createJsonFile(basename(relativePath), text);
}

async function waitForUnlockedPage() {
    await screen.findByText(/Use the two bulk rows for the normal local workflow/i);
}

function dropFiles(dropzoneIndex: number, files: File[]) {
    const dropzones = screen.getAllByLabelText("Upload JSON by drag and drop");
    fireEvent.drop(dropzones[dropzoneIndex], {
        dataTransfer: {
            files,
        },
    });
}

function dropFilesByTitle(title: RegExp, files: File[]) {
    const dropzoneTitle = screen.getByText(title);
    const dropzone = dropzoneTitle.closest("[aria-label='Upload JSON by drag and drop']");
    expect(dropzone).not.toBeNull();
    fireEvent.drop(dropzone!, {
        dataTransfer: {
            files,
        },
    });
}

function renderAdminImportPage(initialEntry = "/admin/import?admin=1") {
    return render(
        <HelmetProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/admin/import" element={<AdminImportPage />} />
                </Routes>
            </MemoryRouter>
        </HelmetProvider>
    );
}

describe("AdminImportPage", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("ewshop_admin_token", "valid-token");
        mockedApiClient.getCodex.mockReset();
        mockedApiClient.regenerateSeoPagesAdmin.mockReset();
        mockedRefreshStoresAfterAdminImport.mockReset();
        mockedRefreshStoresAfterAdminImport.mockResolvedValue({ ok: true });
        window.scrollTo = vi.fn();
        vi.stubGlobal(
            "fetch",
            vi.fn((url: string, init?: RequestInit) => {
                if (init?.method === "POST") {
                    return Promise.resolve(jsonResponse(importSummary(url.split("/").at(-1) ?? "import")));
                }
                return Promise.resolve({
                    ok: true,
                    status: 204,
                    headers: { get: () => null },
                    json: vi.fn(),
                    text: vi.fn().mockResolvedValue(""),
                });
            })
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("downloads the codex diagnostics report from the visible admin action", async () => {
        const user = userEvent.setup();
        const downloadClick = vi.fn();
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = vi.fn(() => "blob:codex-diagnostics");
        URL.revokeObjectURL = vi.fn(() => {});
        let createdAnchor: HTMLAnchorElement | null = null;
        const originalCreateElement = document.createElement.bind(document);
        const createElementSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
            if (tagName.toLowerCase() === "a") {
                const anchor = originalCreateElement("a");
                anchor.click = downloadClick;
                createdAnchor = anchor;
                return anchor;
            }

            return originalCreateElement(tagName);
        }) as typeof document.createElement);

        mockedApiClient.getCodex.mockResolvedValue([
            {
                exportKind: "units",
                entryKey: "Unit_Necro_Drone",
                displayName: "[Unit_Necro_Drone] Drone",
                descriptionLines: ["Gain [DustColored]."],
                referenceKeys: [],
            },
        ]);

        renderAdminImportPage();

        const button = await screen.findByRole("button", { name: /download codex diagnostics/i });
        await user.click(button);

        await waitFor(() => expect(downloadClick).toHaveBeenCalledTimes(1));
        expect(mockedApiClient.getCodex).toHaveBeenCalledTimes(1);
        expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(createdAnchor).not.toBeNull();
        const downloadedAnchor = createdAnchor as unknown as HTMLAnchorElement;
        expect(downloadedAnchor.download).toBe("codex-diagnostics-report.txt");
        expect(await screen.findByText(/Codex diagnostics report downloaded for 1 entry./i)).toBeInTheDocument();

        createElementSpy.mockRestore();
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it("keeps the admin import UI gated without admin mode", () => {
        localStorage.clear();
        renderAdminImportPage("/admin/import");

        expect(screen.getByText("This page is restricted.")).toBeInTheDocument();
        expect(screen.queryByText(/Use the two bulk rows for the normal local workflow/i)).not.toBeInTheDocument();
    });

    it("bulk-imports supported raw exporter files and skips unsupported raw exports", async () => {
        const user = userEvent.setup();
        const units = fixtureFile("local-imports/exports/ewshop_units_export_0.78.json", {
            exportKind: "units",
            units: [{ unitKey: "Unit_Test" }],
        });
        const tech = fixtureFile("local-imports/exports/ewshop_tech_export_0.78.json", {
            exportKind: "tech",
            techs: [{ techKey: "Tech_Test" }],
        });
        const unsupported = fixtureFile("local-imports/exports/ewshop_battle_skills_export_0.78.json", {
            exportKind: "battleSkills",
            battleSkills: [{ key: "BattleSkill_Test" }],
        });

        renderAdminImportPage();
        await waitForUnlockedPage();

        dropFiles(0, [units, tech, unsupported]);

        await screen.findByText(units.name);
        expect(screen.getByText(tech.name)).toBeInTheDocument();
        expect(screen.getByText(unsupported.name)).toBeInTheDocument();
        expect(screen.getByText("Unsupported raw export kind \"battleskills\".")).toBeInTheDocument();
        expect(screen.getByText("skipped")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /^Import supported exports$/i }));

        await screen.findByText(/2 supported export file\(s\) imported\. 1 unsupported file\(s\) skipped\./i);
        expect(screen.queryByText(unsupported.name)).not.toBeInTheDocument();
        expect(screen.queryByText("Unsupported raw export kind \"battleskills\".")).not.toBeInTheDocument();
        expect(screen.getByText(units.name)).toBeInTheDocument();
        expect(screen.getByText(tech.name)).toBeInTheDocument();

        const postCalls = vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST");
        expect(postCalls.map(([url]) => url)).toEqual([
            "/api/admin/import/units",
            "/api/admin/import/techs",
        ]);
        expect(mockedRefreshStoresAfterAdminImport).toHaveBeenCalledWith("units");
        expect(mockedRefreshStoresAfterAdminImport).toHaveBeenCalledWith("techs");
    });

    it("preserves codex bulk import behavior", async () => {
        const user = userEvent.setup();
        const codexUnits = fixtureFile("local-imports/codex/ewshop_units_codex_export_0.78.json", {
            exportKind: "units",
            entries: [{ entryKey: "Unit_Test", displayName: "Unit Test" }],
        });
        const codexTech = fixtureFile("local-imports/codex/ewshop_tech_codex_export_0.78.json", {
            exportKind: "tech",
            entries: [{ entryKey: "Tech_Test", displayName: "Tech Test" }],
        });

        renderAdminImportPage();
        await waitForUnlockedPage();

        await user.click(screen.getByRole("button", { name: /Import codex files/i }));
        dropFilesByTitle(/Drag & drop your Codex JSON files here/i, [codexUnits, codexTech]);

        await screen.findByText(codexUnits.name);
        expect(screen.getByText(codexTech.name)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /^Import all codex$/i }));
        await screen.findByText(/All selected Codex files imported successfully/i);

        const postCalls = vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST");
        expect(postCalls.map(([url]) => url)).toEqual([
            "/api/admin/import/codex",
            "/api/admin/import/codex",
        ]);
        expect(mockedRefreshStoresAfterAdminImport).toHaveBeenCalledWith("codex");
    });

    it("accepts minorFactions and traits as codex import kinds", async () => {
        const user = userEvent.setup();
        const codexMinorFactions = fixtureFile("local-imports/codex/ewshop_minor_factions_codex_export_0.78.json", {
            exportKind: "minorFactions",
            entries: [{ entryKey: "MinorFaction_Test", displayName: "Minor Faction Test" }],
        });
        const codexTraits = fixtureFile("local-imports/codex/ewshop_traits_codex_export_0.78.json", {
            exportKind: "traits",
            entries: [{ entryKey: "Trait_Test", displayName: "Trait Test" }],
        });

        renderAdminImportPage();
        await waitForUnlockedPage();

        await user.click(screen.getByRole("button", { name: /Import codex files/i }));
        dropFilesByTitle(/Drag & drop your Codex JSON files here/i, [codexMinorFactions, codexTraits]);

        await screen.findByText(codexMinorFactions.name);
        expect(screen.getByText(codexTraits.name)).toBeInTheDocument();
        expect(screen.queryByText(/Invalid exportKind/i)).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /^Import all codex$/i }));
        await screen.findByText(/All selected Codex files imported successfully/i);

        const postCalls = vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST");
        expect(postCalls.map(([url]) => url)).toEqual([
            "/api/admin/import/codex",
            "/api/admin/import/codex",
        ]);
        expect(postCalls.map(([, init]) => JSON.parse(String(init?.body)).exportKind)).toEqual([
            "minorFactions",
            "traits",
        ]);
        expect(mockedRefreshStoresAfterAdminImport).toHaveBeenCalledWith("codex");
    });

    it("keeps individual import rows available in the advanced section", async () => {
        const user = userEvent.setup();

        renderAdminImportPage();
        await waitForUnlockedPage();

        await user.click(screen.getByRole("button", { name: /Advanced \/ individual imports/i }));

        expect(screen.getByText("Districts")).toBeInTheDocument();
        expect(screen.getByText("Improvements")).toBeInTheDocument();
        expect(screen.getByText("Units")).toBeInTheDocument();
        expect(screen.getByText("Techs")).toBeInTheDocument();
        expect(screen.getByText("Codex")).toBeInTheDocument();
    });

    it("renders SEO generation as a concise summary without route key lists", async () => {
        const user = userEvent.setup();
        mockedApiClient.regenerateSeoPagesAdmin.mockResolvedValue(seoResult());

        renderAdminImportPage();
        await waitForUnlockedPage();

        await user.click(screen.getByRole("button", { name: /Regenerate SEO pages/i }));

        await screen.findByText(/Generated 3 page\(s\), skipped 1, sitemap updated: yes\./i);
        expect(screen.getByText(/By kind:/i)).toHaveTextContent("districts: 1 generated");
        expect(screen.getByText(/By kind:/i)).toHaveTextContent("tech: 1 generated, 1 skipped");
        expect(screen.getByText(/By kind:/i)).toHaveTextContent("units: 1 generated");
        expect(screen.getByText(/Missing-reference audit:/i)).toHaveTextContent(
            "4 unresolved, 56.4% resolved"
        );
        expect(screen.getByText(/Ownership buckets:/i)).toHaveTextContent(
            "internal/noise: 2 unresolved / 2 key(s), owner: C# exporter / EL2 mapping policy"
        );
        expect(screen.getByText(/Ownership buckets:/i)).toHaveTextContent(
            "present-but-filtered: 1 unresolved / 1 key(s), owner: EWShop codex diagnostics/filtering"
        );
        expect(screen.getByText(/Duplicate alias impact:/i)).toHaveTextContent(
            "1 in-app reference(s) can resolve through 1 duplicate-slug alias target(s)"
        );
        expect(screen.getByText(/Present-but-filtered reasons:/i)).toHaveTextContent("duplicate-slug: 1");
        expect(screen.queryByText(/Unit_Roving_Clans_Trade_Master_That_Should_Not_Render/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Technology_Era_01_Workshop_That_Should_Not_Render/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/^Routes:/i)).not.toBeInTheDocument();
    });
});
