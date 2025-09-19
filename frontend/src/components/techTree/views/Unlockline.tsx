import React from "react";
import TechTooltip from "../../tooltip/TechTooltip";

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
                {/*<TechTooltip content={improvementName /* or placeholder text *!/>*/}
          <span
              style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
              }}
          >
            {improvementName}
          </span>
                {/*</TechTooltip>*/}
            </div>
        );
    } else {
        return <div>{line}</div>;
    }
};

export default UnlockLine;
