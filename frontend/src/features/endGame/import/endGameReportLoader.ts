import { parseEndGameExport } from "@/utils/parsers/endGameReportParser";
import { useEndGameReportStore } from "@/stores/endGameReportStore";

export function loadEndGameReportFromText(rawJsonText: string) {
    const store = useEndGameReportStore.getState();

    store.setState({ status: "loading", rawJsonText });

    const parsed = parseEndGameExport(rawJsonText);

    if (!parsed.ok) {
        store.setState({
            status: "error",
            rawJsonText,
            error: parsed.error ?? "Unknown parse error",
            warnings: parsed.warnings,
        });
        return;
    }

    if (!parsed.data) {
        store.setState({
            status: "error",
            rawJsonText,
            error: "Parser returned ok but no data.",
            warnings: parsed.warnings,
        });
        return;
    }

    const report = parsed.data;

// Minimal "is this really our export?" validation
    const hasMeta = !!report.version || !!report.generatedAtUtc;
    const hasAnySection = !!report.techOrder || !!report.allStats || !!report.cityBreakdown;

    if (!hasMeta || !hasAnySection) {
        store.setState({
            status: "error",
            rawJsonText,
            error: "This file is valid JSON, but it does not look like an Endless Legend 2 end-game export.",
            warnings: parsed.warnings,
        });
        return;
    }

    store.setState({
        status: "ok",
        rawJsonText,
        report,
        warnings: parsed.warnings,
    });
}