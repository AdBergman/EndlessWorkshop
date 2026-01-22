import "../../CityBreakdown.css";
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
    const approvalPctText = formatRatioPctMaybe(city.scoreLike.approvalPct);

    const pop = city.scoreLike.population;
    const popMax = city.scoreLike.maxPopulation;

    const prod = city.scoreLike.productionNet;

    const territories = city.map.territoryCount ?? 0;
    const footprint = city.map.extensionDistrictsCount ?? 0;

    const growthTurns = city.growth.turnBeforeGrowth;
    const growthSuffix = growthTurns === 1 ? "" : "s";

    return (
        <button
            type="button"
            className={`gs-cityCard ${selected ? "gs-cityCard--selected" : ""}`}
            style={{ ["--empire-color" as string]: color } as React.CSSProperties}
            onClick={() => onSelect(city.id)}
            aria-pressed={selected}
        >
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

            <div className="gs-cityStats">
                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">
                        {formatInt(pop)}
                        {popMax !== null ? (
                            <span className="gs-muted"> / {formatInt(popMax)}</span>
                        ) : null}
                    </div>
                    <div className="gs-cityStatLabel">Population</div>
                </div>

                <div className="gs-cityStat">
                    <div className="gs-cityStatValue">
                        {formatInt(prod)}
                        <span className="gs-muted" style={{ visibility: "hidden" }}>.</span>
                    </div>
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

            {growthTurns !== null ? (
                <div className="gs-citySubline">
                    +1 pop in <b>{growthTurns}</b> turn{growthSuffix}
                </div>
            ) : null}
        </button>
    );
}