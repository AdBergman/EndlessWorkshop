import React from "react";
import { isCodexQuestGroupEntry, type CodexListItem } from "@/lib/codex/codexPresentation";
import CodexResultRow from "./CodexResultRow";
import CodexQuestGroupRow from "./CodexQuestGroupRow";

type Props = {
    entries: CodexListItem[];
    selectedEntryKey: string | null;
    loading: boolean;
    error: string | null;
    onSelect: (entry: CodexListItem) => void;
    onToggleQuestGroup: (groupKey: string) => void;
};

const CodexResultList = React.forwardRef<HTMLDivElement, Props>(function CodexResultList(
    { entries, selectedEntryKey, loading, error, onSelect, onToggleQuestGroup },
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
        body = entries.map((entry) => {
            if (isCodexQuestGroupEntry(entry)) {
                return (
                    <CodexQuestGroupRow
                        key={entry.entryKey}
                        group={entry}
                        selectedEntryKey={selectedEntryKey}
                        onSelect={onSelect}
                        onToggle={onToggleQuestGroup}
                    />
                );
            }

            return (
                <CodexResultRow
                    key={entry.entryKey}
                    entry={entry}
                    isSelected={entry.entryKey === selectedEntryKey}
                    onSelect={onSelect}
                />
            );
        });
    }

    return (
        <div className="codex-resultsList" ref={ref}>
            {body}
        </div>
    );
});

export default CodexResultList;
