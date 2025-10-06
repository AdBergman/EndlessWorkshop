import React, { useState, useEffect, useMemo } from "react";
import { Tech, Improvement, District } from "@/types/dataTypes";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import { getUnlockedImprovements } from "@/utils/unlocks";
import { useAppContext } from "@/context/AppContext";
import { useGameData } from "@/context/GameDataContext";

const SpreadSheetView: React.FC = () => {
    const { selectedTechs: selectedTechNames, setSelectedTechs } = useAppContext();
    const { techs, improvements, districts } = useGameData();
    const [activeSheet, setActiveSheet] = useState<SheetView>("techs");

    const selectedTechObjects = useMemo(() => {
        return selectedTechNames
            .map(name => techs.get(name))
            .filter((tech): tech is Tech => tech !== undefined);
    }, [selectedTechNames, techs]);

    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    useEffect(() => {
        setSortedTechs([...selectedTechObjects]);
    }, [selectedTechObjects]);

    const unlockedImprovements = useMemo(() => {
        const improvementArray: Improvement[] = Array.from(improvements.values());
        return getUnlockedImprovements(selectedTechObjects, improvementArray);
    }, [selectedTechObjects, improvements]);

    const unlockedDistricts = useMemo(() => {
        const districtUnlocks: (District & { era: number })[] = [];
        const districtPrefix = "District: ";

        for (const tech of selectedTechObjects) {
            for (const unlockLine of tech.unlocks ?? []) {
                if (unlockLine.startsWith(districtPrefix)) {
                    const distName = unlockLine.substring(districtPrefix.length).trim();
                    const district = districts.get(distName);
                    if (district) {
                        districtUnlocks.push({ ...district, era: tech.era });
                    }
                }
            }
        }
        return districtUnlocks;
    }, [selectedTechObjects, districts]);

    const handleSort = () => {
        const newOrder = [...sortedTechs].sort((a, b) => {
            if (a.era !== b.era) return a.era - b.era;
            return a.name.localeCompare(b.name);
        });
        setSortedTechs(newOrder);
    };

    const handleDeselectAll = () => setSelectedTechs([]);

    const handleGenerateShareLink = () => {
        const link = `${window.location.origin}?share=${encodeURIComponent(
            selectedTechNames.join(",")
        )}`;
        navigator.clipboard.writeText(link).catch(() => {});
        alert("Share link copied to clipboard!");
    };

    if (selectedTechNames.length === 0) {
        return <div className="empty-sheet-message">No techs selected</div>;
    }

    const renderActiveSheet = () => {
        switch (activeSheet) {
            case "techs":
                return <TechSheetView techs={sortedTechs} />;
            case "improvements":
                return <ImprovementSheetView improvements={unlockedImprovements} />;
            case "districts":
                return <DistrictSheetView districts={unlockedDistricts} />;
            default:
                return <TechSheetView techs={sortedTechs} />;
        }
    };

    return (
        <div className="spreadsheet-wrapper">
            <SpreadsheetToolbar
                selectedTechs={selectedTechObjects}
                unlockedImprovements={unlockedImprovements}
                unlockedDistricts={unlockedDistricts} // <-- Pass the new data down
                onDeselectAll={handleDeselectAll}
                generateShareLink={handleGenerateShareLink}
                onSort={handleSort}
                activeSheet={activeSheet}
                setActiveSheet={setActiveSheet}
            />
            {renderActiveSheet()}
        </div>
    );
};

export default SpreadSheetView;
