import React from 'react';

interface TechNodeProps {
    coords: { xPct: number; yPct: number }; // top-left from JSON
    selected: boolean;
    onClick: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const BOX_SIZE_PCT = 4.95;

const TechNode: React.FC<TechNodeProps> = ({ coords, selected, onClick, onMouseEnter, onMouseLeave }) => {
    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                position: 'absolute',
                left: `${coords.xPct}%`,
                top: `${coords.yPct}%`,
                width: `${BOX_SIZE_PCT}%`,
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


export default TechNode;
