import React, { useEffect, useMemo, useState } from "react";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import "../GameSummary.css";

import { buildEmpireMeta, EmpireMeta } from "./techProgress.helpers";
import {
    buildCityBreakdownVM,
    defaultEmpireFilterIndex,
    filterCitiesByEmpire,
    pickDefaultSelectedCityId,
    sortCities,
    CitySortKey,
    CityVM,
} from "./cityBreakdown.helpers";

import CityBreakdownToolbar from "../components/city/CityBreakdownToolbar";
import CityList from "../components/city/CityList";
import CityDetailsPanel from "../components/city/CityDetailsPanel";

type Mode = "grouped" | "all";

export default function CityBreakdownView() {
    const state = useEndGameReportStore((s) => s.state);

    const [mode, setMode] = useState<Mode>("grouped");
    const [empireFilter, setEmpireFilter] = useState<number | "all">(defaultEmpireFilterIndex());
    const [sortKey, setSortKey] = useState<CitySortKey>("production");
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

    const empireCountGuess =
        typeof (state.allStats as any)?.EmpireCount === "number"
            ? (state.allStats as any).EmpireCount
            : Array.isArray((state.allStats as any)?.Empires)
                ? (state.allStats as any).Empires.length
                : 0;

    const empireMeta: EmpireMeta[] = useMemo(() => {
        return buildEmpireMeta(empireCountGuess, state.allStats as any);
    }, [empireCountGuess, state.allStats]);

    const vm = useMemo(() => {
        return buildCityBreakdownVM({ cityBreakdown, empireMeta });
    }, [cityBreakdown, empireMeta]);

    const filteredSortedCities: CityVM[] = useMemo(() => {
        const filtered = filterCitiesByEmpire(vm.cities, empireFilter);
        return sortCities(filtered, sortKey);
    }, [vm.cities, empireFilter, sortKey]);

    // Ensure selection is always valid (and picks a sensible default)
    useEffect(() => {
        if (filteredSortedCities.length === 0) {
            if (selectedCityId !== null) setSelectedCityId(null);
            return;
        }

        const stillExists = selectedCityId
            ? filteredSortedCities.some((c) => c.id === selectedCityId)
            : false;

        if (!stillExists) {
            setSelectedCityId(pickDefaultSelectedCityId(filteredSortedCities));
        }
    }, [filteredSortedCities, selectedCityId]);

    const selectedCity: CityVM | null = useMemo(() => {
        if (!selectedCityId) return null;
        return filteredSortedCities.find((c) => c.id === selectedCityId) ?? null;
    }, [filteredSortedCities, selectedCityId]);

    const visibleCityCount = filteredSortedCities.length;

    return (
        <div className="gs-panel">
            <div className="gs-row gs-spaceBetween">
                <h3 className="gs-h3">City Breakdown</h3>
                <div className="gs-muted">
                    Cities: {visibleCityCount}
                    {vm.cityCount !== visibleCityCount ? ` (of ${vm.cityCount})` : ""}
                </div>
            </div>

            <CityBreakdownToolbar
                mode={mode}
                setMode={setMode}
                empireFilter={empireFilter}
                setEmpireFilter={setEmpireFilter}
                sortKey={sortKey}
                setSortKey={setSortKey}
                empireMeta={empireMeta}
            />

            <div className="gs-section gs-cityLayout">
                <div className="gs-cityLeft">
                    <CityList
                        mode={mode}
                        cities={filteredSortedCities}
                        empireMeta={empireMeta}
                        selectedCityId={selectedCityId}
                        onSelectCity={setSelectedCityId}
                    />
                </div>

                <div className="gs-cityRight">
                    <CityDetailsPanel city={selectedCity} />
                </div>
            </div>
        </div>
    );
}