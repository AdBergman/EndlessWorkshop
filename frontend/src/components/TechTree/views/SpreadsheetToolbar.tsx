import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { Tech, Improvement } from "@/types/dataTypes";

// Define the possible views the sheet can display
export type SheetView = 'techs' | 'improvements' | 'districts';

interface SpreadsheetToolbarProps {
    selectedTechs: Tech[];
    unlockedImprovements: Improvement[]; // The new data prop
    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
    activeSheet: SheetView;
    setActiveSheet: (view: SheetView) => void;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
    selectedTechs,
    unlockedImprovements,
    onDeselectAll,
    generateShareLink,
    onSort,
    activeSheet,
    setActiveSheet,
}) => {
    // useMemo efficiently calculates the CSV data and filename only when the relevant data changes.
    const { csvData, filename } = useMemo(() => {
        switch (activeSheet) {
            case 'improvements':
                return {
                    filename: `endless-workshop-improvements.csv`,
                    csvData: unlockedImprovements.map((imp) => ({
                        Name: imp.name,
                        Era: imp.era,
                        Unique: imp.unique,
                        Effects: imp.effects?.join("; ") ?? "",
                        Cost: imp.cost?.join("; ") ?? "",
                    })),
                };
            case 'techs':
            default:
                return {
                    filename: `endless-workshop-techs.csv`,
                    csvData: selectedTechs.map((t) => ({
                        Name: t.name,
                        Era: t.era,
                        Type: t.type,
                        Unlocks: t.unlocks.join("; "),
                        Effects: t.effects.join("; "),
                    })),
                };
        }
    }, [activeSheet, selectedTechs, unlockedImprovements]);

    return (
        <div className="spreadsheet-toolbar">
            <div className="action-buttons">
                <button onClick={onSort}>Sort</button>
                <button onClick={onDeselectAll}>Deselect All</button>
                <button onClick={generateShareLink}>Copy Link</button>
                <CSVLink data={csvData} filename={filename}>
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
                    className={`${activeSheet === 'districts' ? 'active' : ''} disabled`}
                    title="Coming Soon"
                >
                    Districts
                </button>
            </div>
        </div>
    );
};

export default SpreadsheetToolbar;
