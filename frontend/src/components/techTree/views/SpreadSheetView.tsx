import React from "react";
import { Tech } from '@dataTypes/techTypes';
import "./SpreadSheetView.css";

interface SpreadSheetViewProps {
    techs: Tech[];
}

const SpreadSheetView: React.FC<SpreadSheetViewProps> = ({ techs }) => {
    if (!techs.length) return <div>No techs selected</div>;

    return (
        <table>
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
            {techs.map(t => (
                <tr key={t.name}>
                    <td>{t.name}</td>
                    <td>{t.era}</td>
                    <td>{t.type}</td>
                    <td>{t.unlocks.join(', ')}</td>
                    <td>{t.effect.join('; ')}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default SpreadSheetView;
