import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { payload } from "@/features/quests/testUtils/questExplorerPageFixtures";
import {
    mockedApiClient,
    renderPage,
} from "@/features/quests/testUtils/questExplorerPageTestUtils";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

function expectQuestShell(container: HTMLElement) {
    const page = container.querySelector(".questExplorer-page");
    const shell = container.querySelector(".questExplorer");
    const sidebar = container.querySelector(".questExplorer-sidebar");
    const detail = container.querySelector(".questExplorer-detail");

    expect(page).toBeInstanceOf(HTMLElement);
    expect(shell).toBeInstanceOf(HTMLElement);
    expect(sidebar).toBeInstanceOf(HTMLElement);
    expect(detail).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole("region", { name: "Quest Explorer" })).toBe(shell);
    expect(screen.getByRole("complementary")).toBe(sidebar);
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Quest Explorer mode" })).toBeInTheDocument();
}

describe("QuestExplorerPage visual guardrails", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("keeps the Lore route shell, rail, and chronicle surfaces intact", async () => {
        const { container } = renderPage("/quests/FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();

        expectQuestShell(container);
        expect(container.querySelector(".questExplorer-loreHeader")).toBeInstanceOf(HTMLElement);
        expect(container.querySelector(".questExplorer-content--lore")).toBeInstanceOf(HTMLElement);
        expect(container.querySelector(".questExplorer-loreChronicle")).toBeInstanceOf(HTMLElement);

        const rail = screen.getByRole("complementary");
        expect(within(rail).getByRole("button", { name: /Archive of the First Tide/ })).toHaveAttribute(
            "aria-current",
            "page"
        );

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(chronicle).toHaveClass("questExplorer-questPathChronicle", "questExplorer-loreChronicle");
        expect(screen.getByRole("button", { name: "Lore" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Strategy" })).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps the Strategy route shell and chapter-plan surfaces intact", async () => {
        const user = userEvent.setup();
        const { container } = renderPage("/quests/FactionQuest_Alias");

        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expectQuestShell(container);
        expect(container.querySelector(".questExplorer-strategyHeader")).toBeInstanceOf(HTMLElement);
        expect(container.querySelector(".questExplorer-content--strategy")).toBeInstanceOf(HTMLElement);
        expect(container.querySelector(".questExplorer-strategyChronicle")).toBeInstanceOf(HTMLElement);
        expect(container.querySelector(".questExplorer-strategyChapterPlan")).toBeInstanceOf(HTMLElement);

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(chronicle).toHaveClass("questExplorer-questPathChronicle", "questExplorer-strategyChronicle");
        expect(within(chronicle).getByRole("region", { name: "Chapter plan" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Strategy" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/FactionQuest_Alias?mode=strategy");
    });
});
