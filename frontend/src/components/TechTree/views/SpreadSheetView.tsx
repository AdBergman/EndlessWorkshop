import React, { useState, useMemo, useEffect } from "react";
import { Tech, Improvement, District } from "@/types/dataTypes";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import { getUnlockedImprovements } from "@/utils/unlocks";
import { useGameData } from "@/context/GameDataContext";

const SpreadSheetView: React.FC = () => {
    const {
        selectedTechs,
        setSelectedTechs,
        techs,
        improvements,
        districts,
        createSavedTechBuild
    } = useGameData();

    const [activeSheet, setActiveSheet] = useState<SheetView>("techs");

    const selectedTechObjects = useMemo(() => {
        return selectedTechs
            .map(name => techs.get(name))
            .filter((tech): tech is Tech => tech !== undefined);
    }, [selectedTechs, techs]);

    // --- Keep sortedTechs in sync with selectedTechObjects ---
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
                    if (district) districtUnlocks.push({ ...district, era: tech.era });
                }
            }
        }
        return districtUnlocks;
    }, [selectedTechObjects, districts]);

    const handleSort = () => {
        setSortedTechs([...selectedTechObjects].sort((a, b) => {
            if (a.era !== b.era) return a.era - b.era;
            return a.name.localeCompare(b.name);
        }));
    };

    const handleDeselectAll = () => setSelectedTechs([]);

    const handleGenerateLink = async () => {
        try {
            if (!createSavedTechBuild) return;

            const buildName = "My Build Name";
            const techIds = selectedTechObjects.map(t => t.name);
            const saved = await createSavedTechBuild(buildName, techIds);

            alert(`Link copied! Build UUID: ${saved.uuid}`);
            navigator.clipboard.writeText(`${window.location.origin}?share=${saved.uuid}`);
        } catch (err) {
            console.error(err);
            alert("Failed to generate link");
        }
    };

    if (selectedTechs.length === 0) {
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
                unlockedDistricts={unlockedDistricts}
                onDeselectAll={handleDeselectAll}
                generateShareLink={handleGenerateLink}
                onSort={handleSort}
                activeSheet={activeSheet}
                setActiveSheet={setActiveSheet}
            />
            {renderActiveSheet()}
        </div>
    );
};

export default SpreadSheetView;
