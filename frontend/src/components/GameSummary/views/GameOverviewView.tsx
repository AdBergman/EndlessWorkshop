import React, { useMemo } from "react";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import "../GameSummary.css";
import "../CityBreakdown.css";
import { buildEmpireMeta, EmpireMeta } from "./techProgress.helpers";
import { formatNumber } from "./empireStats.helpers";

import {
    empireColor,
    formatLocalDateTime,
    getFinalSnapshotForEmpire,
    labelize,
    safeNumber,
    victoryLabel,
    FinalSnapshot,
} from "./gameOverview.helpers";

export default function GameOverviewView() {
    const state = useEndGameReportStore((s) => s.state);

    if (state.status !== "ok") {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Overview</h3>
                <p className="gs-muted">No loaded report.</p>
            </div>
        );
    }

    const report = state.report;
    const allStats: any = state.allStats;

    if (!allStats) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">Overview</h3>
                <p className="gs-muted">No allStats section found in this report.</p>
            </div>
        );
    }

    const gameId = labelize(allStats?.GameId, "Unknown");
    const maxTurn: number | null = safeNumber(allStats?.MaxTurn);

    const empireCount: number =
        typeof allStats?.EmpireCount === "number"
            ? allStats.EmpireCount
            : Array.isArray(allStats?.Empires)
                ? allStats.Empires.length
                : 0;

    const winnerEmpire: number | null = safeNumber(allStats?.WinnerEmpire);
    const winnerScore: number | null = safeNumber(allStats?.WinnerScore);

    const difficulty = labelize(allStats?.Game?.Difficulty, "Unknown");
    const mapSize = labelize(allStats?.Game?.MapSize, "Unknown");
    const gameSpeed = labelize(allStats?.Game?.GameSpeed, "Unknown");
    const mapType = labelize(allStats?.Game?.MapType, "—");

    const victory = victoryLabel(allStats?.Victory?.ActualVictoryCondition);

    const generatedUtc = labelize(
        allStats?.GeneratedAtUtc,
        labelize(report?.generatedAtUtc, "Unknown")
    );
    const generatedHuman = formatLocalDateTime(generatedUtc);

    const empires: any[] = Array.isArray(allStats?.Empires) ? allStats.Empires : [];

    const empireMeta: EmpireMeta[] = useMemo(() => {
        return buildEmpireMeta(empireCount, allStats);
    }, [empireCount, allStats]);

    const finalByIdx = useMemo(() => {
        const map = new Map<number, FinalSnapshot>();
        for (const e of empires) {
            const idx = e?.EmpireIndex ?? e?.empireIndex ?? 0;
            map.set(idx, getFinalSnapshotForEmpire(e, maxTurn));
        }
        return map;
    }, [empires, maxTurn]);

    const winnerFaction = useMemo(() => {
        if (winnerEmpire === null) return "Unknown";
        const m = empireMeta.find((x) => x.idx === winnerEmpire);
        return m?.faction ?? `Empire ${winnerEmpire}`;
    }, [winnerEmpire, empireMeta]);

    const winnerColor = winnerEmpire !== null ? empireColor(winnerEmpire) : "#fff";

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3">Overview</h3>
            </div>

            {/* GAME OVERVIEW */}
            <div className="gs-section">
                <div className="gs-overviewGrid">
                    <div className="gs-overviewBlock">
                        <div className="gs-overviewTitle">Game</div>

                        <div className="gs-kvList">
                            <div className="gs-kv">
                                <div className="gs-kvLabel">Difficulty</div>
                                <div className="gs-kvValue">{difficulty}</div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Map</div>
                                <div className="gs-kvValue">
                                    {mapSize}
                                    {mapType !== "—" ? ` • ${mapType}` : ""}
                                </div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Speed</div>
                                <div className="gs-kvValue">{gameSpeed}</div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Turns</div>
                                <div className="gs-kvValue">{maxTurn ?? "—"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="gs-overviewBlock">
                        <div className="gs-overviewTitle">Outcome</div>

                        <div className="gs-kvList">
                            <div className="gs-kv">
                                <div className="gs-kvLabel">Victory</div>
                                <div className="gs-kvValue">{victory}</div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Winner</div>
                                <div className="gs-kvValue" style={{ fontWeight: 800, color: winnerColor }}>
                                    {winnerFaction}
                                    {winnerEmpire === 0 ? " (Player)" : ""}
                                    <span className="gs-muted"> 👑</span>
                                </div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Winner score</div>
                                <div className="gs-kvValue">
                                    {winnerScore !== null ? formatNumber(winnerScore) : "—"}
                                </div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Generated</div>
                                <div className="gs-kvValue">{generatedHuman}</div>
                            </div>
                        </div>

                        <div className="gs-row" style={{ marginTop: 10 }}>
              <span className="gs-pill" title="GameId" style={{ opacity: 0.92 }}>
                <span className="gs-metaLabel" style={{ marginRight: 6 }}>
                  GameId
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{gameId}</span>
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* EMPIRES OVERVIEW */}
            <div className="gs-section">
                <div className="gs-overviewTitle" style={{ marginBottom: 10 }}>
                    Empires
                </div>

                <div className="gs-empireCards">
                    {empireMeta.map((em) => {
                        const snap = finalByIdx.get(em.idx) ?? {
                            score: 0,
                            technologies: 0,
                            cities: 0,
                            territories: 0,
                        };
                        const isWinner = winnerEmpire !== null && em.idx === winnerEmpire;

                        return (
                            <div
                                key={em.idx}
                                className={`gs-empireCard ${isWinner ? "gs-empireCard--winner" : ""}`}
                                title={em.labelLong}
                            >
                                <div className="gs-row gs-spaceBetween" style={{ gap: 10 }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="gs-empireCardTitle">
                      <span className="gs-empireFaction" style={{ color: empireColor(em.idx) }}>
                        {em.faction}
                          {em.idx === 0 ? " (Player)" : ""}
                      </span>
                                            {isWinner ? <span className="gs-empireWin">Winner</span> : null}
                                        </div>
                                    </div>

                                    <div className="gs-empireScore">
                                        {formatNumber(snap.score)}
                                        <div className="gs-muted gs-empireScoreLabel">Score</div>
                                    </div>
                                </div>

                                <div className="gs-empireMiniStats">
                                    <div className="gs-miniStat">
                                        <div className="gs-miniStatValue">{formatNumber(snap.technologies)}</div>
                                        <div className="gs-miniStatLabel">Techs</div>
                                    </div>

                                    <div className="gs-miniStat">
                                        <div className="gs-miniStatValue">{formatNumber(snap.cities)}</div>
                                        <div className="gs-miniStatLabel">Cities</div>
                                    </div>

                                    <div className="gs-miniStat">
                                        <div className="gs-miniStatValue">{formatNumber(snap.territories)}</div>
                                        <div className="gs-miniStatLabel">Territories</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}