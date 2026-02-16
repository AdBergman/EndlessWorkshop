import React from "react";
import { Tech, TechUnlockRef } from "@/types/dataTypes";
import UnlockLine from "./UnlockLine";

interface TechSheetViewProps {
    techs: Tech[];
}

const TechSheetView: React.FC<TechSheetViewProps> = ({ techs }) => {
    return (
        <div className="spreadsheet-container">
            <table className="spreadsheet-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Era</th>
                    <th>Type</th>
                    <th>Unlocks</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>
                {techs.map((tech) => (
                    <tr key={tech.techKey ?? tech.name}>
                        <td>{tech.name ?? "--"}</td>
                        <td>{tech.era ?? "--"}</td>
                        <td>{tech.type ?? "--"}</td>

                        <td style={{ whiteSpace: "pre-line" }}>
                            {(tech.unlocks ?? []).map((u: TechUnlockRef, i: number) => (
                                <UnlockLine key={`${u.unlockType}:${u.unlockKey}:${i}`} unlock={u} />
                            ))}
                        </td>

                        <td style={{ whiteSpace: "pre-line" }}>
                            {(tech.descriptionLines ?? []).length
                                ? tech.descriptionLines.join("\n")
                                : "--"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TechSheetView;