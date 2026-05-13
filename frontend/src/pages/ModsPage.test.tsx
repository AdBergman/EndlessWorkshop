import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import TopContainer from "@/components/TopContainer/TopContainer";
import ModsPage from "./ModsPage";

vi.mock("@/data/modsCatalog", async () => {
    const actual = await vi.importActual<typeof import("@/data/modsCatalog")>("@/data/modsCatalog");

    return {
        ...actual,
        includedMods: actual.includedMods.map((mod) =>
            mod.name === "WorldGen"
                ? {
                      ...mod,
                      screenshots: [
                          {
                              src: "/test-assets/worldgen-screenshot.webp",
                              alt: "WorldGen map screenshot",
                              caption: "World generation adjustments",
                          },
                      ],
                  }
                : mod.name === "BulkTrade"
                  ? {
                        ...mod,
                        screenshots: [],
                    }
                : mod
        ),
    };
});

function LocationProbe() {
    const location = useLocation();

    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
}

describe("ModsPage", () => {
    it("renders a practical mods index with row sections and installation guidance", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/mods"]}>
                <Routes>
                    <Route path="/mods" element={<ModsPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: "Mods" })).toBeInTheDocument();
        expect(screen.queryByText("Small open-source Endless Legend 2 mods and tools.")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Essentials Mod Pack" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "EL2 Essentials Pack" })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Support Tools" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Installation" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Get BepInEx" })).toHaveAttribute(
            "href",
            "https://github.com/BepInEx/BepInEx/releases"
        );

        const includedMods = screen.getByLabelText("Included mods");
        expect(within(includedMods).getByRole("heading", { name: "WorldGen" })).toBeInTheDocument();
        expect(
            within(includedMods).getByText(
                "More varied map generation, slightly larger worlds, and persistent water after the final monsoon."
            )
        ).toBeInTheDocument();
        expect(within(includedMods).queryByRole("link", { name: "Download pack v1.0.0" })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Download Essentials Pack v1.0.0" })).toHaveAttribute(
            "href",
            "https://github.com/AdBergman/EL2Mods/releases/tag/essentials-pack-v1.0.0"
        );
        expect(screen.getByRole("link", { name: "Download Quest Recovery" })).toHaveAttribute(
            "href",
            "https://github.com/AdBergman/EL2Mods/releases/tag/v1.1.0"
        );
        expect(screen.getByRole("link", { name: "Download End Game Report" })).toHaveAttribute(
            "href",
            "https://github.com/AdBergman/EL2StatsMod/releases/tag/v1.1.0"
        );

        await user.click(screen.getByRole("button", { name: "Enlarge WorldGen screenshot" }));

        const lightbox = screen.getByRole("dialog", { name: "WorldGen screenshot" });

        expect(lightbox).toBeInTheDocument();
        expect(within(lightbox).getByRole("img", { name: "WorldGen map screenshot" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Close preview" })).toBeInTheDocument();
    });

    it("does not open a fake preview when a mod has no screenshot", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/mods"]}>
                <Routes>
                    <Route path="/mods" element={<ModsPage />} />
                </Routes>
            </MemoryRouter>
        );

        const includedMods = screen.getByLabelText("Included mods");
        const bulkTradeThumbTitle = within(includedMods).getByText("BulkTrade", { selector: ".mods-row-thumb strong" });

        await user.click(bulkTradeThumbTitle);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Close preview" })).not.toBeInTheDocument();
    });

    it("adds a working Mods nav entry in the top container", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/tech"]}>
                <LocationProbe />
                <TopContainer />
                <Routes>
                    <Route path="/tech" element={<div>Tech Page</div>} />
                    <Route path="/mods" element={<ModsPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId("location-probe")).toHaveTextContent("/tech");

        await user.click(screen.getByRole("link", { name: "Mods" }));

        expect(screen.getByTestId("location-probe")).toHaveTextContent("/mods");
        expect(screen.getByRole("heading", { name: "Essentials Mod Pack" })).toBeInTheDocument();
        expect(within(screen.getByLabelText("Included mods")).getByRole("heading", { name: "WorldGen" })).toBeInTheDocument();
    });
});
