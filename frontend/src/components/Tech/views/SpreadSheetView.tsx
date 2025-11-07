import React, {useEffect, useMemo, useState} from "react";
import {District, Tech, Unit} from "@/types/dataTypes";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, {SheetView} from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import {getUnlockedImprovements} from "@/utils/unlocks";
import {useGameData} from "@/context/GameDataContext";
import {Bounce, toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UnitSheetView from "./UnitSheetView";

const SpreadSheetView: React.FC = () => {
    const { selectedTechs, setSelectedTechs, techs, improvements, districts, units, createSavedTechBuild, selectedFaction } = useGameData();
    const [activeSheet, setActiveSheet] = useState<SheetView>("techs");

    const selectedTechObjects = useMemo(() =>
            selectedTechs.map(name => techs.get(name)).filter((t): t is Tech => !!t),
        [selectedTechs, techs]
    );

    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);
    useEffect(() => setSortedTechs([...selectedTechObjects]), [selectedTechObjects]);

    const unlockedImprovements = useMemo(() =>
            getUnlockedImprovements(selectedTechObjects, Array.from(improvements.values())),
        [selectedTechObjects, improvements]
    );

    const unlockedDistricts = useMemo(() => {
        const districtUnlocks: (District & { era: number })[] = [];
        const prefix = "District: ";
        for (const tech of selectedTechObjects) {
            for (const unlock of tech.unlocks ?? []) {
                if (unlock.startsWith(prefix)) {
                    const name = unlock.substring(prefix.length).trim();
                    const district = districts.get(name);
                    if (district) districtUnlocks.push({ ...district, era: tech.era });
                }
            }
        }
        return districtUnlocks;
    }, [selectedTechObjects, districts]);

    const unlockedUnits = useMemo(() => {
        const unitUnlocks: (Unit & { era: number })[] = [];
        const prefix = "Unit Specialization: ";

        for (const tech of selectedTechObjects) {
            for (const unlock of tech.unlocks ?? []) {
                if (unlock.startsWith(prefix)) {
                    const name = unlock.substring(prefix.length).trim();
                    const unit = units.get(name);
                    if (unit) unitUnlocks.push({ ...unit, era: tech.era });
                }
            }
        }

        return unitUnlocks;
    }, [selectedTechObjects, units]);

    const handleSort = () => setSortedTechs([...selectedTechObjects].sort((a, b) => a.era - b.era || a.name.localeCompare(b.name)));
    const handleDeselectAll = () => setSelectedTechs([]);

    const handleGenerateLink = async () => {
        if (!createSavedTechBuild) return;
        try {
            const saved = await createSavedTechBuild("My Build", selectedFaction, selectedTechObjects.map(t => t.name));
            await navigator.clipboard.writeText(`${window.location.origin}?share=${saved.uuid}`);
            toast.success("Link copied!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy link");
        }
    };

    if (selectedTechs.length === 0) return <div className="empty-sheet-message">No techs selected</div>;

    const renderActiveSheet = () => {
        switch (activeSheet) {
            case "techs": return <TechSheetView techs={sortedTechs} />;
            case "improvements": return <ImprovementSheetView improvements={unlockedImprovements} />;
            case "districts": return <DistrictSheetView districts={unlockedDistricts} />;
            case "units": return <UnitSheetView units={unlockedUnits} />;
            default: return <TechSheetView techs={sortedTechs} />;
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
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover={false}
                theme="dark"
                transition={Bounce}
            />
        </div>
    );
};

export default SpreadSheetView;
