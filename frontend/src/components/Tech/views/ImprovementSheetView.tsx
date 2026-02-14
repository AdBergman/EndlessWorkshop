// ImprovementSheetView.tsx
import React from "react";
import type { UnlockedImprovement } from "@/utils/unlocks";

interface ImprovementSheetViewProps {
    improvements: UnlockedImprovement[];
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
                    <th>Era</th>
                    <th>Effects</th>
                    <th>Unique</th>
                    <th>Cost</th>
                </tr>
                </thead>
                <tbody>
                {improvements.map((imp) => (
                    <tr key={imp.name}>
                        <td>{imp.name}</td>
                        <td>{imp.era}</td>
                        <td style={{ whiteSpace: "pre-line" }}>
                            {imp.effects?.length ? imp.effects.join("\n") : <span style={{ color: "#888" }}>-- No effects data --</span>}
                        </td>
                        <td>{imp.unique}</td>
                        <td>
                            {imp.cost?.length ? imp.cost.join(", ") : <span style={{ color: "#888" }}>-- No cost data --</span>}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImprovementSheetView;