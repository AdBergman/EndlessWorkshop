import React from 'react';
import { Tech } from '@/types/dataTypes';
import '@/components/TechTree/ClearAllButton.css'; // Use the new CSS file

interface ClearAllButtonProps {
    eraTechs: Tech[];
    selectedTechs: Tech[];
    onTechClick: (techName: string) => void;
}

const ClearAllButton: React.FC<ClearAllButtonProps> = ({
                                                           eraTechs,
                                                           selectedTechs,
                                                           onTechClick,
                                                       }) => {
    const handleClearAll = () => {
        // Create a set of names for the techs in the current era for efficient lookup
        const eraTechNames = new Set(eraTechs.map(t => t.name));

        // Find which of the globally selected techs are in the current era
        selectedTechs.forEach(tech => {
            if (eraTechNames.has(tech.name)) {
                onTechClick(tech.name); // Call onTechClick to deselect it
            }
        });
    };

    // Position it directly below the Select All button
    const xPct = 86.9 + 5.5; // Same horizontal position
    const yPct = 29.5 + 14.0 + 4.5; // Add vertical offset

    return (
        <button
            data-testid="clear-all-button"
            onClick={handleClearAll}
            className="select-all-button" // Use the same class for identical styling
            style={{
                position: 'absolute',
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: 'translateX(-50%)',
                zIndex: 10,
            }}
        >
            Clear All
        </button>
    );
};

export default ClearAllButton;
