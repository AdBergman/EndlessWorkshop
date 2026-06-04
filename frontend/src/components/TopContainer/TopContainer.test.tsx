import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopContainer from "./TopContainer";
import { preloadRoutePath } from "@/routeLoaders";

vi.mock("@/routeLoaders", () => ({
    preloadRoutePath: vi.fn(),
}));

const mockedPreloadRoutePath = vi.mocked(preloadRoutePath);

describe("TopContainer", () => {
    beforeEach(() => {
        mockedPreloadRoutePath.mockClear();
    });

    it("preloads route chunks on navigation intent", () => {
        render(
            <MemoryRouter initialEntries={["/tech"]}>
                <TopContainer />
            </MemoryRouter>
        );

        const summaryLink = screen.getByRole("link", { name: "Summary" });

        fireEvent.pointerEnter(summaryLink);
        fireEvent.focus(summaryLink);

        expect(mockedPreloadRoutePath).toHaveBeenCalledWith("/summary");
        expect(mockedPreloadRoutePath).toHaveBeenCalledTimes(2);
    });
});
