import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import "../GameSummary.css";
import "../TechProgress.css";

import type { TechOrderEntry } from "@/types/endGameReport";
import { EMPIRE_COLORS } from "./empireStats.helpers";
import { buildEmpireMeta, groupTechOrderEntries, type EmpireMeta } from "./techProgress.helpers";

type Mode = "global" | "empire";

function displayLabel(e: TechOrderEntry): string {
    const dn = e.technologyDisplayName;
    if (dn && dn.startsWith("%")) return e.technologyDefinitionName;
    return dn || e.technologyDefinitionName;
}

function empireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

function tokenizeFilter(input: string): string[] {
    // Token-based, case-insensitive, dynamic filter:
    // - trim
    // - split on whitespace
    // - remove empty tokens
    return input
        .toLowerCase()
        .trim()
        .split(/\s+/g)
        .filter(Boolean);
}

function searchableTechText(e: TechOrderEntry): string {
    // Search display name first, fallback to definition name
    const label = displayLabel(e);
    const def = e.technologyDefinitionName ?? "";
    return `${label} ${def}`.toLowerCase();
}

function matchesTokenFilter(e: TechOrderEntry, tokens: string[]): boolean {
    if (tokens.length === 0) return true;
    const hay = searchableTechText(e);
    // All tokens must appear somewhere (order-independent)
    for (const t of tokens) {
        if (!hay.includes(t)) return false;
    }
    return true;
}

export default function TechProgressView() {
    const state = useEndGameReportStore((s) => s.state);

    const [mode, setMode] = useState<Mode>("global");
    const [selectedEmpire, setSelectedEmpire] = useState<number>(0);
    const [filterText, setFilterText] = useState<string>("");

    // Autosized filter input width (in px)
    const [filterWidthPx, setFilterWidthPx] = useState<number>(180);
    const filterSizerRef = useRef<HTMLSpanElement | null>(null);

    if (state.status !== "ok") {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Tech Progress</h3>
                <p className="gs-muted">No loaded report.</p>
            </div>
        );
    }

    const { report } = state;
    const techOrder = report.techOrder;

    if (!techOrder) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Tech Progress</h3>
                <p className="gs-muted">No techOrder section found in this report.</p>
            </div>
        );
    }

    const empireCount = techOrder.empireCount;
    const entries = techOrder.entries;

    const empireMeta: EmpireMeta[] = useMemo(() => {
        return buildEmpireMeta(empireCount, report.allStats);
    }, [empireCount, report.allStats]);

    const empireLabelByIndex = useMemo(() => {
        const m = new Map<number, EmpireMeta>();
        for (const e of empireMeta) m.set(e.idx, e);
        return m;
    }, [empireMeta]);

    const { maxTurn, groupedGlobal, groupedByEmpire } = useMemo(() => {
        return groupTechOrderEntries(entries);
    }, [entries]);

    const selectedEmpireIsValid = useMemo(() => {
        if (mode !== "empire") return true;
        return selectedEmpire >= 0 && selectedEmpire < empireCount;
    }, [mode, selectedEmpire, empireCount]);

    const turnsSorted = useMemo(() => {
        const turns =
            mode === "global"
                ? Array.from(groupedGlobal.keys())
                : Array.from(groupedByEmpire.get(selectedEmpire)?.keys() ?? []);
        return turns.sort((a, b) => a - b);
    }, [mode, groupedGlobal, groupedByEmpire, selectedEmpire]);

    const getEntriesForTurn = (turn: number): TechOrderEntry[] => {
        if (mode === "global") return groupedGlobal.get(turn) ?? [];
        return groupedByEmpire.get(selectedEmpire)?.get(turn) ?? [];
    };

    const filterTokens = useMemo(() => tokenizeFilter(filterText), [filterText]);

    const filteredTurns = useMemo(() => {
        // Build turns that have >=1 matching entry under the current filter.
        // Keep filtered entries per turn so rendering stays simple.
        const out: Array<{ turn: number; entries: TechOrderEntry[] }> = [];

        for (const turn of turnsSorted) {
            const list = getEntriesForTurn(turn);
            const filtered =
                filterTokens.length === 0 ? list : list.filter((e) => matchesTokenFilter(e, filterTokens));

            if (filtered.length > 0) out.push({ turn, entries: filtered });
        }

        return out;
        // Note: getEntriesForTurn is derived from mode/grouped maps; deps below cover it.
    }, [turnsSorted, filterTokens, mode, selectedEmpire, groupedGlobal, groupedByEmpire]);

    const matchCount = useMemo(() => {
        if (filterTokens.length === 0) return 0;
        let n = 0;
        for (const t of filteredTurns) n += t.entries.length;
        return n;
    }, [filterTokens, filteredTurns]);

    useLayoutEffect(() => {
        const el = filterSizerRef.current;
        if (!el) return;

        // Measure either current text or placeholder so the control never looks broken when empty.
        const measured = el.getBoundingClientRect().width;

        // + input horizontal padding (20) + space for clear button (28) + a tiny buffer.
        const raw = Math.ceil(measured) + 20 + 28 + 6;

        // Keep a stable, intentional baseline; only grow when needed.
        const min = 180;
        const max = 260;
        const next = Math.max(min, Math.min(max, raw));

        if (next !== filterWidthPx) setFilterWidthPx(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterText]);

    return (
        <div className="gs-panel">
            <div className="gs-row" style={{ justifyContent: "space-between" }}>
                <div className="gs-row" style={{ gap: 12 }}>
                    <h3 className="gs-h3">Tech Progress</h3>
                    <div className="gs-muted">
                        Entries: {techOrder.entryCount} • Empires: {empireCount} • Max turn: {maxTurn}
                    </div>
                </div>
            </div>

            <div className="gs-row gs-toolbar" style={{ justifyContent: "space-between" }}>
                <div className="gs-row" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="gs-row" style={{ gap: 8 }}>
                        <button
                            onClick={() => setMode("global")}
                            className={`gs-btn ${mode === "global" ? "gs-btn--active" : ""}`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => setMode("empire")}
                            className={`gs-btn ${mode === "empire" ? "gs-btn--active" : ""}`}
                        >
                            Per empire
                        </button>
                    </div>

                    {mode === "empire" && (
                        <div className="gs-row" style={{ gap: 8 }}>
                            <span className="gs-muted">Empire:</span>
                            <select
                                className="gs-select"
                                value={selectedEmpire}
                                onChange={(e) => setSelectedEmpire(Number(e.target.value))}
                            >
                                {empireMeta.map((em) => (
                                    <option key={em.idx} value={em.idx}>
                                        {em.labelLong}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Filter (token-based, case-insensitive) */}
                <div className="gs-filter" aria-label="Tech filter">
                    {filterTokens.length > 0 ? (
                        <span className="gs-filterMeta gs-muted">
                            {matchCount} match{matchCount === 1 ? "" : "es"}
                        </span>
                    ) : null}

                    <div className="gs-filterInputWrap">
                        <span ref={filterSizerRef} className="gs-filterSizer" aria-hidden="true">
                            {(filterText && filterText.length > 0 ? filterText : "Filter techs…") + " "}
                        </span>

                        <input
                            className="gs-input gs-filterInput"
                            style={{ width: filterWidthPx }}
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setFilterText("");
                            }}
                            placeholder="Filter techs…"
                            aria-label="Filter techs"
                        />

                        {filterText.trim().length > 0 ? (
                            <button
                                type="button"
                                className="gs-filterClear"
                                onClick={() => setFilterText("")}
                                aria-label="Clear filter"
                                title="Clear"
                            >
                                ×
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {mode === "global" && empireCount > 0 && (
                <div className="gs-section">
                    <div className="gs-row gs-wrap" style={{ gap: 10 }}>
                        {empireMeta.map((em) => (
                            <span
                                key={em.idx}
                                className="gs-pill"
                                style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
                            >
                                <span
                                    className="gs-pillPrefix"
                                    style={{
                                        color: empireColor(em.idx),
                                        fontWeight: em.isPlayer ? 600 : 500,
                                    }}
                                >
                                    E{em.idx}
                                </span>
                                <span>{em.labelShort}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {mode === "empire" && !selectedEmpireIsValid ? (
                <p className="gs-muted gs-section">Selected empire is out of range for this report.</p>
            ) : (
                <div className="gs-section">
                    {turnsSorted.length === 0 ? (
                        <p className="gs-muted">No tech entries to display.</p>
                    ) : filterTokens.length > 0 && filteredTurns.length === 0 ? (
                        <p className="gs-muted">No matching techs for “{filterText.trim()}”.</p>
                    ) : (
                        filteredTurns.map(({ turn, entries: turnEntries }) => {
                            return (
                                <div key={turn} className="gs-turnRow">
                                    <div className="gs-turnBadge">Turn {turn}</div>
                                    <div className="gs-pillWrap">
                                        {turnEntries.map((e, idx) => {
                                            const prefixColor = empireColor(e.empireIndex);
                                            const key = `${e.empireIndex}-${e.turn}-${e.technologyDefinitionName}-${idx}`;

                                            return (
                                                <span
                                                    key={key}
                                                    className="gs-pill"
                                                    title={
                                                        mode === "global"
                                                            ? empireLabelByIndex.get(e.empireIndex)?.labelLong ??
                                                            `E${e.empireIndex}`
                                                            : undefined
                                                    }
                                                >
                                                    {mode === "global" ? (
                                                        <span className="gs-pillPrefix" style={{ color: prefixColor }}>
                                                            E{e.empireIndex}
                                                        </span>
                                                    ) : null}
                                                    {displayLabel(e)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}