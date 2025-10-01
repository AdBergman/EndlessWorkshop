import { render, screen } from '@testing-library/react';
import DistrictTooltip from '../components/Tooltips/DistrictTooltip';
import { District } from '../types/dataTypes';

// Helper function to create type-safe mock data, mirroring the pattern from other tests
const createMockDistrict = (
    data: District & { coords: { xPct: number; yPct: number } }
) => data;

describe('DistrictTooltip', () => {
    it('renders correctly with all optional data present', () => {
        const mockData = createMockDistrict({
            name: 'Test District',
            info: ['A special district.'],
            effect: '+5 Gold',
            tileBonus: ['+1 Food on Plains'],
            adjacencyBonus: ['+1 Gold for each adjacent Market'],
            placementPrereq: 'Must be placed on a hill',
            coords: { xPct: 50, yPct: 50 },
        });

        render(<DistrictTooltip hoveredDistrict={mockData} />);

        // Assert that all provided data is visible
        expect(screen.getByText('Test District')).toBeInTheDocument();
        expect(screen.getByText('A special district.')).toBeInTheDocument();
        expect(screen.getByText('Effect:')).toBeInTheDocument();
        expect(screen.getByText('+5 Gold')).toBeInTheDocument();
        expect(screen.getByText('Tile Bonus:')).toBeInTheDocument();
        expect(screen.getByText('+1 Food on Plains')).toBeInTheDocument();
        expect(screen.getByText('Adjacency Bonus:')).toBeInTheDocument();
        expect(
            screen.getByText('+1 Gold for each adjacent Market')
        ).toBeInTheDocument();
        expect(screen.getByText('Placement:')).toBeInTheDocument();
        expect(
            screen.getByText('Must be placed on a hill')
        ).toBeInTheDocument();
    });

    it('renders correctly with only required and some optional data', () => {
        const mockData = createMockDistrict({
            name: 'Simple Farm',
            effect: '+2 Food',
            coords: { xPct: 50, yPct: 50 },
        });

        render(<DistrictTooltip hoveredDistrict={mockData} />);

        // Assert that the provided data is visible
        expect(screen.getByText('Simple Farm')).toBeInTheDocument();
        expect(screen.getByText('Effect:')).toBeInTheDocument();
        expect(screen.getByText('+2 Food')).toBeInTheDocument();

        // Assert that sections for missing data are NOT rendered
        // `queryBy*` is used to check for absence without throwing an error
        expect(screen.queryByText('Tile Bonus:')).not.toBeInTheDocument();
        expect(screen.queryByText('Adjacency Bonus:')).not.toBeInTheDocument();
        expect(screen.queryByText('Placement:')).not.toBeInTheDocument();
    });
});