import React from "react";
import { District } from "@/types/dataTypes";

interface DistrictSheetViewProps {
    districts: (District & { era: number })[];
}

const DistrictSheetView: React.FC<DistrictSheetViewProps> = ({ districts }) => {
    if (!districts?.length) {
        return (
            <div className="empty-sheet-message">
                No districts unlocked by current tech selections.
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
                </tr>
                </thead>
                <tbody>
                {districts
                    .filter((d) => !!d?.displayName)
                    .map((d) => (
                        <tr key={d.districtKey ?? d.displayName}>
                            <td>{d.displayName ?? "--"}</td>
                            <td>{d.era ?? "--"}</td>
                            <td style={{ whiteSpace: "pre-line" }}>
                                {(d.descriptionLines ?? []).length
                                    ? d.descriptionLines.join("\n")
                                    : "--"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DistrictSheetView;