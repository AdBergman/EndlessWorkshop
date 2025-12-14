import React, { useMemo, useState } from "react";
import { EndGameExportV1 } from "@/types/endGameReport";
import { parseEndGameExport } from "@/utils/parsers/endGameReportParser";
import SummaryLoadView from "./views/SummaryLoadView";
import TechProgressView from "./views/TechProgressView";
import ReportMetaBar from "./components/ReportMetaBar";
import "./GameSummary.css";

export default function GameSummaryPage() {
    const [rawJsonText, setRawJsonText] = useState<string | null>(null);

    const parsed = useMemo(() => {
        if (!rawJsonText) return null;
        return parseEndGameExport(rawJsonText);
    }, [rawJsonText]);

    const report: EndGameExportV1 | undefined = parsed?.ok ? parsed.data : undefined;

    if (!rawJsonText) {
        return <SummaryLoadView onLoadedJsonText={setRawJsonText} />;
    }

    if (!parsed?.ok) {
        return (
            <div className="gs-page">
                <h2 className="gs-title">Game Summary</h2>

                <div className="gs-panel gs-section">
                    <p className="gs-muted">Could not parse report JSON.</p>
                    <pre className="gs-pre">{parsed?.error}</pre>
                    <div className="gs-row gs-section">
                        <button className="gs-btn" onClick={() => setRawJsonText(null)}>
                            Load another file
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="gs-page">
                <h2 className="gs-title">Game Summary</h2>

                <div className="gs-panel gs-section">
                    <p className="gs-muted">Parsed OK, but no report payload was produced.</p>
                    <div className="gs-row gs-section">
                        <button className="gs-btn" onClick={() => setRawJsonText(null)}>
                            Load another file
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gs-page">
            <h2 className="gs-title">Game Summary</h2>

            <div className="gs-section">
                <ReportMetaBar
                    version={report.version ?? "unknown"}
                    generatedAtUtc={report.generatedAtUtc ?? "unknown"}
                    warnings={parsed.warnings}
                    onReset={() => setRawJsonText(null)}
                />
            </div>

            <div className="gs-section">
                <TechProgressView report={report} />
            </div>
        </div>
    );
}