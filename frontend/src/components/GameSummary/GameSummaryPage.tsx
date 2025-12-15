import React from "react";
import SummaryLoadView from "./views/SummaryLoadView";
import TechProgressView from "./views/TechProgressView";
import ReportMetaBar from "./components/ReportMetaBar";
import "./GameSummary.css";
import { useEndGameReportStore } from "@/stores/endGameReportStore";

export default function GameSummaryPage() {
    const state = useEndGameReportStore((s) => s.state);
    const clear = useEndGameReportStore((s) => s.clear);

    if (state.status === "empty") {
        return <SummaryLoadView />;
    }

    if (state.status === "loading") {
        return (
            <div className="gs-page">
                <h2 className="gs-title">Game Summary</h2>
                <div className="gs-panel gs-section">
                    <p className="gs-muted">Loading report…</p>
                </div>
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <div className="gs-page">
                <h2 className="gs-title">Game Summary</h2>

                <div className="gs-panel gs-section">
                    <p className="gs-muted">Could not parse report JSON.</p>
                    <pre className="gs-pre">{state.error}</pre>

                    {state.warnings.length > 0 && (
                        <p className="gs-muted gs-section">
                            Warnings: {state.warnings.length}
                        </p>
                    )}

                    <div className="gs-row gs-section">
                        <button className="gs-btn" onClick={clear}>
                            Load another file
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ok
    const { report, warnings } = state;

    return (
        <div className="gs-page">
            <h2 className="gs-title">Game Summary</h2>

            <div className="gs-section">
                <ReportMetaBar
                    version={report.version ?? "unknown"}
                    generatedAtUtc={report.generatedAtUtc ?? "unknown"}
                    warnings={warnings}
                    onReset={clear}
                />
            </div>

            <div className="gs-section">
                <TechProgressView report={report} />
            </div>
        </div>
    );
}