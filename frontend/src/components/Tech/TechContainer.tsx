import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TechTree from "@/components/Tech/TechTree";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import { ERA_THRESHOLDS, Tech, Faction } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import "./TechContainer.css";

const MAX_ERA = 6;
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_");

// Used for matching display names safely (apostrophes/punctuation/case)
const normalizeForMatch = (s: string) => {
    return String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/[^a-z0-9\s']/g, " ") // drop punctuation except apostrophe
        .replace(/\s+/g, " ")
        .trim();
};

type ImportedTechState = {
    source?: "gamesummary";
    techNames?: string[];
    techDefs?: string[];
    empireIndex?: number;
    mode?: "global" | "empire";
    factionHint?: string | null; // may be factionKey or displayName
};

function resolveFactionFromHint(hint: unknown) {
    if (typeof hint !== "string") return null;
    const h = hint.trim();
    if (!h) return null;

    const norm = h.toLowerCase().replace(/[\s_-]+/g, "");

    // Accept either faction keys or display names
    if (norm.includes("lastlord") || norm.includes("lastlords") || norm.includes("lords")) {
        return { isMajor: true, enumFaction: Faction.LORDS, minorName: null, uiLabel: "Lords" };
    }
    if (norm.includes("kinofsheredyn") || norm.includes("kin")) {
        return { isMajor: true, enumFaction: Faction.KIN, minorName: null, uiLabel: "Kin" };
    }
    if (norm.includes("mukag") || norm.includes("tahuk") || norm.includes("tahuks")) {
        return { isMajor: true, enumFaction: Faction.TAHUK, minorName: null, uiLabel: "Tahuk" };
    }
    if (norm.includes("aspect") || norm.includes("aspects")) {
        return { isMajor: true, enumFaction: Faction.ASPECTS, minorName: null, uiLabel: "Aspects" };
    }
    if (norm.includes("necro") || norm.includes("necrophage") || norm.includes("necrophages")) {
        return { isMajor: true, enumFaction: Faction.NECROPHAGES, minorName: null, uiLabel: "Necrophages" };
    }

    return null;
}

const TechContainer: React.FC = () => {
    const {
        selectedFaction,
        setSelectedFaction,
        selectedTechs,
        setSelectedTechs,
        techs,
    } = useGameData();

    const [firstEraLoaded, setFirstEraLoaded] = useState(false);
    const [importToast, setImportToast] = useState<string | null>(null);

    // --- Hook: Load shared build from URL once ---
    useSharedBuildLoader(setSelectedTechs);

    // --- Derive selected tech objects ---
    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechs);
        return Array.from(techs.values()).filter((t) => techNameSet.has(t.name));
    }, [selectedTechs, techs]);

    // --- Era management hook ---
    const eraController = useEraController(selectedTechObjects);

    // --- Deep link handler for /tech?faction=kin&tech=strength_of_garin ---
    useDeepLinkedTech({
        techs,
        selectedFaction,
        setSelectedFaction,
        setSelectedTechs,
        setEra: eraController.setEra,
    });

    // --- Import tech selection from Game Summary via navigation state (no DB write) ---
    useImportedTechListLoader({
        techs,
        setSelectedTechs,
        setEra: eraController.setEra,
        setImportToast,
        setSelectedFaction,
    });

    // --- Preload first era for selected faction and show main container when loaded ---
    useEffect(() => {
        if (!selectedFaction) return;
        const img = new Image();
        img.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_1.webp`;
        img.onload = () => setFirstEraLoaded(true);
        img.onerror = () => setFirstEraLoaded(true);
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [selectedFaction]);

    // --- Preload all remaining eras in the background ---
    useEffect(() => {
        if (!selectedFaction) return;
        for (let e = 1; e <= MAX_ERA; e++) {
            const img = new Image();
            img.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_${e}.webp`;
        }
    }, [selectedFaction]);

    return (
        <main className={`main-container ${firstEraLoaded ? "loaded" : ""}`}>
            {firstEraLoaded && (
                <>
                    {/* Optional tiny toast for partial imports */}
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
                        onEraChange={(dir) =>
                            dir === "next" ? eraController.handleNextEra() : eraController.handlePrevEra()
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

//
// ------------------------ INTERNAL HOOKS --------------------------------- //
//

/** Handles loading of shared builds from a ?share=UUID param */
function useSharedBuildLoader(setSelectedTechs: (names: string[]) => void) {
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
                const validTechs = data.techIds.filter((name: string) => !!name);
                if (!cancelled) setSelectedTechs(validTechs);
            } catch (err) {
                console.error("Failed to load shared build", err);
            }
        };
        loadBuild();
        return () => {
            cancelled = true;
        };
    }, [setSelectedTechs]);
}

/** Import tech selection from Game Summary via navigation state */
function useImportedTechListLoader({
                                       techs,
                                       setSelectedTechs,
                                       setEra,
                                       setImportToast,
                                       setSelectedFaction,
                                   }: {
    techs: Map<string, Tech>;
    setSelectedTechs: (names: string[]) => void;
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

        const st = (location.state ?? null) as ImportedTechState | null;
        if (!st || st.source !== "gamesummary") return;

        const incoming = Array.isArray(st.techNames) ? st.techNames.filter(Boolean) : [];
        if (incoming.length === 0) return;

        appliedRef.current = true;

        // 1) Set faction if we can resolve it (prevents showing the wrong tech tree background)
        const resolvedFaction = resolveFactionFromHint(st.factionHint);
        if (resolvedFaction) {
            setSelectedFaction(resolvedFaction);
        }

        // 2) Match tech display names to current dataset
        const normToTechName = new Map<string, string>();
        for (const t of techs.values()) {
            const key = normalizeForMatch(t.name);
            if (key && !normToTechName.has(key)) normToTechName.set(key, t.name);
        }

        const matched: string[] = [];
        const missing: string[] = [];

        for (const name of incoming) {
            const norm = normalizeForMatch(name);
            const resolved = normToTechName.get(norm);
            if (resolved) matched.push(resolved);
            else missing.push(name);
        }

        setSelectedTechs(matched);

        // Jump to era of first matched tech
        if (matched.length > 0) {
            const first = Array.from(techs.values()).find((t) => t.name === matched[0]);
            if (first?.era) setEra(first.era);
        }

        // Tiny toast (auto-hide)
        if (missing.length > 0) {
            setImportToast(`Loaded ${matched.length}/${incoming.length} techs (missing ${missing.length}).`);
            window.setTimeout(() => setImportToast(null), 4500);
        } else {
            setImportToast(`Loaded ${matched.length} techs.`);
            window.setTimeout(() => setImportToast(null), 2500);
        }

        // Clear navigation state so back/forward doesn't re-apply
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

/** Handles deep-link routing for /tech?faction=X&tech=Y */
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
    setSelectedTechs: (names: string[]) => void;
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

        // 1️⃣ Select faction
        const fi = {
            isMajor: true,
            enumFaction: factionParam.toUpperCase() as any,
            minorName: null,
            uiLabel: factionParam.toLowerCase(),
        };

        if (!selectedFaction.isMajor || selectedFaction.enumFaction !== fi.enumFaction) {
            setSelectedFaction(fi);
        }

        // 2️⃣ Find and select tech
        const match = Array.from(techs.values()).find((t) => normalize(t.name) === normalize(techParam));

        if (match) {
            setSelectedTechs([match.name]);
            setEra(match.era);

            // ✅ Clean the URL silently (no reload)
            const newUrl = window.location.origin + "/tech";
            window.history.replaceState({}, "", newUrl);
        } else {
            console.warn("⚠️ No tech match found for", techParam);
        }
    }, [techs]);
}

/** Handles era progression logic and unlocks */
function useEraController(selectedTechObjects: Tech[]) {
    const [era, setEra] = useState(1);

    const handlePrevEra = useCallback(() => setEra((prev) => Math.max(1, prev - 1)), []);
    const handleNextEra = useCallback(() => setEra((prev) => Math.min(MAX_ERA, prev + 1)), []);

    const maxUnlockedEra = useMemo(() => {
        const eraCounts = Array(MAX_ERA).fill(0);
        selectedTechObjects.forEach((t) => {
            if (t.era >= 1 && t.era <= MAX_ERA) eraCounts[t.era - 1]++;
        });

        let unlocked = 1;
        for (let i = 2; i <= MAX_ERA; i++) {
            const required = ERA_THRESHOLDS[i];
            const totalSelectedPrev = eraCounts.slice(0, i - 1).reduce((a, b) => a + b, 0);
            if (totalSelectedPrev >= required) unlocked = i;
            else break;
        }
        return unlocked;
    }, [selectedTechObjects]);

    return { era, setEra, maxUnlockedEra, handleNextEra, handlePrevEra };
}