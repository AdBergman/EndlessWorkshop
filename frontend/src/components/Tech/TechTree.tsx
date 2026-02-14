// TechTree.tsx
import React, { useMemo, useRef } from "react";
import TechNode from "./TechNode";
import { Tech } from "@/types/dataTypes";
import EraNavigationButton from "./EraNavigationButton";
import "./TechTree.css";
import TechTooltip from "../Tooltips/TechTooltip";
import EraProgressPanel from "./EraProgressPanel";
import SelectAllButton from "@/components/Tech/SelectAllButton";
import ClearAllButton from "./ClearAllButton";
import { useGameData } from "@/context/GameDataContext";
import { useTooltip } from "@/hooks/useTooltips";
import { getBackgroundUrl } from "@/utils/getBackgroundUrl";
import { useSearchParams } from "react-router-dom";
import AdminTechPlacementPanel from "@/components/Tech/adminPanel/AdminTechPlacementPanel";
import { useTechTreeAdminPlacement } from "@/components/Tech/adminPanel/useTechTreeAdminPlacement";

interface TechTreeProps {
    era: number;
    onEraChange: (dir: "previous" | "next") => void;
    maxUnlockedEra: number;
}

const MIN_ERA = 1;
const MAX_ERA = 6;

const TechTree: React.FC<TechTreeProps> = ({ era, onEraChange, maxUnlockedEra }) => {
    const { selectedFaction, selectedTechs, setSelectedTechs, techs, refreshTechs } = useGameData();
    const { openTooltips, showTooltip, hideTooltip } = useTooltip(300);

    const allTechs = useMemo(() => Array.from(techs.values()), [techs]);

    const [params] = useSearchParams();
    const isAdminMode = params.get("admin") === "1";

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const admin = useTechTreeAdminPlacement({
        isAdminMode,
        wrapperRef,
        allTechs,
        refreshTechs: refreshTechs!,
    });

    const selectedTechObjects = useMemo(() => {
        const techKeySet = new Set(selectedTechs);
        return allTechs.filter((t) => techKeySet.has(t.techKey));
    }, [selectedTechs, allTechs]);

    const currentFactionTechs = useMemo(() => {
        const factionKey = selectedFaction.enumFaction?.toLowerCase() ?? "";
        return allTechs.filter((t) => t.factions.some((f) => f.toLowerCase() === factionKey));
    }, [selectedFaction, allTechs]);

    const eraTechsByEra = useMemo(() => {
        const factionKey = selectedFaction.enumFaction?.toLowerCase() ?? "";
        const map: Record<number, Tech[]> = {};
        for (let e = MIN_ERA; e <= MAX_ERA; e++) {
            map[e] = allTechs.filter((t) => {
                if (t.era !== e) return false;
                return t.factions.some((f) => f.toLowerCase() === factionKey);
            });
        }
        return map;
    }, [selectedFaction, allTechs]);

    const onTechClick = (techKey: string) => {
        setSelectedTechs((prev) =>
            prev.includes(techKey) ? prev.filter((t) => t !== techKey) : [...prev, techKey]
        );
    };

    const isLocked = (techBase: Tech) =>
        selectedTechObjects.some((t) => t.excludes === techBase.techKey) || techBase.era > maxUnlockedEra;

    const selectableTechs = useMemo(() => {
        const visibleThisEra: Tech[] = [];

        for (const techBase of currentFactionTechs) {
            const effective = admin.getEffectiveTech(techBase);
            if (effective.era !== era) continue;
            if (isLocked(techBase)) continue;
            visibleThisEra.push(effective);
        }

        return visibleThisEra;
    }, [currentFactionTechs, admin, era, maxUnlockedEra, selectedTechObjects]);

    const isButtonHidden = (dir: "previous" | "next") =>
        (dir === "previous" && era === MIN_ERA) || (dir === "next" && era === MAX_ERA);

    const techOrderNumberByKey = useMemo(() => {
        const map = new Map<string, number>();
        for (let i = 0; i < selectedTechs.length; i++) {
            const k = selectedTechs[i];
            if (!k) continue;
            if (!map.has(k)) map.set(k, i + 1);
        }
        return map;
    }, [selectedTechs]);

    return (
        <div
            className="tech-tree-image-wrapper"
            ref={wrapperRef}
            onClick={admin.onWrapperClick}
            style={{ cursor: admin.wrapperCursor }}
        >
            <div className="wip-banner">
                EARLY ACCESS / WIP
                <br />
                TECH TREE DATA MAY CHANGE
            </div>

            <img
                src={getBackgroundUrl(selectedFaction.uiLabel, era)}
                alt={`${selectedFaction.uiLabel} Era ${era}`}
                className="tech-tree-bg"
                draggable={false}
            />

            <SelectAllButton eraTechs={selectableTechs} setSelectedTechNames={setSelectedTechs} />
            <ClearAllButton setSelectedTechNames={setSelectedTechs} />

            {currentFactionTechs.map((techBase) => {
                const tech = admin.getEffectiveTech(techBase);

                if (tech.era !== era) return null;

                const orderNumber = techOrderNumberByKey.get(techBase.techKey);

                return (
                    <React.Fragment key={techBase.techKey}>
                        <TechNode
                            coords={tech.coords}
                            selected={selectedTechs.includes(techBase.techKey)}
                            locked={isLocked(techBase)}
                            adminMode={isAdminMode}
                            onClick={(e) => {
                                if (isAdminMode) admin.onTechNodeClick(techBase.techKey, e.shiftKey, onTechClick);
                                else onTechClick(techBase.techKey);
                            }}
                            onHoverChange={(hovered) =>
                                hovered ? showTooltip(techBase.techKey) : hideTooltip(techBase.techKey)
                            }
                            orderNumber={orderNumber}
                            adminActive={isAdminMode && admin.panelProps.activeDraft?.techKey === techBase.techKey}
                        />

                        {openTooltips.has(techBase.techKey) && (
                            <TechTooltip
                                hoveredTech={tech}
                                onMouseEnter={() => showTooltip(techBase.techKey)}
                                onMouseLeave={() => hideTooltip(techBase.techKey)}
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
                <EraProgressPanel
                    selectedTechs={selectedTechObjects}
                    eraTechsByEra={eraTechsByEra}
                    maxUnlockedEra={maxUnlockedEra}
                />
            </div>

            <AdminTechPlacementPanel {...admin.panelProps} />
        </div>
    );
};

export default TechTree;