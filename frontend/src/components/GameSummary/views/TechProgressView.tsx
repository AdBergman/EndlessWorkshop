import React, {useMemo, useState} from "react";
import {EndGameExportV1, TechOrderEntryV1} from "../../../types/endGameReport";

type Props = {
    report: EndGameExportV1;
};

type Mode = "global" | "empire";

function displayLabel(e: TechOrderEntryV1): string {
    // Prefer displayName unless it looks like a loc key
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
        for (const [, list] of groupedGlobal) {
            list.sort((a, b) => a.empireIndex - b.empireIndex || a.technologyDefinitionName.localeCompare(b.technologyDefinitionName));
        }
        for (const [, perEmpire] of groupedByEmpire) {
            for (const [, list] of perEmpire) {
                list.sort((a, b) => a.technologyDefinitionName.localeCompare(b.technologyDefinitionName));
            }
        }

        return { maxTurn, groupedGlobal, groupedByEmpire };
    }, [techOrder]);

    if (!techOrder) {
        return (
            <div style={{ marginTop: 16 }}>
                <h3>Tech Progress</h3>
                <p style={{ opacity: 0.8 }}>No techOrder section found in this report.</p>
            </div>
        );
    }

    const turnsSorted = (mode === "global"
            ? Array.from(groupedGlobal.keys())
            : Array.from((groupedByEmpire.get(selectedEmpire) ?? new Map()).keys())
    ).sort((a, b) => a - b);

    const getEntriesForTurn = (turn: number): TechOrderEntryV1[] => {
        if (mode === "global") return groupedGlobal.get(turn) ?? [];
        const perEmpire = groupedByEmpire.get(selectedEmpire);
        return perEmpire?.get(turn) ?? [];
    };

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>Tech Progress</h3>
                <div style={{ opacity: 0.75 }}>
                    Entries: {techOrder.entryCount} • Empires: {empireCount} • Max turn: {maxTurn}
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => setMode("global")}
                        style={mode === "global" ? activeBtn : btn}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setMode("empire")}
                        style={mode === "empire" ? activeBtn : btn}
                    >
                        Per empire
                    </button>
                </div>

                {mode === "empire" && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ opacity: 0.8 }}>Empire:</span>
                        <select
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

            <div style={{ marginTop: 12 }}>
                {turnsSorted.length === 0 ? (
                    <p style={{ opacity: 0.8 }}>No tech entries to display.</p>
                ) : (
                    turnsSorted.map((turn) => {
                        const entries = getEntriesForTurn(turn);
                        return (
                            <div key={turn} style={turnRow}>
                                <div style={turnBadge}>Turn {turn}</div>
                                <div style={pillWrap}>
                                    {entries.map((e, idx) => (
                                        <span key={`${e.empireIndex}-${e.turn}-${e.technologyDefinitionName}-${idx}`} style={pill}>
                      {mode === "global" ? (
                          <span style={{ opacity: 0.7, marginRight: 6 }}>E{e.empireIndex}</span>
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

const btn: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "transparent",
    cursor: "pointer",
};

const activeBtn: React.CSSProperties = {
    ...btn,
    border: "1px solid rgba(255,255,255,0.45)",
};

const turnRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const turnBadge: React.CSSProperties = {
    minWidth: 90,
    fontSize: 13,
    opacity: 0.85,
    paddingTop: 2,
};

const pillWrap: React.CSSProperties = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
};

const pill: React.CSSProperties = {
    padding: "5px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 13,
    lineHeight: "18px",
};