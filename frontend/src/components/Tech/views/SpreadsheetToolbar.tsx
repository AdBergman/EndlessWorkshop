import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { Tech, Improvement, District, Unit, TechUnlockRef } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";

export type SheetView = "techs" | "improvements" | "districts" | "units";

interface SpreadsheetToolbarProps {
    selectedTechs: Tech[];
    unlockedImprovements: (Improvement & { era: number })[];
    unlockedDistricts: (District & { era: number })[];
    unlockedUnits: (Unit & { era: number })[];

    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
    activeSheet: SheetView;
    setActiveSheet: (view: SheetView) => void;
}

const formatUnlocks = (unlocks: TechUnlockRef[] | undefined) =>
    (unlocks ?? []).map((u) => `${u.unlockType}:${u.unlockKey}`);

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
                                                                   selectedTechs,
                                                                   unlockedImprovements,
                                                                   unlockedDistricts,
                                                                   unlockedUnits,
                                                                   onDeselectAll,
                                                                   generateShareLink,
                                                                   onSort,
                                                                   activeSheet,
                                                                   setActiveSheet,
                                                               }) => {
    const { selectedFaction } = useGameData();
    const factionLabel = selectedFaction?.uiLabel?.toLowerCase() ?? "all-factions";

    const { data, headers, filename } = useMemo(() => {
        switch (activeSheet) {
            case "improvements":
                return {
                    filename: `endless-workshop-${factionLabel}-improvements.csv`,
                    headers: ["Era", "Key", "Name", "Description Lines", "Unique", "Cost"],
                    data: unlockedImprovements.map((imp) => ({
                        Era: imp.era ?? "",
                        Key: imp.improvementKey ?? "",
                        Name: imp.displayName ?? "",
                        "Description Lines": (imp.descriptionLines ?? []).join("; "),
                        Unique: imp.unique ?? "",
                        Cost: (imp.cost ?? []).join("; "),
                    })),
                };

            case "districts":
                return {
                    filename: `endless-workshop-${factionLabel}-districts.csv`,
                    headers: ["Era", "Key", "Name", "Description Lines"],
                    data: unlockedDistricts.map((d) => ({
                        Era: d.era ?? "",
                        Key: d.districtKey ?? "",
                        Name: d.displayName ?? "",
                        "Description Lines": (d.descriptionLines ?? []).join("; "),
                    })),
                };

            case "units":
                return {
                    filename: `endless-workshop-${factionLabel}-units.csv`,
                    headers: ["Era", "Key", "Name", "Tier", "Type", "Health", "Defense", "Damage (Min–Max)", "Movement", "Skills"],
                    data: unlockedUnits.map((u) => ({
                        Era: u.era ?? "",
                        Key: u.unitKey ?? "",
                        Name: u.name ?? "",
                        Tier: u.tier ?? "",
                        Type: u.type ?? "",
                        Health: u.health ?? "",
                        Defense: u.defense ?? "",
                        "Damage (Min–Max)": `${u.minDamage ?? ""}-${u.maxDamage ?? ""}`,
                        Movement: u.movementPoints ?? "",
                        Skills: (u.skills ?? []).join("; "),
                    })),
                };

            case "techs":
            default:
                return {
                    filename: `endless-workshop-${factionLabel}-techs.csv`,
                    headers: ["Key", "Name", "Era", "Type", "Prereq", "Excludes", "Factions", "Description Lines", "Unlocks"],
                    data: selectedTechs.map((t) => ({
                        Key: t.techKey ?? "",
                        Name: t.name ?? "",
                        Era: t.era ?? "",
                        Type: t.type ?? "",
                        Prereq: t.prereq ?? "",
                        Excludes: t.excludes ?? "",
                        Factions: (t.factions ?? []).join("; "),
                        "Description Lines": (t.descriptionLines ?? []).join("; "),
                        Unlocks: formatUnlocks(t.unlocks).join("; "),
                    })),
                };
        }
    }, [activeSheet, factionLabel, unlockedImprovements, unlockedDistricts, unlockedUnits, selectedTechs]);

    return (
        <div className="spreadsheet-toolbar">
            <div className="action-buttons">
                <button onClick={onSort}>Sort</button>
                <button onClick={onDeselectAll}>Deselect All</button>
                <button onClick={generateShareLink}>Copy Link</button>
                <CSVLink data={data} headers={headers} filename={filename}>
                    <button>Export CSV</button>
                </CSVLink>
            </div>

            <div className="view-toggle-buttons">
                <button onClick={() => setActiveSheet("techs")} className={activeSheet === "techs" ? "active" : ""}>
                    Techs
                </button>
                <button
                    onClick={() => setActiveSheet("improvements")}
                    className={activeSheet === "improvements" ? "active" : ""}
                >
                    Improvements
                </button>
                <button onClick={() => setActiveSheet("districts")} className={activeSheet === "districts" ? "active" : ""}>
                    Districts
                </button>
                <button onClick={() => setActiveSheet("units")} className={activeSheet === "units" ? "active" : ""}>
                    Units
                </button>
            </div>
        </div>
    );
};

export default SpreadsheetToolbar;