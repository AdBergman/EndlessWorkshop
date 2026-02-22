import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import { Unit } from "@/types/dataTypes";
import { HoveredWithCoords, createHoveredUnit } from "./hoverHelpers";
import { FactionIcon } from "@/components/Units/UnitCard/FactionIcon";
import { FACTION_COLORS } from "@/types/factionColors";
import { useGameData } from "@/context/GameDataContext";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";

interface UnitTooltipProps {
    hoveredUnit: HoveredWithCoords<Unit>;
}

const prettyClassKey = (key: string | null | undefined) => {
    const k = (key ?? "").trim();
    if (!k) return null;
    return k.replace(/^UnitClass_/, "").replace(/_/g, " ");
};

const toRoman = (n: number) => {
    switch (n) {
        case 1:
            return "I";
        case 2:
            return "II";
        case 3:
            return "III";
        case 4:
            return "IV";
        case 5:
            return "V";
        case 6:
            return "VI";
        default:
            return String(n);
    }
};

const UnitTooltip: React.FC<UnitTooltipProps> = ({ hoveredUnit }) => {
    const { data, coords } = hoveredUnit;

    const {
        displayName,
        isHero,
        isChosen,
        evolutionTierIndex,
        unitClassKey,
        nextEvolutionUnitKeys,
        descriptionLines,
    } = data;

    const { selectedFaction, units } = useGameData();
    const factionKey = selectedFaction?.enumFaction ?? "PLACEHOLDER";
    const accent = FACTION_COLORS[factionKey]?.accent ?? "#ffb673";

    const classLabel = prettyClassKey(unitClassKey);
    const tierLabel = typeof evolutionTierIndex === "number" ? `Tier ${toRoman(evolutionTierIndex)}` : null;

    const subtitleParts = [tierLabel, classLabel].filter(Boolean);
    const subtitle = subtitleParts.length ? subtitleParts.join(" ") : null;

    const evolvesToKeys = (nextEvolutionUnitKeys ?? []).filter((k) => (k ?? "").trim().length > 0);

    return ReactDOM.createPortal(
        <BaseTooltip coords={coords}>
            <div style={{ minWidth: "240px", maxWidth: "320px" }}>
                <div className="techTooltipHeader" style={{ justifyContent: "space-between", gap: 10 }}>
                    <span className="techTooltipName" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {displayName}
                    </span>
                    {selectedFaction?.enumFaction ? (
                        <FactionIcon faction={selectedFaction.enumFaction} size={14} color={accent} />
                    ) : null}
                </div>

                {subtitle ? (
                    <div style={{ fontSize: "0.9rem", opacity: 0.95, marginBottom: "6px" }}>{subtitle}</div>
                ) : null}

                {isHero || isChosen ? (
                    <div style={{ fontSize: "0.85rem", opacity: 0.9, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {isHero ? <span>Hero</span> : null}
                        {isChosen ? <span>Chosen</span> : null}
                    </div>
                ) : null}

                {(descriptionLines?.length ?? 0) > 0 ? (
                    <TooltipSection title="Description:">
                        {descriptionLines.map((line, i) => (
                            <div key={i}>{renderDescriptionLine(line)}</div>
                        ))}
                    </TooltipSection>
                ) : null}

                {evolvesToKeys.length > 0 ? (
                    <TooltipSection title="Evolves to:">
                        {evolvesToKeys.map((unitKey, i) => {
                            const resolved = units.get(unitKey);
                            const label = resolved?.displayName ?? unitKey;

                            return (
                                <div key={i}>
                                    <span
                                        className="hoverable-link unit-link"
                                        onMouseEnter={(e) => {
                                            if (!resolved) return;
                                            // reuse the same coords system as other hover helpers
                                            // and keep it instant (no fetch)
                                            // This will open a nested tooltip like in TechTooltip.
                                            // If you don't want nested tooltips here, tell me and I’ll remove it.
                                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                            createHoveredUnit(resolved, e);
                                        }}
                                        title={unitKey}
                                        style={{ userSelect: "none" }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </TooltipSection>
                ) : null}
            </div>
        </BaseTooltip>,
        document.body
    );
};

export default UnitTooltip;