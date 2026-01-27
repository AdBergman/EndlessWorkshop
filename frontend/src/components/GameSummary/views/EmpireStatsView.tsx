import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    DefaultLegendContent,
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
import "./EmpireStatsView.css";

import type { AllStats, AllStatsEmpire } from "@/types/endGameReport";
import {
    buildChartData,
    buildPlayerEconomyChartData,
    buildTicks,
    ECON_METRICS,
    empireIndex,
    type EmpireMetricKey,
    factionName,
    formatNumber,
    getEconomyMetricColor,
    getEmpireColor,
    getEmpireKey,
    legendLabelForEmpire,
    metricLabel,
    METRICS,
} from "./empireStats.helpers";

type Mode = "compare" | "economy";
const Y_AXIS_WIDTH = 64;

type LegendItem = {
    value?: any;
    dataKey?: any;
    color?: string;
    type?: any;
    inactive?: boolean;
    payload?: any;
};

function orderLegendPayload(payload: LegendItem[] | undefined, order: readonly string[]) {
    const rows = Array.isArray(payload) ? payload : [];

    const byKey = new Map<string, LegendItem[]>();
    for (const it of rows) {
        const k = String(it.dataKey ?? "");
        if (!k) continue;
        const arr = byKey.get(k) ?? [];
        arr.push(it);
        byKey.set(k, arr);
    }

    const out: LegendItem[] = [];
    const used = new Set<LegendItem>();

    for (const k of order) {
        const hit = byKey.get(k);
        if (hit?.length) {
            for (const it of hit) {
                out.push(it);
                used.add(it);
            }
        }
    }

    // Append remaining entries in the original order (for safety)
    for (const it of rows) if (!used.has(it)) out.push(it);

    return out;
}

export default function EmpireStatsView() {
    const state = useEndGameReportStore((s) => s.state);

    const selectedMetric = useEmpireStatsViewStore((s) => s.selectedMetric);
    const selectedEmpires = useEmpireStatsViewStore((s) => s.selectedEmpires);
    const setMetric = useEmpireStatsViewStore((s) => s.setMetric);
    const toggleEmpire = useEmpireStatsViewStore((s) => s.toggleEmpire);
    const selectAll = useEmpireStatsViewStore((s) => s.selectAll);
    const clearAll = useEmpireStatsViewStore((s) => s.clearAll);
    const ensureDefaults = useEmpireStatsViewStore((s) => s.ensureDefaults);

    const [mode, setMode] = useState<Mode>("compare");
    const didInitRef = useRef(false);

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

    useEffect(() => {
        if (didInitRef.current) return;
        if (empireCount <= 0) return;

        didInitRef.current = true;
        setMode("compare");
        setMetric("Score" as EmpireMetricKey);
        selectAll(empireCount);
    }, [empireCount, selectAll, setMetric]);

    const legendLabelByIndex: LegendLabelByIndex = useMemo(() => {
        const map = new Map<number, string>();
        for (const e of empires) {
            const idx = empireIndex(e);
            map.set(idx, legendLabelForEmpire(e, idx));
        }
        return map;
    }, [empires]);

    const compareChartData = useMemo(() => buildChartData(empires, selectedMetric), [empires, selectedMetric]);

    const economyChartData = useMemo(() => {
        const player = empires.find((e) => empireIndex(e) === 0) ?? empires[0] ?? null;
        return buildPlayerEconomyChartData(player);
    }, [empires]);

    const chartData = mode === "economy" ? economyChartData : compareChartData;

    const maxTurn = chartData.length > 0 ? Number(chartData[chartData.length - 1].turn) : 1;
    const ticks = useMemo(() => buildTicks(maxTurn), [maxTurn]);

    const rightHeaderMetricText = mode === "economy" ? "Player economy" : `Metric: ${metricLabel(selectedMetric)}`;
    const showCompareControls = mode === "compare";

    return (
        <div className="gs-panel gs-esPanel" style={{ ["--gs-es-left-pad" as any]: `${Y_AXIS_WIDTH}px` }}>
            <div className="gs-row gs-spaceBetween gs-esHeader">
                <h3 className="gs-h3 gs-esTitle">Empire Stats</h3>

                <div className="gs-esHeaderRight">
                    <div className="gs-muted">
                        {rightHeaderMetricText} • Empires: {empireCount}
                    </div>

                    <div className="gs-esModeToggle" role="group" aria-label="Empire stats mode">
                        <button
                            type="button"
                            className={`gs-esModeBtn ${mode === "compare" ? "is-active" : ""}`}
                            onClick={() => setMode("compare")}
                            title="Compare empires"
                            aria-label="Compare empires"
                            aria-pressed={mode === "compare"}
                        >
                            ≋
                        </button>
                        <button
                            type="button"
                            className={`gs-esModeBtn ${mode === "economy" ? "is-active" : ""}`}
                            onClick={() => setMode("economy")}
                            title="Player economy (FIDSI)"
                            aria-label="Player economy (FIDSI)"
                            aria-pressed={mode === "economy"}
                        >
                            ★
                        </button>
                    </div>
                </div>
            </div>

            <div className="gs-row gs-toolbar gs-wrap gs-esControls" style={{ gap: 12 }}>
                <div className="gs-row" style={{ gap: 8, opacity: showCompareControls ? 1 : 0.55 }}>
                    <select
                        className="gs-select"
                        value={selectedMetric}
                        onChange={(e) => setMetric(e.target.value as EmpireMetricKey)}
                        disabled={!showCompareControls}
                        aria-label="Metric"
                    >
                        {METRICS.map((m) => (
                            <option key={m} value={m}>
                                {metricLabel(m)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="gs-row" style={{ gap: 8 }}>
                    <button
                        className="gs-btn"
                        onClick={() => selectAll(empireCount)}
                        disabled={!showCompareControls}
                        style={{ opacity: showCompareControls ? 1 : 0.55 }}
                    >
                        Select all
                    </button>
                    <button
                        className="gs-btn"
                        onClick={clearAll}
                        disabled={!showCompareControls}
                        style={{ opacity: showCompareControls ? 1 : 0.55 }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {showCompareControls ? (
                <div className="gs-section gs-esEmpires">
                    <div className="gs-row gs-wrap" style={{ gap: 10 }}>
                        {empires.map((e) => {
                            const idx = empireIndex(e);
                            const checked = selectedEmpires.includes(idx);
                            const faction = factionName(e);
                            const dotColor = getEmpireColor(idx);

                            return (
                                <label key={idx} className="gs-empireCheck">
                                    <input type="checkbox" checked={checked} onChange={() => toggleEmpire(idx)} />

                                    <span
                                        aria-hidden
                                        className="gs-empireDot"
                                        style={{
                                            background: dotColor,
                                            boxShadow: "none",
                                        }}
                                    />

                                    <span className="gs-empireName">{idx === 0 ? "Player" : faction}</span>
                                    <span className="gs-empireIndex">(E{idx})</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="gs-section gs-esEmpires">
                    <div className="gs-muted">
                        Showing player economy (FIDSI) for <b>Empire 0</b>.
                    </div>
                </div>
            )}

            {mode === "compare" && selectedEmpires.length === 0 ? (
                <p className="gs-muted">Select at least one empire to show the chart.</p>
            ) : (
                <>
                    <div className="gs-section gs-chartWrap" style={{ width: "100%", height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ left: 0, right: 12, top: 6, bottom: 0 }}>
                                <XAxis dataKey="turn" type="number" domain={[1, maxTurn]} allowDecimals={false} ticks={ticks} />

                                <YAxis width={Y_AXIS_WIDTH} tickFormatter={(v) => formatNumber(v)} />

                                <Tooltip
                                    isAnimationActive={false}
                                    cursor={false}
                                    wrapperStyle={{ pointerEvents: "none" }}
                                    allowEscapeViewBox={{ x: false, y: false }}
                                    content={(props) => (
                                        <TurnTooltip
                                            {...(props as any)}
                                            legendLabelByIndex={legendLabelByIndex}
                                            metricOrder={mode === "economy" ? ECON_METRICS : undefined}
                                        />
                                    )}
                                />

                                <Legend
                                    content={(props: any) => {
                                        const orderedPayload =
                                            mode === "economy" ? orderLegendPayload(props?.payload as LegendItem[], ECON_METRICS) : props?.payload;

                                        // Use Recharts' own default legend renderer so visuals stay identical.
                                        return <DefaultLegendContent {...props} payload={orderedPayload} />;
                                    }}
                                />

                                {mode === "economy"
                                    ? ECON_METRICS.map((m) => (
                                        <Line
                                            key={m}
                                            type="monotone"
                                            dataKey={m}
                                            stroke={getEconomyMetricColor(m)}
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                            name={m}
                                        />
                                    ))
                                    : selectedEmpires.map((idx) => {
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