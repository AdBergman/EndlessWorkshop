import React, { useState } from "react";
import type { Unit } from "@/types/dataTypes";
import { deriveUnit } from "@/lib/units/deriveUnit";
import { useCodex } from "@/hooks/useCodex";
import SkillTooltip, { HoveredSkill } from "@/components/Tooltips/SkillTooltip"; // adjust path to your tooltips folder

type UnlockedUnit = Unit & { era?: number };

interface UnitSheetViewProps {
    units: UnlockedUnit[];
}

const UnitSheetView: React.FC<UnitSheetViewProps> = ({ units }) => {
    const { getVisibleEntry } = useCodex();
    const [hoveredSkill, setHoveredSkill] = useState<HoveredSkill | null>(null);

    if (!units?.length) {
        return (
            <div className="empty-sheet-message">
                No units unlocked by current tech selections.
            </div>
        );
    }

    const clearHover = () => setHoveredSkill(null);

    const handleSkillEnter = (e: React.MouseEvent<HTMLSpanElement>, abilityKey: string) => {
        const codex = getVisibleEntry("abilities", abilityKey);
        if (!codex) return;

        // Pixel coords for portaled tooltip
        setHoveredSkill({
            data: codex,
            coords: {
                x: e.clientX + 12,
                y: e.clientY,
                mode: "pixel",
            },
        });
    };

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

                    const abilityKeys = u.abilityKeys ?? [];

                    // Only show abilities that have a visible codex entry
                    const visibleAbilityKeys = abilityKeys.filter(
                        (k) => !!getVisibleEntry("abilities", k)
                    );

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

                            <td style={{ whiteSpace: "pre-line" }}>
                                {visibleAbilityKeys.length === 0 ? (
                                    "—"
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                        }}
                                    >
                                        {visibleAbilityKeys.map((abilityKey) => {
                                            const codex = getVisibleEntry("abilities", abilityKey)!;

                                            return (
                                                <span
                                                    key={abilityKey}
                                                    style={{
                                                        textDecoration: "underline",
                                                        cursor: "pointer",
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        handleSkillEnter(e, abilityKey)
                                                    }
                                                    onMouseLeave={clearHover}
                                                >
                                                        {codex.displayName}
                                                    </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {hoveredSkill && <SkillTooltip hoveredSkill={hoveredSkill} />}
        </div>
    );
};

export default UnitSheetView;