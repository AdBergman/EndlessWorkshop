import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
    useQuestExplorerLoreScrollUrl,
    type QuestExplorerLoreScrollUrlState,
} from "@/features/quests/useQuestExplorerLoreScrollUrl";
import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";

function LoreScrollUrlHarness({
    mode = "lore",
    selectedEntryKey = "Quest_Stream_A",
    segmentRailEntryKeys = ["Quest_Stream_A", "Quest_Stream_B"],
}: {
    mode?: QuestExplorerMode;
    selectedEntryKey?: string;
    segmentRailEntryKeys?: string[];
}) {
    const location = useLocation();
    const scrollState: QuestExplorerLoreScrollUrlState = useQuestExplorerLoreScrollUrl({
        mode,
        selectedEntryKey,
        selectedProgressionKey: "stream-context",
        segmentRailEntryKeys,
    });

    return (
        <>
            <output data-testid="selected-entry">{selectedEntryKey}</output>
            <output data-testid="active-scroll">{scrollState.scrollActiveRailEntryKey ?? "none"}</output>
            <output data-testid="route-location">{`${location.pathname}${location.search}`}</output>
            <button type="button" onClick={() => scrollState.applyPassiveScroll("Quest_Stream_B")}>
                Scroll B
            </button>
        </>
    );
}

function renderLoreScrollUrlHarness(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/quests/*" element={<LoreScrollUrlHarness />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("useQuestExplorerLoreScrollUrl", () => {
    it("hydrates a direct loreEntry read position without changing the canonical selected entry", async () => {
        renderLoreScrollUrlHarness("/quests/Quest_Stream_A?mode=lore&loreEntry=Quest_Stream_B");

        await waitFor(() => {
            expect(screen.getByTestId("active-scroll")).toHaveTextContent("Quest_Stream_B");
        });
        expect(screen.getByTestId("selected-entry")).toHaveTextContent("Quest_Stream_A");
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A?mode=lore&loreEntry=Quest_Stream_B");
    });

    it("applies passive scroll with replace-style URL state", async () => {
        const user = userEvent.setup();
        renderLoreScrollUrlHarness("/quests/Quest_Stream_A?mode=lore");

        await user.click(screen.getByRole("button", { name: "Scroll B" }));

        await waitFor(() => {
            expect(screen.getByTestId("active-scroll")).toHaveTextContent("Quest_Stream_B");
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });
        expect(screen.getByTestId("selected-entry")).toHaveTextContent("Quest_Stream_A");
    });
});
