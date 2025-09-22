import React from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";

interface SpreadsheetToolbarProps {
    selectedTechs: any[];
    allTechs: any[];
    onSelectAll: () => void;
    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
                                                                   selectedTechs,
                                                                   allTechs,
                                                                   onSelectAll,
                                                                   onDeselectAll,
                                                                   generateShareLink,
                                                                   onSort,
                                                               }) => {
    const csvData = allTechs.map((t) => ({
        Name: t.name,
        Era: t.era,
        Type: t.type,
        Unlocks: t.unlocks.map((u: any) => u.name || u).join("; "),
        Effects: t.effects.join("; "),
    }));

    return (
        <div className="spreadsheet-toolbar">
            <button onClick={onSelectAll}>All</button>
            <button onClick={onDeselectAll}>None</button>
            <button onClick={onSort}>Sort</button>
            <button onClick={generateShareLink}>Copy Link</button>
            <CSVLink data={csvData} filename="techs.csv">
                <button>Export CSV</button>
            </CSVLink>
        </div>
    );
};

export default SpreadsheetToolbar;
