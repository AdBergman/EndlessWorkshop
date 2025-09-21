import React from 'react';
import './TechNode.css';

interface TechNodeProps {
    coords: { xPct: number; yPct: number };
    selected: boolean;
    locked?: boolean; // defaults to false
    onClick: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const BOX_SIZE_PCT = 4.95;

const TechNode: React.FC<TechNodeProps> = ({
                                               coords,
                                               selected,
                                               locked = false,
                                               onClick,
                                               onMouseEnter,
                                               onMouseLeave
                                           }) => {
    const clickable = !locked;

    return (
        <div
            className={`tech-node ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
            onClick={clickable ? onClick : undefined}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                position: 'absolute',
                left: `${coords.xPct}%`,
                top: `${coords.yPct}%`,
                width: `${BOX_SIZE_PCT}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(3%, 3%)', // offset
            }}
        />
    );
};

export default TechNode;
