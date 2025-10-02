import React, { useState, useEffect } from "react";
import { Tech } from "@/types/dataTypes";
import "./SpreadSheetView.css";
import UnlockLine from "./UnlockLine";
import SpreadsheetToolbar from "./SpreadsheetToolbar";

interface SpreadSheetViewProps {
    selectedTechs: Tech[];
    setSelectedTechs: (techs: Tech[]) => void;
}

const SpreadSheetView: React.FC<SpreadSheetViewProps> = ({ selectedTechs, setSelectedTechs }) => {
    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);

    // --- Sync props ---
    useEffect(() => {
        setSortedTechs([...selectedTechs]);
    }, [selectedTechs]);

    // --- Sorting ---
    const handleSort = () => {
        const newOrder = [...sortedTechs].sort((a, b) => {
            if (a.era !== b.era) return a.era - b.era;
            return a.name.localeCompare(b.name);
        });
        setSortedTechs(newOrder);
    };

    // --- Deselect All ---
    const handleDeselectAll = () => setSelectedTechs([]);

    // --- Copy Link ---
    const handleGenerateShareLink = () => {
        const names = selectedTechs.map(t => t.name).join(",");
        const link = `${window.location.origin}?share=${encodeURIComponent(names)}`;
        navigator.clipboard.writeText(link).catch(() => {});
        alert("Share link copied to clipboard!");
    };

    if (!sortedTechs || sortedTechs.length === 0) return <div>No techs selected</div>;

    return (
        <div className="spreadsheet-wrapper">
            <SpreadsheetToolbar
                selectedTechs={selectedTechs}
                allTechs={sortedTechs}
                onDeselectAll={handleDeselectAll}
                generateShareLink={handleGenerateShareLink}
                onSort={handleSort}
            />
            <div className="spreadsheet-container">
                <table className="spreadsheet-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Era</th>
                        <th>Type</th>
                        <th>Unlocks</th>
                        <th>Effects</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedTechs.map((tech) => {
                        const isSelected = selectedTechs.includes(tech);
                        return (
                            <tr
                                key={tech.name}
                                className={isSelected ? "selected-row" : ""}
                            >
                                <td>{tech.name}</td>
                                <td>{tech.era}</td>
                                <td>{tech.type}</td>
                                <td style={{ whiteSpace: "pre-line" }}>
                                    {tech.unlocks.map((line, i) => (
                                        <UnlockLine key={i} line={line} />
                                    ))}
                                </td>
                                <td style={{ whiteSpace: "pre-line" }}>
                                    {tech.effects.join(", ").replace(/, /g, "\n")}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpreadSheetView;
