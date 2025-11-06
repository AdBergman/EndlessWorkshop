import React from 'react';
import { Tech } from '@/types/dataTypes';
import '@/components/Tech/SelectAllButton.css'; // for styling

interface SelectAllButtonProps {
    eraTechs: Tech[];
    selectedTechs: Tech[];
    onTechClick: (techName: string) => void;
    className?: string;
}

const SelectAllButton: React.FC<SelectAllButtonProps> = ({
                                                             eraTechs,
                                                             selectedTechs,
                                                             onTechClick,
                                                         }) => {
    const handleSelectAll = () => {
        eraTechs.forEach(tech => {
            if (!selectedTechs.some(t => t.name === tech.name)) {
                onTechClick(tech.name);
            }
        });
    };

    // Match the Next button's approximate coordinates
    const xPct = 86.9 + 5.5; // percentage from left
    const yPct = 29.5 + 14.0;   // slightly down from top, adjust as needed

    return (
        <button
            data-testid="select-all-button"
            onClick={handleSelectAll}
            className="select-all-button"
            style={{
                position: 'absolute',
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: 'translateX(-50%)',
                zIndex: 10,
            }}
        >
            Select All
        </button>
    );
};

export default SelectAllButton;
