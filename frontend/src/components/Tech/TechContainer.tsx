import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TechTree from "@/components/Tech/TechTree";
import SpreadSheetView from "@/components/Tech/views/SpreadSheetView";
import { ERA_THRESHOLDS, Faction, Tech } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import "./TechContainer.css";

const MAX_ERA = 6;

const normalize = (s: string) => String(s ?? "").toLowerCase().replace(/\s+/g, "_");

const normalizeForMatch = (s: string) => {
    return String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/[^a-z0-9\s']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

type ImportedTechState = {
    source?: "gamesummary";
    techNames?: string[];
    techDefs?: string[];
    empireIndex?: number;
    mode?: "global" | "empire";
    factionHint?: string | null;
};

function resolveFactionFromHint(hint: unknown) {
    if (typeof hint !== "string") return null;
    const h = hint.trim();
    if (!h) return null;

    const norm = h.toLowerCase().replace(/[\s_-]+/g, "");

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
    const { selectedFaction, setSelectedFaction, selectedTechs, setSelectedTechs, techs } = useGameData();

    const [firstEraLoaded, setFirstEraLoaded] = useState(false);
    const [importToast, setImportToast] = useState<string | null>(null);

    useSharedBuildLoader(setSelectedTechs);

    const selectedTechObjects = useMemo(() => {
        const techKeySet = new Set(selectedTechs);
        return Array.from(techs.values()).filter((t) => techKeySet.has(t.techKey));
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
        const img = new Image();
        img.src = `/graphics/techEraScreens/${selectedFaction.uiLabel.toLowerCase()}_era_1.webp`;
        img.onload = () => setFirstEraLoaded(true);
        img.onerror = () => setFirstEraLoaded(true);
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [selectedFaction]);

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
                        onEraChange={(dir) => (dir === "next" ? eraController.handleNextEra() : eraController.handlePrevEra())}
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
                const validTechs = Array.isArray(data.techIds) ? data.techIds.filter((k: string) => !!k) : [];
                if (!cancelled) setSelectedTechs(validTechs);
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

        const st = (location.state ?? null) as ImportedTechState | null;
        if (!st || st.source !== "gamesummary") return;

        const incoming = Array.isArray(st.techNames) ? st.techNames.filter(Boolean) : [];
        if (incoming.length === 0) return;

        appliedRef.current = true;

        const resolvedFaction = resolveFactionFromHint(st.factionHint);
        if (resolvedFaction) setSelectedFaction(resolvedFaction);

        const normToTechKey = new Map<string, string>();
        for (const t of techs.values()) {
            const key = normalizeForMatch(t.name);
            if (key && !normToTechKey.has(key)) normToTechKey.set(key, t.techKey);
        }

        const matched: string[] = [];
        const missing: string[] = [];

        for (const name of incoming) {
            const norm = normalizeForMatch(name);
            const resolved = normToTechKey.get(norm);
            if (resolved) matched.push(resolved);
            else missing.push(name);
        }

        setSelectedTechs(matched);

        if (matched.length > 0) {
            const first = techs.get(matched[0]);
            if (first?.era) setEra(first.era);
        }

        if (missing.length > 0) {
            setImportToast(`Loaded ${matched.length}/${incoming.length} techs (missing ${missing.length}).`);
            window.setTimeout(() => setImportToast(null), 4500);
        } else {
            setImportToast(`Loaded ${matched.length} techs.`);
            window.setTimeout(() => setImportToast(null), 2500);
        }

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

        const fi = {
            isMajor: true,
            enumFaction: factionParam.toUpperCase() as any,
            minorName: null,
            uiLabel: factionParam.toLowerCase(),
        };

        if (!selectedFaction?.isMajor || selectedFaction.enumFaction !== fi.enumFaction) {
            setSelectedFaction(fi);
        }

        const match =
            Array.from(techs.values()).find((t) => t.techKey === techParam) ??
            // optional backward-compat: old links used name-ish
            Array.from(techs.values()).find((t) => normalize(t.name) === normalize(techParam));

        if (match) {
            setSelectedTechs([match.techKey]);
            setEra(match.era);

            const newUrl = window.location.origin + "/tech";
            window.history.replaceState({}, "", newUrl);
        } else {
            console.warn("⚠️ No tech match found for", techParam);
        }
    }, [params, techs, selectedFaction, setSelectedFaction, setSelectedTechs, setEra]);
}

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