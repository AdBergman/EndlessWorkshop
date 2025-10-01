import React from "react";
import HoverableItem from "./HoverableItem";

interface UnlockLineProps {
    line: string;
    containerRef: React.RefObject<HTMLDivElement>; // Accept the container ref
}

const UnlockLine: React.FC<UnlockLineProps> = ({ line, containerRef }) => {
    const impPrefix = "Improvement: ";
    const distPrefix = "District: ";

    if (line.startsWith(impPrefix)) {
        return (
            <HoverableItem
                type="Improvement"
                name={line.slice(impPrefix.length)}
                prefix={impPrefix}
                containerRef={containerRef} // Pass the ref down
            />
        );
    }

    if (line.startsWith(distPrefix)) {
        return (
            <HoverableItem
                type="District"
                name={line.slice(distPrefix.length)}
                prefix={distPrefix}
                containerRef={containerRef} // Pass the ref down
            />
        );
    }

    // Fallback: render line normally
    return <div>{line}</div>;
};

export default UnlockLine;
