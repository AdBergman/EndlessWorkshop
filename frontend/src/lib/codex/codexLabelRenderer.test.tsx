import { render, screen } from "@testing-library/react";
import { renderCodexLabel } from "./codexLabelRenderer";

describe("codexLabelRenderer", () => {
    it("renders known display-name tokens without leaking bracket text", () => {
        render(<div>{renderCodexLabel("[DustColored] Auric Coral")}</div>);

        expect(screen.getByText("Auric Coral")).toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
        expect(screen.queryByRole("img", { name: "DustColored" })).not.toBeInTheDocument();
    });

    it("renders exact resource display-name tokens as decorative icons", () => {
        const { container } = render(<div>{renderCodexLabel("[LuxuryResource01] Auric Coral")}</div>);

        expect(screen.getByText("Auric Coral")).toBeInTheDocument();
        expect(screen.queryByText("LuxuryResource01")).not.toBeInTheDocument();
        expect(screen.queryByText("[LuxuryResource01]")).not.toBeInTheDocument();
        expect(container.querySelector('img[src="/svg/constructibles/UI_Resource_Luxury_Klak.svg"]'))
            .toBeInTheDocument();
    });
});
