import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HoverableItem from '@/components/Tech/views/HoverableItem';

// Mock tooltips
vi.mock('@/components/Tooltips/ImprovementTooltip', () => ({
    default: ({ hoveredImprovement }: any) => (
        <div data-testid="imp-tooltip">{hoveredImprovement.name}</div>
    ),
}));

vi.mock('@/components/Tooltips/DistrictTooltip', () => ({
    default: ({ hoveredDistrict }: any) => (
        <div data-testid="dist-tooltip">{hoveredDistrict.name}</div>
    ),
}));

describe('HoverableItem', () => {
    it('renders improvement tooltip on hover', async () => {
        const user = userEvent.setup();
        const name = "Traveler's Shrine";
        render(<HoverableItem type="Improvement" name={name} prefix="💎 " />);

        const hoverTarget = screen.getByText(name, { selector: 'span' });
        await user.hover(hoverTarget);

        const tooltip = await screen.findByTestId('imp-tooltip');
        expect(tooltip).toHaveTextContent(name);

        await user.unhover(hoverTarget);
        expect(screen.queryByTestId('imp-tooltip')).toBeNull();
    });

    it('renders district tooltip on hover', async () => {
        const user = userEvent.setup();
        const name = 'Communal Habitations';
        render(<HoverableItem type="District" name={name} prefix="🏘️ " />);

        const hoverTarget = screen.getByText(name, { selector: 'span' });
        await user.hover(hoverTarget);

        const tooltip = await screen.findByTestId('dist-tooltip');
        expect(tooltip).toHaveTextContent(name);

        await user.unhover(hoverTarget);
        expect(screen.queryByTestId('dist-tooltip')).toBeNull();
    });

    it('renders without crashing', () => {
        render(<HoverableItem type="Improvement" name="Traveler's Shrine" prefix="💎 " />);
        render(<HoverableItem type="District" name="Communal Habitations" prefix="🏘️ " />);
    });

    it('renders the prefix', () => {
        const prefix = '💎 ';
        const name = "Traveler's Shrine";
        render(<HoverableItem type="Improvement" name={name} prefix={prefix} />);

        // Get the span and check its parent for the prefix
        const span = screen.getByText(name, { selector: 'span' });
        expect(span.parentElement).toHaveTextContent(/^💎 /);
    });

    it('does not show tooltip before hover', () => {
        render(<HoverableItem type="Improvement" name="Traveler's Shrine" prefix="💎 " />);
        expect(screen.queryByTestId('imp-tooltip')).toBeNull();
    });
});
