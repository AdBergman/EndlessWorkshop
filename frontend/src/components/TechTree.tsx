import React, {useMemo} from 'react';
import techTreeJson from '../data/techTree.json';
import techUIJson from '../data/techUI.json';
import TechBox from './TechBox';
import {Tech, TechUIData} from '../types/techTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';
import Tooltip from "./Tooltip";

interface TechTreeProps {
    faction: string;
    era: number;
    onEraChange: (dir: 'previous' | 'next') => void;
}

const TechTree: React.FC<TechTreeProps> = ({ faction, era, onEraChange }) => {
    const [selectedTechs, setSelectedTechs] = React.useState<string[]>([]);

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

    // convert UI data to map for fast lookup
    const uiData: TechUIData = techUIJson as TechUIData;
    const uiMap = useMemo(() => {
        const map = new Map<string, typeof uiData.techs.items[0]>();
        uiData.techs.items.forEach(item => map.set(item.name, item));
        return map;
    }, [uiData]);

    const handleTechClick = (techName: string) => {
        setSelectedTechs(prev =>
            prev.includes(techName)
                ? prev.filter(t => t !== techName)
                : [...prev, techName]
        );
    };

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
                const uiItem = uiMap.get(tech.name);
                if (!uiItem) return null;
                return (
                    <TechBox
                        key={tech.name}
                        coords={uiItem.coords}
                        boxSize={uiData.techs.boxSize}
                        selected={selectedTechs.includes(tech.name)}
                        onClick={() => handleTechClick(tech.name)}
                        onMouseEnter={() => setHoveredTech({ ...tech, coords: uiItem.coords })}
                        onMouseLeave={() => setHoveredTech(null)}
                    />
                );
            })}

            {hoveredTech && <Tooltip hoveredTech={hoveredTech} />}

            {/* Era navigation buttons */}
            {(['previous', 'next'] as const).map(dir => {
                if (isButtonHidden(dir)) return null;
                return (
                    <EraNavigationButton
                        key={dir}
                        direction={dir}
                        buttonData={uiData.navigationButtons[dir]}
                        boxSize={uiData.navigationButtons.boxSize}
                        onClick={() => onEraChange(dir)}
                    />
                );
            })}
        </div>
    );
};

export default TechTree;
