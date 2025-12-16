import React, { useState } from "react";
import SummaryLoadView from "./views/SummaryLoadView";
import GameOverviewView from "./views/GameOverviewView";
import TechProgressView from "./views/TechProgressView";
import EmpireStatsView from "./views/EmpireStatsView";
import ReportMetaBar from "./components/ReportMetaBar";
import "./GameSummary.css";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import CityBreakdownView from "@/components/GameSummary/views/CityBreakdownView";

export default function GameSummaryPage() {
    const state = useEndGameReportStore((s) => s.state);
    const clear = useEndGameReportStore((s) => s.clear);
    const [activeTab, setActiveTab] = useState<"overview" | "tech" | "empire" | "cities">("overview");

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

            <div className="gs-row gs-toolbar">
                <button
                    className={`gs-btn ${activeTab === "overview" ? "gs-btn--active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>

                <button
                    className={`gs-btn ${activeTab === "tech" ? "gs-btn--active" : ""}`}
                    onClick={() => setActiveTab("tech")}
                >
                    Tech Progress
                </button>

                <button
                    className={`gs-btn ${activeTab === "empire" ? "gs-btn--active" : ""}`}
                    onClick={() => setActiveTab("empire")}
                >
                    Empire Stats
                </button>
                <button
                    className={`gs-btn ${activeTab === "cities" ? "gs-btn--active" : ""}`}
                    onClick={() => setActiveTab("cities")}
                >
                    Cities
                </button>
            </div>

            {activeTab === "overview" ? (
                <div className="gs-section">
                    <GameOverviewView />
                </div>
            ) : null}

            {activeTab === "tech" ? (
                <div className="gs-section">
                    <TechProgressView />
                </div>
            ) : null}

            {activeTab === "empire" ? (
                <div className="gs-section">
                    <EmpireStatsView />
                </div>
            ) : null}

            {activeTab === "cities" ? (
                <div className="gs-section">
                    <CityBreakdownView />
                </div>
            ) : null}
        </div>
    );
}