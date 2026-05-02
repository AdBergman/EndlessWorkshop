import React, { useCallback, useMemo, useState } from "react";
import { DropManyResult, DropResult } from "./adminImportTypes";

type DropState =
    | { status: "idle" }
    | { status: "dragging" }
    | { status: "reading"; name?: string }
    | { status: "error"; message: string };

type Props<TJson> = {
    disabled?: boolean;
    accept?: string; // default .json
    multiple?: boolean;
    titleIdle?: string;
    titleDragging?: string;

    onLoaded: (result: DropResult<TJson>) => void;
    onLoadedMany?: (result: DropManyResult<TJson>) => void;
    onCleared?: () => void;
};

export default function JsonDropzone<TJson>({
                                                disabled,
                                                accept = ".json,application/json",
                                                multiple = false,
                                                titleIdle = "Drag & drop your JSON here",
                                                titleDragging = "Drop your file to load it",
                                                onLoaded,
                                                onLoadedMany,
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

    const parseFile = useCallback(async (file: File): Promise<DropResult<TJson>> => {
        const isJson =
            file.type === "application/json" ||
            file.name.toLowerCase().endsWith(".json") ||
            file.type === "";

        if (!isJson) {
            throw new Error("Please upload a .json file.");
        }

        const rawText = await file.text();
        const json = JSON.parse(rawText) as TJson;
        return { file, rawText, json };
    }, []);

    const parseAndEmit = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;

            const readingName = files.length === 1 ? files[0].name : `${files.length} files`;
            setDropState({ status: "reading", name: readingName });

            if (!multiple) {
                try {
                    const result = await parseFile(files[0]);
                    setLoadedName(files[0].name);
                    setDropState({ status: "idle" });
                    onLoaded(result);
                } catch (e) {
                    console.error(e);
                    setDropState({
                        status: "error",
                        message: (e as Error)?.message ?? "Failed to read/parse JSON file.",
                    });
                }
                return;
            }

            const loaded: DropResult<TJson>[] = [];
            const errors: DropManyResult<TJson>["errors"] = [];

            for (const file of files) {
                try {
                    loaded.push(await parseFile(file));
                } catch (e) {
                    console.error(e);
                    errors.push({
                        file,
                        message: (e as Error)?.message ?? "Failed to read/parse JSON file.",
                    });
                }
            }

            if (loaded.length === 0 && errors.length > 0) {
                const first = errors[0];
                const suffix = errors.length > 1 ? ` (${errors.length} files failed)` : "";
                setLoadedName(null);
                setDropState({ status: "error", message: `${first.file.name}: ${first.message}${suffix}` });
                onLoadedMany?.({ loaded, errors });
                return;
            }

            const loadedLabel =
                loaded.length === 1
                    ? loaded[0].file.name
                    : `${loaded.length} file${loaded.length === 1 ? "" : "s"} loaded`;

            setLoadedName(loadedLabel);
            setDropState({ status: "idle" });
            onLoadedMany?.({ loaded, errors });
        },
        [multiple, onLoaded, onLoadedMany, parseFile]
    );

    const onFilePicked = useCallback(
        async (fileList: FileList | null) => {
            if (!fileList || disabled) return;
            const files = multiple ? Array.from(fileList) : [fileList[0]].filter(Boolean) as File[];
            await parseAndEmit(files);
        },
        [disabled, multiple, parseAndEmit]
    );

    const onDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (disabled) return;

            const files = multiple
                ? Array.from(e.dataTransfer.files ?? [])
                : [e.dataTransfer.files?.[0]].filter(Boolean) as File[];
            if (files.length === 0) return;

            setDropState({ status: "idle" });
            await parseAndEmit(files);
        },
        [disabled, multiple, parseAndEmit]
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
        return multiple
            ? "Or browse your files to select one or more JSON files."
            : "Or browse your files to select a JSON file.";
    }, [dropState, isReading, loadedName, multiple]);

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
                        multiple={multiple}
                        className="admin-import-fileInput"
                        disabled={disabled || isReading}
                        onChange={(e) => onFilePicked(e.target.files)}
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
