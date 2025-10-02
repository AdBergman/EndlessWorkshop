import React, { useState, useEffect, useMemo } from "react";
import { Tech } from "@/types/dataTypes";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import { getUnlockedImprovements } from "@/utils/unlocks";
import { improvementsMap } from "@/utils/improvementsMap";

interface SpreadSheetViewProps {
    selectedTechs: Tech[];
    setSelectedTechs: (techs: Tech[]) => void;
}

const SpreadSheetView: React.FC<SpreadSheetViewProps> = ({ selectedTechs, setSelectedTechs }) => {
    const [activeSheet, setActiveSheet] = useState<SheetView>('techs');
    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    useEffect(() => {
        setSortedTechs([...selectedTechs]);
    }, [selectedTechs]);

    // --- Data Derivation ---
    const unlockedImprovements = useMemo(
        () => getUnlockedImprovements(selectedTechs, improvementsMap),
        [selectedTechs]
    );

    // --- Handlers for the Toolbar (currently specific to Techs) ---
    const handleSort = () => {
        const newOrder = [...sortedTechs].sort((a, b) => {
            if (a.era !== b.era) return a.era - b.era;
            return a.name.localeCompare(b.name);
        });
        setSortedTechs(newOrder);
    };

    const handleDeselectAll = () => setSelectedTechs([]);

    const handleGenerateShareLink = () => {
        const names = selectedTechs.map(t => t.name).join(",");
        const link = `${window.location.origin}?share=${encodeURIComponent(names)}`;
        navigator.clipboard.writeText(link).catch(() => {});
        alert("Share link copied to clipboard!");
    };

    // If no techs are selected, render nothing but the message.
    if (selectedTechs.length === 0) {
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
                selectedTechs={selectedTechs}
                unlockedImprovements={unlockedImprovements} // Pass the new data down
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
