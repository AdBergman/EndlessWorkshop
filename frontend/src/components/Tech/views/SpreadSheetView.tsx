import React, { useEffect, useMemo, useState } from "react";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import UnitSheetView from "./UnitSheetView";
import { useGameData } from "@/context/GameDataContext";
import { Tech } from "@/types/dataTypes";
import {
    getUnlockedDistricts,
    getUnlockedImprovements,
    getUnlockedUnits,
    UnlockedDistrict,
    UnlockedImprovement,
    UnlockedUnit,
} from "@/utils/unlocks";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SpreadSheetView: React.FC = () => {
    const {
        selectedTechs,
        setSelectedTechs,
        techs,
        improvements,
        districts,
        units,
        createSavedTechBuild,
        selectedFaction,
    } = useGameData();

    const [activeSheet, setActiveSheet] = useState<SheetView>("techs");
    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    const selectedTechObjects = useMemo(
        () => selectedTechs.map((key) => techs.get(key)).filter((t): t is Tech => !!t),
        [selectedTechs, techs]
    );

    useEffect(() => {
        setSortedTechs([...selectedTechObjects]);
    }, [selectedTechObjects]);

    const unlockedImprovements: UnlockedImprovement[] = useMemo(
        () => getUnlockedImprovements(selectedTechObjects, Array.from(improvements.values())),
        [selectedTechObjects, improvements]
    );

    const unlockedDistricts: UnlockedDistrict[] = useMemo(
        () => getUnlockedDistricts(selectedTechObjects, Array.from(districts.values())),
        [selectedTechObjects, districts]
    );

    const unlockedUnits: UnlockedUnit[] = useMemo(
        () => getUnlockedUnits(selectedTechObjects, Array.from(units.values())),
        [selectedTechObjects, units]
    );

    const handleSort = () => {
        setSortedTechs(
            [...selectedTechObjects].sort((a, b) => a.era - b.era || a.name.localeCompare(b.name))
        );
    };

    const handleDeselectAll = () => setSelectedTechs([]);

    const handleGenerateLink = async () => {
        if (!createSavedTechBuild) return;

        try {
            const saved = await createSavedTechBuild(
                "My Build",
                selectedFaction,
                selectedTechObjects.map((t) => t.techKey)
            );

            const url = new URL("/tech", window.location.origin);
            url.searchParams.set("share", saved.uuid);

            await navigator.clipboard.writeText(url.toString());
            toast.success("Link copied!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy link");
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
            case "units":
                return <UnitSheetView units={unlockedUnits} />;
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
                unlockedUnits={unlockedUnits}
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