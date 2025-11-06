import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EraNavigationButton from '@/components/Tech/EraNavigationButton';

describe('EraNavigationButton', () => {
    const mockOnClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders for \'previous\' direction and has correct class', () => {
        render(<EraNavigationButton direction="previous" onClick={mockOnClick} />);
        const button = screen.getByTestId('era-nav-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('previous');
    });

    it('renders for \'next\' direction and has correct class', () => {
        render(<EraNavigationButton direction="next" onClick={mockOnClick} />);
        const button = screen.getByTestId('era-nav-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('next');
    });

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup();
        render(<EraNavigationButton direction="next" onClick={mockOnClick} />);
        const button = screen.getByTestId('era-nav-button');

        await user.click(button);
        expect(mockOnClick).toHaveBeenCalled();
    });
});
