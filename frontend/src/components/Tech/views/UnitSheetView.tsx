import React from "react";
import type { Unit } from "@/types/dataTypes";
import { deriveUnit } from "@/lib/units/deriveUnit";

type UnlockedUnit = Unit & { era?: number };

interface UnitSheetViewProps {
    units: UnlockedUnit[];
}

function show(n: number | null): React.ReactNode {
    return n == null ? "—" : n;
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
                    <th>Vision</th>
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
                            <td>{u.era ?? "—"}</td>
                            <td>{d.tierLabel ?? "—"}</td>
                            <td>{d.classLabel ?? "—"}</td>

                            <td>{show(d.stats.health)}</td>
                            <td>{def}</td>
                            <td>{show(d.stats.damage)}</td>
                            <td>{show(d.stats.movement)}</td>
                            <td>{show(d.stats.visionRange)}</td>
                            <td>{show(d.stats.upkeep)}</td>

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