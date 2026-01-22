import React, { useCallback, useState } from "react";
import "../GameSummary.css";
import "../CityBreakdown.css";
import { loadEndGameReportFromText } from "@/features/endGame/import/endGameReportLoader";

const EXAMPLE_PATH = "/EL2_EndGame_20260122_112521.json";

export default function SummaryLoadView() {
    const [isLoadingExample, setIsLoadingExample] = useState(false);

    const loadText = useCallback((text: string) => {
        // Loader is the single entry-point that updates the global store.
        loadEndGameReportFromText(text);
    }, []);

    const onFilePicked = useCallback(async (file: File | null) => {
        if (!file) return;

        try {
            const text = await file.text();
            loadText(text);
        } catch (e) {
            console.error(e);
            alert((e as Error)?.message ?? "Failed to load report.");
        }
    }, [loadText]);

    const loadExample = useCallback(async () => {
        setIsLoadingExample(true);
        try {
            const res = await fetch(EXAMPLE_PATH, { cache: "no-store" });
            if (!res.ok) {
                alert(`Could not load example JSON (HTTP ${res.status}).`);
                return;
            }
            const text = await res.text();
            loadText(text);
        } catch (e) {
            console.error(e);
            alert((e as Error)?.message ?? "Failed to load example JSON.");
        } finally {
            setIsLoadingExample(false);
        }
    }, [loadText]);

    return (
        <div className="gs-page">
            <h2 className="gs-title">Game Summary</h2>

            <div className="gs-panel gs-section">
                <p className="gs-muted">Load an end-game export JSON to view your run.</p>

                <div className="gs-row gs-section">
                    <button className="gs-btn" onClick={loadExample} disabled={isLoadingExample}>
                        {isLoadingExample ? "Loading…" : "Load example"}
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