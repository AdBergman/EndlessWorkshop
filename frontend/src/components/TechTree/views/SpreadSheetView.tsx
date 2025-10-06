import React, { useState, useEffect, useMemo } from "react";
import { Tech, Improvement } from "@/types/dataTypes";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import { getUnlockedImprovements } from "@/utils/unlocks";
import { useAppContext } from "@/context/AppContext";
import { useGameData } from "@/context/GameDataContext"; // API context

const SpreadSheetView: React.FC = () => {
    const { selectedTechs: selectedTechNames, setSelectedTechs } = useAppContext();
    const { improvements } = useGameData(); // Improvements from API
    const [activeSheet, setActiveSheet] = useState<SheetView>("techs");

    // --- Techs from JSON ---
    const { techs } = useGameData();
    const allTechs = useMemo(() => Array.from(techs.values()), [techs]);
    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechNames);
        return allTechs.filter((tech) => techNameSet.has(tech.name));
    }, [selectedTechNames, allTechs]);

    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    useEffect(() => {
        setSortedTechs([...selectedTechObjects]);
    }, [selectedTechObjects]);

    // --- Compute unlocked improvements using the PREFIX-aware utility ---
    const unlockedImprovements = useMemo(() => {
        const improvementArray: Improvement[] = Array.from(improvements.values());
        return getUnlockedImprovements(selectedTechObjects, improvementArray);
    }, [selectedTechObjects, improvements]);

    // --- Handlers ---
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

    // --- Sheet rendering ---
    const renderActiveSheet = () => {
        switch (activeSheet) {
            case "techs":
                return <TechSheetView techs={sortedTechs} />;
            case "improvements":
                return <ImprovementSheetView improvements={unlockedImprovements} />;
            case "districts":
                return <DistrictSheetView />;
            default:
                return <TechSheetView techs={sortedTechs} />;
        }
    };

    return (
        <div className="spreadsheet-wrapper">
            <SpreadsheetToolbar
                selectedTechs={selectedTechObjects}
                unlockedImprovements={unlockedImprovements}
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
