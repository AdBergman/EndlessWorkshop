import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import AdminImportPage from "./AdminImportPage";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getCodex: vi.fn(),
        regenerateSeoPagesAdmin: vi.fn(),
    },
}));

const mockedApiClient = vi.mocked(apiClient);

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
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                status: 204,
            })
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("downloads the codex diagnostics report from the visible dev/admin action", async () => {
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
});
