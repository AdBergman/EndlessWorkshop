import React, { useMemo, useState, useCallback } from 'react';
import techTreeJson from '../../data/techTree.json';
import TechNode from './TechNode';
import { Tech } from '../../types/dataTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';
import TechTooltip from '../Tooltips/TechTooltip';
import EraProgressPanel from './EraProgressPanel';
import SelectAllButton from "@/components/TechTree/SelectAllButton";

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
    // --- NEW: a simple Set of tech names whose tooltips are currently shown ---
    const [openTooltips, setOpenTooltips] = useState<Set<string>>(new Set());

    const showTooltip = useCallback((techName: string) => {
        setOpenTooltips(prev => {
            const next = new Set(prev);
            next.add(techName);
            return next;
        });
    }, []);

    const hideTooltip = useCallback((techName: string) => {
        setOpenTooltips(prev => {
            if (!prev.has(techName)) return prev;
            const next = new Set(prev);
            next.delete(techName);
            return next;
        });
    }, []);

    const factionTechs = useMemo(
        () => (techTreeJson as Tech[]).filter(t => t.era === era && t.faction.includes(faction)),
        [era, faction]
    );

    const selectedTechNames = useMemo(
        () => new Set(selectedTechs.map(t => t.name)),
        [selectedTechs]
    );

    const isLocked = (tech: Tech): boolean => {
        if (selectedTechs.some(t => t.excludes === tech.name)) return true;
        return tech.era > maxUnlockedEra;

    };

    const eraTechsByEra = useMemo(() => {
        const map: Record<number, Tech[]> = {};
        for (let e = 1; e <= 6; e++) {
            map[e] = (techTreeJson as Tech[]).filter(
                t => t.faction.includes(faction) && t.era === e
            );
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
            <SelectAllButton
                eraTechs={factionTechs}
                selectedTechs={selectedTechs}
                onTechClick={onTechClick}
            />

            {factionTechs.map(tech => (
                <React.Fragment key={tech.name}>
                    <TechNode
                        coords={tech.coords}
                        selected={selectedTechNames.has(tech.name)}
                        locked={isLocked(tech)}
                        onClick={() => onTechClick(tech.name)}
                        onHoverChange={hovered =>
                            hovered ? showTooltip(tech.name) : hideTooltip(tech.name)
                        }
                    />
                    {openTooltips.has(tech.name) && (
                        <TechTooltip
                            hoveredTech={tech}
                            onMouseEnter={() => showTooltip(tech.name)}
                            onMouseLeave={() => hideTooltip(tech.name)}
                        />
                    )}
                </React.Fragment>
            ))}

            {(["previous", "next"] as const).map(dir =>
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
