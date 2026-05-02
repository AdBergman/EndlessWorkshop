import React from "react";
import type { CodexEntry } from "@/types/dataTypes";
import CodexResultRow from "./CodexResultRow";

type Props = {
    entries: CodexEntry[];
    selectedEntryKey: string | null;
    loading: boolean;
    error: string | null;
    onSelect: (entry: CodexEntry) => void;
};

const CodexResultList = React.forwardRef<HTMLDivElement, Props>(function CodexResultList(
    { entries, selectedEntryKey, loading, error, onSelect },
    ref
) {
    let body: React.ReactNode;

    if (loading && entries.length === 0) {
        body = <p className="codex-stateMessage">Loading codex entries…</p>;
    } else if (error) {
        body = <p className="codex-stateMessage codex-stateMessage--error">{error}</p>;
    } else if (entries.length === 0) {
        body = <p className="codex-stateMessage">No entries match the current search.</p>;
    } else {
        body = entries.map((entry) => (
            <CodexResultRow
                key={entry.entryKey}
                entry={entry}
                isSelected={entry.entryKey === selectedEntryKey}
                onSelect={onSelect}
            />
        ));
    }

    return (
        <div className="codex-resultsList" ref={ref}>
            {body}
        </div>
    );
});

export default CodexResultList;
