import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import HoverableItem from '@/components/TechTree/views/HoverableItem';

// Mock tooltip components
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
        const itemName = "Traveler's Shrine";
        render(<HoverableItem type="Improvement" name={itemName} prefix="" />);

        await user.hover(screen.getByText(itemName));

        const tooltip = await screen.findByTestId('imp-tooltip');
        expect(tooltip).toHaveTextContent(itemName);
    });

    it('renders district tooltip on hover', async () => {
        const user = userEvent.setup();
        const itemName = 'Communal Habitations';
        render(<HoverableItem type="District" name={itemName} prefix="" />);

        await user.hover(screen.getByText(itemName));

        const tooltip = await screen.findByTestId('dist-tooltip');
        expect(tooltip).toHaveTextContent(itemName);
    });
});
