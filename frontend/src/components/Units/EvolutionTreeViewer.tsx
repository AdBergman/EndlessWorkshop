import React, { useContext, useMemo, Fragment } from "react";
import { UnitCard } from "@/components/Units/UnitCard/UnitCard";
import GameDataContext from "@/context/GameDataContext";
import { Unit } from "@/types/dataTypes";
import "./EvolutionTreeViewer.css";
import { buildEvolutionLayers } from "@/components/Units/unitEvolution";
import { identifyFaction } from "@/utils/factionIdentity"; // Import the new helper

interface EvolutionTreeViewerProps {
  rootUnit: Unit | null;
  skipRoot?: boolean;
}

/* 🔸 glowing inline arrow like carousel */
const GlowArrow: React.FC = () => <div className="glowArrowSymbol">❯</div>;

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
    const unitsMap = new Map(
      Array.from(gameData.units.values()).map((u) => [u.name, u])
    );
    return buildEvolutionLayers(rootUnit, unitsMap);
  }, [rootUnit, gameData.units]);

  const rootFactionInfo = identifyFaction(rootUnit);

  const isChosen = rootUnit.name.toLowerCase() === "chosen";
  // Use the helper's isMajor property for layout detection
  const isMajorLayout = !isChosen && rootFactionInfo.isMajor;

  /* 🟢 Major factions — vertical layout */
  if (isMajorLayout) {
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
              <div key={unit.displayName} className="evoNodeWrapper">
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
        <Fragment key={unit.displayName}>
          <UnitCard unit={unit} showArtwork disableFlip={false} />
          {i < flatChain.length - 1 && <GlowArrow />}
        </Fragment>
      ))}
    </div>
  );
};
