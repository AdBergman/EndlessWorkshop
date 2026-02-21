import React from "react";
import type { UnlockedImprovement } from "@/utils/unlocks";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

interface ImprovementSheetViewProps {
    improvements: UnlockedImprovement[];
}

const ImprovementSheetView: React.FC<ImprovementSheetViewProps> = ({ improvements }) => {
    if (!improvements?.length) {
        return <div className="empty-sheet-message">No improvements unlocked by current tech selections.</div>;
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
                {improvements.map((improvement) => (
                    <tr key={improvement.improvementKey ?? improvement.displayName}>
                        <td>{improvement.displayName ?? "--"}</td>
                        <td>{improvement.era ?? "--"}</td>

                        <td>
                            {(improvement.descriptionLines ?? []).length ? (
                                <div style={{ display: "grid", gap: 2 }}>
                                    {improvement.descriptionLines!.map((line, index) => (
                                        <div key={index}>{renderDescriptionLine(line)}</div>
                                    ))}
                                </div>
                            ) : (
                                "--"
                            )}
                        </td>

                        <td>{improvement.unique ?? "--"}</td>
                        <td>{(improvement.cost ?? []).length ? improvement.cost!.join(", ") : "--"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImprovementSheetView;