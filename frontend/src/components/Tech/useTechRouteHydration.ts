import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { type FactionInfo, type Tech } from "@/types/dataTypes";
import { factionInfoForKey, factionIdentityToken } from "@/utils/factionIdentity";
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

    return factionInfoForKey(raw);
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

        const deepLinkFaction = factionInfoForKey(factionParam);
        if (!selectedFaction?.isMajor || factionIdentityToken(selectedFaction.factionKey ?? selectedFaction.enumFaction) !== factionIdentityToken(deepLinkFaction.factionKey)) {
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
