import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { Tech, Improvement, District, Unit } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import { stripDescriptionTokens } from "@/lib/descriptionLine/descriptionLineRenderer";

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

const exportDescriptionLines = (lines: string[] | undefined) =>
    (lines ?? []).map(stripDescriptionTokens).join("; ");

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
                    headers: ["Era", "Name", "Description Lines", "Unique", "Cost"],
                    data: unlockedImprovements.map((improvement) => ({
                        Era: improvement.era ?? "",
                        Name: improvement.displayName ?? "",
                        "Description Lines": exportDescriptionLines(improvement.descriptionLines),
                        Unique: improvement.unique ?? "",
                        Cost: (improvement.cost ?? []).join("; "),
                    })),
                };

            case "districts":
                return {
                    filename: `endless-workshop-${factionLabel}-districts.csv`,
                    headers: ["Era", "Name", "Description Lines"],
                    data: unlockedDistricts.map((district) => ({
                        Era: district.era ?? "",
                        Name: district.displayName ?? "",
                        "Description Lines": exportDescriptionLines(district.descriptionLines),
                    })),
                };

            case "units":
                return {
                    filename: `endless-workshop-${factionLabel}-units.csv`,
                    headers: [
                        "Era",
                        "Name",
                        "Tier",
                        "Type",
                        "Health",
                        "Defense",
                        "Damage (Min–Max)",
                        "Movement",
                        "Skills",
                    ],
                    data: unlockedUnits.map((unit) => ({
                        Era: unit.era ?? "",
                        Name: unit.name ?? "",
                        Tier: unit.tier ?? "",
                        Type: unit.type ?? "",
                        Health: unit.health ?? "",
                        Defense: unit.defense ?? "",
                        "Damage (Min–Max)": `${unit.minDamage ?? ""}-${unit.maxDamage ?? ""}`,
                        Movement: unit.movementPoints ?? "",
                        Skills: (unit.skills ?? []).join("; "),
                    })),
                };

            case "techs":
            default:
                return {
                    filename: `endless-workshop-${factionLabel}-techs.csv`,
                    headers: ["Name", "Era", "Type", "Prereq", "Excludes", "Factions", "Description Lines"],
                    data: selectedTechs.map((tech) => ({
                        Name: tech.name ?? "",
                        Era: tech.era ?? "",
                        Type: tech.type ?? "",
                        Prereq: tech.prereq ?? "",
                        Excludes: tech.excludes ?? "",
                        Factions: (tech.factions ?? []).join("; "),
                        "Description Lines": exportDescriptionLines(tech.descriptionLines),
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
                <button
                    onClick={() => setActiveSheet("districts")}
                    className={activeSheet === "districts" ? "active" : ""}
                >
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