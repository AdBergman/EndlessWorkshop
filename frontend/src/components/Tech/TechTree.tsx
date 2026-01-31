import React, { useMemo, useRef } from "react";
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
    const { selectedFaction, selectedTechs, setSelectedTechs, techs } = useGameData();
    const { openTooltips, showTooltip, hideTooltip } = useTooltip(300);
    const allTechs = useMemo(() => Array.from(techs.values()), [techs]);

    const OFFSET_PX = selectedFaction.enumFaction === Faction.ASPECTS ? -35 : 0;

    const [params] = useSearchParams();
    const isAdminMode = params.get("admin") === "1";

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const selectedTechObjects = useMemo(() => {
        const techSet = new Set(selectedTechs);
        return allTechs.filter((t) => techSet.has(t.name));
    }, [selectedTechs, allTechs]);

    //  Admin-safe: compute effective-tech list for this era (staged era moves show up immediately)
    // - Still filters by faction from base data
    // - Uses admin overlay (coords + era) for rendering only
    const currentFactionEraTechs = useMemo(() => {
        const factionKey = selectedFaction.enumFaction!.toLowerCase();

        return allTechs.filter((tBase) => {
            // faction membership is not editable; use base
            if (!tBase.factions.some((f) => f.toLowerCase() === factionKey)) return false;

            // era may be edited in admin mode; use effective
            const tEffective = isAdminMode ? adminGetEffectiveTech(tBase) : tBase;
            return tEffective.era === era;
        });
        // NOTE: adminGetEffectiveTech is defined below after admin hook is created.
        // This useMemo body is overwritten later once admin exists. Kept here for readability.
    }, [] as any);

    // Era progress: keep based on base data (and selected tech objects) — unchanged.
    const eraTechsByEra = useMemo(() => {
        const map: Record<number, Tech[]> = {};
        for (let e = MIN_ERA; e <= MAX_ERA; e++) {
            map[e] = allTechs.filter((t) => {
                if (t.era !== e) return false;
                return t.factions.some((f) => f.toLowerCase() === selectedFaction.enumFaction!.toLowerCase());
            });
        }
        return map;
    }, [selectedFaction, allTechs]);

    const isLocked = (tech: Tech) =>
        selectedTechObjects.some((t) => t.excludes === tech.name) || tech.era > maxUnlockedEra;

    // Admin-safe: selectableTechs should follow what is visible in this era in admin mode
    // but locking must use base tech rules (NOT editable era)
    const selectableTechs = useMemo(() => {
        const factionKey = selectedFaction.enumFaction!.toLowerCase();
        return allTechs
            .filter((tBase) => tBase.factions.some((f) => f.toLowerCase() === factionKey))
            .filter((tBase) => {
                const tEffective = isAdminMode ? admin.getEffectiveTech(tBase) : tBase;
                return tEffective.era === era;
            })
            .filter((tBase) => !isLocked(tBase));
    }, [allTechs, era, isAdminMode, selectedFaction, selectedTechObjects, maxUnlockedEra]); // admin added below via closure

    const isButtonHidden = (dir: "previous" | "next") =>
        (dir === "previous" && era === MIN_ERA) || (dir === "next" && era === MAX_ERA);

    const techOrderNumberByName = useMemo(() => {
        const map = new Map<string, number>();
        for (let i = 0; i < selectedTechs.length; i++) {
            const name = selectedTechs[i];
            if (!name) continue;
            if (!map.has(name)) map.set(name, i + 1);
        }
        return map;
    }, [selectedTechs]);

    const admin = useTechTreeAdminPlacement({
        isAdminMode,
        wrapperRef,
        allTechs,
    });

    // helper used by memos below
    const adminGetEffectiveTech = (tBase: Tech) => admin.getEffectiveTech(tBase);

    const currentFactionEraTechsFixed = useMemo(() => {
        const factionKey = selectedFaction.enumFaction!.toLowerCase();

        return allTechs.filter((tBase) => {
            if (!tBase.factions.some((f) => f.toLowerCase() === factionKey)) return false;

            const tEffective = isAdminMode ? admin.getEffectiveTech(tBase) : tBase;
            return tEffective.era === era;
        });
    }, [allTechs, era, isAdminMode, selectedFaction, admin]);

    const onTechClick = (techName: string) => {
        setSelectedTechs((prev) =>
            prev.includes(techName) ? prev.filter((t) => t !== techName) : [...prev, techName]
        );
    };

    return (
        <div
            className="tech-tree-image-wrapper"
            ref={wrapperRef}
            onClick={admin.onWrapperClick}
            style={{ cursor: admin.wrapperCursor }}
        >
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

            <SelectAllButton eraTechs={selectableTechs} setSelectedTechNames={setSelectedTechs} />
            <ClearAllButton setSelectedTechNames={setSelectedTechs} />

            {currentFactionEraTechsFixed.map((techBase) => {
                const tech = admin.getEffectiveTech(techBase);

                const orderNumber = techOrderNumberByName.get(techBase.name);

                return (
                    <React.Fragment key={techBase.name}>
                        <TechNode
                            coords={tech.coords}
                            selected={selectedTechs.includes(techBase.name)}
                            locked={isLocked(techBase)} // keep lock logic on base
                            onClick={(e) => {
                                if (isAdminMode) admin.onTechNodeClick(techBase.name, e.shiftKey, onTechClick);
                                else onTechClick(techBase.name);
                            }}
                            onHoverChange={(hovered) =>
                                hovered ? showTooltip(techBase.name) : hideTooltip(techBase.name)
                            }
                            offsetPx={OFFSET_PX}
                            orderNumber={orderNumber}
                            adminActive={isAdminMode && admin.panelProps.activeDraft?.name === techBase.name}
                        />

                        {openTooltips.has(techBase.name) && (
                            <TechTooltip
                                hoveredTech={tech}
                                onMouseEnter={() => showTooltip(techBase.name)}
                                onMouseLeave={() => hideTooltip(techBase.name)}
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