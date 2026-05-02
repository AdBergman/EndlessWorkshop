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
                    displayName: "Market Square",
                    descriptionLines: ["Centralized trade district."],
                    referenceKeys: [],
                },
                {
                    exportKind: "districts",
                    entryKey: "District_BloomHarbor",
                    displayName: "",
                    descriptionLines: ["Supports blossom logistics."],
                    referenceKeys: [],
                },
            ],
            entriesByKey: {
                District_MarketSquare: {
                    exportKind: "districts",
                    entryKey: "District_MarketSquare",
                    displayName: "Market Square",
                    descriptionLines: ["Centralized trade district."],
                    referenceKeys: [],
                },
                District_BloomHarbor: {
                    exportKind: "districts",
                    entryKey: "District_BloomHarbor",
                    displayName: "",
                    descriptionLines: ["Supports blossom logistics."],
                    referenceKeys: [],
                },
            },
            entriesByKind: {
                districts: [
                    {
                        exportKind: "districts",
                        entryKey: "District_MarketSquare",
                        displayName: "Market Square",
                        descriptionLines: ["Centralized trade district."],
                        referenceKeys: [],
                    },
                    {
                        exportKind: "districts",
                        entryKey: "District_BloomHarbor",
                        displayName: "",
                        descriptionLines: ["Supports blossom logistics."],
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

        render(
            <MemoryRouter initialEntries={["/codex"]}>
                <Routes>
                    <Route path="/codex" element={<CodexPage />} />
                </Routes>
            </MemoryRouter>
        );

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
    });
});
