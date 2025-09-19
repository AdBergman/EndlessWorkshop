import React from "react";
import "./SpreadSheetView.css";

interface SpreadSheetViewProps {
    techs: string[];
}

const SpreadSheetView: React.FC<SpreadSheetViewProps> = ({ techs = [] }) => {
    return (
        <div className="spreadsheet-view">
            <table>
                <thead>
                <tr>
                    <th>Era</th>
                    <th>Tech</th>
                </tr>
                </thead>
                <tbody>
                {techs.map((t) => (
                    <tr key={t}>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SpreadSheetView;
