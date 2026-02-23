import React from "react";
import { District } from "@/types/dataTypes";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

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
                    .filter((district) => !!district?.displayName)
                    .map((district) => (
                        <tr key={district.districtKey ?? district.displayName}>
                            <td>{district.displayName ?? ""}</td>
                            <td>{district.era ?? ""}</td>
                            <td>
                                {(district.descriptionLines ?? []).map((line, index) => (
                                    <div key={index}>{renderDescriptionLine(line)}</div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DistrictSheetView;