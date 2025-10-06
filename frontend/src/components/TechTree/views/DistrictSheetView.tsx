import React from 'react';
import { District } from '@/types/dataTypes';

interface DistrictSheetViewProps {
    districts: (District & { era: number })[];
}

const DistrictSheetView: React.FC<DistrictSheetViewProps> = ({ districts }) => {
    if (!districts || districts.length === 0) {
        return <div className="empty-sheet-message">No districts unlocked by current tech selections.</div>;
    }

    const renderArrayCell = (items: string[] | undefined | null) => {
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
                    .filter(dist => dist && dist.name)
                    .map((district) => (
                    <tr key={district.name}>
                        <td>{district.name}</td>
                        <td>{district.era}</td>
                        {/* This now correctly renders the 'effect' string or a fallback */}
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
