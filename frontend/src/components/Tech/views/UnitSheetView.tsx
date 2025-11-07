import React from "react";
import { Unit } from "@/types/dataTypes";

interface UnitSheetViewProps {
    units: (Unit & { era: number })[];
}

const UnitSheetView: React.FC<UnitSheetViewProps> = ({ units }) => {
    if (!units || units.length === 0)
        return (
            <div className="empty-sheet-message">
                No units unlocked by current tech selections.
            </div>
        );

    return (
        <div className="spreadsheet-container">
            <table className="spreadsheet-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Era</th>
                    <th>Tier</th>
                    <th>Type</th>
                    <th>Health</th>
                    <th>Defense</th>
                    <th>Damage</th>
                    <th>Move</th>
                    <th>Skills</th>
                </tr>
                </thead>
                <tbody>
                {units.map((u) => (
                    <tr key={u.name}>
                        <td>{u.name}</td>
                        <td>{u.era}</td>
                        <td>{u.tier}</td>
                        <td>{u.type}</td>
                        <td>{u.health}</td>
                        <td>{u.defense}</td>
                        <td>
                            {u.minDamage}–{u.maxDamage}
                        </td>
                        <td>{u.movementPoints}</td>
                        <td style={{ whiteSpace: "pre-line" }}>
                            {u.skills?.length ? u.skills.join("\n") : "--"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UnitSheetView;
