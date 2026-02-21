// TechContainer.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TechTree from "@/components/Tech/TechTree";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import { ERA_THRESHOLDS, Faction, Tech } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import "./TechContainer.css";

const MAX_ERA = 6;

const normalize = (s: string) => String(s ?? "").toLowerCase().replace(/\s+/g, "_");

type ImportedTechState = {
    source?: "gamesummary";
    techKeys?: string[];
    focusTechKey?: string | null;
    factionKeyHint?: string | null;
    empireIndex?: number;
    mode?: "global" | "empire";
};

function cleanString(x: unknown): string {
    return typeof x === "string" ? x.trim() : "";
}

function resolveFactionFromKeyHint(hint: unknown) {
    const raw = cleanString(hint);
    if (!raw) return null;

    const normalized = raw.toLowerCase().replace(/[\s_-]+/g, "");

    if (normalized.includes("lastlord") || normalized.includes("lastlords") || normalized === "lords") {
        return { isMajor: true, enumFaction: Faction.LORDS, minorName: null, uiLabel: "Lords" };
    }
    if (normalized.includes("kinofsheredyn") || normalized === "kin") {
        return { isMajor: true, enumFaction: Faction.KIN, minorName: null, uiLabel: "Kin" };
    }
    if (normalized.includes("mukag") || normalized.includes("tahuk")) {
        return { isMajor: true, enumFaction: Faction.TAHUK, minorName: null, uiLabel: "Tahuk" };
    }
    if (normalized.includes("aspect")) {
        return { isMajor: true, enumFaction: Faction.ASPECTS, minorName: null, uiLabel: "Aspects" };
    }
    if (normalized.includes("necro") || normalized.includes("necrophage")) {
        return { isMajor: true, enumFaction: Faction.NECROPHAGES, minorName: null, uiLabel: "Necrophages" };
    }

    return null;
}

const TechContainer: React.FC = () => {
    const { selectedFaction, setSelectedFaction, selectedTechs, setSelectedTechs, techs } = useGameData();

    const [firstEraLoaded, setFirstEraLoaded] = useState(false);
    const [importToast, setImportToast] = useState<string | null>(null);

    useSharedBuildLoader(setSelectedTechs);

    const selectedTechObjects = useMemo(() => {
        const selectedTechKeySet = new Set(selectedTechs);
        return Array.from(techs.values()).filter((tech) => selectedTechKeySet.has(tech.techKey));
    }, [selectedTechs, techs]);

    const eraController = useEraController(selectedTechObjects);

    useDeepLinkedTech({
        techs,
        selectedFaction,
        setSelectedFaction,
        setSelectedTechs,
        setEra: eraController.setEra,
    });

    useImportedTechListLoader({
        techs,
        setSelectedTechs,
        setEra: eraController.setEra,
        setImportToast,
        setSelectedFaction,
    });

    useEffect(() => {
        if (!selectedFaction) return;

        const preload = new Image();
        preload.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_1.webp`;
        preload.onload = () => setFirstEraLoaded(true);
        preload.onerror = () => setFirstEraLoaded(true);

        return () => {
            preload.onload = null;
            preload.onerror = null;
        };
    }, [selectedFaction]);

    useEffect(() => {
        if (!selectedFaction) return;

        for (let eraIndex = 1; eraIndex <= MAX_ERA; eraIndex++) {
            const img = new Image();
            img.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_${eraIndex}.webp`;
        }
    }, [selectedFaction]);

    return (
        <main className={`main-container ${firstEraLoaded ? "loaded" : ""}`}>
            {firstEraLoaded && (
                <>
                    {importToast ? (
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                zIndex: 50,
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.14)",
                                background: "rgba(0,0,0,0.45)",
                                color: "rgba(255,255,255,0.92)",
                                fontSize: 12,
                                pointerEvents: "none",
                            }}
                        >
                            {importToast}
                        </div>
                    ) : null}

                    <TechTree
                        era={eraController.era}
                        maxUnlockedEra={eraController.maxUnlockedEra}
                        onEraChange={(direction) =>
                            direction === "next" ? eraController.handleNextEra() : eraController.handlePrevEra()
                        }
                    />

                    <div className="view-container">
                        <SpreadSheetView />
                    </div>
                </>
            )}
        </main>
    );
};

export default TechContainer;

function useSharedBuildLoader(setSelectedTechs: (techKeys: string[]) => void) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");
        if (!shareUuid) return;

        let cancelled = false;

        const loadBuild = async () => {
            try {
                const res = await fetch(`/api/builds/${shareUuid}`);
                if (!res.ok) throw new Error("Build not found");
                const data = await res.json();
                const validTechKeys = Array.isArray(data.techIds) ? data.techIds.filter((k: string) => !!k) : [];
                if (!cancelled) setSelectedTechs(validTechKeys);
            } catch (err) {
                console.error("Failed to load shared build", err);
            }
        };

        void loadBuild();

        return () => {
            cancelled = true;
        };
    }, [setSelectedTechs]);
}

function useImportedTechListLoader({
                                       techs,
                                       setSelectedTechs,
                                       setEra,
                                       setImportToast,
                                       setSelectedFaction,
                                   }: {
    techs: Map<string, Tech>;
    setSelectedTechs: (techKeys: string[]) => void;
    setEra: (era: number) => void;
    setImportToast: (msg: string | null) => void;
    setSelectedFaction: (f: any) => void;
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const appliedRef = useRef(false);

    useEffect(() => {
        if (appliedRef.current) return;
        if (techs.size === 0) return;

        const importedState = (location.state ?? null) as ImportedTechState | null;
        if (!importedState || importedState.source !== "gamesummary") return;

        const incomingTechKeys = (Array.isArray(importedState.techKeys) ? importedState.techKeys : [])
            .map(cleanString)
            .filter(Boolean);

        if (incomingTechKeys.length === 0) return;

        appliedRef.current = true;

        const resolvedFaction = resolveFactionFromKeyHint(importedState.factionKeyHint);
        if (resolvedFaction) setSelectedFaction(resolvedFaction);

        const resolvedTechKeys: string[] = [];
        let missingCount = 0;

        for (const techKey of incomingTechKeys) {
            if (techs.has(techKey)) resolvedTechKeys.push(techKey);
            else missingCount++;
        }

        setSelectedTechs(resolvedTechKeys);

        // Always land on Era 1 when importing from Game Summary.
        setEra(1);

        setImportToast(
            missingCount > 0
                ? `Loaded ${resolvedTechKeys.length}/${incomingTechKeys.length} techs.`
                : `Loaded ${resolvedTechKeys.length} techs.`
        );
        window.setTimeout(() => setImportToast(null), missingCount > 0 ? 4500 : 2500);

        navigate(location.pathname + location.search, { replace: true, state: null });
    }, [
        techs,
        location.state,
        location.pathname,
        location.search,
        navigate,
        setSelectedTechs,
        setEra,
        setImportToast,
        setSelectedFaction,
    ]);
}

function useDeepLinkedTech({
                               techs,
                               selectedFaction,
                               setSelectedFaction,
                               setSelectedTechs,
                               setEra,
                           }: {
    techs: Map<string, Tech>;
    selectedFaction: any;
    setSelectedFaction: (faction: any) => void;
    setSelectedTechs: (techKeys: string[]) => void;
    setEra: (era: number) => void;
}) {
    const [params] = useSearchParams();
    const appliedRef = useRef(false);

    useEffect(() => {
        if (appliedRef.current) return;
        if (techs.size === 0) return;

        const factionParam = params.get("faction");
        const techParam = params.get("tech");
        if (!factionParam || !techParam) return;

        appliedRef.current = true;

        const deepLinkFaction = {
            isMajor: true,
            enumFaction: factionParam.toUpperCase() as any,
            minorName: null,
            uiLabel: factionParam.toLowerCase(),
        };

        if (!selectedFaction?.isMajor || selectedFaction.enumFaction !== deepLinkFaction.enumFaction) {
            setSelectedFaction(deepLinkFaction);
        }

        const matchedTech =
            Array.from(techs.values()).find((tech) => tech.techKey === techParam) ??
            Array.from(techs.values()).find((tech) => normalize(tech.name) === normalize(techParam));

        if (matchedTech) {
            setSelectedTechs([matchedTech.techKey]);
            setEra(matchedTech.era);

            const newUrl = window.location.origin + "/tech";
            window.history.replaceState({}, "", newUrl);
        }
    }, [params, techs, selectedFaction, setSelectedFaction, setSelectedTechs, setEra]);
}

function useEraController(selectedTechObjects: Tech[]) {
    const [era, setEra] = useState(1);

    const handlePrevEra = useCallback(() => setEra((prev) => Math.max(1, prev - 1)), []);
    const handleNextEra = useCallback(() => setEra((prev) => Math.min(MAX_ERA, prev + 1)), []);

    const maxUnlockedEra = useMemo(() => {
        const eraCounts = Array(MAX_ERA).fill(0);

        selectedTechObjects.forEach((tech) => {
            if (tech.era >= 1 && tech.era <= MAX_ERA) eraCounts[tech.era - 1]++;
        });

        let unlockedEra = 1;
        for (let eraIndex = 2; eraIndex <= MAX_ERA; eraIndex++) {
            const required = ERA_THRESHOLDS[eraIndex];
            const totalSelectedPrev = eraCounts.slice(0, eraIndex - 1).reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlockedEra = eraIndex;
            else break;
        }
        return unlockedEra;
    }, [selectedTechObjects]);

    return { era, setEra, maxUnlockedEra, handleNextEra, handlePrevEra };
}