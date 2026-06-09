import React, { useId } from "react";
import {
    MAX_VETERANCY_LEVEL,
    VETERANCY_LENS_DESCRIPTION,
    VETERANCY_LEVELS,
    clampVeterancyLevel,
} from "@/components/Units/utils/applyVeterancy";
import "./VeterancyLens.css";

export type VeterancyLensProps = {
    selectedLevel: number;
    onChange: (level: number) => void;
    disabled?: boolean;
    hidden?: boolean;
    maxLevel?: number;
    className?: string;
    id?: string;
};

export const VeterancyLens: React.FC<VeterancyLensProps> = ({
    selectedLevel,
    onChange,
    disabled = false,
    hidden = false,
    maxLevel = MAX_VETERANCY_LEVEL,
    className,
    id,
}) => {
    const generatedId = useId();
    const baseId = id ?? generatedId;
    const descriptionId = `${baseId}-description`;
    const roundedMax = Number.isFinite(maxLevel) ? Math.round(maxLevel) : MAX_VETERANCY_LEVEL;
    const safeMax = Math.min(MAX_VETERANCY_LEVEL, Math.max(0, roundedMax));
    const levels = VETERANCY_LEVELS.filter((level) => level <= safeMax);
    const safeSelected = disabled ? 0 : Math.min(clampVeterancyLevel(selectedLevel), safeMax);

    if (hidden) return null;

    const commitLevel = (level: number) => {
        if (disabled) return;
        onChange(Math.min(clampVeterancyLevel(level), safeMax));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            commitLevel(Math.min(safeMax, safeSelected + 1));
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            commitLevel(Math.max(0, safeSelected - 1));
        } else if (event.key === "Home") {
            event.preventDefault();
            commitLevel(0);
        } else if (event.key === "End") {
            event.preventDefault();
            commitLevel(safeMax);
        }
    };

    return (
        <section
            className={`veterancyLens ${disabled ? "isDisabled" : ""} ${className ?? ""}`.trim()}
            aria-labelledby={`${baseId}-label`}
        >
            <div className="veterancyLens__copy">
                <div className="veterancyLens__labelRow">
                    <span id={`${baseId}-label`} className="veterancyLens__label">
                        Veterancy Lens
                    </span>
                    <span className="veterancyLens__levelText">
                        {disabled ? "Base only" : `Level ${safeSelected}`}
                    </span>
                </div>
                <p id={descriptionId} className="veterancyLens__hint" title={VETERANCY_LENS_DESCRIPTION}>
                    {disabled ? "Heroes do not use unit veterancy." : "Preview cumulative unit stat gains."}
                </p>
            </div>

            <div
                className="veterancyLens__rail"
                role="radiogroup"
                aria-label="Veterancy level"
                aria-describedby={descriptionId}
                aria-disabled={disabled}
                onKeyDown={handleKeyDown}
            >
                {levels.map((level) => {
                    const selected = level === safeSelected;
                    const label = level === 0 ? "Base stats" : `Veterancy level ${level}`;

                    return (
                        <button
                            key={level}
                            type="button"
                            className={`veterancyLens__node ${selected ? "isSelected" : ""}`}
                            role="radio"
                            aria-checked={selected}
                            aria-label={label}
                            title={label}
                            disabled={disabled}
                            onClick={() => commitLevel(level)}
                        >
                            <span className="veterancyLens__dot" aria-hidden="true" />
                            <span className="veterancyLens__number">{level}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
