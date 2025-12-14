import React, { useMemo, useState } from "react";
import { EndGameExportV1 } from "../../types/endGameReport";
import { parseEndGameExport } from "../../utils/parsers/endGameReportParser";
import SummaryLoadView from "./views/SummaryLoadView";
import TechProgressView from "./views/TechProgressView";
import ReportMetaBar from "./components/ReportMetaBar";

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
            <div style={{ padding: 16 }}>
                <h2>Game Summary</h2>
                <p style={{ opacity: 0.8 }}>Could not parse report JSON.</p>
                <pre style={{ whiteSpace: "pre-wrap" }}>{parsed?.error}</pre>
                <button onClick={() => setRawJsonText(null)}>Load another file</button>
            </div>
        );
    }

    if (!report) {
        return (
            <div style={{ padding: 16 }}>
                <h2>Game Summary</h2>
                <p style={{ opacity: 0.8 }}>Parsed OK, but no report payload was produced.</p>
                <button onClick={() => setRawJsonText(null)}>Load another file</button>
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>Game Summary</h2>

            <ReportMetaBar
                version={report.version ?? "unknown"}
                generatedAtUtc={report.generatedAtUtc ?? "unknown"}
                warnings={parsed.warnings}
                onReset={() => setRawJsonText(null)}
            />

            <TechProgressView report={report} />
        </div>
    );
}