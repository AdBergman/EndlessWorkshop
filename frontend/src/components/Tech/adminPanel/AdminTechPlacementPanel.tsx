import React, { useEffect, useMemo, useRef, useState } from "react";
import "./AdminTechPlacementPanel.css";

export type StepMode = "pct" | "px";

export type AdminCoords = { xPct: number; yPct: number };

export type AdminPlacementDraft = {
    name: string;
    type: string;
    era: number; // 1..6
    coords: AdminCoords; // ALWAYS stored as %
};

export type AdminStagedRow = {
    name: string;
    summary?: string; // optional display string like "(12.3→12.5, 44.0→43.8 | 1→2)"
};

type Props = {
    isOpen: boolean;

    // Token (A1)
    tokenIsSet: boolean;
    onSetToken: (token: string) => void;

    // Active tech draft (read/write)
    activeDraft: AdminPlacementDraft | null;
    onChangeEra: (era: number) => void;
    onChangeCoords: (coords: AdminCoords) => void;

    // Actions
    onUndoActive: () => void;
    onToggleReposition: () => void;
    repositionEnabled: boolean;

    // Nudging
    stepMode: StepMode;
    stepPct: number; // e.g. 0.2
    stepPx: number; // e.g. 10
    onChangeStepMode: (mode: StepMode) => void;
    onChangeStepPct: (pct: number) => void;
    onChangeStepPx: (px: number) => void;

    // Optional: if you want to show “Shift = 5x” and also wire it later
    shiftMultiplierLabel?: string; // default "Shift = 5×"

    // Staged edits
    stagedCount: number;
    stagedRows: AdminStagedRow[];
    onFocusStaged: (techName: string) => void;
    onUndoStaged: (techName: string) => void;
    onDiscardAll: () => void;

    // Save
    saveDisabled: boolean;
    saveLabel: string; // "Save" / "Saving..."
    saveMessage?: { kind: "idle" | "ok" | "err"; text: string };
    onSave: () => void;

    // Optional: let parent reset panel position on faction/route changes
    initialPosition?: { x: number; y: number };
};

const clampInt = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.trunc(v)));
const toNumberOr = (s: string, fallback: number) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
};

const DEFAULT_POS = { x: 18, y: 18 };

const DEFAULT_SHIFT_LABEL = "Shift + Arrow = 5×";

export default function AdminTechPlacementPanel({
                                                    isOpen,

                                                    tokenIsSet,
                                                    onSetToken,

                                                    activeDraft,
                                                    onChangeEra,
                                                    onChangeCoords,

                                                    onUndoActive,
                                                    onToggleReposition,
                                                    repositionEnabled,

                                                    stepMode,
                                                    stepPct,
                                                    stepPx,
                                                    onChangeStepMode,
                                                    onChangeStepPct,
                                                    onChangeStepPx,

                                                    shiftMultiplierLabel = DEFAULT_SHIFT_LABEL,

                                                    stagedCount,
                                                    stagedRows,
                                                    onFocusStaged,
                                                    onUndoStaged,
                                                    onDiscardAll,

                                                    saveDisabled,
                                                    saveLabel,
                                                    saveMessage,
                                                    onSave,

                                                    initialPosition,
                                                }: Props) {
    const [pos, setPos] = useState<{ x: number; y: number }>(initialPosition ?? DEFAULT_POS);
    const [tokenInput, setTokenInput] = useState("");

    // Dragging state
    const dragRef = useRef<{ dragging: boolean; dx: number; dy: number }>({
        dragging: false,
        dx: 0,
        dy: 0,
    });

    useEffect(() => {
        if (!initialPosition) return;
        setPos(initialPosition);
    }, [initialPosition?.x, initialPosition?.y]); // eslint-disable-line react-hooks/exhaustive-deps

    const eraValue = activeDraft?.era ?? 1;
    const xValue = activeDraft?.coords.xPct ?? 0;
    const yValue = activeDraft?.coords.yPct ?? 0;

    const coordsCsv = useMemo(() => {
        if (!activeDraft) return "";
        return `${activeDraft.coords.xPct},${activeDraft.coords.yPct}`;
    }, [activeDraft]);

    const onPointerDownHeader = (e: React.PointerEvent) => {
        const el = e.currentTarget as HTMLElement;
        el.setPointerCapture(e.pointerId);

        dragRef.current.dragging = true;
        dragRef.current.dx = e.clientX - pos.x;
        dragRef.current.dy = e.clientY - pos.y;
    };

    const onPointerMoveHeader = (e: React.PointerEvent) => {
        if (!dragRef.current.dragging) return;

        const nextX = e.clientX - dragRef.current.dx;
        const nextY = e.clientY - dragRef.current.dy;

        // Keep panel on screen (rough clamp)
        const maxX = Math.max(0, window.innerWidth - 340);
        const maxY = Math.max(0, window.innerHeight - 140);

        setPos({
            x: Math.max(0, Math.min(maxX, nextX)),
            y: Math.max(0, Math.min(maxY, nextY)),
        });
    };

    const onPointerUpHeader = (e: React.PointerEvent) => {
        dragRef.current.dragging = false;
        try {
            const el = e.currentTarget as HTMLElement;
            el.releasePointerCapture(e.pointerId);
        } catch {}
    };

    if (!isOpen) return null;

    return (
        <aside className="admin-panel" style={{ left: pos.x, top: pos.y }}>
            <header
                className="admin-panel__header"
                onPointerDown={onPointerDownHeader}
                onPointerMove={onPointerMoveHeader}
                onPointerUp={onPointerUpHeader}
            >
                <div className="admin-panel__title">Admin Placement</div>
                <div className="admin-panel__subtitle">drag me</div>
            </header>

            <div className="admin-panel__body">
                {/* Token */}
                {!tokenIsSet ? (
                    <div className="admin-panel__row admin-panel__token">
                        <input
                            className="admin-input"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="X-Admin-Token"
                            spellCheck={false}
                        />
                        <button
                            className="admin-button admin-button--primary"
                            onClick={() => {
                                const t = tokenInput.trim();
                                if (!t) return;
                                onSetToken(t);
                                setTokenInput("");
                            }}
                        >
                            Set
                        </button>
                    </div>
                ) : (
                    <div className="admin-panel__hint">Token: set (localStorage)</div>
                )}

                {/* Active tech */}
                <section className="admin-card">
                    {activeDraft ? (
                        <>
                            <div className="admin-card__top">
                                <div className="admin-card__name">
                                    <div className="admin-card__nameText">{activeDraft.name}</div>
                                    <div className="admin-card__type">{activeDraft.type}</div>
                                </div>

                                <button className="admin-button" onClick={onUndoActive} title="Undo this tech">
                                    Undo
                                </button>
                            </div>

                            <div className="admin-grid2">
                                <label className="admin-field">
                                    <span className="admin-field__label">Era (1–6)</span>
                                    <input
                                        className="admin-input"
                                        type="number"
                                        min={1}
                                        max={6}
                                        value={eraValue}
                                        onChange={(e) => onChangeEra(clampInt(toNumberOr(e.target.value, eraValue), 1, 6))}
                                    />
                                </label>

                                <div className="admin-field admin-field--button">
                                    <span className="admin-field__label">Reposition</span>
                                    <button
                                        className={`admin-button ${repositionEnabled ? "admin-button--toggled" : ""}`}
                                        onClick={onToggleReposition}
                                        title="Enable, then click on the tree to place the node center"
                                    >
                                        {repositionEnabled ? "ON" : "Click-to-place"}
                                    </button>
                                </div>

                                <label className="admin-field">
                                    <span className="admin-field__label">xPct</span>
                                    <input
                                        className="admin-input"
                                        type="number"
                                        step={0.01}
                                        value={xValue}
                                        onChange={(e) => onChangeCoords({ xPct: toNumberOr(e.target.value, xValue), yPct: yValue })}
                                    />
                                </label>

                                <label className="admin-field">
                                    <span className="admin-field__label">yPct</span>
                                    <input
                                        className="admin-input"
                                        type="number"
                                        step={0.01}
                                        value={yValue}
                                        onChange={(e) => onChangeCoords({ xPct: xValue, yPct: toNumberOr(e.target.value, yValue) })}
                                    />
                                </label>
                            </div>

                            <div className="admin-panel__row admin-panel__copyRow">
                                <input className="admin-input admin-input--mono" value={coordsCsv} readOnly />
                                <button
                                    className="admin-button"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(coordsCsv);
                                        } catch {}
                                    }}
                                    title="Copy xPct,yPct"
                                >
                                    Copy
                                </button>
                                <button
                                    className="admin-button"
                                    onClick={async () => {
                                        try {
                                            const txt = await navigator.clipboard.readText();
                                            const parts = txt.split(",").map((p) => p.trim());
                                            if (parts.length < 2) return;
                                            const x = Number(parts[0]);
                                            const y = Number(parts[1]);
                                            if (!Number.isFinite(x) || !Number.isFinite(y)) return;
                                            onChangeCoords({ xPct: x, yPct: y });
                                        } catch {}
                                    }}
                                    title="Paste xPct,yPct"
                                >
                                    Paste
                                </button>
                            </div>

                            <div className="admin-divider" />

                            {/* Step controls */}
                            <div className="admin-grid2">
                                <label className="admin-field">
                                    <span className="admin-field__label">Step mode</span>
                                    <select
                                        className="admin-select"
                                        value={stepMode}
                                        onChange={(e) => onChangeStepMode(e.target.value as StepMode)}
                                    >
                                        <option value="pct">%</option>
                                        <option value="px">px</option>
                                    </select>
                                </label>

                                {stepMode === "pct" ? (
                                    <label className="admin-field">
                                        <span className="admin-field__label">Step (%)</span>
                                        <select
                                            className="admin-select"
                                            value={String(stepPct)}
                                            onChange={(e) => onChangeStepPct(Number(e.target.value))}
                                        >
                                            <option value="0.05">0.05</option>
                                            <option value="0.1">0.1</option>
                                            <option value="0.2">0.2</option>
                                            <option value="0.5">0.5</option>
                                            <option value="1">1</option>
                                        </select>
                                    </label>
                                ) : (
                                    <label className="admin-field">
                                        <span className="admin-field__label">Step (px)</span>
                                        <select
                                            className="admin-select"
                                            value={String(stepPx)}
                                            onChange={(e) => onChangeStepPx(Number(e.target.value))}
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </select>
                                    </label>
                                )}
                            </div>

                            <div className="admin-panel__hint">
                                Arrow keys nudge the active tech. {shiftMultiplierLabel}.
                            </div>
                        </>
                    ) : (
                        <div className="admin-panel__empty">
                            Click a tech node to edit placement.
                            <div className="admin-panel__emptySub">Era navigation can stay active while editing.</div>
                        </div>
                    )}
                </section>

                {/* Staged + Save */}
                <section className="admin-card">
                    <div className="admin-card__top">
                        <div className="admin-card__name">
                            <div className="admin-card__nameText">Staged edits</div>
                            <div className="admin-card__type">{stagedCount}</div>
                        </div>

                        <div className="admin-card__actions">
                            <button className="admin-button" onClick={onDiscardAll} disabled={stagedCount === 0}>
                                Discard all
                            </button>
                            <button
                                className="admin-button admin-button--primary"
                                onClick={onSave}
                                disabled={saveDisabled}
                                title="POST /api/admin/techs/placements"
                            >
                                {saveLabel}
                            </button>
                        </div>
                    </div>

                    {saveMessage && saveMessage.kind !== "idle" ? (
                        <div className={`admin-flash admin-flash--${saveMessage.kind}`}>{saveMessage.text}</div>
                    ) : null}

                    {stagedRows.length > 0 ? (
                        <div className="admin-list">
                            {stagedRows.map((row) => (
                                <div className="admin-list__row" key={row.name}>
                                    <div className="admin-list__left">
                                        <div className="admin-list__name">{row.name}</div>
                                        {row.summary ? <div className="admin-list__summary">{row.summary}</div> : null}
                                    </div>
                                    <div className="admin-list__right">
                                        <button className="admin-button" onClick={() => onFocusStaged(row.name)}>
                                            Focus
                                        </button>
                                        <button className="admin-button" onClick={() => onUndoStaged(row.name)}>
                                            Undo
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-panel__hint">No staged edits yet.</div>
                    )}
                </section>

                {/* Small reminder */}
                <div className="admin-panel__footer">
                    Storage format: <span className="admin-mono">coords.xPct / coords.yPct</span> (always %)
                </div>
            </div>
        </aside>
    );
}