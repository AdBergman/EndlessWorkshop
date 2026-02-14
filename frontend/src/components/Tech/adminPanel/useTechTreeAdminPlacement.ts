import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Tech } from "@/types/dataTypes";
import { apiClient, TechAdminDto } from "@/api/apiClient";
import type { AdminPlacementDraft, AdminStagedRow, StepMode } from "@/components/Tech/adminPanel/adminPlacementTypes";

const ADMIN_TOKEN_STORAGE_KEY = "ewshop_admin_token";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round4 = (n: number) => Math.round(n * 10000) / 10000;

// Must match TechNode.tsx
const TECHNODE_BOX_SIZE_PCT = 4.95;
// Must match TechNode.tsx transform: translate(3%, 3%)
const TECHNODE_TRANSLATE_PCT = 0.03;

type Args = {
    isAdminMode: boolean;
    wrapperRef: RefObject<HTMLDivElement | null>;
    allTechs: Tech[];
    refreshTechs: () => Promise<void>;
};

export function useTechTreeAdminPlacement({ isAdminMode, wrapperRef, allTechs, refreshTechs }: Args) {
    const [activeTechKey, setActiveTechKey] = useState<string | null>(null);

    // staged edits keyed by techKey
    const [stagedEdits, setStagedEdits] = useState<Map<string, TechAdminDto>>(new Map());
    const [pendingSaved, setPendingSaved] = useState<Map<string, TechAdminDto>>(new Map());

    const [repositionEnabled, setRepositionEnabled] = useState(false);

    const [stepMode, setStepMode] = useState<StepMode>("pct");
    const [stepPct, setStepPct] = useState(0.2);
    const [stepPx, setStepPx] = useState(10);

    const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ kind: "idle" | "ok" | "err"; text: string } | undefined>(undefined);

    const techByKey = useMemo(() => {
        const m = new Map<string, Tech>();
        for (const t of allTechs) {
            const k = (t.techKey ?? "").trim();
            if (k) m.set(k, t);
        }
        return m;
    }, [allTechs]);

    const effectiveTechByKey = useMemo(() => {
        if (!isAdminMode) return null;
        if (stagedEdits.size === 0 && pendingSaved.size === 0) return null;

        const m = new Map<string, Tech>();
        for (const base of allTechs) {
            const k = (base.techKey ?? "").trim();
            if (!k) continue;

            const edit = stagedEdits.get(k) ?? pendingSaved.get(k);
            if (!edit) continue;

            m.set(k, {
                ...base,
                era: edit.era,
                coords: { xPct: edit.coords.xPct, yPct: edit.coords.yPct },
            });
        }
        return m;
    }, [isAdminMode, stagedEdits, pendingSaved, allTechs]);

    useEffect(() => {
        if (isAdminMode) return;

        setActiveTechKey(null);
        setRepositionEnabled(false);
        setSaveMessage(undefined);
        setIsSaving(false);
        setStagedEdits(new Map());
        setPendingSaved(new Map());
    }, [isAdminMode]);

    const upsertEdit = (base: Tech, next: Partial<TechAdminDto>) => {
        const techKey = (base.techKey ?? "").trim();
        if (!techKey) return;

        setStagedEdits((prev) => {
            const copy = new Map(prev);

            const current =
                prev.get(techKey) ??
                ({
                    techKey,
                    // optional for server / summaries, not identity
                    name: base.name,
                    type: base.type,
                    era: base.era,
                    coords: { xPct: base.coords.xPct, yPct: base.coords.yPct },
                } satisfies TechAdminDto);

            const merged: TechAdminDto = {
                ...current,
                ...next,
                techKey,
                coords: {
                    xPct: next.coords?.xPct ?? current.coords.xPct,
                    yPct: next.coords?.yPct ?? current.coords.yPct,
                },
            };

            merged.era = clamp(Math.trunc(merged.era), 1, 6);
            merged.coords.xPct = round4(clamp(merged.coords.xPct, 0, 100));
            merged.coords.yPct = round4(clamp(merged.coords.yPct, 0, 100));

            copy.set(techKey, merged);
            return copy;
        });
    };

    const removeEdit = (techKey: string) => {
        const k = (techKey ?? "").trim();
        if (!k) return;

        setStagedEdits((prev) => {
            const copy = new Map(prev);
            copy.delete(k);
            return copy;
        });

        setPendingSaved((prev) => {
            if (!prev.has(k)) return prev;
            const copy = new Map(prev);
            copy.delete(k);
            return copy;
        });
    };

    const handleSetToken = (token: string) => {
        const t = token.trim();
        if (!t) return;
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, t);
        setAdminToken(t);
        setSaveMessage(undefined);
    };

    const activeDraft: AdminPlacementDraft | null = useMemo(() => {
        if (!activeTechKey) return null;
        const base = techByKey.get(activeTechKey);
        if (!base) return null;

        const ed = stagedEdits.get(activeTechKey) ?? pendingSaved.get(activeTechKey);

        return {
            techKey: base.techKey, // logic only; panel doesn't render it
            name: base.name,       // display
            type: base.type,
            era: ed ? ed.era : base.era,
            coords: ed ? { ...ed.coords } : { ...base.coords },
        };
    }, [activeTechKey, techByKey, stagedEdits, pendingSaved]);

    // avoid stale closure in keydown
    const activeDraftRef = useRef<AdminPlacementDraft | null>(null);
    useEffect(() => {
        activeDraftRef.current = activeDraft;
    }, [activeDraft]);

    const activeTechKeyRef = useRef<string | null>(null);
    useEffect(() => {
        activeTechKeyRef.current = activeTechKey;
    }, [activeTechKey]);

    const handleChangeEra = (nextEra: number) => {
        const k = activeTechKeyRef.current;
        if (!k) return;
        const base = techByKey.get(k);
        if (!base) return;
        upsertEdit(base, { era: clamp(nextEra, 1, 6) });
    };

    const handleChangeCoords = (coords: { xPct: number; yPct: number }) => {
        const k = activeTechKeyRef.current;
        if (!k) return;
        const base = techByKey.get(k);
        if (!base) return;
        upsertEdit(base, { coords });
    };

    const toggleReposition = () => {
        if (!activeTechKeyRef.current) return;
        setRepositionEnabled((v) => !v);
    };

    const pxToPctDelta = (dxPx: number, dyPx: number) => {
        const wrapper = wrapperRef.current;
        const rect = wrapper?.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return { dxPct: 0, dyPct: 0 };
        return {
            dxPct: (dxPx / rect.width) * 100,
            dyPct: (dyPx / rect.height) * 100,
        };
    };

    const centerCoordsFromClickPct = (clickXPct: number, clickYPct: number) => {
        const half = TECHNODE_BOX_SIZE_PCT / 2;
        const translate = TECHNODE_BOX_SIZE_PCT * TECHNODE_TRANSLATE_PCT;
        return {
            xPct: clickXPct - half - translate,
            yPct: clickYPct - half - translate,
        };
    };

    const onWrapperClick = (e: any) => {
        if (!isAdminMode) return;
        if (!repositionEnabled) return;

        const k = activeTechKeyRef.current;
        if (!k) return;

        const base = techByKey.get(k);
        if (!base) return;

        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const rawXPct = (clickX / rect.width) * 100;
        const rawYPct = (clickY / rect.height) * 100;

        upsertEdit(base, { coords: centerCoordsFromClickPct(rawXPct, rawYPct) });
        setRepositionEnabled(false);
        setSaveMessage(undefined);
    };

    useEffect(() => {
        if (!isAdminMode) return;

        const onKeyDown = (ev: KeyboardEvent) => {
            const draft = activeDraftRef.current;
            const k = activeTechKeyRef.current;
            if (!draft || !k) return;
            if (repositionEnabled) return;

            const target = ev.target as HTMLElement | null;
            const tag = target?.tagName?.toLowerCase();
            const isTyping = tag === "input" || tag === "textarea" || tag === "select" || (target as any)?.isContentEditable;
            if (isTyping) return;

            const key = ev.key;
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

            ev.preventDefault();

            const base = techByKey.get(k);
            if (!base) return;

            const mult = ev.shiftKey ? 5 : 1;

            let dxPct = 0;
            let dyPct = 0;

            if (stepMode === "pct") {
                const s = stepPct * mult;
                if (key === "ArrowLeft") dxPct = -s;
                if (key === "ArrowRight") dxPct = s;
                if (key === "ArrowUp") dyPct = -s;
                if (key === "ArrowDown") dyPct = s;
            } else {
                const px = stepPx * mult;
                const d =
                    key === "ArrowLeft"
                        ? pxToPctDelta(-px, 0)
                        : key === "ArrowRight"
                            ? pxToPctDelta(px, 0)
                            : key === "ArrowUp"
                                ? pxToPctDelta(0, -px)
                                : pxToPctDelta(0, px);
                dxPct = d.dxPct;
                dyPct = d.dyPct;
            }

            upsertEdit(base, { coords: { xPct: draft.coords.xPct + dxPct, yPct: draft.coords.yPct + dyPct } });
            setSaveMessage(undefined);
        };

        window.addEventListener("keydown", onKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", onKeyDown as any);
    }, [isAdminMode, repositionEnabled, stepMode, stepPct, stepPx, techByKey, wrapperRef]);

    const stagedRows: AdminStagedRow[] = useMemo(() => {
        const rows: AdminStagedRow[] = [];

        for (const ed of stagedEdits.values()) {
            const base = techByKey.get(ed.techKey);
            const summary = base
                ? `(${round4(base.coords.xPct)}→${round4(ed.coords.xPct)}, ${round4(base.coords.yPct)}→${round4(ed.coords.yPct)} | ${base.era}→${ed.era})`
                : undefined;

            rows.push({
                techKey: ed.techKey,               // identity
                name: base?.name ?? ed.name ?? "", // display
                summary,
            });
        }

        rows.sort((a, b) => a.name.localeCompare(b.name));
        return rows;
    }, [stagedEdits, techByKey]);

    const handleUndoActive = () => {
        const k = activeTechKeyRef.current;
        if (!k) return;
        removeEdit(k);
        setSaveMessage(undefined);
    };

    const handleUndoStaged = (techKey: string) => {
        removeEdit(techKey);
        setSaveMessage(undefined);
    };

    const handleDiscardAll = () => {
        setStagedEdits(new Map());
        setSaveMessage(undefined);
    };

    const handleSave = async () => {
        if (stagedEdits.size === 0) return;

        const token = (adminToken || "").trim();
        if (!token) {
            setSaveMessage({ kind: "err", text: "Missing admin token. Paste it and press Set." });
            return;
        }

        const payload = Array.from(stagedEdits.values());

        setIsSaving(true);
        setSaveMessage(undefined);

        try {
            await apiClient.saveTechPlacementsAdmin(payload, token);

            setPendingSaved(new Map(stagedEdits));
            await refreshTechs();

            setStagedEdits(new Map());
            setPendingSaved(new Map());

            setSaveMessage({ kind: "ok", text: "Saved (204)." });
        } catch (err: any) {
            const msg = String(err?.message ?? err);
            if (msg.includes("status: 401")) setSaveMessage({ kind: "err", text: "401 Unauthorized." });
            else if (msg.includes("status: 403")) setSaveMessage({ kind: "err", text: "403 Forbidden." });
            else setSaveMessage({ kind: "err", text: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const onTechNodeClick = (techKey: string, shiftKey: boolean, toggleSelection: (techKey: string) => void) => {
        const k = (techKey ?? "").trim();
        if (!k) return;

        setActiveTechKey(k);
        setSaveMessage(undefined);
        if (shiftKey) toggleSelection(k);
    };

    const getEffectiveTech = (base: Tech): Tech => {
        const k = (base.techKey ?? "").trim();
        if (!k) return base;
        return effectiveTechByKey?.get(k) ?? base;
    };

    const panelProps = {
        isOpen: isAdminMode,
        tokenIsSet: !!(adminToken || "").trim(),
        onSetToken: handleSetToken,

        activeDraft,
        onChangeEra: handleChangeEra,
        onChangeCoords: handleChangeCoords,

        onUndoActive: handleUndoActive,
        onToggleReposition: toggleReposition,
        repositionEnabled,

        stepMode,
        stepPct,
        stepPx,
        onChangeStepMode: setStepMode,
        onChangeStepPct: setStepPct,
        onChangeStepPx: setStepPx,

        stagedCount: stagedEdits.size,
        stagedRows,
        onFocusStaged: (techKey: string) => setActiveTechKey(techKey),
        onUndoStaged: handleUndoStaged,
        onDiscardAll: handleDiscardAll,

        saveDisabled: isSaving || stagedEdits.size === 0,
        saveLabel: isSaving ? "Saving..." : "Save",
        saveMessage,
        onSave: handleSave,
    };

    const wrapperCursor = isAdminMode && repositionEnabled ? "crosshair" : undefined;

    return {
        getEffectiveTech,
        onTechNodeClick,
        onWrapperClick,
        wrapperCursor,
        panelProps,
    };
}