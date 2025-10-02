import React from "react";
import HoverableItem from "./HoverableItem";

interface UnlockLineProps {
    line: string;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ line }) => {
    const impPrefix = "Improvement: ";
    const distPrefix = "District: ";

    if (line.startsWith(impPrefix)) {
        return (
            <HoverableItem
                type="Improvement"
                name={line.slice(impPrefix.length)}
                prefix={impPrefix}
            />
        );
    }

    if (line.startsWith(distPrefix)) {
        return (
            <HoverableItem
                type="District"
                name={line.slice(distPrefix.length)}
                prefix={distPrefix}
            />
        );
    }

    // Fallback: render line normally
    return <div>{line}</div>;
};

export default UnlockLine;
