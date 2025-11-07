import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import { Unit } from "@/types/dataTypes";
import { HoveredWithCoords } from "./hoverHelpers";
import { FactionIcon } from "@/components/Units/UnitCard/FactionIcon";
import { FACTION_COLORS, FACTION_GRADIENT } from "@/types/factionColors";
import { useGameData } from "@/context/GameDataContext";

interface UnitTooltipProps {
    hoveredUnit: HoveredWithCoords<Unit>;
}

const UnitTooltip: React.FC<UnitTooltipProps> = ({ hoveredUnit }) => {
    const { data, coords } = hoveredUnit;
    const { name, type, health, defense, minDamage, maxDamage, movementPoints, skills, tier } = data;

    const { selectedFaction } = useGameData();
    const factionKey = selectedFaction?.enumFaction ?? "PLACEHOLDER";
    const accent = FACTION_COLORS[factionKey]?.accent ?? "#ffb673";

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ width: "fit-content", maxWidth: "240px" }}>
                {/* Header with name on left and faction icon on right */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: 600,
                        marginBottom: "4px",
                    }}
                >
                    <span>{name}</span>
                    <FactionIcon faction={selectedFaction.enumFaction} size={14} color={accent} />
                </div>

                {/* Stats summary */}
                <div
                    style={{
                        display: "inline-grid",
                        gridTemplateColumns: "auto auto", // use natural width
                        columnGap: "8px",
                        rowGap: "2px",
                        fontSize: "0.85rem",
                        lineHeight: 1.25,
                        whiteSpace: "nowrap",
                    }}
                >
                    <span>❤️ Health:</span>
                    <span>{health}</span>
                    <span>🛡️ Defense:</span>
                    <span>{defense}</span>
                    <span>⚔️ Damage:</span>
                    <span>
    {minDamage}–{maxDamage}
  </span>
                    <span>👣 Move:</span>
                    <span>{movementPoints}</span>
                </div>

                {/* Skills */}
                {skills?.length > 0 && (
                    <TooltipSection title="Skills:">
                        {skills.map((skill, i) => (
                            <div key={i}>{skill}</div>
                        ))}
                    </TooltipSection>
                )}

                {/* Footer — Tier + Type with subtle faction gradient */}
                {(typeof tier === "number" || type) && (
                    <div
                        style={{
                            marginTop: "0.6rem",
                            fontSize: "0.8rem",
                            fontStyle: "italic",
                            background: FACTION_GRADIENT[factionKey] ?? "none",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            opacity: 0.9,
                            textAlign: "left",
                        }}
                    >
                        {`Tier ${tier}`} {type}
                    </div>
                )}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default UnitTooltip;
