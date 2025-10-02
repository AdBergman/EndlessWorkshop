import React from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { Tech } from "@/types/dataTypes";

// Define the possible views the sheet can display
export type SheetView = 'techs' | 'improvements' | 'districts';

interface SpreadsheetToolbarProps {
    selectedTechs: Tech[];
    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
    activeSheet: SheetView;
    setActiveSheet: (view: SheetView) => void;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
                                                                   selectedTechs,
                                                                   onDeselectAll,
                                                                   generateShareLink,
                                                                   onSort,
                                                                   activeSheet,
                                                                   setActiveSheet,
                                                               }) => {
    // CSV export data depends on current view
    let csvData;
    if (activeSheet === 'techs') {
        csvData = selectedTechs.map((t) => ({
            Name: t.name,
            Era: t.era,
            Type: t.type,
            Unlocks: t.unlocks.join("; "),
            Effects: t.effects.join("; "),
        }));
    } else if (activeSheet === 'improvements') {
        // You can replace this with the actual unlocked improvements logic later
        csvData = selectedTechs.flatMap(t =>
            t.unlocks
                .filter(line => line.startsWith("Improvement: "))
                .map(line => ({ Name: line.slice("Improvement: ".length) }))
        );
    } else {
        // districts or units
        csvData = []; // placeholder until we implement
    }

    return (
        <div className="spreadsheet-toolbar">
            {/* Action buttons on the left */}
            <div className="action-buttons">
                <button onClick={onSort}>Sort</button>
                <button onClick={onDeselectAll}>Deselect All</button>
                <button onClick={generateShareLink}>Copy Link</button>
                <CSVLink data={csvData} filename={`endless-workshop-${activeSheet}.csv`}>
                    <button>Export CSV</button>
                </CSVLink>
            </div>

            {/* View toggle buttons on the right */}
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
                    className={activeSheet === 'districts' ? 'active disabled' : 'disabled'}
                    title="Coming Soon"
                >
                    Districts
                </button>
            </div>
        </div>
    );
};

export default SpreadsheetToolbar;
