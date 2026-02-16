import React from "react";
import type { UnlockedImprovement } from "@/utils/unlocks";

interface ImprovementSheetViewProps {
    improvements: UnlockedImprovement[];
}

const ImprovementSheetView: React.FC<ImprovementSheetViewProps> = ({ improvements }) => {
    if (!improvements?.length) {
        return (
            <div className="empty-sheet-message">
                No improvements unlocked by current tech selections.
            </div>
        );
    }

    return (
        <div className="spreadsheet-container">
            <table className="spreadsheet-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Era</th>
                    <th>Description</th>
                    <th>Unique</th>
                    <th>Cost</th>
                </tr>
                </thead>
                <tbody>
                {improvements.map((imp) => (
                    <tr key={imp.improvementKey ?? imp.displayName}>
                        <td>{imp.displayName ?? "--"}</td>
                        <td>{imp.era ?? "--"}</td>
                        <td style={{ whiteSpace: "pre-line" }}>
                            {(imp.descriptionLines ?? []).length
                                ? imp.descriptionLines.join("\n")
                                : "--"}
                        </td>
                        <td>{imp.unique ?? "--"}</td>
                        <td>{(imp.cost ?? []).length ? imp.cost.join(", ") : "--"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImprovementSheetView;