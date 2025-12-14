import React from "react";
import { ParseWarning } from "../../../types/endGameReport";

type Props = {
    version: string;
    generatedAtUtc: string;
    warnings: ParseWarning[];
    onReset: () => void;
};

export default function ReportMetaBar({ version, generatedAtUtc, warnings, onReset }: Props) {
    return (
        <div
            style={{
                marginTop: 8,
                padding: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            <span style={{ opacity: 0.85 }}>Version: {version}</span>
            <span style={{ opacity: 0.85 }}>Generated: {generatedAtUtc}</span>
            <span style={{ opacity: 0.85 }}>Warnings: {warnings.length}</span>

            <button style={{ marginLeft: "auto" }} onClick={onReset}>
                Load another file
            </button>
        </div>
    );
}