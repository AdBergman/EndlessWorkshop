import React, { useMemo, useState } from "react";
import "../../GameSummary.css";
import "../../CityDetailsPanel.css";

import type { CityVM } from "../../views/cityBreakdown.helpers";
import {
    empireColor,
    formatInt,
    formatRatioPctMaybe,
    isDestroyedCity,
    isOutpostCity,
} from "../../views/cityBreakdown.helpers";

type Props = {
    city: CityVM | null;
};

function safeText(v: unknown, fallback = "—"): string {
    const s = typeof v === "string" ? v.trim() : "";
    return s ? s : fallback;
}

export default function CityDetailsPanel({ city }: Props) {
    const [showDebug, setShowDebug] = useState(false);

    const color = empireColor(city?.empireIndex ?? 0);

    const badges = useMemo(() => {
        if (!city) return [];
        const list: Array<{ key: string; label: string; tone?: "danger" | "warn" | "neutral" }> = [];

        if (city.isCapital) list.push({ key: "capital", label: "Capital", tone: "neutral" });
        if (city.defense?.isBesieged) list.push({ key: "besieged", label: "Besieged", tone: "warn" });
        if (city.defense?.isMutinous) list.push({ key: "mutiny", label: "Mutiny", tone: "danger" });

        if (city.tags?.includes("Outpost")) list.push({ key: "outpost", label: "Outpost", tone: "warn" });
        if (city.tags?.includes("Destroyed")) list.push({ key: "destroyed", label: "Destroyed", tone: "danger" });

        return list;
    }, [city]);

    if (!city) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Details</h3>
                <p className="gs-muted">Select a city to see details.</p>
            </div>
        );
    }

    const destroyed = isDestroyedCity(city);
    const outpost = isOutpostCity(city);

    // Snapshot
    const population = city.scoreLike?.population ?? 0;
    const maxPopulation = city.scoreLike?.maxPopulation ?? null;

    const approvalPctText =
        city.scoreLike?.approvalPct !== null && city.scoreLike?.approvalPct !== undefined
            ? formatRatioPctMaybe(city.scoreLike.approvalPct)
            : null;

    const productionNet = city.scoreLike?.productionNet ?? 0;

    const fortification = city.defense?.fortification ?? null;
    const militia = city.defense?.militiaUnits ?? null;

    // City size
    const controlledTiles = city.map?.extensionDistrictsCount ?? null;
    const territories = city.map?.territoryCount ?? null;
    const distToCapital = city.map?.distanceWithCapital ?? null;

    // Growth
    const turnsBeforeGrowth = city.growth?.turnBeforeGrowth ?? null;
    const foodStock = city.growth?.foodStock ?? null;
    const maxFoodStock = city.growth?.maxFoodStock ?? null;

    const foodGainPct = city.growth?.foodGainPct ?? null;
    const foodGainText =
        foodGainPct !== null
            ? `${foodGainPct > 0 ? "+" : ""}${formatRatioPctMaybe(foodGainPct) ?? "—"}`
            : null;

    const growingPopName = safeText(city.growth?.growingPopulationName, "—");

    // Defense section
    const isBesieged = !!city.defense?.isBesieged;
    const isMutinous = !!city.defense?.isMutinous;

    const settlementStatus = safeText(city.settlementStatus, "—");

    return (
        <div className="gs-panel gs-cityDetailsPanel">
            <div className="gs-cityDetailsHeader">
                <div className="gs-cityDetailsTitleRow">
                    <h3 className="gs-h3" style={{ margin: 0 }}>
                        <span style={{ color }}>{city.name}</span>
                    </h3>
                    <div className="gs-muted">{city.empireLabel}</div>
                </div>

                {badges.length > 0 ? (
                    <div className="gs-cityDetailsBadges">
                        {badges.map((b) => (
                            <span
                                key={b.key}
                                className={`gs-cityDetailsBadge ${
                                    b.tone === "danger"
                                        ? "gs-cityDetailsBadge--danger"
                                        : b.tone === "warn"
                                            ? "gs-cityDetailsBadge--warn"
                                            : ""
                                }`}
                            >
                {b.label}
              </span>
                        ))}
                    </div>
                ) : (
                    <div />
                )}
            </div>

            <div className="gs-muted gs-cityDetailsStatus">
                {settlementStatus !== "—" ? `Status: ${settlementStatus}` : null}
            </div>

            {destroyed || outpost ? (
                <div className={`gs-cityNotice ${destroyed ? "gs-cityNotice--danger" : "gs-cityNotice--warn"}`}>
                    <div className="gs-cityNoticeTitle">{destroyed ? "Destroyed settlement" : "Outpost settlement"}</div>
                    <div className="gs-cityNoticeBody">
                        {destroyed
                            ? "This settlement was destroyed before the end of the game. Some city stats may be missing or meaningless."
                            : "This settlement never became a full city. Growth/approval/production may be incomplete or not applicable."}
                    </div>
                </div>
            ) : null}

            {/* Snapshot */}
            <div className="gs-section">
                <div className="gs-overviewTitle" style={{ marginBottom: 10 }}>
                    Snapshot
                </div>

                <div className="gs-cityDetailsGrid">
                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Population</div>
                        <div className="gs-cityDetailsMetricValue gs-cityDetailsMetricValue--inline">
                            <span>{formatInt(population)}</span>
                            {maxPopulation ? <span className="gs-muted"> / {formatInt(maxPopulation)}</span> : null}
                        </div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Approval</div>
                        <div className="gs-cityDetailsMetricValue">{approvalPctText ?? "—"}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Production</div>
                        <div className="gs-cityDetailsMetricValue">{formatInt(productionNet)}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Defense</div>
                        <div className="gs-cityDetailsMetricValue">
                            <div>{fortification !== null ? formatInt(fortification) : "—"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* City Size */}
            <div className="gs-section">
                <div className="gs-overviewTitle" style={{ marginBottom: 10 }}>
                    City Size
                </div>

                <div className="gs-cityDetailsGrid gs-cityDetailsGrid--two">
                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Controlled tiles</div>
                        <div className="gs-cityDetailsMetricValue">{formatInt(controlledTiles ?? 0)}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Territories</div>
                        <div className="gs-cityDetailsMetricValue">{formatInt(territories ?? 0)}</div>
                    </div>
                </div>

                {distToCapital !== null && distToCapital > 0 ? (
                    <div className="gs-muted" style={{ marginTop: 8, fontSize: 12 }}>
                        Distance to capital: {formatInt(distToCapital)}
                    </div>
                ) : null}
            </div>

            {/* Growth */}
            <div className="gs-section">
                <div className="gs-overviewTitle" style={{ marginBottom: 10 }}>
                    Growth
                </div>

                <div className="gs-cityDetailsGrid gs-cityDetailsGrid--two">
                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Next population</div>
                        <div className="gs-cityDetailsMetricValue">
                            {turnsBeforeGrowth !== null
                                ? `+1 in ${formatInt(turnsBeforeGrowth)} turn${turnsBeforeGrowth === 1 ? "" : "s"}`
                                : "—"}
                        </div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Food stock</div>
                        <div className="gs-cityDetailsMetricValue gs-cityDetailsMetricValue--inline">
                            <span>{foodStock !== null ? formatInt(foodStock) : "—"}</span>
                            {maxFoodStock !== null ? <span className="gs-muted"> / {formatInt(maxFoodStock)}</span> : null}
                        </div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Food gain</div>
                        <div className="gs-cityDetailsMetricValue">{foodGainText ?? "—"}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Growing pop</div>
                        <div className="gs-cityDetailsMetricValue">{growingPopName}</div>
                    </div>
                </div>
            </div>

            {/* Defense */}
            <div className="gs-section">
                <div className="gs-overviewTitle" style={{ marginBottom: 10 }}>
                    Defense
                </div>

                <div className="gs-cityDetailsGrid gs-cityDetailsGrid--two">
                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Fortification</div>
                        <div className="gs-cityDetailsMetricValue">{fortification !== null ? formatInt(fortification) : "—"}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Militia</div>
                        <div className="gs-cityDetailsMetricValue">{militia !== null ? formatInt(militia) : "—"}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Besieged</div>
                        <div className="gs-cityDetailsMetricValue">{isBesieged ? "Yes" : "No"}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Mutiny</div>
                        <div className="gs-cityDetailsMetricValue">{isMutinous ? "Yes" : "No"}</div>
                    </div>
                </div>
            </div>

            {/* Debug */}
            <div className="gs-section">
                <button className="gs-btn" onClick={() => setShowDebug((v) => !v)} style={{ opacity: 0.95 }}>
                    {showDebug ? "Hide debug" : "Show debug"}
                </button>

                {showDebug ? (
                    <div className="gs-section">
                        <div className="gs-muted" style={{ marginBottom: 8 }}>
                            Raw city JSON (CityVM)
                        </div>

                        <pre className="gs-pre" style={{ fontSize: "0.85rem" }}>
              {JSON.stringify(city, null, 2)}
            </pre>
                    </div>
                ) : null}
            </div>
        </div>
    );
}