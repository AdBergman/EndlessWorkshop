import React, { useMemo } from "react";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import "../GameSummary.css";
import "../CityBreakdown.css";
import { formatNumber } from "./empireStats.helpers";

import {
    empireColor,
    formatLocalDateTime,
    getFinalSnapshotForEmpire,
    victoryLabel,
    type FinalSnapshot,
} from "./gameOverview.helpers";

import type { AllStats } from "@/types/endGameReport";

type EmpireMeta = {
    idx: number;
    faction: string;
    isPlayer: boolean;
    labelLong: string;
};

function buildEmpireMetaFromAllStats(allStats: AllStats): EmpireMeta[] {
    const empires = allStats.empires ?? [];
    const empireCount =
        typeof allStats.empireCount === "number" ? allStats.empireCount : empires.length;

    const byIndex = new Map<number, { faction: string }>();

    for (const e of empires) {
        const idx = e.empireIndex;
        const faction =
            e.factionDisplayName?.trim() ||
            e.factionKey?.trim() ||
            `Empire ${idx}`;
        byIndex.set(idx, { faction });
    }

    const result: EmpireMeta[] = [];
    for (let i = 0; i < empireCount; i++) {
        const isPlayer = i === 0;
        const faction = byIndex.get(i)?.faction ?? `Empire ${i}`;
        result.push({
            idx: i,
            faction,
            isPlayer,
            labelLong: isPlayer ? `${faction} (Player) (E${i})` : `${faction} (E${i})`,
        });
    }

    return result;
}

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

    const { report } = state;

    if (report.meta.version !== "1.0") {
        console.error(
            `[schema] Expected report.meta.version === "1.0" but got: ${report.meta.version}`
        );
    }

    const allStats = report.allStats as AllStats;

    const gameId = report.meta.gameId;
    const generatedAtUtc = report.meta.generatedAtUtc;

    const maxTurn = allStats.maxTurn;
    const empires = allStats.empires ?? [];
    const empireCount =
        typeof allStats.empireCount === "number" ? allStats.empireCount : empires.length;

    const topScoreEmpire = allStats.topScoreEmpire;
    const topScore = allStats.topScore;

    const difficulty = allStats.game?.difficulty ?? "Unknown";
    const mapSize = allStats.game?.mapSize ?? "Unknown";
    const gameSpeed = allStats.game?.gameSpeed ?? "Unknown";

    const victory = victoryLabel(allStats.victory?.actualVictoryCondition);
    const generatedHuman = formatLocalDateTime(generatedAtUtc);

    const empireMeta = useMemo(() => buildEmpireMetaFromAllStats(allStats), [allStats]);

    const finalByIdx = useMemo(() => {
        const map = new Map<number, FinalSnapshot>();
        for (const e of empires) {
            map.set(e.empireIndex, getFinalSnapshotForEmpire(e, maxTurn));
        }
        return map;
    }, [empires, maxTurn]);

    const topScoreFaction = useMemo(() => {
        const m = empireMeta.find((x) => x.idx === topScoreEmpire);
        return m?.faction ?? `Empire ${topScoreEmpire}`;
    }, [topScoreEmpire, empireMeta]);

    const topScoreColor = empireColor(topScoreEmpire);

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3">Overview</h3>
            </div>

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
                                <div className="gs-kvValue">{mapSize}</div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Speed</div>
                                <div className="gs-kvValue">{gameSpeed}</div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Turns</div>
                                <div className="gs-kvValue">{maxTurn}</div>
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
                                <div className="gs-kvLabel">Top score</div>
                                <div className="gs-kvValue" style={{ fontWeight: 800, color: topScoreColor }}>
                                    {topScoreFaction}
                                    {topScoreEmpire === 0 ? " (Player)" : ""}
                                    <span className="gs-topScoreIcon" aria-hidden>
                    {" "}
                                        🥇
                  </span>
                                </div>
                            </div>

                            <div className="gs-kv">
                                <div className="gs-kvLabel">Score</div>
                                <div className="gs-kvValue">{formatNumber(topScore)}</div>
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

            <div className="gs-section">
                <div className="gs-overviewTitle" style={{ marginBottom: 10 }}>
                    Empires
                </div>

                <div className="gs-empireCards">
                    {empireMeta.map((em) => {
                        const snap =
                            finalByIdx.get(em.idx) ??
                            ({
                                score: 0,
                                technologies: 0,
                                cities: 0,
                                territories: 0,
                            } satisfies FinalSnapshot);

                        const isTopScore = em.idx === topScoreEmpire;

                        return (
                            <div
                                key={em.idx}
                                className={`gs-empireCard ${isTopScore ? "gs-empireCard--topScore" : ""}`}
                                title={em.labelLong}
                            >
                                <div className="gs-row gs-spaceBetween" style={{ gap: 10 }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="gs-empireCardTitle">
                      <span className="gs-empireFaction" style={{ color: empireColor(em.idx) }}>
                        {em.faction}
                          {em.idx === 0 ? " (Player)" : ""}
                      </span>

                                            {isTopScore ? (
                                                <span className="gs-empireWin">
                          Top score <span aria-hidden>🥇</span>
                        </span>
                                            ) : null}
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

                {empireCount === 0 ? (
                    <p className="gs-muted gs-section">No empires found in this export.</p>
                ) : null}
            </div>
        </div>
    );
}