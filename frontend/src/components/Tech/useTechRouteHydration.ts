import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Faction, type FactionInfo, type Tech } from "@/types/dataTypes";
import { selectTechs, selectTechsByKey, useTechStore } from "@/stores/techStore";
import { selectSetSelectedTechs, useTechPlannerStore } from "@/stores/techPlannerStore";
import {
    selectSelectedFaction,
    selectSetSelectedFaction,
    useFactionSelectionStore,
} from "@/stores/factionSelectionStore";

type ImportedTechState = {
    source?: "gamesummary";
    techKeys?: string[];
    focusTechKey?: string | null;
    factionKeyHint?: string | null;
    empireIndex?: number;
    mode?: "global" | "empire";
};

type UseTechRouteHydrationArgs = {
    setEra: (era: number) => void;
    setImportToast: (msg: string | null) => void;
};

const normalizeTechLinkToken = (s: string) => String(s ?? "").toLowerCase().replace(/\s+/g, "_");

const cleanString = (x: unknown): string => (typeof x === "string" ? x.trim() : "");

export function resolveFactionFromKeyHint(hint: unknown): FactionInfo | null {
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

export function resolveImportedTechKeys(incomingTechKeys: unknown, techsByKey: Record<string, Tech>) {
    const incoming = (Array.isArray(incomingTechKeys) ? incomingTechKeys : [])
        .map(cleanString)
        .filter(Boolean);

    const resolvedTechKeys: string[] = [];
    let missingCount = 0;

    for (const techKey of incoming) {
        if (techsByKey[techKey]) resolvedTechKeys.push(techKey);
        else missingCount++;
    }

    return {
        incomingTechKeys: incoming,
        resolvedTechKeys,
        missingCount,
    };
}

export function formatImportedTechToast(resolvedCount: number, incomingCount: number, missingCount: number) {
    return missingCount > 0
        ? `Loaded ${resolvedCount}/${incomingCount} techs.`
        : `Loaded ${resolvedCount} techs.`;
}

export function resolveDeepLinkedTech(allTechs: Tech[], techParam: string): Tech | undefined {
    return (
        allTechs.find((tech) => tech.techKey === techParam) ??
        allTechs.find((tech) => normalizeTechLinkToken(tech.name) === normalizeTechLinkToken(techParam))
    );
}

export function useTechRouteHydration({ setEra, setImportToast }: UseTechRouteHydrationArgs) {
    const location = useLocation();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const allTechs = useTechStore(selectTechs);
    const techsByKey = useTechStore(selectTechsByKey);
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const setSelectedFaction = useFactionSelectionStore(selectSetSelectedFaction);
    const setSelectedTechs = useTechPlannerStore(selectSetSelectedTechs);

    const importedAppliedRef = useRef(false);
    const deepLinkAppliedRef = useRef(false);

    useEffect(() => {
        if (importedAppliedRef.current) return;
        if (Object.keys(techsByKey).length === 0) return;

        const importedState = (location.state ?? null) as ImportedTechState | null;
        if (!importedState || importedState.source !== "gamesummary") return;

        const { incomingTechKeys, resolvedTechKeys, missingCount } = resolveImportedTechKeys(
            importedState.techKeys,
            techsByKey
        );

        if (incomingTechKeys.length === 0) return;

        importedAppliedRef.current = true;

        const resolvedFaction = resolveFactionFromKeyHint(importedState.factionKeyHint);
        if (resolvedFaction) setSelectedFaction(resolvedFaction);

        setSelectedTechs(resolvedTechKeys);

        // Preserve existing summary import behavior: always land on Era 1.
        setEra(1);

        setImportToast(formatImportedTechToast(resolvedTechKeys.length, incomingTechKeys.length, missingCount));
        window.setTimeout(() => setImportToast(null), missingCount > 0 ? 4500 : 2500);

        navigate(location.pathname + location.search, { replace: true, state: null });
    }, [
        techsByKey,
        location.state,
        location.pathname,
        location.search,
        navigate,
        setSelectedFaction,
        setSelectedTechs,
        setEra,
        setImportToast,
    ]);

    useEffect(() => {
        if (deepLinkAppliedRef.current) return;
        if (allTechs.length === 0) return;

        const factionParam = params.get("faction");
        const techParam = params.get("tech");
        if (!factionParam || !techParam) return;

        deepLinkAppliedRef.current = true;

        const deepLinkFaction: FactionInfo = {
            isMajor: true,
            enumFaction: factionParam.toUpperCase() as Faction,
            minorName: null,
            uiLabel: factionParam.toLowerCase(),
        };

        if (!selectedFaction?.isMajor || selectedFaction.enumFaction !== deepLinkFaction.enumFaction) {
            setSelectedFaction(deepLinkFaction);
        }

        const matchedTech = resolveDeepLinkedTech(allTechs, techParam);

        if (matchedTech) {
            setSelectedTechs([matchedTech.techKey]);
            setEra(matchedTech.era);

            const newUrl = window.location.origin + "/tech";
            window.history.replaceState({}, "", newUrl);
        }
    }, [params, allTechs, selectedFaction, setSelectedFaction, setSelectedTechs, setEra]);
}
