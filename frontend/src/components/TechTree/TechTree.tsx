import React, {useMemo} from 'react';
import TechNode from './TechNode';
import {Tech} from '@/types/dataTypes';
import EraNavigationButton from './EraNavigationButton';
import './TechTree.css';
import TechTooltip from '../Tooltips/TechTooltip';
import EraProgressPanel from './EraProgressPanel';
import SelectAllButton from "@/components/TechTree/SelectAllButton";
import ClearAllButton from "./ClearAllButton";
import {useGameData} from "@/context/GameDataContext";
import {useTooltip} from "@/hooks/useTooltips";
import {getBackgroundUrl} from "@/utils/getBackgroundUrl";

interface TechTreeProps {
    era: number;
    onEraChange: (dir: 'previous' | 'next') => void;
    maxUnlockedEra: number;
}

const MIN_ERA = 1;
const MAX_ERA = 6;

const TechTree: React.FC<TechTreeProps> = ({ era, onEraChange, maxUnlockedEra }) => {
    const { selectedFaction, selectedTechs, setSelectedTechs, techs } = useGameData();
    const { openTooltips, showTooltip, hideTooltip } = useTooltip(300); // HIDE_DELAY
    const allTechs = useMemo(() => Array.from(techs.values()), [techs]);
    const OFFSET_PX = selectedFaction === 'Aspect' ? -35 : 0; //TEMPORARY OFFSET FOR NEW BACKGROUND - TLPROD-55944

    const selectedTechObjects = useMemo(() => {
        const techSet = new Set(selectedTechs);
        return allTechs.filter(t => techSet.has(t.name));
    }, [selectedTechs, allTechs]);

    const currentFactionEraTechs = useMemo(
        () => allTechs.filter(t => t.era === era && t.factions.includes(selectedFaction)),
        [era, selectedFaction, allTechs]
    );

    const eraTechsByEra = useMemo(() => {
        const map: Record<number, Tech[]> = {};
        for (let e = MIN_ERA; e <= MAX_ERA; e++) {
            map[e] = allTechs.filter(t => t.factions.includes(selectedFaction) && t.era === e);
        }
        return map;
    }, [selectedFaction, allTechs]);

    const onTechClick = (techName: string) => {
        setSelectedTechs(prev =>
            prev.includes(techName)
                ? prev.filter(t => t !== techName)
                : [...prev, techName]
        );
    };

    const isLocked = (tech: Tech) =>
        selectedTechObjects.some(t => t.excludes === tech.name) || tech.era > maxUnlockedEra;

    const selectableTechs = currentFactionEraTechs.filter(t => !isLocked(t));

    const isButtonHidden = (dir: 'previous' | 'next') =>
        (dir === 'previous' && era === MIN_ERA) || (dir === 'next' && era === MAX_ERA);

    return (
        <div className="tech-tree-image-wrapper">
            <img
                src={getBackgroundUrl(selectedFaction, era)}
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
                        selected={selectedTechs.includes(tech.name)}
                        locked={isLocked(tech)}
                        onClick={() => onTechClick(tech.name)}
                        onHoverChange={hovered =>
                            hovered ? showTooltip(tech.name) : hideTooltip(tech.name)
                        }
                        offsetPx={OFFSET_PX}
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
                    selectedTechs={selectedTechObjects}
                    eraTechsByEra={eraTechsByEra}
                    maxUnlockedEra={maxUnlockedEra}
                />
            </div>
        </div>
    );
};

export default TechTree;
