// src/components/TechBox.tsx
import React from 'react';

interface TechBoxProps {
    coords: { xPct: number; yPct: number }; // top-left from JSON
    boxSize: { widthPct: number; heightPct: number };
    selected: boolean;
    onClick: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const TechBox: React.FC<TechBoxProps> = ({ coords, boxSize, selected, onClick, onMouseEnter, onMouseLeave }) => {
    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                position: 'absolute',
                left: `${coords.xPct}%`,
                top: `${coords.yPct}%`,
                width: `${boxSize.widthPct}%`,
                aspectRatio: '1 / 1',   // keeps circle
                cursor: 'pointer',
                boxSizing: 'border-box',
                userSelect: 'none',
                transform: 'translate(3.0%, 3.0%)', //Offset due to CSS bg-img borders

                // Styling
                border: selected ? '3px solid gold' : 'none',
                backgroundColor: selected ? 'rgba(255,255,0,0.3)' : 'transparent',
                borderRadius: '50%',      // makes it circular
                boxShadow: selected
                    ? '0 0 8px 2px gold'
                    : '0 0 4px 1px rgba(255,255,255,0.2)',
            }}
        />
    );
};


export default TechBox;
