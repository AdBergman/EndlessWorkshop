import React, { useCallback, useMemo, useState } from "react";
import { DropResult } from "./adminImportTypes";

type DropState =
    | { status: "idle" }
    | { status: "dragging" }
    | { status: "reading"; name?: string }
    | { status: "error"; message: string };

type Props<TJson> = {
    disabled?: boolean;
    accept?: string; // default .json
    titleIdle?: string;
    titleDragging?: string;

    onLoaded: (result: DropResult<TJson>) => void;
    onCleared?: () => void;
};

export default function JsonDropzone<TJson>({
                                                disabled,
                                                accept = ".json,application/json",
                                                titleIdle = "Drag & drop your JSON here",
                                                titleDragging = "Drop your file to load it",
                                                onLoaded,
                                                onCleared,
                                            }: Props<TJson>) {
    const [dropState, setDropState] = useState<DropState>({ status: "idle" });
    const [loadedName, setLoadedName] = useState<string | null>(null);

    const isDragging = dropState.status === "dragging";
    const isReading = dropState.status === "reading";
    const errorMessage = dropState.status === "error" ? dropState.message : null;

    const reset = useCallback(() => {
        setDropState({ status: "idle" });
        setLoadedName(null);
        onCleared?.();
    }, [onCleared]);

    const parseAndEmit = useCallback(
        async (file: File) => {
            setDropState({ status: "reading", name: file.name });

            try {
                const isJson =
                    file.type === "application/json" ||
                    file.name.toLowerCase().endsWith(".json") ||
                    file.type === "";

                if (!isJson) {
                    setDropState({ status: "error", message: "Please upload a .json file." });
                    return;
                }

                const rawText = await file.text();
                const json = JSON.parse(rawText) as TJson;

                setLoadedName(file.name);
                setDropState({ status: "idle" });
                onLoaded({ file, rawText, json });
            } catch (e) {
                console.error(e);
                setDropState({
                    status: "error",
                    message: (e as Error)?.message ?? "Failed to read/parse JSON file.",
                });
            }
        },
        [onLoaded]
    );

    const onFilePicked = useCallback(
        async (file: File | null) => {
            if (!file || disabled) return;
            await parseAndEmit(file);
        },
        [disabled, parseAndEmit]
    );

    const onDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;

            const file = e.dataTransfer.files?.[0] ?? null;
            if (!file) return;

            setDropState({ status: "idle" });
            await parseAndEmit(file);
        },
        [disabled, parseAndEmit]
    );

    const onDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;

            if (dropState.status !== "dragging" && dropState.status !== "reading") {
                setDropState({ status: "dragging" });
            }
        },
        [disabled, dropState.status]
    );

    const onDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;

            if (dropState.status === "dragging") {
                setDropState({ status: "idle" });
            }
        },
        [disabled, dropState.status]
    );

    const title = useMemo(() => {
        if (isReading) return "Reading file…";
        if (isDragging) return titleDragging;
        if (loadedName) return "File loaded";
        return titleIdle;
    }, [isDragging, isReading, loadedName, titleDragging, titleIdle]);

    const subtitle = useMemo(() => {
        if (isReading) return dropState.status === "reading" && dropState.name ? dropState.name : "";
        if (loadedName) return loadedName;
        return "Or browse your files to select a JSON file.";
    }, [dropState, isReading, loadedName]);

    return (
        <div
            className={`admin-import-dropzone ${isDragging ? "is-dragging" : ""} ${isReading ? "is-loading" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            role="button"
            tabIndex={0}
            aria-label="Upload JSON by drag and drop"
        >
            <div className="admin-import-dropzoneTitle">{title}</div>
            <div className="admin-import-muted">{subtitle}</div>

            <div className="admin-import-row admin-import-section" style={{ gap: 10 }}>
                <label className="admin-import-uploadLabel">
                    <input
                        type="file"
                        accept={accept}
                        className="admin-import-fileInput"
                        disabled={disabled || isReading}
                        onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
                    />
                    <span className="admin-import-btn">{isReading ? "Reading…" : "Browse files…"}</span>
                </label>

                {loadedName ? (
                    <button
                        type="button"
                        className="admin-import-btn admin-import-btn--ghost"
                        onClick={reset}
                        disabled={disabled || isReading}
                    >
                        Load another file
                    </button>
                ) : null}
            </div>

            {errorMessage ? (
                <div className="admin-import-error">
                    <div className="admin-import-errorTitle">Could not load file</div>
                    <div className="admin-import-muted">{errorMessage}</div>
                </div>
            ) : null}
        </div>
    );
}