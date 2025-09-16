import React from 'react';
import uiDataJson from '../data/techUI.json';

interface Tech {
    name: string;
    coords: { xPct: number; yPct: number };
}

interface TechsData {
    boxSize: { widthPct: number; heightPct: number };
    items: Tech[];
}

interface NavigationButtons {
    boxSize: { widthPct: number; heightPct: number };
    previous: { xPct: number; yPct: number };
    next: { xPct: number; yPct: number };
}

interface UIData {
    techs: TechsData;
    navigationButtons: NavigationButtons;
}

const uiData: UIData = uiDataJson as unknown as UIData;

const TechTreeEra1: React.FC = () => {
    const { techs, navigationButtons } = uiData;

    return (
        <div style={{ position: 'relative' }}>
            <img
                src="/graphics/final/kin_era_1.png"
                alt="Kin Era 1"
                style={{ width: '100%', display: 'block' }}
            />

            {/* Tech highlights */}
            {techs.items.map((tech) => (
                <div
                    key={tech.name}
                    style={{
                        position: 'absolute',
                        left: `${tech.coords.xPct}%`,
                        top: `${tech.coords.yPct}%`,
                        width: `${techs.boxSize.widthPct}%`,
                        height: `${techs.boxSize.heightPct}%`,
                        border: '2px solid red',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.8em',
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    {tech.name}
                </div>
            ))}

            {/* Previous Era Button */}
            {navigationButtons.previous && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${navigationButtons.previous.xPct}%`,
                        top: `${navigationButtons.previous.yPct}%`,
                        width: `${navigationButtons.boxSize.widthPct}%`,
                        height: `${navigationButtons.boxSize.heightPct}%`,
                        border: '2px solid blue',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0,0,255,0.2)',
                    }}
                >
                    Prev
                </div>
            )}

            {/* Next Era Button */}
            {navigationButtons.next && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${navigationButtons.next.xPct}%`,
                        top: `${navigationButtons.next.yPct}%`,
                        width: `${navigationButtons.boxSize.widthPct}%`,
                        height: `${navigationButtons.boxSize.heightPct}%`,
                        border: '2px solid green',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0,255,0,0.2)',
                    }}
                >
                    Next
                </div>
            )}
        </div>
    );
};

export default TechTreeEra1;
