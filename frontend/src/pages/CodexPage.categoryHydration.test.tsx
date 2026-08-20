import { StrictMode } from "react";
import { apiClient } from "@/api/apiClient";
import {
    cleanupCodexPageStores,
    resetCodexPageTestState,
} from "@/pages/testUtils/codexPageHarness";
import { LocationProbe } from "@/pages/testUtils/codexPageTestUtils";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry } from "@/types/dataTypes";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
