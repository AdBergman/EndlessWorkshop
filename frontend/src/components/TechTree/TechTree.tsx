import React, { useMemo, useState, useRef, useEffect } from 'react';
import techTreeJson from '../../data/techTree.json';
import TechNode from './TechNode';
import { Tech } from '@dataTypes/dataTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';
import TechTooltip from "../Tooltips/TechTooltip";
import EraProgressPanel from "./EraProgressPanel";

interface TechTreeProps {
    faction: string;
    era: number;
    onEraChange: (dir: 'previous' | 'next') => void;
    maxUnlockedEra: number;
    selectedTechs: Tech[];
    onTechClick: (techName: string) => void;
}

const MIN_ERA = 1;
const MAX_ERA = 6;

const TechTree: React.FC<TechTreeProps> = ({
                                               faction,
                                               era,
                                               onEraChange,
                                               maxUnlockedEra,
                                               selectedTechs,
                                               onTechClick
                                           }) => {
    // State
    const [hoveredTech, setHoveredTech] = useState<Tech & { coords: { xPct: number; yPct: number } } | null>(null);
    const [hoveredTooltip, setHoveredTooltip] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    // Schedule hiding tooltip only if nothing is hovered
    const scheduleHide = (delay: number = 250) => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            if (!hoveredTooltip) setHoveredTech(null);
        }, delay);
    };

    const handleNodeHover = (tech: Tech & { coords: { xPct: number; yPct: number } }, hovered: boolean) => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

        if (hovered) {
            // Reset tooltip hover state when moving to new node
            setHoveredTooltip(false);
            setHoveredTech(tech);
        } else {
            scheduleHide(250); // 0.25s delay to allow tooltip to appear if moving to it
        }
    };

    const handleTooltipHover = (hovered: boolean) => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        setHoveredTooltip(hovered);

        if (!hovered) {
            // Immediate hide when leaving tooltip
            setHoveredTech(null);
        }
    };

    const factionTechs = useMemo(() => {
        return (techTreeJson as Tech[]).filter(t => t.era === era && t.faction.includes(faction));
    }, [era, faction]);

    const selectedTechNames = useMemo(() => new Set(selectedTechs.map(t => t.name)), [selectedTechs]);

    const isLocked = (tech: Tech): boolean => {
        if (selectedTechs.some(t => t.excludes === tech.name)) return true;
        if (tech.era > maxUnlockedEra) return true;
        if (selectedTechs.some(t => t.name === tech.name)) return false;
        return false;
    };

    const eraTechsByEra = useMemo(() => {
        const map: Record<number, Tech[]> = {};
        for (let e = 1; e <= 6; e++) {
            map[e] = (techTreeJson as Tech[]).filter(t => t.faction.includes(faction) && t.era === e);
        }
        return map;
    }, [faction]);

    const isButtonHidden = (dir: 'previous' | 'next') =>
        (dir === 'previous' && era === MIN_ERA) || (dir === 'next' && era === MAX_ERA);

    return (
        <div className="tech-tree-image-wrapper">
            <img
                src={`/graphics/techEraScreens/${faction.toLowerCase()}_era_${era}.png`}
                alt={`${faction} Era ${era}`}
                className="tech-tree-bg"
                draggable={false}
            />

            {factionTechs.map(tech => (
                <TechNode
                    key={tech.name}
                    coords={tech.coords}
                    selected={selectedTechNames.has(tech.name)}
                    locked={isLocked(tech)}
                    onClick={() => onTechClick(tech.name)}
                    onHoverChange={(hovered) => handleNodeHover(tech, hovered)}
                />
            ))}

            {hoveredTech && (
                <TechTooltip
                    hoveredTech={hoveredTech}
                    onMouseEnter={() => handleTooltipHover(true)}
                    onMouseLeave={() => handleTooltipHover(false)}
                />
            )}

            {(['previous', 'next'] as const).map(dir =>
                    !isButtonHidden(dir) && (
                        <EraNavigationButton
                            key={dir}
                            direction={dir}
                            onClick={() => onEraChange(dir)}
                        />
                    )
            )}

            <div className="era-panel-wrapper bottom-left">
                <EraProgressPanel
                    selectedTechs={selectedTechs}
                    eraTechsByEra={eraTechsByEra}
                    maxUnlockedEra={maxUnlockedEra}
                />
            </div>
        </div>
    );
};

export default TechTree;
