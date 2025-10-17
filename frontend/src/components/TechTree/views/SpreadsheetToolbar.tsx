import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { Tech, Improvement, District } from "@/types/dataTypes";

export type SheetView = 'techs' | 'improvements' | 'districts';

interface SpreadsheetToolbarProps {
    selectedTechs: Tech[];
    unlockedImprovements: Improvement[];
    unlockedDistricts: (District & { era: number })[];
    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
    activeSheet: SheetView;
    setActiveSheet: (view: SheetView) => void;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
                                                                   selectedTechs,
                                                                   unlockedImprovements,
                                                                   unlockedDistricts,
                                                                   onDeselectAll,
                                                                   generateShareLink,
                                                                   onSort,
                                                                   activeSheet,
                                                                   setActiveSheet,
                                                               }) => {
    const { data, headers, filename } = useMemo(() => {
        switch (activeSheet) {
            case 'improvements':
                return {
                    filename: `endless-workshop-improvements.csv`,
                    headers: ["Name", "Era", "Unique", "Effects", "Cost"],
                    data: unlockedImprovements.map(imp => ({
                        Name: imp.name,
                        Era: imp.era,
                        Unique: imp.unique,
                        Effects: imp.effects?.join("; ") ?? "",
                        Cost: imp.cost?.join("; ") ?? "",
                    })),
                };
            case 'districts':
                return {
                    filename: `endless-workshop-districts.csv`,
                    headers: ["Name", "Era", "Effect", "Info", "Tile Bonus", "Adjacency Bonus", "Placement Prerequisite"],
                    data: unlockedDistricts.map(d => ({
                        Name: d.name,
                        Era: d.era,
                        Effect: d.effect ?? "",
                        Info: d.info?.join("; ") ?? "",
                        "Tile Bonus": d.tileBonus?.join("; ") ?? "",
                        "Adjacency Bonus": d.adjacencyBonus?.join("; ") ?? "",
                        "Placement Prerequisite": d.placementPrereq ?? "None",
                    })),
                };
            case 'techs':
            default:
                return {
                    filename: `endless-workshop-techs.csv`,
                    headers: ["Name", "Era", "Type", "Unlocks", "Effects"],
                    data: selectedTechs.map(t => ({
                        Name: t.name,
                        Era: t.era,
                        Type: t.type,
                        Unlocks: t.unlocks?.join("; ") ?? "",
                        Effects: t.effects?.join("; ") ?? "",
                    })),
                };
        }
    }, [activeSheet, selectedTechs, unlockedImprovements, unlockedDistricts]);

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
                <button
                    onClick={() => setActiveSheet('techs')}
                    className={activeSheet === 'techs' ? 'active' : ''}
                >
                    Techs
                </button>
                <button
                    onClick={() => setActiveSheet('improvements')}
                    className={activeSheet === 'improvements' ? 'active' : ''}
                >
                    Improvements
                </button>
                <button
                    onClick={() => setActiveSheet('districts')}
                    className={activeSheet === 'districts' ? 'active' : ''}
                >
                    Districts
                </button>
            </div>
        </div>
    );
};

export default SpreadsheetToolbar;
