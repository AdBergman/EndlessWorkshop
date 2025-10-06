import React from 'react';
import { District } from '@/types/dataTypes';

// The component now receives districts that are enhanced with the era of the tech that unlocked them.
interface DistrictSheetViewProps {
    districts: (District & { era: number })[];
}

const DistrictSheetView: React.FC<DistrictSheetViewProps> = ({ districts }) => {
    // Handle the case where no districts are unlocked by the current selection.
    if (!districts || districts.length === 0) {
        return <div className="empty-sheet-message">No districts unlocked by current tech selections.</div>;
    }

    // Helper to render array-based cells cleanly
    const renderArrayCell = (items: string[] | undefined) => {
        if (!items || items.length === 0) {
            return <span style={{ color: '#888' }}>--</span>;
        }
        return items.join('\n');
    };

    return (
        <div className="spreadsheet-container">
            <table className="spreadsheet-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Era</th>
                    <th>Effect</th>
                    <th>Info</th>
                    <th>Tile Bonus</th>
                    <th>Adjacency Bonus</th>
                    <th>Placement Prerequisite</th>
                </tr>
                </thead>
                <tbody>
                {districts
                    .filter(dist => dist && dist.name) // Defensively filter out invalid data
                    .map((district) => (
                    <tr key={district.name}>
                        <td>{district.name}</td>
                        <td>{district.era}</td>
                        {/* The 'effect' field is a single string, so it's rendered directly. */}
                        <td>{district.effect ?? <span style={{ color: '#888' }}>--</span>}</td>
                        <td style={{ whiteSpace: 'pre-line' }}>{renderArrayCell(district.info)}</td>
                        <td style={{ whiteSpace: 'pre-line' }}>{renderArrayCell(district.tileBonus)}</td>
                        <td style={{ whiteSpace: 'pre-line' }}>{renderArrayCell(district.adjacencyBonus)}</td>
                        <td>{district.placementPrereq ?? 'None'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DistrictSheetView;
