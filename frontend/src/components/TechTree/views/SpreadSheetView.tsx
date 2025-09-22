import React, { useState, useEffect } from "react";
import { Tech } from "@dataTypes/dataTypes";
import "./SpreadSheetView.css";
import UnlockLine from "./UnlockLine";
import SpreadsheetToolbar from "./SpreadsheetToolbar";

interface SpreadSheetViewProps {
    techs: Tech[];
}

const SpreadSheetView: React.FC<SpreadSheetViewProps> = ({ techs }) => {
    const [sortedTechs, setSortedTechs] = useState<Tech[]>([]);
    const [selectedTechs, setSelectedTechs] = useState<Tech[]>([]);

    // --- Sync props ---
    useEffect(() => {
        setSortedTechs(techs);
    }, [techs]);

    // --- Sorting ---
    const handleSort = () => {
        const newOrder = [...sortedTechs].sort((a, b) => {
            if (a.era !== b.era) return a.era - b.era;
            return a.name.localeCompare(b.name);
        });
        setSortedTechs(newOrder);
    };

    // --- Selection helpers ---
    const handleSelectAll = () => setSelectedTechs([...sortedTechs]);
    const handleDeselectAll = () => setSelectedTechs([]);
    const handleGenerateShareLink = () => {
        const names = selectedTechs.map((t) => t.name).join(",");
        const link = `${window.location.origin}?share=${encodeURIComponent(names)}`;
        navigator.clipboard.writeText(link).catch(() => {});
        alert("Share link copied to clipboard!");
    };

    // --- Row toggle selection ---
    const toggleTechSelection = (tech: Tech) => {
        setSelectedTechs((prev) =>
            prev.includes(tech)
                ? prev.filter((t) => t !== tech)
                : [...prev, tech]
        );
    };

    if (!sortedTechs || sortedTechs.length === 0) return <div>No techs available</div>;

    return (
        <div className="spreadsheet-wrapper">
            <SpreadsheetToolbar
                selectedTechs={selectedTechs}
                allTechs={sortedTechs}
                onSelectAll={handleSelectAll}
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
                                onClick={() => toggleTechSelection(tech)}
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
