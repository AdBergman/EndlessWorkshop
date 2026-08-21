import { StrictMode } from "react";
import { apiClient } from "@/api/apiClient";
import {
    cleanupCodexPageStores,
    resetCodexPageTestState,
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

    it("hydrates a cold hidden Modifier direct route without loading the full Codex", async () => {
        const categoryRequest = deferred<CodexEntry[]>();
        const modifierEntry: CodexEntry = {
            exportKind: "bonuses",
            entryKey: "ActionCostModifier_RaiseRuin_Decrease_00",
            displayName: "Raise Ruin Cost Reduction",
            category: "Cost Modifier",
            kind: "Cost Modifier",
            descriptionLines: ["Reduces the action cost."],
            referenceKeys: [],
        };
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "modifiers", count: 1 },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockReturnValue(categoryRequest.promise);
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00",
            true
        );

        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00"
        );
        await waitFor(() => expect(getCategory).toHaveBeenCalledTimes(1));
        expect(getCategory).toHaveBeenCalledWith("modifiers");
        expect(getFullCodex).not.toHaveBeenCalled();

        categoryRequest.resolve([modifierEntry]);

        expect(await screen.findByRole("heading", { name: "Raise Ruin Cost Reduction" }))
            .toBeInTheDocument();
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00"
        );
        const categoryToolbar = screen.getByRole("toolbar", { name: /filter codex by category/i });
        expect(within(categoryToolbar).queryByRole("button", { name: /modifiers/i }))
            .not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /all modifiers overview/i }))
            .not.toBeInTheDocument();
        expect(useCodexStore.getState().fullLoaded).toBe(false);
    });

    it("preserves an invalid hidden direct route until category absence is proven", async () => {
        const categoryRequest = deferred<CodexEntry[]>();
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "modifiers", count: 1 },
        ]);
        vi.spyOn(apiClient, "getCodexCategory").mockReturnValue(categoryRequest.promise);

        renderCodex("/codex?category=modifiers&entry=ActionCostModifier_Missing");

        await screen.findByRole("heading", { name: "Loading Modifiers" });
        expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=modifiers&entry=ActionCostModifier_Missing"
        );

        categoryRequest.resolve([]);

        await waitFor(() => {
            expect(screen.getByTestId("location-probe")).toHaveTextContent(/^\/codex$/);
        });
        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
    });

    it("does not turn a hidden Modifier category-only URL into a browse archive", async () => {
        const modifierEntry: CodexEntry = {
            exportKind: "bonuses",
            entryKey: "ActionCostModifier_RaiseRuin_Decrease_00",
            displayName: "Raise Ruin Cost Reduction",
            category: "Cost Modifier",
            kind: "Cost Modifier",
            descriptionLines: ["Reduces the action cost."],
            referenceKeys: [],
        };
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "modifiers", count: 1 },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockResolvedValue([modifierEntry]);
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex("/codex?category=modifiers");

        await waitFor(() => expect(screen.getByTestId("location-probe")).toHaveTextContent(/^\/codex$/));
        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(getCategory).toHaveBeenCalledWith("modifiers");
        expect(getFullCodex).not.toHaveBeenCalled();
    });

    it("canonicalizes an unambiguous legacy entry-only URL through identity before category hydration", async () => {
        const modifierEntry: CodexEntry = {
            exportKind: "bonuses",
            entryKey: "ActionCostModifier_RaiseRuin_Decrease_00",
            displayName: "Raise Ruin Cost Reduction",
            category: "Cost Modifier",
            kind: "Cost Modifier",
            descriptionLines: ["Reduces the action cost."],
            referenceKeys: [],
        };
        vi.mocked(apiClient.getCodexIdentities).mockResolvedValue([
            {
                entryKey: modifierEntry.entryKey,
                displayName: modifierEntry.displayName,
                routeKind: "modifiers",
            },
        ]);
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "modifiers", count: 1 },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockResolvedValue([modifierEntry]);
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex("/codex?entry=ActionCostModifier_RaiseRuin_Decrease_00");

        await waitFor(() => expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00"
        ));
        expect(await screen.findByRole("heading", { name: "Raise Ruin Cost Reduction" }))
            .toBeInTheDocument();
        expect(getCategory).toHaveBeenCalledWith("modifiers");
        expect(getFullCodex).not.toHaveBeenCalled();
    });

    it("does not guess a canonical category for an ambiguous legacy entry key", async () => {
        vi.mocked(apiClient.getCodexIdentities).mockResolvedValue([
            { entryKey: "Shared_Key", displayName: "Shared Modifier", routeKind: "modifiers" },
            { entryKey: "Shared_Key", displayName: "Shared Status", routeKind: "statuses" },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory");
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex("/codex?entry=Shared_Key");

        await waitFor(() => expect(screen.getByTestId("location-probe")).toHaveTextContent(/^\/codex$/));
        expect(await screen.findByRole("heading", { name: "Encyclopedia Index" })).toBeInTheDocument();
        expect(getCategory).not.toHaveBeenCalled();
        expect(getFullCodex).not.toHaveBeenCalled();
    });

    it("hydrates a hidden cross-category target on preview and navigates canonically", async () => {
        const targetRequest = deferred<CodexEntry[]>();
        const sourceEntry: CodexEntry = {
            exportKind: "abilities",
            entryKey: "Ability_RaiseRuin",
            displayName: "Raise Ruin",
            descriptionLines: ["Raises a ruin."],
            referenceKeys: ["ActionCostModifier_RaiseRuin_Decrease_00"],
        };
        const targetEntry: CodexEntry = {
            exportKind: "bonuses",
            entryKey: "ActionCostModifier_RaiseRuin_Decrease_00",
            displayName: "Raise Ruin Cost Reduction",
            category: "Cost Modifier",
            kind: "Cost Modifier",
            descriptionLines: ["Reduces the action cost."],
            referenceKeys: [],
        };
        vi.mocked(apiClient.getCodexSummary).mockResolvedValue([
            { exportKind: "abilities", count: 1 },
            { exportKind: "modifiers", count: 1 },
        ]);
        vi.mocked(apiClient.getCodexIdentities).mockResolvedValue([
            { entryKey: sourceEntry.entryKey, displayName: sourceEntry.displayName, routeKind: "abilities" },
            { entryKey: targetEntry.entryKey, displayName: targetEntry.displayName, routeKind: "modifiers" },
        ]);
        const getCategory = vi.spyOn(apiClient, "getCodexCategory").mockImplementation((category) => {
            if (category === "abilities") return Promise.resolve([sourceEntry]);
            if (category === "modifiers") return targetRequest.promise;
            return Promise.resolve([]);
        });
        const getFullCodex = vi.spyOn(apiClient, "getCodex");

        renderCodex("/codex?category=abilities&entry=Ability_RaiseRuin");

        expect(await screen.findByRole("heading", { name: "Raise Ruin" })).toBeInTheDocument();
        const relationship = await screen.findByRole("button", { name: /Raise Ruin Cost Reduction Modifiers/ });
        expect(useCodexStore.getState().entriesByKindKey.modifiers).toBeUndefined();

        fireEvent.focus(relationship);
        await waitFor(() => expect(getCategory).toHaveBeenCalledWith("modifiers"));
        expect(getFullCodex).not.toHaveBeenCalled();

        targetRequest.resolve([targetEntry]);
        expect(await screen.findByText("Reduces the action cost.")).toBeInTheDocument();

        fireEvent.click(relationship);
        await waitFor(() => expect(screen.getByTestId("location-probe")).toHaveTextContent(
            "/codex?category=modifiers&entry=ActionCostModifier_RaiseRuin_Decrease_00"
        ));
        expect(await screen.findByRole("heading", { name: "Raise Ruin Cost Reduction" }))
            .toBeInTheDocument();
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
