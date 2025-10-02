import React from 'react';
import { Improvement } from '@/types/dataTypes';

interface ImprovementSheetViewProps {
    improvements: Improvement[];
}

const ImprovementSheetView: React.FC<ImprovementSheetViewProps> = ({ improvements }) => {
    if (!improvements || improvements.length === 0) {
        return <div className="empty-sheet-message">No improvements unlocked by current tech selections.</div>;
    }

    return (
        <div className="spreadsheet-container">
            <table className="spreadsheet-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Effects</th>
                    <th>Unique</th>
                    <th>Cost</th>
                </tr>
                </thead>
                <tbody>
                {improvements
                    .filter(imp => imp && imp.name) // Defensively filter items without a name to prevent key errors
                    .map((imp) => (
                    <tr key={imp.name}>
                        <td>{imp.name}</td>
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {imp.effects && imp.effects.length > 0
                                ? imp.effects.join('\n')
                                : <span style={{ color: '#888' }}>-- No effects data --</span>}
                        </td>
                        <td>{imp.unique}</td>
                        <td>
                            {/* With consistent data, we can now safely join the array */}
                            {imp.cost && imp.cost.length > 0
                                ? imp.cost.join(', ')
                                : <span style={{ color: '#888' }}>-- No cost data --</span>}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImprovementSheetView;
