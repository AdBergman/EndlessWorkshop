import React from 'react';
import techtreeJson from '../data/techtree.json';
import techUIJson from '../data/techUI.json';
import TechBox from './TechBox';
import { Tech, TechUIData } from '../types/techTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';

interface TechTreeProps {
    faction: string;
    era: number;
}

const TechTree: React.FC<TechTreeProps> = ({ faction, era }) => {
    const [selectedTechs, setSelectedTechs] = React.useState<string[]>([]);

    const techData: Tech[] = (techtreeJson as Tech[]).filter(
        t => t.era === era && (t.faction === "" || t.faction === faction)
    );

    const uiData: TechUIData = techUIJson as TechUIData;

    const handleTechClick = (techName: string) => {
        setSelectedTechs((prev) =>
            prev.includes(techName)
                ? prev.filter(t => t !== techName) // unselect
                : [...prev, techName]              // select
        );
    };

    return (
        <div className="tech-tree-image-wrapper">
            <img
                src={`/graphics/final/${faction.toLowerCase()}_era_${era}.png`}
                alt={`${faction} Era ${era}`}
                className="tech-tree-bg"
                draggable={false}
            />

            {techData.map((tech) => {
                const uiItem = uiData.techs.items.find(u => u.name === tech.name);
                if (!uiItem) return null;
                return (
                    <TechBox
                        key={tech.name}
                        coords={uiItem.coords}
                        boxSize={uiData.techs.boxSize}
                        selected={selectedTechs.includes(tech.name)}
                        onClick={() => handleTechClick(tech.name)}
                    />
                );
            })}

            {/* Era navigation buttons */}
            {(['previous', 'next'] as const).map((dir) => (
                <EraNavigationButton
                    key={dir}
                    direction={dir}
                    buttonData={uiData.navigationButtons[dir]}
                    boxSize={uiData.navigationButtons.boxSize}
                    onClick={() => {}} // no-op for now
                    // onClick={dir === 'previous' ? handlePrevEra : handleNextEra}
                />
            ))}
        </div>
    );
};

export default TechTree;
