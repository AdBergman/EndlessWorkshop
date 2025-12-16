import React from "react";
import "../../GameSummary.css";
import type { EmpireMeta } from "../../views/techProgress.helpers";
import type { CitySortKey } from "../../views/cityBreakdown.helpers";

type Mode = "grouped" | "all";

const SORT_OPTIONS: Array<{ key: CitySortKey; label: string }> = [
    { key: "production", label: "Production" },
    { key: "population", label: "Population" },
    { key: "districts", label: "Districts" },
    { key: "territories", label: "Territories" },
    { key: "fortification", label: "Fortification" },
    { key: "approval", label: "Approval" },
];

type Props = {
    mode: Mode;
    setMode: (m: Mode) => void;

    empireFilter: number | "all";
    setEmpireFilter: (v: number | "all") => void;

    sortKey: CitySortKey;
    setSortKey: (k: CitySortKey) => void;

    empireMeta: EmpireMeta[];
};

export default function CityBreakdownToolbar({
                                                 mode,
                                                 setMode,
                                                 empireFilter,
                                                 setEmpireFilter,
                                                 sortKey,
                                                 setSortKey,
                                                 empireMeta,
                                             }: Props) {
    return (
        <div className="gs-row gs-toolbar gs-wrap" style={{ gap: 10 }}>
            <div className="gs-row" style={{ gap: 8 }}>
                <button
                    className={`gs-btn ${mode === "grouped" ? "gs-btn--active" : ""}`}
                    onClick={() => setMode("grouped")}
                >
                    Grouped
                </button>
                <button
                    className={`gs-btn ${mode === "all" ? "gs-btn--active" : ""}`}
                    onClick={() => setMode("all")}
                >
                    All cities
                </button>
            </div>

            <div className="gs-row" style={{ gap: 8 }}>
                <span className="gs-muted">Empire:</span>
                <select
                    className="gs-select"
                    value={empireFilter === "all" ? "all" : String(empireFilter)}
                    onChange={(e) => {
                        const v = e.target.value;
                        setEmpireFilter(v === "all" ? "all" : Number(v));
                    }}
                >
                    <option value="all">All empires</option>
                    {empireMeta.map((em) => (
                        <option key={em.idx} value={String(em.idx)}>
                            {em.labelLong}
                        </option>
                    ))}
                </select>
            </div>

            <div className="gs-row" style={{ gap: 8 }}>
                <span className="gs-muted">Sort:</span>
                <select
                    className="gs-select"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as CitySortKey)}
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}