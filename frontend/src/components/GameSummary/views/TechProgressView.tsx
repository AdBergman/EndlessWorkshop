import React, { useMemo, useState } from "react";
import { EndGameExportV1, TechOrderEntryV1 } from "@/types/endGameReport";
import "../GameSummary.css";

type Props = {
    report: EndGameExportV1;
};

type Mode = "global" | "empire";

function displayLabel(e: TechOrderEntryV1): string {
    const dn = e.technologyDisplayName;
    if (dn && dn.startsWith("%")) return e.technologyDefinitionName;
    return dn || e.technologyDefinitionName;
}

export default function TechProgressView({ report }: Props) {
    const techOrder = report.techOrder;

    const [mode, setMode] = useState<Mode>("global");
    const [selectedEmpire, setSelectedEmpire] = useState<number>(0);

    const empireCount = techOrder?.empireCount ?? 0;

    const { maxTurn, groupedGlobal, groupedByEmpire } = useMemo(() => {
        const entries = techOrder?.entries ?? [];
        let maxTurn = 0;

        const groupedGlobal = new Map<number, TechOrderEntryV1[]>();
        const groupedByEmpire = new Map<number, Map<number, TechOrderEntryV1[]>>();

        for (const e of entries) {
            if (e.turn > maxTurn) maxTurn = e.turn;

            // global
            if (!groupedGlobal.has(e.turn)) groupedGlobal.set(e.turn, []);
            groupedGlobal.get(e.turn)!.push(e);

            // per empire -> per turn
            if (!groupedByEmpire.has(e.empireIndex)) groupedByEmpire.set(e.empireIndex, new Map());
            const perEmpire = groupedByEmpire.get(e.empireIndex)!;
            if (!perEmpire.has(e.turn)) perEmpire.set(e.turn, []);
            perEmpire.get(e.turn)!.push(e);
        }

        // sort within turn for stable display
        groupedGlobal.forEach((list) => {
            list.sort(
                (a, b) =>
                    a.empireIndex - b.empireIndex ||
                    a.technologyDefinitionName.localeCompare(b.technologyDefinitionName)
            );
        });

        groupedByEmpire.forEach((perEmpire) => {
            perEmpire.forEach((list) => {
                list.sort((a, b) =>
                    a.technologyDefinitionName.localeCompare(b.technologyDefinitionName)
                );
            });
        });

        return { maxTurn, groupedGlobal, groupedByEmpire };
    }, [techOrder]);

    if (!techOrder) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Tech Progress</h3>
                <p className="gs-muted">No techOrder section found in this report.</p>
            </div>
        );
    }

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
                            {Array.from({ length: empireCount }, (_, i) => i).map((i) => (
                                <option key={i} value={i}>
                                    {i}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

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
                                    {entries.map((e, idx) => (
                                        <span
                                            key={`${e.empireIndex}-${e.turn}-${e.technologyDefinitionName}-${idx}`}
                                            className="gs-pill"
                                        >
                      {mode === "global" ? (
                          <span className="gs-pillPrefix">E{e.empireIndex}</span>
                      ) : null}
                                            {displayLabel(e)}
                    </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}