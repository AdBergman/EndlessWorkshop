import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BaseTooltip from "./BaseTooltip";

function setViewport(width: number) {
    Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
    });
    Object.defineProperty(window, "scrollX", {
        configurable: true,
        value: 0,
    });
}

describe("BaseTooltip pixel placement", () => {
    it("anchors left-placed pixel tooltips by their right edge", () => {
        setViewport(900);

        render(
            <BaseTooltip coords={{ x: 520, y: 80, mode: "pixel", placement: "left" }}>
                <div>Tooltip body</div>
            </BaseTooltip>
        );

        const tooltip = screen.getByText("Tooltip body").closest(".base-tooltip");
        expect(tooltip).toHaveStyle({
            position: "absolute",
            right: "380px",
            transform: "translateY(-50%)",
        });
        expect(tooltip).not.toHaveStyle({ left: "520px" });
    });
});
