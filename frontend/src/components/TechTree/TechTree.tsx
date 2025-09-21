import React, {useMemo} from 'react';
import techTreeJson from '../../data/techTree.json';
import TechNode from './TechNode';
import {Tech} from '@dataTypes/dataTypes';
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

const TechTree: React.FC<TechTreeProps> = ({ faction, era, onEraChange,maxUnlockedEra, selectedTechs, onTechClick }) => {
    const [hoveredTech, setHoveredTech] = React.useState<
        (Tech & { coords: { xPct: number; yPct: number } }) | null
    >(null);

    // filter techs for current era + faction
    const factionTechs = useMemo(() => {
        return (techTreeJson as Tech[])
            .filter(t => t.era === era && t.faction.includes(faction));
    }, [era, faction]);


    const isButtonHidden = (dir: 'previous' | 'next') =>
        (dir === 'previous' && era === MIN_ERA) || (dir === 'next' && era === MAX_ERA);

    const selectedTechNames = useMemo(
        () => new Set(selectedTechs.map(t => t.name)),
        [selectedTechs]
    );

    // build locked tech set
    const lockedTechNames = useMemo(() => {
        const locked = new Set<string>();

        selectedTechs.forEach(t => {
            if (t.excludes) locked.add(t.excludes); // add mutually exclusive tech
        });

        // remove already selected techs from locked set
        selectedTechs.forEach(t => locked.delete(t.name));

        return locked;
    }, [selectedTechs]);

    const isLocked = (tech: Tech): boolean => {
        // Mutual exclusion
        if (selectedTechs.some(t => t.excludes === tech.name)) return true;

        // Era unlock
        if (tech.era > maxUnlockedEra) return true;

        // Already selected? Not locked
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
                    onMouseEnter={() => setHoveredTech({ ...tech, coords: tech.coords })}
                    onMouseLeave={() => setHoveredTech(null)}
                />
            ))}

            {hoveredTech && <TechTooltip hoveredTech={hoveredTech} />}

            {(['previous', 'next'] as const).map(dir =>
                    !isButtonHidden(dir) && (
                        <EraNavigationButton
                            key={dir}
                            direction={dir}
                            onClick={() => onEraChange(dir)}
                        />
                    )
            )}

            {/* Bottom panel aligned to image */}
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
