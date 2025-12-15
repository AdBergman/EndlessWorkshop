import React, { useMemo, useState } from "react";
import { TechOrderEntryV1 } from "@/types/endGameReport";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import "../GameSummary.css";
import { EMPIRE_COLORS } from "./empireStats.helpers";
import { buildEmpireMeta, EmpireMeta, groupTechOrderEntries } from "./techProgress.helpers";

type Mode = "global" | "empire";

function displayLabel(e: TechOrderEntryV1): string {
    const dn = e.technologyDisplayName;
    if (dn && dn.startsWith("%")) return e.technologyDefinitionName;
    return dn || e.technologyDefinitionName;
}

function empireColor(idx: number): string {
    return EMPIRE_COLORS[idx % EMPIRE_COLORS.length];
}

export default function TechProgressView() {
    const state = useEndGameReportStore((s) => s.state);

    const [mode, setMode] = useState<Mode>("global");
    const [selectedEmpire, setSelectedEmpire] = useState<number>(0);

    if (state.status !== "ok") {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Tech Progress</h3>
                <p className="gs-muted">No loaded report.</p>
            </div>
        );
    }

    const techOrder = state.techOrder;

    if (!techOrder) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Tech Progress</h3>
                <p className="gs-muted">No techOrder section found in this report.</p>
            </div>
        );
    }

    const empireCount = techOrder.empireCount ?? 0;

    // Build empire labels using allStats if available (best UX), fallback otherwise.
    const empireMeta: EmpireMeta[] = useMemo(() => {
        const allStats: any = (state as any).allStats;
        return buildEmpireMeta(empireCount, allStats);
    }, [empireCount, state]);

    const empireLabelByIndex = useMemo(() => {
        const m = new Map<number, EmpireMeta>();
        for (const e of empireMeta) m.set(e.idx, e);
        return m;
    }, [empireMeta]);

    const { maxTurn, groupedGlobal, groupedByEmpire } = useMemo(() => {
        const entries = techOrder.entries ?? [];
        return groupTechOrderEntries(entries);
    }, [techOrder]);

    const turnsSorted = (
        mode === "global"
            ? Array.from(groupedGlobal.keys())
            : Array.from((groupedByEmpire.get(selectedEmpire) ?? new Map()).keys())
    ).sort((a, b) => a - b);

    const getEntriesForTurn = (turn: number): TechOrderEntryV1[] => {
        if (mode === "global") return groupedGlobal.get(turn) ?? [];
        const perEmpire = groupedByEmpire.get(selectedEmpire);
        return perEmpire?.get(turn) ?? [];
    };

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

            <div className="gs-row gs-toolbar">
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

            {/* Always show legend in global mode (no click, no "Empire legend" line) */}
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

            <div className="gs-section">
                {turnsSorted.length === 0 ? (
                    <p className="gs-muted">No tech entries to display.</p>
                ) : (
                    turnsSorted.map((turn) => {
                        const entries = getEntriesForTurn(turn);
                        return (
                            <div key={turn} className="gs-turnRow">
                                <div className="gs-turnBadge">Turn {turn}</div>
                                <div className="gs-pillWrap">
                                    {entries.map((e, idx) => {
                                        const prefixColor = empireColor(e.empireIndex);
                                        return (
                                            <span
                                                key={`${e.empireIndex}-${e.turn}-${e.technologyDefinitionName}-${idx}`}
                                                className="gs-pill"
                                                title={
                                                    mode === "global"
                                                        ? empireLabelByIndex.get(e.empireIndex)?.labelLong ?? `E${e.empireIndex}`
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
        </div>
    );
}