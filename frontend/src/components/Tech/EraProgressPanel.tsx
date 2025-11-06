import React, {useMemo} from 'react';
import {Tech, ERA_THRESHOLDS} from '../../types/dataTypes';
import './EraProgressPanel.css';

interface EraProgressPanelProps {
    selectedTechs: Tech[];
    eraTechsByEra: Record<number, Tech[]>;
    maxUnlockedEra: number;
}

const maxEra = 6;

const EraProgressPanel: React.FC<EraProgressPanelProps> = ({selectedTechs, eraTechsByEra ,maxUnlockedEra}) => {
    const eraCounts = useMemo(() => {
        const counts = Array(maxEra).fill(0);
        selectedTechs.forEach(t => {
            if (t.era >= 1 && t.era <= maxEra) counts[t.era - 1]++;
        });
        return counts;
    }, [selectedTechs]);

    const nextEra = maxUnlockedEra + 1;
    const remainingToUnlockNextEra =
        nextEra <= maxEra
            ? Math.max(ERA_THRESHOLDS[nextEra] - eraCounts.slice(0, nextEra - 1).reduce((a, b) => a + b, 0), 0)
            : 0;

    return (
        <div className="era-progress-panel">
            {/* Top line: summary */}
            {nextEra <= maxEra && remainingToUnlockNextEra > 0 && (
                <div className="era-summary">
                    Need {remainingToUnlockNextEra} more tech
                    {remainingToUnlockNextEra > 1 ? 's' : ''} from previous eras to unlock Era {nextEra}
                </div>
            )}
            {/* per-era counts in one horizontal row */}
            <div className="era-lines">
                {Array.from({ length: maxEra }, (_, i) => {
                    const eraNum = i + 1;

                    // total techs in this era for display (optional)
                    const totalInEra = eraTechsByEra[eraNum]?.length || 0;

                    // how many techs selected in this era
                    const count = eraCounts[i] || 0;

                    // Compute cumulative techs selected in previous eras
                    const cumulativeSelected = eraCounts.slice(0, eraNum - 1).reduce((a, b) => a + b, 0);

                    // Determine if this era is unlocked
                    const unlocked = eraNum === 1 || cumulativeSelected >= ERA_THRESHOLDS[eraNum];

                    return (
                        <div
                            key={eraNum}
                            className={`era-line ${unlocked ? 'met' : 'not-met'}`}
                        >
                            Era {eraNum}: {count} / {totalInEra}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EraProgressPanel;
