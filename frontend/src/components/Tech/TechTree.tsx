import React, { useMemo } from "react";
import TechNode from "./TechNode";
import { Tech, Faction } from "@/types/dataTypes";
import EraNavigationButton from "./EraNavigationButton";
import "./TechTree.css";
import TechTooltip from "../Tooltips/TechTooltip";
import EraProgressPanel from "./EraProgressPanel";
import SelectAllButton from "@/components/Tech/SelectAllButton";
import ClearAllButton from "./ClearAllButton";
import { useGameData } from "@/context/GameDataContext";
import { useTooltip } from "@/hooks/useTooltips";
import { getBackgroundUrl } from "@/utils/getBackgroundUrl";

interface TechTreeProps {
    era: number;
    onEraChange: (dir: "previous" | "next") => void;
    maxUnlockedEra: number;
}

const MIN_ERA = 1;
const MAX_ERA = 6;

const TechTree: React.FC<TechTreeProps> = ({ era, onEraChange, maxUnlockedEra }) => {
    const { selectedFaction, selectedTechs, setSelectedTechs, techs } = useGameData();
    const { openTooltips, showTooltip, hideTooltip } = useTooltip(300); // HIDE_DELAY
    const allTechs = useMemo(() => Array.from(techs.values()), [techs]);
    const OFFSET_PX = selectedFaction.enumFaction === Faction.ASPECTS ? -35 : 0; //TEMPORARY OFFSET FOR NEW BACKGROUND - TLPROD-55944

    const selectedTechObjects = useMemo(() => {
        const techSet = new Set(selectedTechs);
        return allTechs.filter((t) => techSet.has(t.name));
    }, [selectedTechs, allTechs]);

    const currentFactionEraTechs = useMemo(
        () =>
            allTechs.filter((t) => {
                if (t.era !== era) return false;
                // Only consider major factions, with case-insensitive comparison
                return t.factions.some((f) => f.toLowerCase() === selectedFaction.enumFaction!.toLowerCase());
            }),
        [era, selectedFaction, allTechs]
    );

    const eraTechsByEra = useMemo(() => {
        const map: Record<number, Tech[]> = {};
        for (let e = MIN_ERA; e <= MAX_ERA; e++) {
            map[e] = allTechs.filter((t) => {
                if (t.era !== e) return false;
                // Only consider major factions, with case-insensitive comparison
                return t.factions.some((f) => f.toLowerCase() === selectedFaction.enumFaction!.toLowerCase());
            });
        }
        return map;
    }, [selectedFaction, allTechs]);

    const onTechClick = (techName: string) => {
        setSelectedTechs((prev) =>
            prev.includes(techName) ? prev.filter((t) => t !== techName) : [...prev, techName]
        );
    };

    const isLocked = (tech: Tech) =>
        selectedTechObjects.some((t) => t.excludes === tech.name) || tech.era > maxUnlockedEra;

    const selectableTechs = currentFactionEraTechs.filter((t) => !isLocked(t));

    const isButtonHidden = (dir: "previous" | "next") =>
        (dir === "previous" && era === MIN_ERA) || (dir === "next" && era === MAX_ERA);

    /**
     * Phase 1: Always-on numbering for selected techs
     * Rule: order = index in selectedTechs + 1
     */
    const techOrderNumberByName = useMemo(() => {
        const map = new Map<string, number>();
        // If duplicates ever occur, first occurrence wins (stable)
        for (let i = 0; i < selectedTechs.length; i++) {
            const name = selectedTechs[i];
            if (!name) continue;
            if (!map.has(name)) map.set(name, i + 1);
        }
        return map;
    }, [selectedTechs]);

    return (
        <div className="tech-tree-image-wrapper">
            {selectedFaction.enumFaction === Faction.ASPECTS && (
                <div className="wip-banner">
                    WORK IN PROGRESS
                    <br />
                    NEW BACKGROUND IMAGES
                    <br />
                    ARE ALIGNED DIFFERENTLY
                </div>
            )}

            <img
                src={getBackgroundUrl(selectedFaction.uiLabel, era)}
                alt={`${selectedFaction.uiLabel} Era ${era}`}
                className="tech-tree-bg"
                draggable={false}
            />

            <SelectAllButton eraTechs={selectableTechs} selectedTechs={selectedTechObjects} onTechClick={onTechClick} />
            <ClearAllButton eraTechs={currentFactionEraTechs} selectedTechs={selectedTechObjects} onTechClick={onTechClick} />

            {currentFactionEraTechs.map((tech) => {
                const orderNumber = techOrderNumberByName.get(tech.name);

                return (
                    <React.Fragment key={tech.name}>
                        <TechNode
                            coords={tech.coords}
                            selected={selectedTechs.includes(tech.name)}
                            locked={isLocked(tech)}
                            onClick={() => onTechClick(tech.name)}
                            onHoverChange={(hovered) => (hovered ? showTooltip(tech.name) : hideTooltip(tech.name))}
                            offsetPx={OFFSET_PX}
                            orderNumber={orderNumber}
                        />

                        {openTooltips.has(tech.name) && (
                            <TechTooltip
                                hoveredTech={tech}
                                onMouseEnter={() => showTooltip(tech.name)}
                                onMouseLeave={() => hideTooltip(tech.name)}
                            />
                        )}
                    </React.Fragment>
                );
            })}

            {(["previous", "next"] as const).map(
                (dir) =>
                    !isButtonHidden(dir) && (
                        <EraNavigationButton key={dir} direction={dir} onClick={() => onEraChange(dir)} />
                    )
            )}

            <div className="era-panel-wrapper bottom-left">
                <EraProgressPanel selectedTechs={selectedTechObjects} eraTechsByEra={eraTechsByEra} maxUnlockedEra={maxUnlockedEra} />
            </div>
        </div>
    );
};

export default TechTree;