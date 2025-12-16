import React, { useState } from "react";
import "../../GameSummary.css";
import type { CityVM } from "../../views/cityBreakdown.helpers";
import CityCard from "./CityCard";

type Props = {
    title: string;
    count: number;
    cities: CityVM[];
    selectedCityId: string | null;
    onSelectCity: (id: string) => void;
};

export default function CityGroup({ title, count, cities, selectedCityId, onSelectCity }: Props) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="gs-cityGroup">
            <div className="gs-cityGroupHeader">
                <div className="gs-row" style={{ gap: 10 }}>
                    <button
                        type="button"
                        className="gs-btn"
                        onClick={() => setCollapsed((v) => !v)}
                        style={{ padding: "0.25rem 0.6rem", opacity: 0.95 }}
                    >
                        {collapsed ? "Expand" : "Collapse"}
                    </button>

                    <div style={{ fontWeight: 800 }}>{title}</div>
                    <div className="gs-muted">• {count}</div>
                </div>
            </div>

            {collapsed ? null : (
                <div className="gs-cityList">
                    {cities.length === 0 ? (
                        <div className="gs-muted">No cities.</div>
                    ) : (
                        cities.map((c) => (
                            <CityCard
                                key={c.id}
                                city={c}
                                selected={selectedCityId === c.id}
                                onSelect={onSelectCity}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}