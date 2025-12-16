import React from "react";
import "../../GameSummary.css";
import type { CityVM } from "../../views/cityBreakdown.helpers";
import { empireColor } from "../../views/cityBreakdown.helpers";

type Props = {
    city: CityVM | null;
};

export default function CityDetailsPanel({ city }: Props) {
    if (!city) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Details</h3>
                <p className="gs-muted">Select a city to see details.</p>
            </div>
        );
    }

    const color = empireColor(city.empireIndex);

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3" style={{ margin: 0 }}>
                    <span style={{ color }}>{city.name}</span>
                </h3>
                <div className="gs-muted">{city.empireLabel}</div>
            </div>

            <div className="gs-section">
                <p className="gs-muted">
                    Next step: fill out sections (Growth, Approval, Defense, Meta/Debug).
                </p>
            </div>

            {/* Small quick stats preview (temporary) */}
            <div className="gs-section">
                <div className="gs-kvList">
                    <div className="gs-kv">
                        <div className="gs-kvLabel">Population</div>
                        <div className="gs-kvValue">
                            {city.scoreLike.population}
                            {city.scoreLike.maxPopulation ? ` / ${city.scoreLike.maxPopulation}` : ""}
                        </div>
                    </div>

                    <div className="gs-kv">
                        <div className="gs-kvLabel">Production</div>
                        <div className="gs-kvValue">{Math.round(city.scoreLike.productionNet)}</div>
                    </div>

                    <div className="gs-kv">
                        <div className="gs-kvLabel">Approval</div>
                        <div className="gs-kvValue">
                            {city.scoreLike.approvalState}
                            {city.scoreLike.approvalPct !== null ? ` • ${Math.round(city.scoreLike.approvalPct)}%` : ""}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}