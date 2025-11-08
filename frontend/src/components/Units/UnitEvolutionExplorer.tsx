import React, {
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import GameDataContext from "@/context/GameDataContext";
import { UnitCarousel } from "./UnitCarousel";
import { EvolutionTreeViewer } from "./EvolutionTreeViewer";
import { FactionInfo, Unit } from "@/types/dataTypes";
import { identifyFaction } from "@/utils/factionIdentity";
import "./UnitEvolutionExplorer.css";

// --- Utility helpers ---
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_");

const toFactionInfo = (f: string): FactionInfo => ({
    isMajor: true,
    enumFaction: f.toUpperCase() as any,
    minorName: null,
    uiLabel: f.toLowerCase(),
});

export const UnitEvolutionExplorer: React.FC = () => {
    const gameData = useContext(GameDataContext);
    const [params, setParams] = useSearchParams();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMinorUnits, setShowMinorUnits] = useState(false);

    const hydratedFromUrl = useRef(false);

    // Reset carousel when faction or toggle changes
    useEffect(() => {
        // When major faction changes, reset to majors view
        setShowMinorUnits(false);
        setSelectedIndex(0);
    }, [gameData?.selectedFaction]);

    // Filter Tier 1 roots based on major/minor toggle
    const tierOneUnits = useMemo(() => {
        if (!gameData || gameData.units.size === 0) return [];
        const { selectedFaction } = gameData;

        return Array.from(gameData.units.values()).filter((u) => {
            if (u.tier !== 1) return false;
            const unitFaction = identifyFaction(u);

            if (showMinorUnits) {
                // All minor faction Tier 1 units
                return !unitFaction.isMajor;
            }

            // Major faction Tier 1 units for the selected major faction
            return (
                selectedFaction.isMajor &&
                unitFaction.isMajor &&
                unitFaction.enumFaction === selectedFaction.enumFaction
            );
        });
    }, [gameData?.units, gameData?.selectedFaction, showMinorUnits]);

    // === URL → State (hydrate once after data ready) ===
    useEffect(() => {
        if (hydratedFromUrl.current) return;
        if (!gameData) return;

        const factionParam = params.get("faction");
        const unitParam = params.get("unit");
        const originParam = params.get("origin"); // minor faction origin (optional)

        if (!factionParam || !unitParam) {
            hydratedFromUrl.current = true;
            return;
        }

        // Ensure selectedFaction matches the URL faction
        const fi = toFactionInfo(factionParam);
        const factionMatches =
            gameData.selectedFaction.isMajor &&
            gameData.selectedFaction.enumFaction === fi.enumFaction;

        if (!factionMatches) {
            gameData.setSelectedFaction(fi);
            return; // wait for selectedFaction to update
        }

        // If origin is present, we want the minor units view
        const wantsMinor = !!originParam;
        if (wantsMinor && !showMinorUnits) {
            setShowMinorUnits(true);
            return; // wait for tierOneUnits to recompute with minors
        }
        if (!wantsMinor && showMinorUnits) {
            setShowMinorUnits(false);
            return;
        }

        // At this point:
        // - selectedFaction matches URL
        // - showMinorUnits matches origin presence
        // - tierOneUnits is computed accordingly
        if (tierOneUnits.length === 0) return;

        const normalizedUnit = normalize(unitParam);
        const normalizedOrigin = originParam ? normalize(originParam) : null;

        let idx = tierOneUnits.findIndex((u) => {
            if (normalize(u.name) !== normalizedUnit) return false;
            if (!normalizedOrigin) return true; // major units path

            // For minor: also check that the unit's minor faction matches origin
            const uf = identifyFaction(u);
            const label =
                uf.minorName ||
                uf.uiLabel ||
                u.faction ||
                (u as any).minorFaction ||
                "";
            return normalize(label) === normalizedOrigin;
        });

        if (idx < 0) {
            // No exact match; keep default index 0
            idx = 0;
        }

        setSelectedIndex(idx);
        hydratedFromUrl.current = true;
    }, [params, gameData, tierOneUnits, showMinorUnits]);

    // === State → URL (silent sync, keeps origin for minor units) ===
    useEffect(() => {
        if (!gameData?.selectedFaction?.isMajor) return;
        if (tierOneUnits.length === 0) return;

        const selectedUnit: Unit | null = tierOneUnits[selectedIndex] || null;
        if (!selectedUnit) return;

        const factionKey = gameData.selectedFaction.enumFaction.toLowerCase();
        const unitKey = normalize(selectedUnit.name);

        const uf = identifyFaction(selectedUnit);
        const isMinor = !uf.isMajor;
        const originLabel =
            uf.minorName ||
            uf.uiLabel ||
            selectedUnit.faction ||
            (selectedUnit as any).minorFaction ||
            "";
        const originKey = isMinor ? normalize(originLabel) : "";

        const curFaction = params.get("faction") || "";
        const curUnit = params.get("unit") || "";
        const curOrigin = params.get("origin") || "";

        const nextFaction = factionKey;
        const nextUnit = unitKey;
        const nextOrigin = originKey;

        // If nothing changed, don't rewrite URL
        if (
            curFaction === nextFaction &&
            curUnit === nextUnit &&
            curOrigin === nextOrigin
        ) {
            return;
        }

        const nextParams: Record<string, string> = {
            faction: nextFaction,
            unit: nextUnit,
        };
        if (isMinor && originKey) {
            nextParams.origin = originKey;
        }

        setParams(nextParams, { replace: true });
    }, [gameData?.selectedFaction, selectedIndex, tierOneUnits]);

    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    const selectedUnit = tierOneUnits[selectedIndex] || null;

    return (
        <div className="unitEvolutionExplorer">
            {/* --- Header Row (toggle only, aligned right) --- */}
            <div className="unitExplorerHeader">
                <div className="minorSegmentedToggle single">
                    <span className="toggleLabel">Show Minor Factions:</span>
                    <div
                        className={`togglePill ${showMinorUnits ? "on" : "off"}`}
                        onClick={() => setShowMinorUnits(!showMinorUnits)}
                    >
                        <div className="toggleHighlight" />
                        <span className={`toggleOption ${!showMinorUnits ? "active" : ""}`}>
                            Off
                        </span>
                        <span className={`toggleOption ${showMinorUnits ? "active" : ""}`}>
                            On
                        </span>
                    </div>
                </div>
            </div>

            {/* --- Content --- */}
            <UnitCarousel
                units={tierOneUnits}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
            />
            <EvolutionTreeViewer rootUnit={selectedUnit} skipRoot />
        </div>
    );
};
