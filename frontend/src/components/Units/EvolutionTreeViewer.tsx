import React, { Fragment, useMemo } from "react";
import { UnitCard } from "@/components/Units/UnitCard/UnitCard";
import type { Unit } from "@/types/dataTypes";
import { selectUnitsByKey, useUnitStore } from "@/stores/unitStore";
import { buildEvolutionLayers } from "./unitEvolution";
import "./EvolutionTreeViewer.css";

interface EvolutionTreeViewerProps {
  rootUnit: Unit | null;
  skipRoot?: boolean;
}

const GlowArrow: React.FC = () => <div className="glowArrowSymbol">❯</div>;

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

function isNecrophageLarvae(u: Unit): boolean {
  if (u.isMajorFaction !== true) return false;
  const f = norm(u.faction);
  const isNecro = f === "necrophage" || f === "necrophages";
  if (!isNecro) return false;

  // Your special case: the single tier-0 root that everything evolves from
  return u.previousUnitKey == null && u.evolutionTierIndex === 0 && (u.nextEvolutionUnitKeys?.length ?? 0) > 0;
}

export const EvolutionTreeViewer: React.FC<EvolutionTreeViewerProps> = ({
                                                                          rootUnit,
                                                                          skipRoot = false,
                                                                        }) => {
  const unitsByKey = useUnitStore(selectUnitsByKey);

  const maxDepth = useMemo(() => {
    if (!rootUnit) return 0;
    // Necro larvae: only show the first evolution step (tier-1)
    return isNecrophageLarvae(rootUnit) ? 1 : 20;
  }, [rootUnit]);

  const tiers = useMemo(() => {
    if (!rootUnit) return [];
    if (maxDepth <= 0) return [];
    return buildEvolutionLayers(rootUnit, unitsByKey, maxDepth);
  }, [rootUnit, unitsByKey, maxDepth]);

  const isChosen = !!rootUnit?.isChosen;
  const isMajorLayout = !!rootUnit?.isMajorFaction && !isChosen;

  const flatChain: Unit[] = useMemo(() => {
    if (!rootUnit) return [];
    const flattened = tiers.flat();
    return skipRoot ? flattened : [rootUnit, ...flattened];
  }, [rootUnit, tiers, skipRoot]);

  if (!rootUnit) return null;

  if (isMajorLayout) {
    return (
        <div className="evolutionTreeWrapper">
          {!skipRoot && (
              <div className="evoRow">
                <UnitCard unit={rootUnit} showArtwork disableFlip={false} />
              </div>
          )}

          {tiers.map((tier, i) => (
              <div key={`tier-${i}`} className="evoRow">
                {tier.map((unit) => (
                    <div key={unit.unitKey} className="evoNodeWrapper">
                      <UnitCard unit={unit} showArtwork disableFlip={false} />
                    </div>
                ))}
              </div>
          ))}
        </div>
    );
  }

  return (
      <div className="horizontalEvolution">
        {flatChain.map((unit, i) => (
            <Fragment key={unit.unitKey}>
              <UnitCard unit={unit} showArtwork disableFlip={false} />
              {i < flatChain.length - 1 && <GlowArrow />}
            </Fragment>
        ))}
      </div>
  );
};
