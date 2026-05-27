import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import {
    useQuestExplorerLoreScrollUrl,
    type QuestExplorerLoreScrollUrlState,
} from "@/features/quests/useQuestExplorerLoreScrollUrl";
import type { QuestExplorerMode } from "@/features/quests/questExplorerMode";

function LoreScrollUrlHarness({
    mode = "lore",
    selectedEntryKey = "Quest_Stream_A",
    selectedProgressionKey = "stream-context",
    segmentRailEntryKeys = ["Quest_Stream_A", "Quest_Stream_B"],
}: {
    mode?: QuestExplorerMode;
    selectedEntryKey?: string;
    selectedProgressionKey?: string;
    segmentRailEntryKeys?: string[];
}) {
    const location = useLocation();
    const scrollState: QuestExplorerLoreScrollUrlState = useQuestExplorerLoreScrollUrl({
        mode,
        selectedEntryKey,
        selectedProgressionKey,
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
            <button type="button" onClick={() => scrollState.applyPassiveScroll(null)}>
                Clear Scroll
            </button>
        </>
    );
}

function LoreScrollNavigationHarness() {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedEntryKey, setSelectedEntryKey] = useState("Quest_Stream_A");
    const [selectedProgressionKey, setSelectedProgressionKey] = useState("stream-a-context");
    const scrollState = useQuestExplorerLoreScrollUrl({
        mode: "lore",
        selectedEntryKey,
        selectedProgressionKey,
        segmentRailEntryKeys: selectedEntryKey === "Quest_Stream_A"
            ? ["Quest_Stream_A", "Quest_Stream_B"]
            : ["Quest_Stream_C"],
    });

    return (
        <>
            <output data-testid="selected-entry">{selectedEntryKey}</output>
            <output data-testid="active-scroll">{scrollState.scrollActiveRailEntryKey ?? "none"}</output>
            <output data-testid="route-location">{`${location.pathname}${location.search}`}</output>
            <button type="button" onClick={() => scrollState.applyPassiveScroll("Quest_Stream_B")}>
                Scroll B
            </button>
            <button
                type="button"
                onClick={() => {
                    scrollState.applyPassiveScroll(null);
                    setSelectedEntryKey("Quest_Stream_C");
                    setSelectedProgressionKey("stream-c-context");
                    navigate("/quests/Quest_Stream_C?mode=lore");
                }}
            >
                Navigate C
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

    it("does not restore stale passive scroll when canonical navigation changes chapter context", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/quests/Quest_Stream_A?mode=lore"]}>
                <Routes>
                    <Route path="/quests/*" element={<LoreScrollNavigationHarness />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: "Scroll B" }));
        await waitFor(() => {
            expect(screen.getByTestId("active-scroll")).toHaveTextContent("Quest_Stream_B");
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });

        await user.click(screen.getByRole("button", { name: "Navigate C" }));

        await waitFor(() => {
            expect(screen.getByTestId("selected-entry")).toHaveTextContent("Quest_Stream_C");
            expect(screen.getByTestId("active-scroll")).toHaveTextContent("none");
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_C?mode=lore");
        });
    });
});
