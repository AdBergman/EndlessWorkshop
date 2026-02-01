import React from 'react';
import './EraNavigationButton.css';

interface Props {
    direction: 'previous' | 'next';
    onClick: () => void;
}

const BOX_SIZE = { widthPct: 13.28, heightPct: 27.78 };
const COORDS_MAP = {
    previous: { xPct: 0.15, yPct: 36.0 },
    next: { xPct: 86.9, yPct: 36.0 }
};

const EraNavigationButton: React.FC<Props> = ({ direction, onClick }) => {
    const coords = COORDS_MAP[direction];
    const style = {
        left: `${coords.xPct}%`,
        top: `${coords.yPct}%`,
        width: `${BOX_SIZE.widthPct}%`,
        height: `${BOX_SIZE.heightPct}%`
    };

    return (
        <div
            className={`era-navigation-button ${direction}`}
            style={style}
            onClick={onClick}
            data-testid="era-nav-button"
        >
            <div className="orb" />
        </div>
    );
};

export default EraNavigationButton;
