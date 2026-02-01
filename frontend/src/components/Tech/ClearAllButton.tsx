import React from "react";
import "@/components/Tech/ClearAllButton.css";

interface ClearAllButtonProps {
    setSelectedTechNames: React.Dispatch<React.SetStateAction<string[]>>;
}

const ClearAllButton: React.FC<ClearAllButtonProps> = ({ setSelectedTechNames }) => {
    const handleClearAll = () => {
        setSelectedTechNames([]); // ✅ clear ALL eras
    };

    const xPct = 86.9 + 6.5;
    const yPct = 40.5 + 14.0 + 3.5;

    return (
        <button
            data-testid="clear-all-button"
            onClick={handleClearAll}
            className="select-all-button"
            style={{
                position: "absolute",
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: "translateX(-50%)",
                zIndex: 10,
            }}
        >
            Clear All
        </button>
    );
};

export default ClearAllButton;