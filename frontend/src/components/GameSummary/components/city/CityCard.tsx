import React from "react";
import "../../GameSummary.css";
import type { CityVM } from "../../views/cityBreakdown.helpers";
import {
    empireColor,
    formatInt,
    formatRatioPctMaybe,
    humanizeApprovalState,
} from "../../views/cityBreakdown.helpers";

type Props = {
    city: CityVM;
    selected: boolean;
    onSelect: (id: string) => void;
};

export default function CityCard({ city, selected, onSelect }: Props) {
    const color = empireColor(city.empireIndex);

    const approvalHuman = humanizeApprovalState(city.scoreLike.approvalState);
    const approvalPctText =
        city.scoreLike.approvalPct !== null
            ? formatRatioPctMaybe(city.scoreLike.approvalPct)
            : null;

    const pop = city.scoreLike.population;
    const popMax = city.scoreLike.maxPopulation;

    const prod = city.scoreLike.productionNet;

    const territories = city.map.territoryCount ?? 0;
    const footprint = city.map.extensionDistrictsCount ?? 0;

    return (
        <button
            type="button"
            className={`gs-cityCard ${selected ? "gs-cityCard--selected" : ""}`}
            style={{ ["--empire-color" as any]: color }}
            onClick={() => onSelect(city.id)}
            aria-pressed={selected}
        >
            {/* Top row */}
            <div className="gs-cityCardTop">
                <div className="gs-cityTitleRow">
                    <div className="gs-cityName">{city.name}</div>
                    <div className="gs-cityEmpire">
                        <span style={{ color, fontWeight: 700 }}>{city.empireLabel}</span>
                    </div>
                </div>

                {city.tags.length > 0 ? (
                    <div className="gs-cityBadges">
                        {city.tags.slice(0, 3).map((t) => (
                            <span key={t} className="gs-cityBadge">
                {t}
              </span>
                        ))}
                    </div>
                ) : null}
            </div>

            {/* Stats */}
            <div className="gs-cityStats">
                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">
                        {formatInt(pop)}
                        {popMax ? <span className="gs-muted"> / {formatInt(popMax)}</span> : null}
                    </div>
                    <div className="gs-cityStatLabel">Population</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">{formatInt(prod)}</div>
                    <div className="gs-cityStatLabel">Production</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">
                        {approvalHuman}
                        {approvalPctText ? (
                            <span className="gs-muted"> • {approvalPctText}</span>
                        ) : null}
                    </div>
                    <div className="gs-cityStatLabel">Approval</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">
                        {formatInt(territories)} <span className="gs-muted">•</span>{" "}
                        {formatInt(footprint)}
                    </div>
                    <div className="gs-cityStatLabel">Territories • Footprint</div>
                </div>
            </div>

            {/* Growth hint */}
            {city.growth.turnBeforeGrowth !== null ? (
                <div className="gs-citySubline">
                    +1 pop in <b>{city.growth.turnBeforeGrowth}</b>{" "}
                    turn{city.growth.turnBeforeGrowth === 1 ? "" : "s"}
                </div>
            ) : null}
        </button>
    );
}