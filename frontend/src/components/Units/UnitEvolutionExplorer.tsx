import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GameDataContext from "@/context/GameDataContext";
import { UnitCarousel } from "./UnitCarousel";
import { EvolutionTreeViewer } from "./EvolutionTreeViewer";
import type { FactionInfo, Unit } from "@/types/dataTypes";
import { getCarouselModelForFaction } from "@/lib/units/necrophageRoots";
import "./UnitEvolutionExplorer.css";

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_").trim();
const normFaction = (s: string | null | undefined) => normalize(String(s ?? ""));

const toFactionInfo = (f: string): FactionInfo => ({
    isMajor: true,
    enumFaction: f.toUpperCase() as any, // legacy; toolbar/context still uses this
    minorName: null,
    uiLabel: f.toLowerCase(),
});

function doesUnitMatchSelectedMajorFaction(unit: Unit, selectedFaction: FactionInfo): boolean {
    if (unit.isMajorFaction !== true) return false;
    if (!selectedFaction?.isMajor) return false;

    const uf = normFaction(unit.faction);
    const label = normFaction(selectedFaction.uiLabel);
    const enumKey = normFaction(selectedFaction.enumFaction as any);

    const ufSingular = uf.endsWith("s") ? uf.slice(0, -1) : uf;
    const labelSingular = label.endsWith("s") ? label.slice(0, -1) : label;
    const enumSingular = enumKey.endsWith("s") ? enumKey.slice(0, -1) : enumKey;

    return uf === label || uf === enumKey || ufSingular === labelSingular || ufSingular === enumSingular;
}

function isHiddenInUi(u: Unit): boolean {
    const f = (u.faction ?? "").trim();
    if (f === "Tormented") return true; // keep in DB, hide in /units for now
    if (u.isMajorFaction === false && f === "Dungeon") return true; // hide minor "Dungeon" for now
    return false;
}

/**
 * Priority rules (user action wins):
 * 1) External navigation (paste URL, enter, back/forward, link click) hydrates state from URL.
 * 2) Toolbar selection updates view and URL, but MUST NOT be overridden by URL hydration.
 * 3) Minor toggle + carousel updates view and URL, but MUST NOT re-trigger hydration loops.
 */
export const UnitEvolutionExplorer: React.FC = () => {
    const gameData = useContext(GameDataContext);
    const [params, setParams] = useSearchParams();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMinorUnits, setShowMinorUnits] = useState(false);

    // We only want to hydrate from URL on *external* URL changes (paste/back/forward/link).
    // When we write params ourselves (toolbar/carousel/toggle), we record it and ignore that change for hydration.
    const lastParamsWritten = useRef<string | null>(null);
    const hydratedOnceForThisNav = useRef(false);

    // If the URL changes to something we did NOT write, consider it external navigation -> rehydrate.
    useEffect(() => {
        const cur = params.toString();
        if (lastParamsWritten.current && cur === lastParamsWritten.current) return;

        // External navigation detected (or first mount)
        hydratedOnceForThisNav.current = false;
    }, [params]);

    // Toolbar change should be a user action that wins.
    // Reset local UI state when faction changes via toolbar.
    useEffect(() => {
        setShowMinorUnits(false);
        setSelectedIndex(0);
        // Do NOT mark "hydrated"; we still allow external URL nav to override.
        // This effect is only reacting to toolbar state.
    }, [gameData?.selectedFaction]);

    const allVisibleUnits = useMemo(() => {
        if (!gameData || gameData.units.size === 0) return [];
        return Array.from(gameData.units.values()).filter((u) => !isHiddenInUi(u));
    }, [gameData]);

    // Build the *faction-scoped* pool of units (not just roots),
    // then apply Necro carousel model (pinned larvae + tier-1 roots).
    const { pinned: pinnedUnit, roots: rootUnits } = useMemo(() => {
        if (!gameData || allVisibleUnits.length === 0) {
            return { pinned: null as Unit | null, roots: [] as Unit[] };
        }

        const { selectedFaction } = gameData;

        if (showMinorUnits) {
            const minorUnits = allVisibleUnits.filter((u) => u.isMajorFaction === false);
            return getCarouselModelForFaction(minorUnits, true);
        }

        if (!selectedFaction?.isMajor) return { pinned: null, roots: [] };

        const factionUnits = allVisibleUnits.filter((u) => doesUnitMatchSelectedMajorFaction(u, selectedFaction));
        return getCarouselModelForFaction(factionUnits, false);
    }, [gameData, allVisibleUnits, showMinorUnits]);

    const carouselUnits = useMemo(() => {
        return pinnedUnit ? [pinnedUnit, ...rootUnits] : rootUnits;
    }, [pinnedUnit, rootUnits]);

    // If Necro has a pinned larvae, default selection to first real “root” (index 1),
    // but only when NOT currently hydrating from an external URL navigation.
    useEffect(() => {
        if (!pinnedUnit) return;
        if (carouselUnits.length <= 1) return;

        // If external URL navigation is about to select something, don't fight it.
        if (!hydratedOnceForThisNav.current) return;

        setSelectedIndex((idx) => (idx === 0 ? 1 : idx));
    }, [pinnedUnit, carouselUnits.length]);

    // === URL → State (hydrate once per external navigation) ===
    useEffect(() => {
        if (!gameData) return;

        // Ignore URL changes that we wrote ourselves (carousel/toggle/toolbar sync)
        const cur = params.toString();
        if (lastParamsWritten.current && cur === lastParamsWritten.current) return;

        if (hydratedOnceForThisNav.current) return;

        const factionParam = params.get("faction");
        const unitKeyParam = params.get("unitKey");
        const legacyUnitParam = params.get("unit"); // normalized displayName
        const originParam = params.get("origin"); // optional minor origin (legacy)
        const minorParam = params.get("minor"); // optional (explicit)

        // If URL doesn't specify a target unit, we consider hydration done (let UI defaults win)
        if (!factionParam || (!unitKeyParam && !legacyUnitParam)) {
            hydratedOnceForThisNav.current = true;
            return;
        }

        // 1) Faction from URL should win over toolbar if it's a real navigation event.
        const fi = toFactionInfo(factionParam);
        const factionMatches =
            gameData.selectedFaction?.isMajor && gameData.selectedFaction.enumFaction === fi.enumFaction;

        if (!factionMatches) {
            gameData.setSelectedFaction(fi);
            // Wait for toolbar/context to update; we'll hydrate index after carouselUnits recompute.
            return;
        }

        // 2) Minor toggle from URL should win
        const wantsMinor = !!originParam || minorParam === "1";
        if (wantsMinor !== showMinorUnits) {
            setShowMinorUnits(wantsMinor);
            return;
        }

        // 3) Select the unit inside the current carousel model
        if (carouselUnits.length === 0) return;

        let idx = -1;

        if (unitKeyParam) {
            idx = carouselUnits.findIndex((u) => u.unitKey === unitKeyParam);
        }

        if (idx < 0 && legacyUnitParam) {
            const normalizedUnit = normalize(legacyUnitParam);
            const normalizedOrigin = originParam ? normalize(originParam) : null;

            idx = carouselUnits.findIndex((u) => {
                if (normalize(u.displayName) !== normalizedUnit) return false;
                if (!normalizedOrigin) return true;
                return normalize(u.faction ?? "") === normalizedOrigin;
            });
        }

        if (idx < 0) idx = 0;

        setSelectedIndex(idx);
        hydratedOnceForThisNav.current = true;
    }, [params, gameData, carouselUnits, showMinorUnits]);

    // === State → URL (silent sync) ===
    useEffect(() => {
        if (!gameData?.selectedFaction?.isMajor) return;
        if (carouselUnits.length === 0) return;

        const selectedUnit: Unit | null = carouselUnits[selectedIndex] || null;
        if (!selectedUnit) return;

        const factionKey = normFaction(gameData.selectedFaction.uiLabel || (gameData.selectedFaction.enumFaction as any));
        const unitKey = selectedUnit.unitKey;

        const isMinor = selectedUnit.isMajorFaction === false;
        const originKey = isMinor ? normalize(selectedUnit.faction ?? "") : "";

        const nextParams: Record<string, string> = { faction: factionKey, unitKey };

        if (isMinor) {
            if (originKey) nextParams.origin = originKey;
            nextParams.minor = "1";
        }

        const nextStr = new URLSearchParams(nextParams).toString();
        const curStr = params.toString();

        if (curStr === nextStr) return;

        lastParamsWritten.current = nextStr;
        setParams(nextParams, { replace: true });

        // Once the user has interacted (toolbar/toggle/carousel), we're in "UI driven" mode
        // until an external navigation happens (which resets hydratedOnceForThisNav in the params watcher).
        hydratedOnceForThisNav.current = true;
    }, [gameData?.selectedFaction, selectedIndex, carouselUnits, setParams, params]);

    if (!gameData || gameData.units.size === 0) {
        return <div>Loading units...</div>;
    }

    const selectedUnit = carouselUnits[selectedIndex] || null;

    return (
        <div className="unitEvolutionExplorer">
            <div className="unitExplorerHeader">
                <div className="minorSegmentedToggle single">
                    <span className="toggleLabel">Show Minor Factions:</span>
                    <div
                        className={`togglePill ${showMinorUnits ? "on" : "off"}`}
                        onClick={() => {
                            setShowMinorUnits((v) => !v);
                            setSelectedIndex(0);
                            hydratedOnceForThisNav.current = true;
                        }}
                    >
                        <div className="toggleHighlight" />
                        <span className={`toggleOption ${!showMinorUnits ? "active" : ""}`}>Off</span>
                        <span className={`toggleOption ${showMinorUnits ? "active" : ""}`}>On</span>
                    </div>
                </div>
            </div>

            <UnitCarousel units={carouselUnits} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />

            <EvolutionTreeViewer rootUnit={selectedUnit} skipRoot />
        </div>
    );
};