import React, { useEffect, useState } from "react";
import { ParseWarning } from "@/types/endGameReport";
import "../GameSummary.css";
import "../CityBreakdown.css";

type Props = {
    version: string;
    generatedAtUtc: string;
    warnings: ParseWarning[];
    onReset: () => void;
};

export default function ReportMetaBar({ version, generatedAtUtc, warnings, onReset }: Props) {
    const [showWarnings, setShowWarnings] = useState(false);
    const warningCount = Array.isArray(warnings) ? warnings.length : 0;

    // If warnings disappear (e.g. parser normalization or reload),
    // ensure the panel closes cleanly.
    useEffect(() => {
        if (warningCount === 0 && showWarnings) {
            setShowWarnings(false);
        }
    }, [warningCount, showWarnings]);

    return (
        <div className="gs-panel gs-metaBarWrap">
            <div className="gs-row gs-metaBar">
                <span className="gs-metaItem">
                    <span className="gs-metaLabel">Version</span>
                    <span className="gs-metaValue">{version}</span>
                </span>

                <span className="gs-metaItem">
                    <span className="gs-metaLabel">Generated</span>
                    <span className="gs-metaValue">{generatedAtUtc}</span>
                </span>

                {warningCount > 0 && (
                    <span className="gs-metaItem">
                        <span className="gs-metaLabel">Warnings</span>
                        <button
                            type="button"
                            className="gs-btn gs-btn--chip"
                            onClick={() => setShowWarnings((v) => !v)}
                            title="Show warnings"
                        >
                            {warningCount}
                        </button>
                    </span>
                )}

                <button className="gs-btn gs-metaReset" onClick={onReset}>
                    Load another file
                </button>
            </div>

            {showWarnings && warningCount > 0 && (
                <div className="gs-panel gs-section gs-warningsPanel">
                    <div className="gs-muted" style={{ marginBottom: 8 }}>
                        Parser warnings (safe fallbacks)
                    </div>

                    <ul className="gs-warningsList">
                        {warnings.map((w, i) => (
                            <li key={`${w.code}-${i}`} className="gs-warningsItem">
                                <div className="gs-muted">{w.code}</div>
                                <div>{w.message}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}