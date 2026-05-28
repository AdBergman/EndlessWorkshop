import { describe, expect, it } from "vitest";
import { getHoverCoordsForElement } from "./hoverHelpers";

function elementWithRect(rect: Partial<DOMRect>): HTMLElement {
    const element = document.createElement("span");
    element.getBoundingClientRect = () => ({
        bottom: rect.bottom ?? 0,
        height: rect.height ?? 0,
        left: rect.left ?? 0,
        right: rect.right ?? 0,
        top: rect.top ?? 0,
        width: rect.width ?? 0,
        x: rect.x ?? rect.left ?? 0,
        y: rect.y ?? rect.top ?? 0,
        toJSON: () => ({}),
    } as DOMRect);
    return element;
}

function setViewport(width: number) {
    Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
    });
    Object.defineProperty(window, "scrollX", {
        configurable: true,
        value: 0,
    });
    Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 0,
    });
}

describe("tooltip hover coordinate placement", () => {
    it("places pixel tooltips to the right when there is room", () => {
        setViewport(1200);
        const element = elementWithRect({ left: 180, right: 240, top: 40 });

        expect(getHoverCoordsForElement(element)).toEqual({
            x: 250,
            y: 40,
            mode: "pixel",
            placement: "right",
        });
    });

    it("flips pixel tooltips left near the viewport right edge", () => {
        setViewport(900);
        const element = elementWithRect({ left: 520, right: 760, top: 72 });

        expect(getHoverCoordsForElement(element)).toEqual({
            x: 510,
            y: 72,
            mode: "pixel",
            placement: "left",
        });
    });
});
