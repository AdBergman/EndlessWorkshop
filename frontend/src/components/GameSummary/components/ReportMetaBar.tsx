import React from "react";
import { ParseWarning } from "@/types/endGameReport";
import "../GameSummary.css";

type Props = {
    version: string;
    generatedAtUtc: string;
    warnings: ParseWarning[];
    onReset: () => void;
};

export default function ReportMetaBar({ version, generatedAtUtc, warnings, onReset }: Props) {
    return (
        <div className="gs-panel gs-row gs-metaBar">
      <span className="gs-metaItem">
        <span className="gs-metaLabel">Version</span>
        <span className="gs-metaValue">{version}</span>
      </span>

            <span className="gs-metaItem">
        <span className="gs-metaLabel">Generated</span>
        <span className="gs-metaValue">{generatedAtUtc}</span>
      </span>

            <span className="gs-metaItem">
        <span className="gs-metaLabel">Warnings</span>
        <span className="gs-metaValue">{warnings.length}</span>
      </span>

            <button className="gs-btn gs-metaReset" onClick={onReset}>
                Load another file
            </button>
        </div>
    );
}