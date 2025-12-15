import React from "react";
import "../GameSummary.css";
import { loadEndGameReportFromText } from "@/features/endGame/import/endGameReportLoader";

export default function SummaryLoadView() {
    const onFilePicked = async (file: File | null) => {
        if (!file) return;
        const text = await file.text();
        try {
            loadEndGameReportFromText(text);
        } catch (e) {
            console.error(e);
            alert((e as Error)?.message ?? "Failed to load report.");
        }
    };

    const loadExample = async () => {
        try {
            const res = await fetch("/EL2_EndGame_20251207_194724.json");
            if (!res.ok) {
                alert(`Could not load example JSON (HTTP ${res.status}).`);
                return;
            }
            const text = await res.text();
            loadEndGameReportFromText(text);
        } catch (e) {
            console.error(e);
            alert((e as Error)?.message ?? "Failed to load example JSON.");
        }
    };

    return (
        <div className="gs-page">
            <h2 className="gs-title">Game Summary</h2>

            <div className="gs-panel gs-section">
                <p className="gs-muted">Load an end-game export JSON to view your run.</p>

                <div className="gs-row gs-section">
                    <button className="gs-btn" onClick={loadExample}>
                        Load example
                    </button>

                    <label className="gs-uploadLabel">
                        <input
                            type="file"
                            accept=".json,application/json"
                            className="gs-fileInput"
                            onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
                        />
                        <span className="gs-btn">Upload JSON…</span>
                    </label>
                </div>

                <p className="gs-muted gs-section">
                    Preview: this report stays loaded while you browse other tabs.
                </p>
            </div>
        </div>
    );
}