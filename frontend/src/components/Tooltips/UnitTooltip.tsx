import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "./BaseTooltip";
import TooltipSection from "./TooltipSection";
import { Unit } from "@/types/dataTypes";
import { HoveredWithCoords, createHoveredUnit } from "./hoverHelpers";
import { FACTION_COLORS } from "@/types/factionColors";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import { getFactionIconPath } from "@/features/icons/factionIconResolver";
import { deriveUnit } from "@/lib/units/deriveUnit";
import { normalizeUnitKey, selectUnitsByKey, useUnitStore } from "@/stores/unitStore";

interface UnitTooltipProps {
    hoveredUnit: HoveredWithCoords<Unit>;
}

const prettyClassKey = (key: string | null | undefined) => {
    const k = (key ?? "").trim();
    if (!k) return null;
    return k
        .replace(/^UnitClass_/, "")
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
        .split(/\s+/g)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
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
    const derived = deriveUnit(data);

    const {
        displayName,
        isHero,
        isChosen,
        evolutionTierIndex,
        unitClassKey,
        unitClassDisplayName,
        nextEvolutionUnitKeys,
        descriptionLines,
    } = data;

    const unitsByKey = useUnitStore(selectUnitsByKey);
    const factionKey = derived.majorEnumFaction ?? "PLACEHOLDER";
    const factionIconPath = !derived.isMinor && derived.majorEnumFaction
        ? getFactionIconPath(data.faction ?? derived.majorEnumFaction)
        : null;
    const factionColor = FACTION_COLORS[factionKey]?.border ?? FACTION_COLORS.PLACEHOLDER.border;

    const classLabel = unitClassDisplayName?.trim() || prettyClassKey(unitClassKey);
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
                    {factionIconPath ? (
                        <span
                            className="techTooltipFactionIcon"
                            aria-hidden="true"
                            title={data.faction ?? undefined}
                            style={{
                                ["--faction-icon-path" as any]: `url("${factionIconPath}")`,
                                ["--faction-icon-color" as any]: factionColor,
                            }}
                        />
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
                            const resolved = unitsByKey[normalizeUnitKey(unitKey)];
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
