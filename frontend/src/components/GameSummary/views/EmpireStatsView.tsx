import React, { useEffect, useMemo } from "react";
import {
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useEndGameReportStore } from "@/stores/endGameReportStore";
import { useEmpireStatsViewStore } from "@/stores/empireStatsViewStore";

import TurnTooltip, { type LegendLabelByIndex } from "./TurnTooltip";
import "../GameSummary.css";
import "../CityBreakdown.css";

import type { AllStats, AllStatsEmpire } from "@/types/endGameReport";
import {
    buildChartData,
    buildTicks,
    empireIndex,
    type EmpireMetricKey,
    factionName,
    formatNumber,
    getEmpireColor,
    getEmpireKey,
    legendLabelForEmpire,
    metricLabel,
    METRICS,
} from "./empireStats.helpers";

export default function EmpireStatsView() {
    const state = useEndGameReportStore((s) => s.state);

    const selectedMetric = useEmpireStatsViewStore((s) => s.selectedMetric);
    const selectedEmpires = useEmpireStatsViewStore((s) => s.selectedEmpires);
    const setMetric = useEmpireStatsViewStore((s) => s.setMetric);
    const toggleEmpire = useEmpireStatsViewStore((s) => s.toggleEmpire);
    const selectAll = useEmpireStatsViewStore((s) => s.selectAll);
    const clearAll = useEmpireStatsViewStore((s) => s.clearAll);
    const ensureDefaults = useEmpireStatsViewStore((s) => s.ensureDefaults);

    if (state.status !== "ok") {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Empire Stats</h3>
                <p className="gs-muted">No loaded report.</p>
            </div>
        );
    }

    const { report } = state;

    const allStats: AllStats = report.allStats;
    const empires: AllStatsEmpire[] = allStats.empires ?? [];
    const empireCount = empires.length;

    useEffect(() => {
        ensureDefaults(empireCount);
    }, [empireCount, ensureDefaults]);

    const legendLabelByIndex: LegendLabelByIndex = useMemo(() => {
        const map = new Map<number, string>();
        for (const e of empires) {
            const idx = empireIndex(e);
            map.set(idx, legendLabelForEmpire(e, idx));
        }
        return map;
    }, [empires]);

    const chartData = useMemo(() => {
        return buildChartData(empires, selectedMetric);
    }, [empires, selectedMetric]);

    const maxTurn =
        chartData.length > 0 ? Number(chartData[chartData.length - 1].turn) : 1;

    const ticks = useMemo(() => buildTicks(maxTurn), [maxTurn]);

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3">Empire Stats</h3>
                <div className="gs-muted">
                    Metric: {metricLabel(selectedMetric)} • Empires: {empireCount}
                </div>
            </div>

            <div className="gs-row gs-toolbar gs-wrap" style={{ gap: 12 }}>
                <div className="gs-row" style={{ gap: 8 }}>
                    <span className="gs-muted">Stat:</span>
                    <select
                        className="gs-select"
                        value={selectedMetric}
                        onChange={(e) => setMetric(e.target.value as EmpireMetricKey)}
                    >
                        {METRICS.map((m) => (
                            <option key={m} value={m}>
                                {metricLabel(m)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="gs-row" style={{ gap: 8 }}>
                    <button className="gs-btn" onClick={() => selectAll(empireCount)}>
                        Select all
                    </button>
                    <button className="gs-btn" onClick={clearAll}>
                        Clear
                    </button>
                </div>
            </div>

            <div className="gs-section">
                <div className="gs-row gs-wrap" style={{ gap: 10 }}>
                    {empires.map((e) => {
                        const idx = empireIndex(e);
                        const checked = selectedEmpires.includes(idx);
                        const faction = factionName(e, idx);
                        const dotColor = getEmpireColor(idx);

                        return (
                            <label key={idx} className="gs-empireCheck">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleEmpire(idx)}
                                />

                                <span
                                    aria-hidden
                                    className="gs-empireDot"
                                    style={{
                                        background: dotColor,
                                        boxShadow:
                                            idx === 0 ? "0 0 10px rgba(255,127,50,0.55)" : "none",
                                    }}
                                />

                                <span className="gs-empireName">{idx === 0 ? "Player" : faction}</span>

                                <span className="gs-empireIndex">(E{idx})</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {selectedEmpires.length === 0 ? (
                <p className="gs-muted">Select at least one empire to show the chart.</p>
            ) : (
                <>
                    <div className="gs-section gs-chartWrap" style={{ width: "100%", height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey="turn"
                                    type="number"
                                    domain={[1, maxTurn]}
                                    allowDecimals={false}
                                    ticks={ticks}
                                />

                                <YAxis tickFormatter={(v) => formatNumber(v)} />

                                <Tooltip
                                    isAnimationActive={false}
                                    cursor={false}
                                    wrapperStyle={{ pointerEvents: "none" }}
                                    allowEscapeViewBox={{ x: false, y: false }}
                                    content={(props) => (
                                        <TurnTooltip
                                            {...(props as any)}
                                            legendLabelByIndex={legendLabelByIndex}
                                        />
                                    )}
                                />

                                <Legend />

                                {selectedEmpires.map((idx) => {
                                    const color = getEmpireColor(idx);
                                    return (
                                        <Line
                                            key={idx}
                                            type="monotone"
                                            dataKey={getEmpireKey(idx)}
                                            stroke={color}
                                            strokeWidth={idx === 0 ? 3 : 2}
                                            dot={false}
                                            isAnimationActive={false}
                                            name={legendLabelByIndex.get(idx) ?? `E${idx}`}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <p className="gs-muted" style={{ marginTop: 6 }}>
                        Tip: hover the chart to see the exact turn and value.
                    </p>
                </>
            )}
        </div>
    );
}