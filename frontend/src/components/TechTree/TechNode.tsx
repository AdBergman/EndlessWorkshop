import React from 'react';
import './TechNode.css';

interface TechNodeProps {
    coords: { xPct: number; yPct: number };
    selected: boolean;
    locked?: boolean;
    onClick: () => void;
    onHoverChange?: (hovered: boolean) => void;
    visible?: boolean;
}

const BOX_SIZE_PCT = 4.95;

const TechNode: React.FC<TechNodeProps> = ({
                                               coords,
                                               selected,
                                               locked = false,
                                               onClick,
                                               onHoverChange,
    visible
                                           }) => {
    const clickable = !locked;

    return (
        <div
            data-testid="tech-node"
            className={`tech-node 
                ${selected ? 'selected' : ''} 
                ${locked ? 'locked' : ''} 
                ${visible ? 'visible' : ''}`}
            onClick={clickable ? onClick : undefined}
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
            style={{
                position: 'absolute',
                left: `${coords.xPct}%`,
                top: `${coords.yPct}%`,
                width: `${BOX_SIZE_PCT}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(3%, 3%)',
            }}
        />
    );
};

export default TechNode;
