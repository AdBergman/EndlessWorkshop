import { render, screen } from '@testing-library/react';
import ImprovementTooltip from '../components/Tooltips/ImprovementTooltip';
import { Improvement } from '@/types/dataTypes';

// Helper function to create type-safe mock data
const createMockImprovement = (
    data: Improvement & { coords: { xPct: number; yPct: number } }
) => data;

describe('ImprovementTooltip', () => {
    // This mock now correctly matches the Improvement type.
    const baseImprovement: Omit<Improvement, 'displayName' | 'effects' | 'unique'> = {
        cost: [], // Strategic resource costs
    };

    it('renders correctly with all data, including effects', () => {
        // Use the helper to ensure the object has the correct, specific type
        const mockData = createMockImprovement({
            ...baseImprovement,
            displayName: 'Test Shrine',
            unique: 'City',
            effects: ['+1 Faith', '+1 Culture'],
            coords: { xPct: 50, yPct: 50 },
        });

        render(<ImprovementTooltip hoveredImprovement={mockData} />);

        // Since the tooltip is in a portal, screen queries search the whole document
        expect(screen.getByText('Test Shrine')).toBeInTheDocument();
        expect(screen.getByText('City')).toBeInTheDocument();
        expect(screen.getByText('Effects:')).toBeInTheDocument();
        expect(screen.getByText('+1 Faith')).toBeInTheDocument();
        expect(screen.getByText('+1 Culture')).toBeInTheDocument();
    });

    it('renders correctly without an effects section when effects are empty', () => {
        const mockData = createMockImprovement({
            ...baseImprovement,
            displayName: 'Basic Farm',
            unique: 'District',
            effects: [],
            coords: { xPct: 50, yPct: 50 },
        });

        render(<ImprovementTooltip hoveredImprovement={mockData} />);

        expect(screen.getByText('Basic Farm')).toBeInTheDocument();
        expect(screen.getByText('District')).toBeInTheDocument();

        // Use queryBy* to assert that an element is NOT present
        expect(screen.queryByText('Effects:')).not.toBeInTheDocument();
    });
});