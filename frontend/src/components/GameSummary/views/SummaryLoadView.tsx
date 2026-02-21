import React, { useCallback, useMemo, useState } from "react";
import "../GameSummary.css";
import "../CityBreakdown.css";
import { loadEndGameReportFromText } from "@/features/endGame/import/endGameReportLoader";

const EXAMPLE_PATH = "/EL2_EndGame_20260221_090536.json";

const MOD_URL = "https://github.com/AdBergman/EL2StatsMod";

const EXPORT_PATH =
    "BepInEx/reports/ (e.g. C:\\Program Files (x86)\\Steam\\steamapps\\common\\ENDLESS Legend 2\\BepInEx\\reports\\)";

type DropState =
    | { status: "idle" }
    | { status: "dragging" }
    | { status: "loading"; name?: string }
    | { status: "error"; message: string };

export default function SummaryLoadView() {
    const [isLoadingExample, setIsLoadingExample] = useState(false);
    const [dropState, setDropState] = useState<DropState>({ status: "idle" });
    const [showHelp, setShowHelp] = useState(false);

    const loadText = useCallback((text: string) => {
        loadEndGameReportFromText(text);
    }, []);

    const loadFile = useCallback(
        async (file: File) => {
            setDropState({ status: "loading", name: file.name });
            try {
                const text = await file.text();
                loadText(text);
            } catch (e) {
                console.error(e);
                setDropState({
                    status: "error",
                    message: (e as Error)?.message ?? "Failed to load report.",
                });
            }
        },
        [loadText]
    );

    const onFilePicked = useCallback(
        async (file: File | null) => {
            if (!file) return;
            await loadFile(file);
        },
        [loadFile]
    );

    const loadExample = useCallback(async () => {
        setIsLoadingExample(true);
        setDropState({ status: "loading", name: "Example report" });

        try {
            const res = await fetch(EXAMPLE_PATH, { cache: "no-store" });
            if (!res.ok) {
                setDropState({
                    status: "error",
                    message: `Could not load example report (HTTP ${res.status}).`,
                });
                return;
            }
            const text = await res.text();
            loadText(text);
        } catch (e) {
            console.error(e);
            setDropState({
                status: "error",
                message: (e as Error)?.message ?? "Failed to load example report.",
            });
        } finally {
            setIsLoadingExample(false);
        }
    }, [loadText]);

    const isDragging = dropState.status === "dragging";
    const isLoading = dropState.status === "loading";
    const errorMessage = dropState.status === "error" ? dropState.message : null;

    const dropTitle = useMemo(() => {
        if (isLoading) return "Loading report…";
        if (isDragging) return "Drop your report file to load it";
        return "Drag & drop your report file here";
    }, [isDragging, isLoading]);

    const dropSubtitle = useMemo(() => {
        if (isLoading) return dropState.status === "loading" && dropState.name ? dropState.name : "";
        return "Or browse your files to select a report file.";
    }, [isLoading, dropState]);

    const onDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const file = e.dataTransfer.files?.[0] ?? null;
            setDropState({ status: "idle" });

            if (!file) return;

            const isJson =
                file.type === "application/json" ||
                file.name.toLowerCase().endsWith(".json") ||
                file.type === "";

            if (!isJson) {
                setDropState({ status: "error", message: "Please upload a .json file." });
                return;
            }

            await loadFile(file);
        },
        [loadFile]
    );

    const onDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropState.status !== "dragging" && dropState.status !== "loading") {
                setDropState({ status: "dragging" });
            }
        },
        [dropState.status]
    );

    const onDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropState.status === "dragging") {
                setDropState({ status: "idle" });
            }
        },
        [dropState.status]
    );

    return (
        <div className="gs-page">
            <h2 className="gs-title">Game Summary</h2>

            <div className="gs-panel gs-section">
                <p className="gs-muted" style={{ marginBottom: 10 }}>
                    Upload an end-game report to analyze your Endless Legend 2 run.
                </p>

                <div
                    className={`gs-dropzone ${isDragging ? "is-dragging" : ""} ${isLoading ? "is-loading" : ""}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload report JSON by drag and drop"
                >
                    <div className="gs-dropzoneTitle">{dropTitle}</div>
                    <div className="gs-muted">{dropSubtitle}</div>

                    <div className="gs-row gs-section" style={{ gap: 10 }}>
                        <label className="gs-uploadLabel">
                            <input
                                type="file"
                                accept=".json,application/json"
                                className="gs-fileInput"
                                disabled={isLoading}
                                onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
                            />
                            <span className="gs-btn">{isLoading ? "Loading…" : "Browse files…"}</span>
                        </label>

                        <span className="gs-muted gs-or" aria-hidden>
                            {" "}
                            or{" "}
                        </span>

                        <button
                            type="button"
                            className="gs-btn gs-btn--ghost gs-btn--ghost-view"
                            onClick={loadExample}
                            disabled={isLoadingExample || isLoading}
                            title="View an example report"
                        >
                            {isLoadingExample ? "Loading example…" : "View example"}
                        </button>
                    </div>

                    {errorMessage ? (
                        <div className="gs-section" style={{ marginTop: 10 }}>
                            <div className="gs-panel gs-warningsPanel">
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Could not load file</div>
                                <div className="gs-muted">{errorMessage}</div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="gs-section" style={{ marginTop: 12 }}>
                    <div className="gs-muted">
                        To analyze your own game, you need a report exported from Endless Legend 2.
                        <br />
                        It’s exported at the Victory screen by the{" "}
                        <a href={MOD_URL} target="_blank" rel="noreferrer">
                            End Game Report mod
                        </a>
                        . Then load the resulting file here.
                    </div>

                    <button
                        type="button"
                        className="gs-btn gs-btn--chipText"
                        style={{ marginTop: 10 }}
                        onClick={() => setShowHelp((v) => !v)}
                        aria-expanded={showHelp}
                    >
                        {showHelp ? "Hide help" : "Where do I find the exported file?"}
                    </button>

                    {showHelp ? (
                        <div className="gs-panel gs-section" style={{ marginTop: 10 }}>
                            <div style={{ fontWeight: 800, marginBottom: 6 }}>Finding your export</div>
                            <ol className="gs-muted" style={{ margin: 0, paddingLeft: 18 }}>
                                <li>Finish a game and reach the Victory screen (the mod exports automatically).</li>
                                <li>
                                    Look for a <code>.json</code> file in:
                                    <div style={{ marginTop: 6 }}>
                                        <code>{EXPORT_PATH}</code>
                                    </div>
                                </li>
                                <li>Drag &amp; drop the file here, or use “Browse files…”.</li>
                            </ol>
                        </div>
                    ) : null}
                </div>

                <p className="gs-muted gs-section">Preview: this report stays loaded while you browse other tabs.</p>
            </div>
        </div>
    );
}