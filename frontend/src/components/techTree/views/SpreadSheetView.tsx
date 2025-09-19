import React from "react";
import { Tech } from '@dataTypes/techTypes';
import "./SpreadSheetView.css";

interface SpreadSheetViewProps {
    techs: Tech[];
}

const SpreadSheetView: React.FC<SpreadSheetViewProps> = ({ techs }) => {
    if (!techs || techs.length === 0) return null;

    return (
        <div className="spreadsheet-container">
            <table className="spreadsheet-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Era</th>
                    <th>Type</th>
                    <th>Unlocks</th>
                    <th>Effects</th>
                </tr>
                </thead>
                <tbody>
                {techs.map((tech) => (
                    <tr key={tech.name}>
                        <td>{tech.name}</td>
                        <td>{tech.era}</td>
                        <td>{tech.type}</td>
                        {/* replace commas with newline and use pre-line */}
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {tech.unlocks.join(', ').replace(/, /g, '\n')}
                        </td>
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {tech.effects.join(', ').replace(/, /g, '\n')}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SpreadSheetView;
