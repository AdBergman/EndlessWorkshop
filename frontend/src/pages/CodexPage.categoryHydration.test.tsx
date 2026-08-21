import { StrictMode } from "react";
import { apiClient } from "@/api/apiClient";
import {
    cleanupCodexPageStores,
    resetCodexPageTestState,
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CodexPage from "./CodexPage";

const AMETRINE_ENTRY: CodexEntry = {
    exportKind: "populations",
    entryKey: "Population_Minor_Ametrine",
    displayName: "Ametrine",
    category: "Minor Faction",
    kind: "Population",
    descriptionLines: ["Ametrine population."],
    referenceKeys: [],
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

function renderCodex(route: string, strict = false) {
    const routeElement = (
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route
                    path="/codex"
                    element={(
                        <>
                            <LocationProbe />
                            <CodexPage />
                        </>
                    )}
                />
            </Routes>
        </MemoryRouter>
    );

    return render(strict ? <StrictMode>{routeElement}</StrictMode> : routeElement);
}

describe("CodexPage category hydration", () => {
    beforeEach(() => {
        resetCodexPageTestState();
        useCodexStore.getState().reset();
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "populations", count: 1 },
        ]);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        cleanupCodexPageStores();
    });

    it("preserves a cold direct-entry URL until its category resolves in StrictMode", async () => {
        const categoryRequest = deferred<CodexEntry[]>();
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockReturnValue(categoryRequest.promise);
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex(
            "/codex?category=populations&entry=Population_Minor_Ametrine",
            true
        );

        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=populations&entry=Population_Minor_Ametrine"
        );
        await waitFor(() => expect(getCategory).toHaveBeenCalledTimes(1));
        expect(screen.getByRole("heading", { name: "Loading Populations" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=populations&entry=Population_Minor_Ametrine"
        );
        expect(getFullCodex).not.toHaveBeenCalled();

        categoryRequest.resolve([AMETRINE_ENTRY]);

        expect(await screen.findByRole("heading", { name: "Ametrine" })).toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=populations&entry=Population_Minor_Ametrine"
        );
    });

    it("does not remove an invalid entry until the requested category proves absence", async () => {
        const categoryRequest = deferred<CodexEntry[]>();
        vi.spyOn(apiClient, "getCodexCategory").mockReturnValue(categoryRequest.promise);

        renderCodex("/codex?category=populations&entry=Population_Missing");

        await screen.findByRole("heading", { name: "Loading Populations" });
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=populations&entry=Population_Missing"
        );

        categoryRequest.resolve([]);

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent(
                /^\/codex\?category=populations$/
            );
        });
        expect(await screen.findByRole("heading", { name: "All Populations" })).toBeInTheDocument();
    });

    it("loads a category route without requesting the full Codex", async () => {
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockResolvedValue([AMETRINE_ENTRY]);
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex("/codex?category=populations");

        expect(await screen.findByRole("heading", { name: "All Populations" })).toBeInTheDocument();
        expect(getCategory).toHaveBeenCalledWith("populations");
        expect(getFullCodex).not.toHaveBeenCalled();
    });

    it("renders a cold cross-category relationship from identity and hydrates its actual category on hover", async () => {
        const targetRequest = deferred<CodexEntry[]>();
        const sourceEntry: CodexEntry = {
            exportKind: "abilities",
            entryKey: "Ability_Rally",
            displayName: "Rally",
            descriptionLines: ["Calls a nearby unit to the line."],
            referenceKeys: ["Unit_Warden"],
        };
        const targetEntry: CodexEntry = {
            exportKind: "units",
            entryKey: "Unit_Warden",
            displayName: "Warden",
            kind: "Unit",
            descriptionLines: ["A stalwart defensive unit."],
            referenceKeys: [],
        };
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "abilities", count: 1 },
            { exportKind: "actions", count: 1 },
            { exportKind: "districts", count: 1 },
            { exportKind: "units", count: 1 },
        ]);
        vi.mocked(apiClient.getCodexIdentities).mockResolvedValue([
            { entryKey: "Ability_Rally", displayName: "Rally", routeKind: "abilities" },
            { entryKey: "Unit_Warden", displayName: "Warden", routeKind: "units" },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockImplementation((category) => {
            if (category === "abilities") return Promise.resolve([sourceEntry]);
            if (category === "units") return targetRequest.promise;
            return Promise.resolve([]);
        });
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex("/codex?category=abilities&entry=Ability_Rally");

        expect(await screen.findByRole("heading", { name: "Rally" })).toBeInTheDocument();
        const relationship = await screen.findByRole("button", { name: /Warden Units/ });
        expect(useCodexStore.getState().entriesByKindKey.units).toBeUndefined();

        fireEvent.mouseEnter(relationship);
        await waitFor(() => expect(getCategory).toHaveBeenCalledWith("units"));
        expect(getFullCodex).not.toHaveBeenCalled();

        targetRequest.resolve([targetEntry]);
        expect(await screen.findByText("A stalwart defensive unit.")).toBeInTheDocument();

        fireEvent.click(relationship);
        await waitFor(() => expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=units&entry=Unit_Warden"
        ));
        expect(await screen.findByRole("heading", { name: "Warden" })).toBeInTheDocument();
    });

    it("prefetches only the next two public categories after a category visit", async () => {
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "abilities", count: 1 },
            { exportKind: "heroes", count: 1 },
            { exportKind: "populations", count: 1 },
            { exportKind: "quests", count: 1 },
            { exportKind: "statuses", count: 1 },
            { exportKind: "tech", count: 1 },
            { exportKind: "traits", count: 1 },
            { exportKind: "units", count: 1 },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockImplementation(async (category) => (
            category === "populations" ? [AMETRINE_ENTRY] : []
        ));

        renderCodex("/codex?category=populations");

        expect(await screen.findByRole("heading", { name: "All Populations" })).toBeInTheDocument();
        await waitFor(() => expect(getCategory).toHaveBeenCalledTimes(3));
        await waitFor(() => expect(useCodexStore.getState().prefetching).toBe(false));
        expect(getCategory.mock.calls.map(([category]) => category)).toEqual([
            "populations",
            "statuses",
            "tech",
        ]);
    });

    it("keeps the landing summary-only and lazily loads the full Codex for global search", async () => {
        const user = userEvent.setup();
        const getCategory = vi.spyOn(apiClient, "getCodexCategory");
        const getFullCodex = vi.spyOn(apiClient, "getCodex").mockResolvedValue([AMETRINE_ENTRY]);

        renderCodex("/codex");

        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(getFullCodex).not.toHaveBeenCalled();
        expect(getCategory).not.toHaveBeenCalled();

        await user.type(screen.getByRole("combobox", { name: /search the encyclopedia/i }), "ametrine");

        await waitFor(() => expect(getFullCodex).toHaveBeenCalledTimes(1));
        expect(await screen.findByRole("button", { name: /ametrine/i })).toBeInTheDocument();
    });

    it("reuses an already-loaded category without refetching", async () => {
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockResolvedValue([AMETRINE_ENTRY]);
        await useCodexStore.getState().loadCategory("populations");

        renderCodex("/codex?category=populations&entry=Population_Minor_Ametrine");

        expect(await screen.findByRole("heading", { name: "Ametrine" })).toBeInTheDocument();
        expect(getCategory).toHaveBeenCalledTimes(1);
    });
});
