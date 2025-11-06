import React from 'react';
import { Tech } from '@/types/dataTypes';
import UnlockLine from './UnlockLine';

// This component is now only responsible for rendering the table of techs.
interface TechSheetViewProps {
    techs: Tech[];
}

const TechSheetView: React.FC<TechSheetViewProps> = ({ techs }) => {
    // The check for empty techs is now handled by the parent controller.
    // This component can assume it will always receive techs to render.
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
                        <td style={{ whiteSpace: 'pre-line' }}>
                            {tech.unlocks.map((line, i) => (
                                <UnlockLine key={i} line={line} />
                            ))}
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

export default TechSheetView;
