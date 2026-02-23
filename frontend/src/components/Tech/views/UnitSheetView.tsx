import React from "react";
import type { Unit } from "@/types/dataTypes";
import { deriveUnit } from "@/lib/units/deriveUnit";

type UnlockedUnit = Unit & { era?: number };

interface UnitSheetViewProps {
    units: UnlockedUnit[];
}

const UnitSheetView: React.FC<UnitSheetViewProps> = ({ units }) => {
    if (!units?.length) {
        return (
            <div className="empty-sheet-message">
                No units unlocked by current tech selections.
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
                    <th>Tier</th>
                    <th>Class</th>
                    <th>Health</th>
                    <th>Defense</th>
                    <th>Damage</th>
                    <th>Move</th>
                    <th>Upkeep</th>
                    <th>Skills</th>
                </tr>
                </thead>

                <tbody>
                {units.map((u) => {
                    const d = deriveUnit(u);
                    const def = d.stats.defense ?? 0;

                    return (
                        <tr key={u.unitKey}>
                            <td>{d.displayName}</td>
                            <td>{u.era}</td>
                            <td>{d.tierLabel}</td>
                            <td>{d.classLabel}</td>
                            <td>{d.stats.health}</td>
                            <td>{def}</td>
                            <td>{d.stats.damage}</td>
                            <td>{d.stats.movement}</td>
                            <td>{d.stats.upkeep}</td>
                            <td style={{ whiteSpace: "pre-line" }}>—</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default UnitSheetView;