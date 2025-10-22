import React, { useContext, useMemo, Fragment } from "react";
import { UnitCard } from "@/components/Units/UnitCard/UnitCard";
import GameDataContext from "@/context/GameDataContext";
import { Unit } from "@/types/dataTypes";
import "./EvolutionTreeViewer.css";

interface EvolutionTreeViewerProps {
    rootUnit: Unit | null;
    skipRoot?: boolean;
}

/* 🔸 glowing inline arrow like carousel */
const GlowArrow: React.FC = () => (
    <div className="glowArrowSymbol">❯</div>
);

export const EvolutionTreeViewer: React.FC<EvolutionTreeViewerProps> = ({
                                                                            rootUnit,
                                                                            skipRoot = false,
                                                                        }) => {
    const gameData = useContext(GameDataContext);
    if (!rootUnit || !gameData) return null;

    const findChildren = (unit: Unit): Unit[] =>
        (unit.upgradesTo || [])
            .map((name) =>
                Array.from(gameData.units.values()).find((u) => u.name === name)
            )
            .filter(Boolean) as Unit[];

    // 🧩 Build tier structure for vertical layout
    const tiers = useMemo(() => {
        if (!rootUnit) return [];
        const result: Unit[][] = [];
        let currentTier: Unit[] = findChildren(rootUnit);
        let visited = new Set<string>();
        let depth = 0;

        while (currentTier.length > 0 && depth < 10) {
            result.push(currentTier);
            const nextTier: Unit[] = [];
            for (const u of currentTier) {
                visited.add(u.name);
                for (const child of findChildren(u)) {
                    if (!visited.has(child.name)) nextTier.push(child);
                }
            }
            currentTier = nextTier;
            depth++;
        }
        return result;
    }, [rootUnit, gameData.units]);

    const isChosen = rootUnit.name.toLowerCase() === "chosen";
    const isMajor =
        !isChosen &&
        ["KIN", "TAHUK", "LORDS", "ASPECT", "NECROPHAGE"].includes(
            rootUnit.faction.toUpperCase()
        );

    /* 🟢 Major factions — vertical layout */
    if (isMajor) {
        return (
            <div className="evolutionTreeWrapper">
                {!skipRoot && (
                    <div className="evoRow">
                        <UnitCard unit={rootUnit} showArtwork disableFlip={false} />
                    </div>
                )}
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
    }

    /* 🔵 Minor factions + Chosen — horizontal layout with glowing arrows */
    const flatChain: Unit[] = [rootUnit, ...tiers.flat()];

    return (
        <div className="horizontalEvolution">
            {flatChain.map((unit, i) => (
                <Fragment key={unit.name}>
                    <UnitCard unit={unit} showArtwork disableFlip={false} />
                    {i < flatChain.length - 1 && <GlowArrow />}
                </Fragment>
            ))}
        </div>
    );
};
