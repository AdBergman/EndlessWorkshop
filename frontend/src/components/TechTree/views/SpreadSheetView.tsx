import React, { useState, useEffect, useMemo } from "react";
import { Tech } from "@/types/dataTypes";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import { getUnlockedImprovements } from "@/utils/unlocks";
import { improvementsMap } from "@/utils/improvementsMap";
import { useAppContext } from "@/context/AppContext";
import techTreeJson from "@/data/techs.json";

// This component no longer receives props, as it gets its state from the context.
const SpreadSheetView: React.FC = () => {
    const { selectedTechs: selectedTechNames, setSelectedTechs } = useAppContext();
    const [activeSheet, setActiveSheet] = useState<SheetView>('techs');

    // --- Data Derivation from Context and JSON ---
    const allTechs = useMemo(() => techTreeJson as Tech[], []);
    const selectedTechObjects = useMemo(() => {
        const techNameSet = new Set(selectedTechNames);
        return allTechs.filter(tech => techNameSet.has(tech.name));
    }, [selectedTechNames, allTechs]);

    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    useEffect(() => {
        setSortedTechs([...selectedTechObjects]);
    }, [selectedTechObjects]);

    const unlockedImprovements = useMemo(
        () => getUnlockedImprovements(selectedTechObjects, improvementsMap),
        [selectedTechObjects]
    );

    // --- Handlers for the Toolbar ---
    const handleSort = () => {
        const newOrder = [...sortedTechs].sort((a, b) => {
            if (a.era !== b.era) return a.era - b.era;
            return a.name.localeCompare(b.name);
        });
        setSortedTechs(newOrder);
    };

    // This now clears the global state.
    const handleDeselectAll = () => setSelectedTechs([]);

    const handleGenerateShareLink = () => {
        const link = `${window.location.origin}?share=${encodeURIComponent(selectedTechNames.join(","))}`;
        navigator.clipboard.writeText(link).catch(() => {});
        alert("Share link copied to clipboard!");
    };

    // If no techs are selected, render nothing but the message.
    if (selectedTechNames.length === 0) {
        return <div className="empty-sheet-message">No techs selected</div>;
    }

    // --- Dynamic Rendering Logic ---
    const renderActiveSheet = () => {
        switch (activeSheet) {
            case 'techs':
                return <TechSheetView techs={sortedTechs} />;
            case 'improvements':
                return <ImprovementSheetView improvements={unlockedImprovements} />;
            case 'districts':
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
