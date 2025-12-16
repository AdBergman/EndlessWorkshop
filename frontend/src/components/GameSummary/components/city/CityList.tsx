import React from "react";
import "../../GameSummary.css";
import type { CityVM } from "../../views/cityBreakdown.helpers";
import type { EmpireMeta } from "../../views/techProgress.helpers";
import { empireColor } from "../../views/cityBreakdown.helpers";
import CityCard from "./CityCard";

type Mode = "grouped" | "all";

type Props = {
    mode: Mode;
    cities: CityVM[]; // already filtered + sorted
    empireMeta: EmpireMeta[];
    selectedCityId: string | null;
    onSelectCity: (id: string) => void;
};

export default function CityList({
                                     mode,
                                     cities,
                                     empireMeta,
                                     selectedCityId,
                                     onSelectCity,
                                 }: Props) {
    if (cities.length === 0) {
        return <p className="gs-muted">No cities to display.</p>;
    }

    if (mode === "all") {
        return (
            <div className="gs-cityList">
                {cities.map((c) => (
                    <CityCard
                        key={c.id}
                        city={c}
                        selected={c.id === selectedCityId}
                        onSelect={onSelectCity}
                    />
                ))}
            </div>
        );
    }

    // grouped
    const byEmpire = new Map<number, CityVM[]>();
    for (const c of cities) {
        if (!byEmpire.has(c.empireIndex)) byEmpire.set(c.empireIndex, []);
        byEmpire.get(c.empireIndex)!.push(c);
    }

    const groups = Array.from(byEmpire.entries()).sort(([a], [b]) => a - b);

    return (
        <div className="gs-cityGrouped">
            {groups.map(([empireIdx, list]) => {
                const header =
                    empireMeta.find((e) => e.idx === empireIdx)?.labelShort ?? `Empire ${empireIdx}`;

                return (
                    <div key={empireIdx} className="gs-cityGroup">
                        <div className="gs-cityGroupHeader">
                            <div style={{ fontWeight: 800, color: empireColor(empireIdx) }}>{header}</div>
                            <div className="gs-muted">{list.length} cities</div>
                        </div>

                        <div className="gs-cityList">
                            {list.map((c) => (
                                <CityCard
                                    key={c.id}
                                    city={c}
                                    selected={c.id === selectedCityId}
                                    onSelect={onSelectCity}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}