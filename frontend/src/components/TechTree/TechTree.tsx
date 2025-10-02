import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import techTreeJson from '../../data/techs.json';
import TechNode from './TechNode';
import { Tech } from '@/types/dataTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';
import TechTooltip from '../Tooltips/TechTooltip';
import EraProgressPanel from './EraProgressPanel';
import SelectAllButton from "@/components/TechTree/SelectAllButton";
import ClearAllButton from "./ClearAllButton";
import { useAppContext } from "@/context/AppContext";

// Props are now simpler, as selectedTechs state is handled by context.
interface TechTreeProps {
    era: number;
    onEraChange: (dir: 'previous' | 'next') => void;
    maxUnlockedEra: number;
}

const MIN_ERA = 1;
const MAX_ERA = 6;
const HIDE_DELAY = 300; // Grace period in ms to move mouse to tooltip

const TechTree: React.FC<TechTreeProps> = ({
   era,
   onEraChange,
   maxUnlockedEra,
}) => {
    const { selectedFaction, selectedTechs: selectedTechNames, setSelectedTechs } = useAppContext();
    const [openTooltips, setOpenTooltips] = useState<Set<string>>(new Set());
    const hideTimers = useRef<Record<string, NodeJS.Timeout>>({});

    // The onTechClick handler now lives here and updates the global context.
    const onTechClick = (techName: string) => {
        setSelectedTechs(prev =>
            prev.includes(techName)
                ? prev.filter(t => t !== techName)
                : [...prev, techName]
        );
    };

    // --- Data Derivation from Context and JSON ---
    const allTechs = useMemo(() => techTreeJson as Tech[], []);
    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechNames);
        return allTechs.filter(tech => techNameSet.has(tech.name));
    }, [selectedTechNames, allTechs]);

    const currentFactionEraTechs = useMemo(
        () => allTechs.filter(t => t.era === era && t.faction.includes(selectedFaction)),
        [era, selectedFaction, allTechs]
    );

    const eraTechsByEra = useMemo(() => {
        const map: Record<number, Tech[]> = {};
        for (let e = 1; e <= 6; e++) {
            map[e] = allTechs.filter(
                t => t.faction.includes(selectedFaction) && t.era === e
            );
        }
        return map;
    }, [selectedFaction, allTechs]);

    // --- Tooltip and Locking Logic ---
    useEffect(() => {
        const timers = hideTimers.current;
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, []);

    const showTooltip = useCallback((techName: string) => {
        if (hideTimers.current[techName]) {
            clearTimeout(hideTimers.current[techName]);
        }
        setOpenTooltips(prev => {
            const next = new Set(prev);
            next.add(techName);
            return next;
        });
    }, []);

    const hideTooltip = useCallback((techName: string) => {
        hideTimers.current[techName] = setTimeout(() => {
            setOpenTooltips(prev => {
                const next = new Set(prev);
                next.delete(techName);
                return next;
            });
        }, HIDE_DELAY);
    }, []);

    const isLocked = (tech: Tech): boolean => {
        if (selectedTechObjects.some(t => t.excludes === tech.name)) return true;
        return tech.era > maxUnlockedEra;
    };

    const selectableTechs = currentFactionEraTechs.filter(t => !isLocked(t));
    const isButtonHidden = (dir: 'previous' | 'next') =>
        (dir === 'previous' && era === MIN_ERA) || (dir === 'next' && era === MAX_ERA);

    return (
        <div className="tech-tree-image-wrapper">
            <img
                src={`/graphics/techEraScreens/${selectedFaction.toLowerCase()}_era_${era}.png`}
                alt={`${selectedFaction} Era ${era}`}
                className="tech-tree-bg"
                draggable={false}
            />
            <SelectAllButton
                eraTechs={selectableTechs}
                selectedTechs={selectedTechObjects}
                onTechClick={onTechClick}
            />
            <ClearAllButton
                eraTechs={currentFactionEraTechs}
                selectedTechs={selectedTechObjects}
                onTechClick={onTechClick}
            />

            {currentFactionEraTechs.map(tech => (
                <React.Fragment key={tech.name}>
                    <TechNode
                        coords={tech.coords}
                        selected={selectedTechNames.includes(tech.name)}
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
                    selectedTechs={selectedTechObjects}
                    eraTechsByEra={eraTechsByEra}
                    maxUnlockedEra={maxUnlockedEra}
                />
            </div>
        </div>
    );
};

export default TechTree;
