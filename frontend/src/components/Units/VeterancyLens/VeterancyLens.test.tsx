import { fireEvent, render, screen } from "@testing-library/react";
import { VeterancyLens } from "./VeterancyLens";

describe("VeterancyLens", () => {
    it("renders levels 0-5 with the selected level exposed as a radio", () => {
        render(<VeterancyLens selectedLevel={2} onChange={vi.fn()} />);

        expect(screen.getByText("Veterancy")).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Base stats" })).toHaveAttribute("aria-checked", "false");
        expect(screen.getByRole("radio", { name: "Veterancy level 2" })).toHaveAttribute("aria-checked", "true");
        expect(screen.getAllByRole("radio")).toHaveLength(6);
    });

    it("calls onChange when a level is selected", () => {
        const onChange = vi.fn();

        render(<VeterancyLens selectedLevel={0} onChange={onChange} />);

        fireEvent.click(screen.getByRole("radio", { name: "Veterancy level 5" }));

        expect(onChange).toHaveBeenCalledWith(5);
    });

    it("supports arrow, home, and end keyboard changes", () => {
        const onChange = vi.fn();

        render(<VeterancyLens selectedLevel={2} onChange={onChange} />);
        const group = screen.getByRole("radiogroup", { name: "Veterancy level" });

        fireEvent.keyDown(group, { key: "ArrowRight" });
        fireEvent.keyDown(group, { key: "ArrowLeft" });
        fireEvent.keyDown(group, { key: "Home" });
        fireEvent.keyDown(group, { key: "End" });

        expect(onChange).toHaveBeenNthCalledWith(1, 3);
        expect(onChange).toHaveBeenNthCalledWith(2, 1);
        expect(onChange).toHaveBeenNthCalledWith(3, 0);
        expect(onChange).toHaveBeenNthCalledWith(4, 5);
    });

    it("renders a disabled hero/base-only state without changing levels", () => {
        const onChange = vi.fn();

        render(<VeterancyLens selectedLevel={5} onChange={onChange} disabled />);

        expect(screen.getByText("Veterancy")).toBeInTheDocument();
        expect(screen.getByText("Heroes do not use unit veterancy.")).toBeInTheDocument();

        const levelFive = screen.getByRole("radio", { name: "Veterancy level 5" });
        expect(levelFive).toBeDisabled();
        expect(screen.getByRole("radio", { name: "Base stats" })).toHaveAttribute("aria-checked", "true");

        fireEvent.click(levelFive);
        fireEvent.keyDown(screen.getByRole("radiogroup", { name: "Veterancy level" }), { key: "End" });

        expect(onChange).not.toHaveBeenCalled();
    });

    it("can be hidden by consumers that need to remove the control entirely", () => {
        const { container } = render(<VeterancyLens selectedLevel={0} onChange={vi.fn()} hidden />);

        expect(container).toBeEmptyDOMElement();
    });
});
