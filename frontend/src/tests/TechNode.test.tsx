import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TechNode from '@/components/TechTree/TechNode';

describe('TechNode', () => {
    const mockOnClick = vi.fn();
    const mockOnHoverChange = vi.fn();

    const baseProps = {
        coords: { xPct: 50, yPct: 50 },
        selected: false,
        locked: false,
        onClick: mockOnClick,
        onHoverChange: mockOnHoverChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<TechNode {...baseProps} />);
        const node = screen.getByTestId('tech-node');
        expect(node).toBeInTheDocument();
    });

    it('calls onClick when clicked if not locked', async () => {
        const user = userEvent.setup();
        render(<TechNode {...baseProps} />);
        const node = screen.getByTestId('tech-node');

        await user.click(node);
        expect(mockOnClick).toHaveBeenCalled();
    });

    it('does not call onClick if locked', async () => {
        const user = userEvent.setup();
        render(<TechNode {...baseProps} locked={true} />);
        const node = screen.getByTestId('tech-node');

        await user.click(node);
        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('calls onHoverChange on hover and unhover', async () => {
        const user = userEvent.setup();
        render(<TechNode {...baseProps} />);
        const node = screen.getByTestId('tech-node');

        await user.hover(node);
        expect(mockOnHoverChange).toHaveBeenCalledWith(true);

        await user.unhover(node);
        expect(mockOnHoverChange).toHaveBeenCalledWith(false);
    });
});
