import React from "react";
import { Tech, TechUnlockRef } from "@/types/dataTypes";
import UnlockLine from "./UnlockLine";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

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
                            {(tech.unlocks ?? []).map((unlock: TechUnlockRef, index: number) => (
                                <UnlockLine
                                    key={`${unlock.unlockType}:${unlock.unlockKey}:${index}`}
                                    unlock={unlock}
                                />
                            ))}
                        </td>

                        <td>
                            {(tech.descriptionLines ?? []).length ? (
                                <div style={{ display: "grid", gap: 2 }}>
                                    {tech.descriptionLines!.map((line, index) => (
                                        <div key={index}>{renderDescriptionLine(line)}</div>
                                    ))}
                                </div>
                            ) : (
                                "--"
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TechSheetView;