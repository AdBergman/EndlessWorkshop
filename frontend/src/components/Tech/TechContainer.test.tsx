import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TechContainer from "@/components/Tech/TechContainer";
import { useTechStore } from "@/stores/techStore";
import { type Tech } from "@/types/dataTypes";

const tech = (overrides: Partial<Tech>): Tech => ({
    techKey: "Tech_Workshop",
    name: "Workshop",
    era: 1,
    type: "Industry",
    unlocks: [],
    descriptionLines: [],
    prereq: null,
    factions: ["KIN"],
    excludes: null,
    coords: { xPct: 0, yPct: 0 },
    ...overrides,
});

describe("TechContainer passive tech reads", () => {
    beforeEach(() => {
        useTechStore.getState().reset();
        useTechStore.getState().replaceTechs([
            tech({
                techKey: "Tech_Store_Only",
                name: "Store Only",
            }),
        ]);
    });

    it("renders SEO hidden tech labels from techStore without using context techs", () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/tech"]}>
                <TechContainer />
            </MemoryRouter>
        );

        const seoText = container.querySelector(".seo-hidden[aria-hidden='true']")?.textContent ?? "";

        expect(seoText).toContain("Store Only.");
    });
});
