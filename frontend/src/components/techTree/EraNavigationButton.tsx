import React from 'react';
import { NavigationButtons } from '../../types/techTypes';
import './EraNavigationButton.css';

interface Props {
    direction: 'previous' | 'next';
    buttonData: NavigationButtons['previous'];
    boxSize: NavigationButtons['boxSize'];
    onClick: () => void;
}

const EraNavigationButton: React.FC<Props> = ({ direction, buttonData, boxSize, onClick }) => {
    return (
        <div
            className={`era-navigation-button ${direction}`}
            style={{
                left: `${buttonData.xPct}%`,
                top: `${buttonData.yPct}%`,
                width: `${boxSize.widthPct}%`,
                height: `${boxSize.heightPct}%`,
            }}
            onClick={onClick}
        >
            <div className="orb" />
        </div>
    );
};

export default EraNavigationButton;
