import React, { useMemo, useState } from "react";
import SummaryLoadView from "./views/SummaryLoadView";
import GameOverviewView from "./views/GameOverviewView";
import TechProgressView from "./views/TechProgressView";
import EmpireStatsView from "./views/EmpireStatsView";
import CityBreakdownView from "./views/CityBreakdownView";
import ReportMetaBar from "./components/ReportMetaBar";
import { useEndGameReportStore } from "@/stores/endGameReportStore";
import "./GameSummary.css";
import {formatLocalDateTime} from "@/components/GameSummary/views/gameOverview.helpers";

type TabKey = "overview" | "tech" | "empire" | "cities";

export default function GameSummaryPage() {
    const state = useEndGameReportStore((s) => s.state);
    const clear = useEndGameReportStore((s) => s.clear);

    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    const tabs = useMemo(
        () =>
            [
                { key: "overview" as const, label: "Overview", view: <GameOverviewView /> },
                { key: "tech" as const, label: "Tech Progress", view: <TechProgressView /> },
                { key: "empire" as const, label: "Empire Stats", view: <EmpireStatsView /> },
                { key: "cities" as const, label: "Cities", view: <CityBreakdownView /> },
            ] satisfies Array<{ key: TabKey; label: string; view: React.ReactNode }>,
        []
    );

    if (state.status === "empty") return <SummaryLoadView />;

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
        const warningsCount = Array.isArray((state as any).warnings) ? (state as any).warnings.length : 0;

        return (
            <div className="gs-page">
                <h2 className="gs-title">Game Summary</h2>

                <div className="gs-panel gs-section">
                    <p className="gs-muted">Could not parse report JSON.</p>
                    <pre className="gs-pre">{state.error}</pre>

                    {warningsCount > 0 ? <p className="gs-muted gs-section">Warnings: {warningsCount}</p> : null}

                    <div className="gs-row gs-section">
                        <button className="gs-btn" onClick={clear}>
                            Load another file
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { report, warnings } = state;

    const activeView = tabs.find((t) => t.key === activeTab)?.view ?? tabs[0].view;

    const pageClassName = `gs-page ${activeTab === "empire" ? "gs-page--wide" : ""}`;

    return (
        <div className={pageClassName}>
            <h2 className="gs-title">Game Summary</h2>

            <div className="gs-section">
                <ReportMetaBar
                    version={report.meta.version}
                    generatedAtUtc={formatLocalDateTime(report.meta.generatedAtUtc)}
                    warnings={warnings}
                    onReset={clear}
                />
            </div>

            <div className="gs-row gs-toolbar">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        className={`gs-btn ${activeTab === t.key ? "gs-btn--active" : ""}`}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="gs-section">{activeView}</div>
        </div>
    );
}