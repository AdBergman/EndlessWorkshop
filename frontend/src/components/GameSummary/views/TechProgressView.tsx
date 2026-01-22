import React, { useMemo, useState } from "react";
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

    const selectedEmpireIsValid = useMemo(() => {
        if (mode !== "empire") return true;
        return selectedEmpire >= 0 && selectedEmpire < empireCount;
    }, [mode, selectedEmpire, empireCount]);

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
                    ) : (
                        turnsSorted.map((turn) => {
                            const turnEntries = getEntriesForTurn(turn);
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
            )}
        </div>
    );
}