import type { KeyboardEvent } from "react";
import { useEffect, useId, useState } from "react";
import { stripDescriptionTokens } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    value: string;
    onChange: (nextValue: string) => void;
    resultCount: number;
    totalCount: number;
    suggestions: CodexEntry[];
    onSelectSuggestion: (entry: CodexEntry) => void;
    onConfirmQuery: () => void;
};

function formatKindLabel(kind: string): string {
    if (!kind) return "Unknown";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function CodexSearch({
    value,
    onChange,
    resultCount,
    totalCount,
    suggestions,
    onSelectSuggestion,
    onConfirmQuery,
}: Props) {
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const listboxId = useId();

    const hasQuery = value.trim().length > 0;
    const showSuggestions = isFocused && hasQuery && suggestions.length > 0;
    const activeSuggestion = showSuggestions ? suggestions[highlightedIndex] : null;

    useEffect(() => {
        if (!showSuggestions) {
            setHighlightedIndex(0);
            return;
        }

        setHighlightedIndex((current) => Math.min(current, suggestions.length - 1));
    }, [showSuggestions, suggestions]);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            if (suggestions.length === 0) return;
            event.preventDefault();
            setIsFocused(true);
            setHighlightedIndex((current) => (current + 1) % suggestions.length);
            return;
        }

        if (event.key === "ArrowUp") {
            if (suggestions.length === 0) return;
            event.preventDefault();
            setIsFocused(true);
            setHighlightedIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
            return;
        }

        if (event.key === "Enter") {
            if (showSuggestions && activeSuggestion) {
                event.preventDefault();
                onSelectSuggestion(activeSuggestion);
                setIsFocused(false);
                return;
            }

            onConfirmQuery();
            return;
        }

        if (event.key === "Escape") {
            setIsFocused(false);
        }
    };

    return (
        <div className="codex-search">
            <div className="codex-search__labelRow">
                <label className="codex-search__label" htmlFor="codex-search-input">
                    Search the encyclopedia
                </label>

                <div className="codex-search__meta" aria-live="polite">
                    {resultCount === totalCount
                        ? `${totalCount} entries`
                        : `${resultCount} of ${totalCount} entries`}
                </div>
            </div>

            <div className="codex-search__fieldWrap">
                <input
                    id="codex-search-input"
                    className="codex-search__input"
                    type="search"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by name, description, or key"
                    autoComplete="off"
                    spellCheck={false}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls={showSuggestions ? listboxId : undefined}
                    aria-activedescendant={activeSuggestion ? `codex-suggestion-${activeSuggestion.entryKey}` : undefined}
                />

                {showSuggestions ? (
                    <div className="codex-search__dropdown" role="listbox" id={listboxId}>
                        {suggestions.map((entry, index) => {
                            const previewLine = entry.descriptionLines
                                .map((line) => stripDescriptionTokens(line))
                                .find((line) => line.length > 0);

                            return (
                                <button
                                    key={entry.entryKey}
                                    id={`codex-suggestion-${entry.entryKey}`}
                                    type="button"
                                    className={`codex-search__option ${
                                        index === highlightedIndex ? "is-highlighted" : ""
                                    }`}
                                    role="option"
                                    aria-selected={index === highlightedIndex}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        onSelectSuggestion(entry);
                                        setIsFocused(false);
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    <span className="codex-search__optionTop">
                                        <span className="codex-search__optionName">
                                            {entry.displayName || entry.entryKey}
                                        </span>
                                        <span className="codex-search__optionKind">
                                            {formatKindLabel(entry.exportKind)}
                                        </span>
                                    </span>

                                    {previewLine ? (
                                        <span className="codex-search__optionPreview">{previewLine}</span>
                                    ) : (
                                        <span className="codex-search__optionKey">{entry.entryKey}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
