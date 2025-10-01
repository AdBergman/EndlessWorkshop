import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import techTreeJson from '../../data/techTree.json';
import TechNode from './TechNode';
import { Tech } from '@/types/dataTypes';
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
const HIDE_DELAY = 300; // Grace period in ms to move mouse to tooltip

const TechTree: React.FC<TechTreeProps> = ({
                                               faction,
                                               era,
                                               onEraChange,
                                               maxUnlockedEra,
                                               selectedTechs,
                                               onTechClick
                                           }) => {
    const [openTooltips, setOpenTooltips] = useState<Set<string>>(new Set());
    const hideTimers = useRef<Record<string, NodeJS.Timeout>>({});

    // Clear timers on unmount
    useEffect(() => {
        const timers = hideTimers.current;
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, []);

    const showTooltip = useCallback((techName: string) => {
        // If there's a pending timer to hide this tooltip, cancel it.
        if (hideTimers.current[techName]) {
            clearTimeout(hideTimers.current[techName]);
        }
        setOpenTooltips(prev => {
            if (prev.has(techName)) return prev; // Already open
            const next = new Set(prev);
            next.add(techName);
            return next;
        });
    }, []);

    const hideTooltip = useCallback((techName: string) => {
        // Set a timer to hide the tooltip, allowing a grace period.
        hideTimers.current[techName] = setTimeout(() => {
            setOpenTooltips(prev => {
                if (!prev.has(techName)) return prev;
                const next = new Set(prev);
                next.delete(techName);
                return next;
            });
        }, HIDE_DELAY);
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

    const selectableTechs = factionTechs.filter(t => !isLocked(t));

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
                eraTechs={selectableTechs}   // only unlocked/selectable techs
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
                            onMouseEnter={() => showTooltip(tech.name)} // Cancels the hide timer
                            onMouseLeave={() => hideTooltip(tech.name)} // Schedules a new hide timer
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
