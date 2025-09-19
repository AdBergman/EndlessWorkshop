import React from "react";

interface UnlockLineProps {
    line: string;
}

const UnlockLine: React.FC<UnlockLineProps> = ({ line }) => {
    const prefix = "Improvement: ";
    if (line.startsWith(prefix)) {
        const improvementName = line.slice(prefix.length);
        return (
            <div>
                {prefix}
                <span style={{ textDecoration: 'underline', cursor: 'default' }}>
                    {improvementName}
                </span>
            </div>
        );
    } else {
        return <div>{line}</div>;
    }
};

export default UnlockLine;
