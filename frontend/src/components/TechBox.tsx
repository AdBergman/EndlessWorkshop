// src/components/TechBox.tsx
import React from 'react';

interface TechBoxProps {
    coords: { xPct: number; yPct: number }; // top-left from JSON
    boxSize: { widthPct: number; heightPct: number };
    selected: boolean;
    onClick: () => void;
}

const TechBox: React.FC<TechBoxProps> = ({ coords, boxSize, selected, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                left: `${coords.xPct}%`,
                top: `${coords.yPct}%`,
                width: `${boxSize.widthPct}%`,
                height: `${boxSize.heightPct}%`,
                cursor: 'pointer',
                border: selected ? '3px solid gold' : 'none',
                backgroundColor: selected ? 'rgba(255,255,0,0.3)' : 'transparent',
                boxSizing: 'border-box',
                userSelect: 'none',
                transform: 'translate(3.0%, 3.0%',
            }}
        />
    );
};


export default TechBox;
