import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Tech } from "@/types/dataTypes";
import { apiClient, TechAdminDto } from "@/api/apiClient";
import type {
    AdminPlacementDraft,
    AdminStagedRow,
    StepMode,
} from "@/components/Tech/adminPanel/AdminTechPlacementPanel";

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
    const [activeTechName, setActiveTechName] = useState<string | null>(null);
    const [stagedEdits, setStagedEdits] = useState<Map<string, TechAdminDto>>(new Map());

    /**
     * Keeps the UI stable immediately after Save:
     * - we copy stagedEdits into pendingSaved
     * - refreshTechs updates the base list
     * - then we clear pendingSaved
     *
     * This prevents "snapback" even if refreshTechs is briefly stale.
     */
    const [pendingSaved, setPendingSaved] = useState<Map<string, TechAdminDto>>(new Map());

    const [repositionEnabled, setRepositionEnabled] = useState(false);

    const [stepMode, setStepMode] = useState<StepMode>("pct");
    const [stepPct, setStepPct] = useState(0.2);
    const [stepPx, setStepPx] = useState(10);

    const [adminToken, setAdminToken] = useState<string>(
        () => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? ""
    );
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<
        { kind: "idle" | "ok" | "err"; text: string } | undefined
    >(undefined);

    const techByName = useMemo(() => {
        const m = new Map<string, Tech>();
        for (const t of allTechs) m.set(t.name, t);
        return m;
    }, [allTechs]);

    /**
     * Effective tech map lets TechTree render admin preview immediately.
     * We render from:
     *  - stagedEdits (current unsaved edits)
     *  - pendingSaved (just-saved edits while refresh is happening)
     */
    const effectiveTechByName = useMemo(() => {
        if (!isAdminMode) return null;
        if (stagedEdits.size === 0 && pendingSaved.size === 0) return null;

        const m = new Map<string, Tech>();
        for (const base of allTechs) {
            const edit = stagedEdits.get(base.name) ?? pendingSaved.get(base.name);
            if (!edit) continue;
            m.set(base.name, {
                ...base,
                era: edit.era,
                coords: { xPct: edit.coords.xPct, yPct: edit.coords.yPct },
            });
        }
        return m;
    }, [isAdminMode, stagedEdits, pendingSaved, allTechs]);

    useEffect(() => {
        if (isAdminMode) return;

        setActiveTechName(null);
        setRepositionEnabled(false);
        setSaveMessage(undefined);
        setIsSaving(false);

        // Cleanup any preview leftovers when leaving admin mode
        setStagedEdits(new Map());
        setPendingSaved(new Map());
    }, [isAdminMode]);

    const upsertEdit = (base: Tech, next: Partial<TechAdminDto>) => {
        setStagedEdits((prev) => {
            const copy = new Map(prev);
            const current =
                prev.get(base.name) ??
                ({
                    name: base.name,
                    type: base.type,
                    era: base.era,
                    coords: { xPct: base.coords.xPct, yPct: base.coords.yPct },
                } satisfies TechAdminDto);

            const merged: TechAdminDto = {
                ...current,
                ...next,
                coords: {
                    xPct: next.coords?.xPct ?? current.coords.xPct,
                    yPct: next.coords?.yPct ?? current.coords.yPct,
                },
            };

            merged.era = clamp(Math.trunc(merged.era), 1, 6);
            merged.coords.xPct = round4(clamp(merged.coords.xPct, 0, 100));
            merged.coords.yPct = round4(clamp(merged.coords.yPct, 0, 100));

            copy.set(base.name, merged);
            return copy;
        });
    };

    const removeEdit = (name: string) => {
        setStagedEdits((prev) => {
            const copy = new Map(prev);
            copy.delete(name);
            return copy;
        });

        // If it was in pendingSaved too, remove there as well (rare but safe)
        setPendingSaved((prev) => {
            if (!prev.has(name)) return prev;
            const copy = new Map(prev);
            copy.delete(name);
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
        if (!activeTechName) return null;
        const base = techByName.get(activeTechName);
        if (!base) return null;

        const ed = stagedEdits.get(activeTechName) ?? pendingSaved.get(activeTechName);

        return {
            name: base.name,
            type: base.type,
            era: ed ? ed.era : base.era,
            coords: ed ? { ...ed.coords } : { ...base.coords },
        };
    }, [activeTechName, techByName, stagedEdits, pendingSaved]);

    /**
     * Keydown handler must read latest draft to avoid stale closure.
     */
    const activeDraftRef = useRef<AdminPlacementDraft | null>(null);
    useEffect(() => {
        activeDraftRef.current = activeDraft;
    }, [activeDraft]);

    const handleChangeEra = (nextEra: number) => {
        if (!activeTechName) return;
        const base = techByName.get(activeTechName);
        if (!base) return;
        upsertEdit(base, { era: clamp(nextEra, 1, 6) });
    };

    const handleChangeCoords = (coords: { xPct: number; yPct: number }) => {
        if (!activeTechName) return;
        const base = techByName.get(activeTechName);
        if (!base) return;
        upsertEdit(base, { coords });
    };

    const toggleReposition = () => {
        if (!activeTechName) return;
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
        if (!activeTechName) return;

        const base = techByName.get(activeTechName);
        if (!base) return;

        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const rawXPct = (clickX / rect.width) * 100;
        const rawYPct = (clickY / rect.height) * 100;

        const centered = centerCoordsFromClickPct(rawXPct, rawYPct);

        upsertEdit(base, { coords: centered });
        setRepositionEnabled(false);
        setSaveMessage(undefined);
    };

    useEffect(() => {
        if (!isAdminMode) return;

        const onKeyDown = (ev: KeyboardEvent) => {
            const draft = activeDraftRef.current;
            if (!draft) return;
            if (repositionEnabled) return;

            const target = ev.target as HTMLElement | null;
            const tag = target?.tagName?.toLowerCase();
            const isTyping =
                tag === "input" ||
                tag === "textarea" ||
                tag === "select" ||
                (target as any)?.isContentEditable;

            if (isTyping) return;

            const key = ev.key;
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

            ev.preventDefault();

            const base = techByName.get(draft.name);
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

            const next = {
                xPct: draft.coords.xPct + dxPct,
                yPct: draft.coords.yPct + dyPct,
            };

            upsertEdit(base, { coords: next });
            setSaveMessage(undefined);
        };

        window.addEventListener("keydown", onKeyDown, { passive: false });
        return () => window.removeEventListener("keydown", onKeyDown as any);
        // techByName is stable via memo; wrapperRef stable; step values included.
    }, [isAdminMode, repositionEnabled, stepMode, stepPct, stepPx, techByName, wrapperRef]);

    const stagedRows: AdminStagedRow[] = useMemo(() => {
        const rows: AdminStagedRow[] = [];
        for (const ed of stagedEdits.values()) {
            const orig = techByName.get(ed.name);
            const summary = orig
                ? `(${round4(orig.coords.xPct)}→${round4(ed.coords.xPct)}, ${round4(orig.coords.yPct)}→${round4(
                    ed.coords.yPct
                )} | ${orig.era}→${ed.era})`
                : undefined;
            rows.push({ name: ed.name, summary });
        }
        rows.sort((a, b) => a.name.localeCompare(b.name));
        return rows;
    }, [stagedEdits, techByName]);

    const handleUndoActive = () => {
        if (!activeTechName) return;
        removeEdit(activeTechName);
        setSaveMessage(undefined);
    };

    const handleUndoStaged = (name: string) => {
        removeEdit(name);
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

        // Snapshot payload (avoid reading mutable state during async)
        const payload = Array.from(stagedEdits.values());

        setIsSaving(true);
        setSaveMessage(undefined);

        try {
            await apiClient.saveTechPlacementsAdmin(payload, token);

            // Keep UI stable immediately after save.
            // (Don't clear stagedEdits yet.)
            setPendingSaved(new Map(stagedEdits));

            // Refresh base tech list so the saved coords become the new truth.
            await refreshTechs();

            // Now we can clear staged edits (and the temporary preview map)
            setStagedEdits(new Map());
            setPendingSaved(new Map());

            setSaveMessage({ kind: "ok", text: "Saved (204)." });
        } catch (err: any) {
            const msg = String(err?.message ?? err);
            if (msg.includes("status: 401"))
                setSaveMessage({ kind: "err", text: "401 Unauthorized. Token missing or not sent." });
            else if (msg.includes("status: 403"))
                setSaveMessage({ kind: "err", text: "403 Forbidden. Wrong token or admin disabled on server." });
            else setSaveMessage({ kind: "err", text: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const onTechNodeClick = (techName: string, shiftKey: boolean, toggleSelection: (name: string) => void) => {
        setActiveTechName(techName);
        setSaveMessage(undefined);
        if (shiftKey) toggleSelection(techName);
    };

    const getEffectiveTech = (base: Tech): Tech => effectiveTechByName?.get(base.name) ?? base;

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
        onFocusStaged: (name: string) => setActiveTechName(name),
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