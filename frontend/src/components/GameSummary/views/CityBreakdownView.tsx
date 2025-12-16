import React, { useEffect, useMemo, useState } from "react";
import "../GameSummary.css";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import { buildEmpireMeta, type EmpireMeta } from "./techProgress.helpers";

import {
    buildCityBreakdownVM,
    buildEmpireFilterOptions,
    filterCitiesByEmpire,
    groupCitiesByEmpire,
    pickBestDefaultCityId,
    sortCities,
    type CitySortKey,
    type SortDir,
    type CityVM,
} from "./cityBreakdown.helpers";

import CityDetailsPanel from "../components/city/CityDetailsPanel";
import CityCard from "../components/city/CityCard";
import CityGroup from "../components/city/CityGroup";

type GroupMode = "grouped" | "flat";

const SORT_KEYS: Array<{ key: CitySortKey; label: string }> = [
    { key: "production", label: "Production" },
    { key: "population", label: "Population" },
    { key: "approval", label: "Approval" },
    { key: "districts", label: "Footprint" },      // exporter name, UI label is “Footprint”
    { key: "territories", label: "Regions" },
    { key: "fortification", label: "Fortification" },
];

export default function CityBreakdownView() {
    const state = useEndGameReportStore((s) => s.state);

    const [empireFilter, setEmpireFilter] = useState<number | "all">(0);
    const [sortKey, setSortKey] = useState<CitySortKey>("production");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [groupMode, setGroupMode] = useState<GroupMode>("grouped");

    const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

    if (state.status !== "ok") {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Breakdown</h3>
                <p className="gs-muted">No loaded report.</p>
            </div>
        );
    }

    const cityBreakdown: any = state.cityBreakdown;
    if (!cityBreakdown) {
        return (
            <div className="gs-panel">
                <h3 className="gs-h3">City Breakdown</h3>
                <p className="gs-muted">No cityBreakdown section found in this report.</p>
            </div>
        );
    }

    const allStats: any = state.allStats;
    const empireCount =
        typeof allStats?.EmpireCount === "number"
            ? allStats.EmpireCount
            : Array.isArray(allStats?.Empires)
                ? allStats.Empires.length
                : (state.techOrder?.empireCount ?? 0);

    const empireMeta: EmpireMeta[] = useMemo(() => {
        return buildEmpireMeta(empireCount, allStats);
    }, [empireCount, allStats]);

    const vm = useMemo(() => {
        return buildCityBreakdownVM({ cityBreakdown, empireMeta });
    }, [cityBreakdown, empireMeta]);

    const empireOptions = useMemo(() => {
        return buildEmpireFilterOptions({
            empireMeta,
            empireCityCounts: vm.empireCityCounts,
            totalCityCount: vm.cities.length,
        });
    }, [empireMeta, vm.empireCityCounts, vm.cities.length]);

    // cities visible in current scope (filter -> sort)
    const citiesInScope: CityVM[] = useMemo(() => {
        const filtered = filterCitiesByEmpire(vm.cities, empireFilter);
        const sorted = sortCities(filtered, sortKey, sortDir);
        return sorted;
    }, [vm.cities, empireFilter, sortKey, sortDir]);

    // selection correctness: if selected is not visible anymore, pick best default in scope
    useEffect(() => {
        if (citiesInScope.length === 0) {
            setSelectedCityId(null);
            return;
        }

        if (selectedCityId && citiesInScope.some((c) => c.id === selectedCityId)) {
            return;
        }

        setSelectedCityId(pickBestDefaultCityId(citiesInScope));
    }, [citiesInScope, selectedCityId]);

    const selectedCity = useMemo(() => {
        if (!selectedCityId) return null;
        return vm.cities.find((c) => c.id === selectedCityId) ?? null;
    }, [vm.cities, selectedCityId]);

    // when filter is "all" and grouped mode, group AFTER sorting within each empire
    const grouped = useMemo(() => {
        const map = groupCitiesByEmpire(citiesInScope);
        // keep empires in stable order = empireMeta order
        const ordered: Array<{ empireIndex: number; title: string; cities: CityVM[] }> = [];

        for (const em of empireMeta) {
            const cities = map.get(em.idx) ?? [];
            const title = em.idx === 0 ? `${em.faction} (Player)` : em.faction;
            ordered.push({ empireIndex: em.idx, title, cities });
        }

        // also include any unknown empires present (just in case)
        for (const [idx, cities] of map.entries()) {
            if (!ordered.some((o) => o.empireIndex === idx)) {
                ordered.push({ empireIndex: idx, title: `Empire ${idx}`, cities });
            }
        }

        return ordered;
    }, [citiesInScope, empireMeta]);

    const showGroupToggle = empireFilter === "all";

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3">City Breakdown</h3>
                <div className="gs-muted">
                    Cities: {vm.cities.length} • Showing: {citiesInScope.length}
                </div>
            </div>

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
                        {empireOptions.map((o) => (
                            <option key={String(o.value)} value={o.value}>
                                {o.label}
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
                        {SORT_KEYS.map((k) => (
                            <option key={k.key} value={k.key}>
                                {k.label}
                            </option>
                        ))}
                    </select>

                    <button
                        className={`gs-btn ${sortDir === "desc" ? "gs-btn--active" : ""}`}
                        onClick={() => setSortDir("desc")}
                    >
                        Desc
                    </button>
                    <button
                        className={`gs-btn ${sortDir === "asc" ? "gs-btn--active" : ""}`}
                        onClick={() => setSortDir("asc")}
                    >
                        Asc
                    </button>
                </div>

                {showGroupToggle ? (
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
                ) : null}
            </div>

            {/* Layout */}
            <div className="gs-cityLayout">
                <div className="gs-cityLeft">
                    {citiesInScope.length === 0 ? (
                        <div className="gs-muted">No cities in this view.</div>
                    ) : empireFilter === "all" && groupMode === "grouped" ? (
                        <div className="gs-cityGrouped">
                            {grouped.map((g) => (
                                <CityGroup
                                    key={g.empireIndex}
                                    title={g.title}
                                    count={g.cities.length}
                                    cities={g.cities}
                                    selectedCityId={selectedCityId}
                                    onSelectCity={setSelectedCityId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="gs-cityList">
                            {citiesInScope.map((c) => (
                                <CityCard
                                    key={c.id}
                                    city={c}
                                    selected={selectedCityId === c.id}
                                    onSelect={setSelectedCityId}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="gs-cityRight">
                    <CityDetailsPanel city={selectedCity} />
                </div>
            </div>
        </div>
    );
}