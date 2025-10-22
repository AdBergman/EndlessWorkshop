import React, { useContext, useMemo } from "react";
import { UnitCard } from "@/components/Units/UnitCard/UnitCard";
import GameDataContext from "@/context/GameDataContext";
import { Unit } from "@/types/dataTypes";
import "./EvolutionTreeViewer.css";

interface EvolutionTreeViewerProps {
    rootUnit: Unit | null;
    skipRoot?: boolean;
}

export const EvolutionTreeViewer: React.FC<EvolutionTreeViewerProps> = ({
                                                                            rootUnit,
                                                                            skipRoot = false,
                                                                        }) => {
    const gameData = useContext(GameDataContext);
    if (!rootUnit || !gameData) return null;

    const findChildren = (unit: Unit): Unit[] =>
        (unit.upgradesTo || [])
            .map((name) => Array.from(gameData.units.values()).find((u) => u.name === name))
            .filter(Boolean) as Unit[];

    // Build tier arrays for each depth level
    const tiers = useMemo(() => {
        const result: Unit[][] = [];
        const visited = new Set<string>();
        let current = skipRoot ? findChildren(rootUnit) : [rootUnit];

        while (current.length > 0) {
            result.push(current);
            const next: Unit[] = [];
            for (const u of current) {
                visited.add(u.name);
                for (const child of findChildren(u)) {
                    if (!visited.has(child.name)) next.push(child);
                }
            }
            current = next;
        }
        return result;
    }, [rootUnit, gameData.units, skipRoot]);

    return (
        <div className="evolutionTreeWrapper">
            {tiers.map((tier, i) => (
                <div key={i} className="evoRow">
                    {tier.map((unit) => (
                        <div key={unit.name} className="evoNodeWrapper">
                            <UnitCard unit={unit} showArtwork disableFlip={false} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
