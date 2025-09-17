import React from 'react';
import { NavigationButtons } from '../types/techTypes';

interface Props {
    direction: 'previous' | 'next';
    buttonData: NavigationButtons['previous'];
    boxSize: NavigationButtons['boxSize'];
    onClick: () => void;
}

const EraNavigationButton: React.FC<Props> = ({ direction, buttonData, boxSize, onClick }) => {
    const borderColor = direction === 'previous' ? 'blue' : 'green';
    const label = direction === 'previous' ? 'Prev' : 'Next';

    return (
        <div
            style={{
                position: 'absolute',
                left: `${buttonData.xPct}%`,
                top: `${buttonData.yPct}%`,
                width: `${boxSize.widthPct}%`,
                height: `${boxSize.heightPct}%`,
                border: `2px solid ${borderColor}`,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClick}
        >
            {label}
        </div>
    );
};

export default EraNavigationButton;
