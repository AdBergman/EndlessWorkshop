import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CodexPage from "./CodexPage";
import { useCodexStore } from "@/stores/codexStore";

describe("CodexPage", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useCodexStore.setState({
            entries: [
                {
                    exportKind: "districts",
                    entryKey: "District_MarketSquare",
                    displayName: "[DustColored] Market Square",
                    descriptionLines: ["Centralized trade district."],
                    referenceKeys: ["Improvement_AuricCoral"],
                },
                {
                    exportKind: "districts",
                    entryKey: "District_BloomHarbor",
                    displayName: "",
                    descriptionLines: ["Supports blossom logistics."],
                    referenceKeys: [],
                },
                {
                    exportKind: "improvements",
                    entryKey: "Improvement_AuricCoral",
                    displayName: "[LuxuryResource01] Auric Coral",
                    descriptionLines: ["Rare sea harvest."],
                    referenceKeys: [],
                },
            ],
            entriesByKey: {
                District_MarketSquare: {
                    exportKind: "districts",
                    entryKey: "District_MarketSquare",
                    displayName: "[DustColored] Market Square",
                    descriptionLines: ["Centralized trade district."],
                    referenceKeys: ["Improvement_AuricCoral"],
                },
                District_BloomHarbor: {
                    exportKind: "districts",
                    entryKey: "District_BloomHarbor",
                    displayName: "",
                    descriptionLines: ["Supports blossom logistics."],
                    referenceKeys: [],
                },
                Improvement_AuricCoral: {
                    exportKind: "improvements",
                    entryKey: "Improvement_AuricCoral",
                    displayName: "[LuxuryResource01] Auric Coral",
                    descriptionLines: ["Rare sea harvest."],
                    referenceKeys: [],
                },
            },
            entriesByKind: {
                districts: [
                    {
                        exportKind: "districts",
                        entryKey: "District_MarketSquare",
                        displayName: "[DustColored] Market Square",
                        descriptionLines: ["Centralized trade district."],
                        referenceKeys: ["Improvement_AuricCoral"],
                    },
                    {
                        exportKind: "districts",
                        entryKey: "District_BloomHarbor",
                        displayName: "",
                        descriptionLines: ["Supports blossom logistics."],
                        referenceKeys: [],
                    },
                ],
                improvements: [
                    {
                        exportKind: "improvements",
                        entryKey: "Improvement_AuricCoral",
                        displayName: "[LuxuryResource01] Auric Coral",
                        descriptionLines: ["Rare sea harvest."],
                        referenceKeys: [],
                    },
                ],
            },
            loading: false,
            error: null,
        });
    });

    afterEach(() => {
        useCodexStore.getState().reset();
    });

    it("shows a synthetic kind summary row and summary detail when filtering by kind", async () => {
        const user = userEvent.setup();

        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/codex"]}>
                    <Routes>
                        <Route path="/codex" element={<CodexPage />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        await act(async () => {
            await user.click(screen.getByRole("button", { name: /districts 2/i }));
        });

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "All Districts" })).toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /all districts/i })).toBeInTheDocument();
        const summaryList = screen.getByLabelText("Districts overview");
        expect(within(summaryList).getByRole("button", { name: /market square/i })).toBeInTheDocument();
        expect(within(summaryList).getByRole("button", { name: /bloom harbor/i })).toBeInTheDocument();
        expect(screen.queryByText("District_BloomHarbor")).not.toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
    });

    it("renders tokenized labels in detail panes and related links without leaking bracket text", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/codex"]}>
                    <Routes>
                        <Route path="/codex" element={<CodexPage />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(screen.getByRole("heading", { name: "Market Square" })).toBeInTheDocument();
        const relatedSection = screen.getByLabelText(/selected codex entry/i);
        expect(within(relatedSection).getByRole("button", { name: /auric coral improvements/i })).toBeInTheDocument();
        expect(screen.queryByText("[LuxuryResource01]")).not.toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
    });
});
