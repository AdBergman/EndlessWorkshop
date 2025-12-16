import React from "react";
import "../../GameSummary.css";
import type { CityVM } from "../../views/cityBreakdown.helpers";
import { empireColor } from "../../views/cityBreakdown.helpers";

type Props = {
    city: CityVM;
    selected?: boolean;
    onSelect: (id: string) => void;
};

function badge(text: string) {
    return (
        <span className="gs-cityBadge" key={text}>
      {text}
    </span>
    );
}

export default function CityCard({ city, selected, onSelect }: Props) {
    const color = empireColor(city.empireIndex);

    const badges: string[] = [];
    if (city.isCapital) badges.push("Capital");
    if (city.defense.isBesieged) badges.push("Besieged");
    if (city.defense.isMutinous) badges.push("Mutiny");

    return (
        <button
            type="button"
            className={`gs-cityCard ${selected ? "gs-cityCard--selected" : ""}`}
            onClick={() => onSelect(city.id)}
            title={city.settlementStatus}
            style={{ ["--empire-color" as any]: color }}
        >
            <div className="gs-cityCardTop">
                <div className="gs-cityTitleRow">
          <span className="gs-cityName" style={{ color }}>
            {city.name}
          </span>
                    <span className="gs-muted gs-cityEmpire">{city.empireLabel}</span>
                </div>

                {badges.length > 0 ? (
                    <div className="gs-cityBadges">{badges.map(badge)}</div>
                ) : (
                    <div className="gs-cityBadges" />
                )}
            </div>

            <div className="gs-cityStats">
                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">
                        {city.scoreLike.population}
                        {city.scoreLike.maxPopulation ? `/${city.scoreLike.maxPopulation}` : ""}
                    </div>
                    <div className="gs-cityStatLabel">Pop</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">{Math.round(city.scoreLike.productionNet)}</div>
                    <div className="gs-cityStatLabel">Prod</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">{city.map.extensionDistrictsCount ?? 0}</div>
                    <div className="gs-cityStatLabel">Dist</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">{city.map.territoryCount ?? 0}</div>
                    <div className="gs-cityStatLabel">Terr</div>
                </div>
            </div>

            <div className="gs-citySubline gs-muted">
                {city.scoreLike.approvalState}
                {city.scoreLike.approvalPct !== null ? ` • ${Math.round(city.scoreLike.approvalPct)}%` : ""}
                {city.growth.turnBeforeGrowth !== null ? ` • +1 in ${city.growth.turnBeforeGrowth}t` : ""}
            </div>
        </button>
    );
}