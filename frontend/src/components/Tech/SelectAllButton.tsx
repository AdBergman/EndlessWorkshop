import React from "react";
import { Tech } from "@/types/dataTypes";
import "@/components/Tech/SelectAllButton.css";

interface SelectAllButtonProps {
    eraTechs: Tech[]; // should be selectableTechs for THIS ERA
    setSelectedTechNames: React.Dispatch<React.SetStateAction<string[]>>;
}

const SelectAllButton: React.FC<SelectAllButtonProps> = ({ eraTechs, setSelectedTechNames }) => {
    const handleSelectAll = () => {
        const eraNames = eraTechs.map((t) => t.name);

        setSelectedTechNames((prev) => {
            if (eraNames.length === 0) return prev;

            const prevSet = new Set(prev);
            const toAdd: string[] = [];

            // Preserve the era order and avoid duplicates
            for (const name of eraNames) {
                if (!prevSet.has(name)) toAdd.push(name);
            }

            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
    };

    const xPct = 86.9 + 6.5;
    const yPct = 40.5 + 14.0;

    return (
        <button
            data-testid="select-all-button"
            onClick={handleSelectAll}
            className="select-all-button"
            style={{
                position: "absolute",
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: "translateX(-50%)",
                zIndex: 10,
            }}
        >
            Select All
        </button>
    );
};

export default SelectAllButton;