import React, { useEffect, useMemo, useState } from "react";
import "../CityBreakdown.css";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import { buildEmpireMeta, type EmpireMeta } from "./techProgress.helpers";

import {
    type CitySortKey,
    type SortDir,
    buildCityBreakdownVM,
    defaultEmpireFilterIndex,
    filterCitiesByEmpire,
    groupCitiesByEmpire,
    pickStableSelectedCityId,
    sortCities,
    findCityById,
} from "./cityBreakdown.helpers";

import CityDetailsPanel from "../components/city/CityDetailsPanel";
import CityCard from "../components/city/CityCard";

type GroupMode = "grouped" | "flat";

export default function CityBreakdownView() {
    const state = useEndGameReportStore((s) => s.state);

    // View controls
    const [empireFilter, setEmpireFilter] = useState<number | "all">(defaultEmpireFilterIndex());
    const [sortKey, setSortKey] = useState<CitySortKey>("production");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [groupMode, setGroupMode] = useState<GroupMode>("grouped");

    // Selection
    const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

    // ---- Edge states ----
    if (state.status !== "ok") {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Breakdown</h3>
                <p className="gs-muted">Load an end-game export to view cities.</p>
            </div>
        );
    }

    const allStats: any = state.allStats;
    const cityBreakdown: any = state.cityBreakdown;

    if (!cityBreakdown) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Breakdown</h3>
                <p className="gs-muted">No cityBreakdown section found in this report.</p>
            </div>
        );
    }

    // Empire meta (for labels)
    const empireCount =
        typeof allStats?.EmpireCount === "number"
            ? allStats.EmpireCount
            : Array.isArray(allStats?.Empires)
                ? allStats.Empires.length
                : 0;

    const empireMeta: EmpireMeta[] = useMemo(() => {
        return buildEmpireMeta(empireCount, allStats);
    }, [empireCount, allStats]);

    // Build City VM once
    const vm = useMemo(() => {
        return buildCityBreakdownVM({ cityBreakdown, empireMeta });
    }, [cityBreakdown, empireMeta]);

    // Filter + sort list used by the left column
    const filteredCities = useMemo(() => {
        return filterCitiesByEmpire(vm.cities, empireFilter);
    }, [vm.cities, empireFilter]);

    const sortedCities = useMemo(() => {
        return sortCities(filteredCities, sortKey, sortDir);
    }, [filteredCities, sortKey, sortDir]);

    // Grouped view data
    const grouped = useMemo(() => {
        const g = groupCitiesByEmpire(sortedCities);
        // deterministic order of groups
        return Array.from(g.entries()).sort((a, b) => a[0] - b[0]);
    }, [sortedCities]);

    // ---- Selection stability ----
    useEffect(() => {
        const next = pickStableSelectedCityId({
            currentCities: sortedCities,
            prevSelectedId: selectedCityId,
            sortKey,
            sortDir,
        });

        if (next !== selectedCityId) {
            setSelectedCityId(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedCities, sortKey, sortDir]);

    const selectedCity = useMemo(() => {
        return findCityById(vm.cities, selectedCityId);
    }, [vm.cities, selectedCityId]);

    const hasCities = vm.cities.length > 0;
    const hasFilteredCities = sortedCities.length > 0;

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3">City Breakdown</h3>
                <div className="gs-muted">
                    Cities: {vm.cityCount ?? vm.cities.length}
                    {typeof empireFilter === "number" ? ` • Showing: E${empireFilter}` : ""}
                </div>
            </div>

            {!hasCities ? (
                <p className="gs-muted gs-section">No cities found in this export.</p>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="gs-row gs-toolbar gs-wrap" style={{ gap: 12 }}>
                        <div className="gs-row" style={{ gap: 8 }}>
                            <span className="gs-muted">Empire:</span>
                            <select
                                className="gs-select"
                                value={empireFilter}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setEmpireFilter(v === "all" ? "all" : Number(v));
                                }}
                            >
                                <option value="all">All</option>
                                {empireMeta.map((em) => (
                                    <option key={em.idx} value={em.idx}>
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
                                <option value="production">Production</option>
                                <option value="population">Population</option>
                                <option value="approval">Approval</option>
                                <option value="districts">Controlled Tiles</option>
                                <option value="territories">Territories</option>
                                <option value="fortification">Fortification</option>
                            </select>

                            <button
                                className="gs-btn"
                                onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                                title="Toggle sort direction"
                            >
                                {sortDir === "desc" ? "Desc" : "Asc"}
                            </button>
                        </div>

                        <div className="gs-row" style={{ gap: 8 }}>
                            <span className="gs-muted">View:</span>
                            <button
                                className={`gs-btn ${groupMode === "grouped" ? "gs-btn--active" : ""}`}
                                onClick={() => setGroupMode("grouped")}
                            >
                                Grouped
                            </button>
                            <button
                                className={`gs-btn ${groupMode === "flat" ? "gs-btn--active" : ""}`}
                                onClick={() => setGroupMode("flat")}
                            >
                                Flat
                            </button>
                        </div>
                    </div>

                    {/* Layout */}
                    <div className="gs-cityLayout gs-section">
                        {/* Left: list */}
                        <div className="gs-cityLeft">
                            {!hasFilteredCities ? (
                                <div className="gs-cityGroup">
                                    <div className="gs-muted">
                                        No cities match this selection (empire filter or export may have 0 cities).
                                    </div>
                                </div>
                            ) : groupMode === "flat" ? (
                                <div className="gs-cityList">
                                    {sortedCities.map((c) => (
                                        <CityCard
                                            key={c.id}
                                            city={c}
                                            selected={c.id === selectedCityId}
                                            onSelect={(id) => setSelectedCityId(id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="gs-cityGrouped">
                                    {grouped.map(([empireIdx, cities]) => {
                                        const em = empireMeta.find((x) => x.idx === empireIdx);
                                        const header = em?.labelLong ?? `Empire ${empireIdx}`;

                                        return (
                                            <div className="gs-cityGroup" key={empireIdx}>
                                                <div className="gs-cityGroupHeader">
                                                    <div style={{ fontWeight: 800 }}>{header}</div>
                                                    <div className="gs-muted">{cities.length} cities</div>
                                                </div>

                                                <div className="gs-cityList">
                                                    {cities.map((c) => (
                                                        <CityCard
                                                            key={c.id}
                                                            city={c}
                                                            selected={c.id === selectedCityId}
                                                            onSelect={(id) => setSelectedCityId(id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: details */}
                        <div className="gs-cityRight">
                            <CityDetailsPanel city={selectedCity} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}