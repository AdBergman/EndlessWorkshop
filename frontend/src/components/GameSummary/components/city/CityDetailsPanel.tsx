import React, { useMemo, useState } from "react";
import "../../GameSummary.css";
import type { CityVM } from "../../views/cityBreakdown.helpers";
import {
    empireColor,
    formatInt,
    formatRatioPctMaybe,
    formatSignedPct1Decimal,
    humanizeApprovalState,
} from "../../views/cityBreakdown.helpers";

type Props = {
    city: CityVM | null;
};

export default function CityDetailsPanel({ city }: Props) {
    const [showDebug, setShowDebug] = useState(false);

    const color = empireColor(city?.empireIndex ?? 0);

    const headerBadges = useMemo(() => {
        if (!city) return [];
        const list: Array<{ key: string; label: string; tone?: "danger" | "warn" | "neutral" }> = [];
        if (city.isCapital) list.push({ key: "capital", label: "Capital", tone: "neutral" });
        if (city.defense?.isBesieged) list.push({ key: "besieged", label: "Besieged", tone: "warn" });
        if (city.defense?.isMutinous) list.push({ key: "mutiny", label: "Mutiny", tone: "danger" });
        return list;
    }, [city]);

    const population = city?.scoreLike?.population ?? 0;
    const maxPopulation = city?.scoreLike?.maxPopulation ?? null;

    const approvalState = humanizeApprovalState(city?.scoreLike?.approvalState);
    const approvalPct = city?.scoreLike?.approvalPct ?? null;

    const productionNet = city?.scoreLike?.productionNet ?? 0;

    const turnsBeforeGrowth = city?.growth?.turnBeforeGrowth ?? null;
    const foodStock = city?.growth?.foodStock ?? null;
    const maxFoodStock = city?.growth?.maxFoodStock ?? null;
    const foodGainPct = city?.growth?.foodGainPct ?? null;
    const growingPop = city?.growth?.growingPopulationName ?? null;

    const fortification = city?.defense?.fortification ?? null;
    const militia = city?.defense?.militiaUnits ?? null;

    const isBesieged = Boolean(city?.defense?.isBesieged);
    const isMutinous = Boolean(city?.defense?.isMutinous);

    const status = city?.settlementStatus;
    const statusLine = typeof status === "string" && status.trim() ? `Status: ${status}` : null;

    const defensePills = useMemo(() => {
        if (!city) return [];
        const pills: Array<{ key: string; label: string; tone?: "danger" | "warn" | "neutral" }> = [];
        if (isBesieged) pills.push({ key: "besieged", label: "Besieged", tone: "warn" });
        if (isMutinous) pills.push({ key: "mutiny", label: "Mutiny", tone: "danger" });
        if (!isBesieged && !isMutinous) pills.push({ key: "stable", label: "Stable", tone: "neutral" });
        return pills;
    }, [city, isBesieged, isMutinous]);

    const metaRows = useMemo(() => {
        if (!city) return [];
        const rows: Array<{ k: string; v: string }> = [];
        const meta = city.meta;

        if (meta.tileIndex !== null) rows.push({ k: "Tile index", v: String(meta.tileIndex) });
        if (typeof meta.guid === "string" && meta.guid.trim()) rows.push({ k: "GUID", v: meta.guid });
        if (typeof meta.factionDefinitionName === "string" && meta.factionDefinitionName.trim()) {
            rows.push({ k: "Faction", v: meta.factionDefinitionName });
        }
        if (typeof meta.currentConstructible === "string" && meta.currentConstructible.trim()) {
            rows.push({ k: "Constructing", v: meta.currentConstructible });
        }
        if (typeof meta.currentConstructibleAffinity === "string" && meta.currentConstructibleAffinity.trim()) {
            rows.push({ k: "Constructible affinity", v: meta.currentConstructibleAffinity });
        }
        return rows;
    }, [city]);

    if (!city) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Details</h3>
                <p className="gs-muted">Select a city to see details.</p>
            </div>
        );
    }

    return (
        <div className="gs-panel">
            <div className="gs-cityDetailsHeader">
                <div className="gs-cityDetailsTitleRow">
                    <h3 className="gs-h3" style={{ margin: 0 }}>
                        <span style={{ color }}>{city.name}</span>
                    </h3>
                    <div className="gs-muted">{city.empireLabel}</div>
                </div>

                {headerBadges.length > 0 ? (
                    <div className="gs-cityDetailsBadges">
                        {headerBadges.map((b) => (
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

            {statusLine ? <div className="gs-muted gs-cityDetailsStatus">{statusLine}</div> : null}

            {/* Snapshot */}
            <div className="gs-section">
                <div className="gs-overviewTitle">City Snapshot</div>

                <div className="gs-cityDetailsGrid">
                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Population</div>
                        <div className="gs-cityDetailsMetricValue">
                            {population}
                            {maxPopulation ? <span className="gs-muted"> / {maxPopulation}</span> : null}
                        </div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Approval</div>
                        <div className="gs-cityDetailsMetricValue">
                            {approvalState}
                            {approvalPct !== null ? <span className="gs-muted"> • {formatRatioPctMaybe(approvalPct) ?? "—"}</span> : null}
                        </div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Production</div>
                        <div className="gs-cityDetailsMetricValue">{formatInt(productionNet)}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Fortification</div>
                        <div className="gs-cityDetailsMetricValue">{fortification !== null ? formatInt(fortification) : "—"}</div>
                    </div>
                </div>
            </div>

            {/* City Size */}
            <div className="gs-section">
                <div className="gs-overviewTitle">City Size</div>

                <div className="gs-cityDetailsGrid gs-cityDetailsGrid--two">
                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">City Footprint</div>
                        <div className="gs-cityDetailsMetricValue">{formatInt(city.map?.extensionDistrictsCount ?? 0)}</div>
                    </div>

                    <div className="gs-cityDetailsMetric">
                        <div className="gs-cityDetailsMetricLabel">Controlled Regions</div>
                        <div className="gs-cityDetailsMetricValue">{formatInt(city.map?.territoryCount ?? 0)}</div>
                    </div>
                </div>

                <div className="gs-muted" style={{ marginTop: 6, fontSize: 11 }}>
                    City footprint reflects the total area and extensions controlled by the city.
                </div>

                {(city.map?.distanceWithCapital ?? 0) > 0 ? (
                    <div className="gs-muted" style={{ marginTop: 8, fontSize: 12 }}>
                        Distance to capital: {formatInt(city.map?.distanceWithCapital)}
                    </div>
                ) : null}
            </div>

            {/* Growth */}
            <div className="gs-section">
                <div className="gs-overviewTitle">Growth</div>

                <div className="gs-cityDetailsNote">
                    {turnsBeforeGrowth !== null
                        ? `+1 population in ${turnsBeforeGrowth} turn${turnsBeforeGrowth === 1 ? "" : "s"}`
                        : "No growth estimate available in this export."}

                    {(foodStock !== null && maxFoodStock !== null) || foodGainPct !== null || (typeof growingPop === "string" && growingPop) ? (
                        <div className="gs-muted" style={{ marginTop: 6 }}>
                            {foodStock !== null && maxFoodStock !== null ? `Food: ${formatInt(foodStock)} / ${formatInt(maxFoodStock)}` : null}
                            {foodGainPct !== null ? <span>{` • ${formatSignedPct1Decimal(foodGainPct)}`}</span> : null}
                            {typeof growingPop === "string" && growingPop ? <span>{` • ${growingPop}`}</span> : null}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Defense */}
            <div className="gs-section">
                <div className="gs-overviewTitle">Defense</div>

                <div className="gs-row gs-wrap" style={{ gap: 8, marginBottom: 10 }}>
                    {defensePills.map((p) => (
                        <span
                            key={p.key}
                            className={`gs-cityDetailsBadge ${
                                p.tone === "danger"
                                    ? "gs-cityDetailsBadge--danger"
                                    : p.tone === "warn"
                                        ? "gs-cityDetailsBadge--warn"
                                        : ""
                            }`}
                        >
              {p.label}
            </span>
                    ))}
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
                </div>
            </div>

            {/* Meta */}
            {metaRows.length > 0 ? (
                <div className="gs-section">
                    <div className="gs-overviewTitle">City Meta</div>

                    <div className="gs-kvList">
                        {metaRows.map((r) => (
                            <div key={r.k} className="gs-kv">
                                <div className="gs-kvLabel">{r.k}</div>
                                <div className="gs-kvValue" style={{ fontVariantNumeric: "tabular-nums" }}>
                                    {r.v}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

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