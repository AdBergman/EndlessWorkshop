import React, {useMemo} from 'react';
import techTreeJson from '../../data/techTree.json';
import TechNode from './TechNode';
import {Tech} from '@dataTypes/dataTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';
import TechTooltip from "../tooltips/TechTooltip";

interface TechTreeProps {
    faction: string;
    era: number;
    onEraChange: (dir: 'previous' | 'next') => void;
    selectedTechs: Tech[];
    onTechClick: (techName: string) => void;
}



const TechTree: React.FC<TechTreeProps> = ({ faction, era, onEraChange,selectedTechs, onTechClick }) => {
    const [hoveredTech, setHoveredTech] = React.useState<
        (Tech & { coords: { xPct: number; yPct: number } }) | null
    >(null);

    // filter techs for current era + faction
    const techData: Tech[] = useMemo(
        () => (techTreeJson as Tech[]).filter(
            t => t.era === era && (t.faction === "" || t.faction === faction)
        ),
        [era, faction]
    );

    const isButtonHidden = (dir: 'previous' | 'next') =>
        (dir === 'previous' && era === 1) || (dir === 'next' && era === 6);

    return (
        <div className="tech-tree-image-wrapper">
            <img
                src={`/graphics/techEraScreens/${faction.toLowerCase()}_era_${era}.png`}
                alt={`${faction} Era ${era}`}
                className="tech-tree-bg"
                draggable={false}
            />

            {techData.map((tech) => {
                return (
                    <TechNode
                        key={tech.name}
                        coords={tech.coords}
                        selected={selectedTechs.some(t => t.name === tech.name)}
                        onClick={() => onTechClick(tech.name)}
                        onMouseEnter={() => setHoveredTech({ ...tech, coords: tech.coords })}
                        onMouseLeave={() => setHoveredTech(null)}
                    />
                );
            })}

            {hoveredTech && <TechTooltip hoveredTech={hoveredTech} />}

            {/* Era navigation buttons */}
            {(['previous', 'next'] as const).map(dir => {
                if (isButtonHidden(dir)) return null;
                return (
                    <EraNavigationButton
                        key={dir}
                        direction={dir}
                        onClick={() => onEraChange(dir)}
                    />
                );
            })}
        </div>
    );
};

export default TechTree;
