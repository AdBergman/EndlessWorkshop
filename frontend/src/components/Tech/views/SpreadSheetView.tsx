import React, { useEffect, useMemo, useState } from "react";
import "./SpreadSheetView.css";
import SpreadsheetToolbar, { SheetView } from "./SpreadsheetToolbar";
import TechSheetView from "./TechSheetView";
import ImprovementSheetView from "./ImprovementSheetView";
import DistrictSheetView from "./DistrictSheetView";
import UnitSheetView from "./UnitSheetView";
import { useSavedTechBuildCommands } from "@/context/appOrchestration";
import { Tech } from "@/types/dataTypes";
import {
    getUnlockedConstructiblesByKey,
    UnlockedDistrict,
    UnlockedImprovement,
    UnlockedUnit,
} from "@/utils/unlocks";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { selectUnitsByKey, useUnitStore } from "@/stores/unitStore";
import { getTechsByKeys, selectTechsByKey, useTechStore } from "@/stores/techStore";
import {
    selectSelectedTechs,
    selectSetSelectedTechs,
    useTechPlannerStore,
} from "@/stores/techPlannerStore";
import { selectSelectedFaction, useFactionSelectionStore } from "@/stores/factionSelectionStore";

const SpreadSheetView: React.FC = () => {
    const { createSavedTechBuild } = useSavedTechBuildCommands();
    const selectedTechs = useTechPlannerStore(selectSelectedTechs);
    const setSelectedTechs = useTechPlannerStore(selectSetSelectedTechs);
    const selectedFaction = useFactionSelectionStore(selectSelectedFaction);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const unitsByKey = useUnitStore(selectUnitsByKey);
    const techsByKey = useTechStore(selectTechsByKey);

    const [activeSheet, setActiveSheet] = useState<SheetView>("techs");
    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    const selectedTechObjects = useMemo(
        () => getTechsByKeys(selectedTechs, techsByKey),
        [selectedTechs, techsByKey]
    );

    useEffect(() => {
        setSortedTechs([...selectedTechObjects]);
    }, [selectedTechObjects]);

    const unlockedConstructibles = useMemo(
        () =>
            getUnlockedConstructiblesByKey(selectedTechObjects, {
                districtsByKey,
                improvementsByKey,
                unitsByKey,
            }),
        [selectedTechObjects, districtsByKey, improvementsByKey, unitsByKey]
    );
    const unlockedImprovements: UnlockedImprovement[] = unlockedConstructibles.improvements;
    const unlockedDistricts: UnlockedDistrict[] = unlockedConstructibles.districts;
    const unlockedUnits: UnlockedUnit[] = unlockedConstructibles.units;

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
