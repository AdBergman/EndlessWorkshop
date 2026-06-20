import type { StatusScopeFilterOption } from "@/lib/codex/codexStatusArchiveFilters";

type Props = {
    activeScope: string | null;
    options: readonly StatusScopeFilterOption[];
    onClearScope: () => void;
    onToggleScope: (scope: string) => void;
};

export default function StatusArchiveRail({
    activeScope,
    options,
    onClearScope,
    onToggleScope,
}: Props) {
    const hasActiveScope = Boolean(activeScope);

    return (
        <div className="codex-resultsFilters" aria-label="Statuses filters">
            <div className="codex-resultsFilters__controls">
                <div className="codex-resultsFilters__group" role="group" aria-label="Scope">
                    <div className="codex-resultsFilters__groupHeader">
                        <span className="codex-resultsFilters__groupLabel">Scope</span>
                        <button
                            type="button"
                            className={`codex-resultsFilters__clear ${
                                hasActiveScope ? "" : "is-hidden"
                            }`}
                            onClick={onClearScope}
                            aria-hidden={!hasActiveScope}
                            disabled={!hasActiveScope}
                            tabIndex={hasActiveScope ? undefined : -1}
                        >
                            Clear
                        </button>
                    </div>

                    <div className="codex-resultsFilters__chips">
                        {options.map((option) => {
                            const isActive = activeScope === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`codex-resultsFilters__chip ${
                                        isActive ? "is-active" : ""
                                    }`}
                                    onClick={() => onToggleScope(option.value)}
                                    aria-pressed={isActive}
                                    aria-label={`${option.label} ${option.count}`}
                                >
                                    <span>{option.label}</span>
                                    <span className="codex-resultsFilters__count">
                                        {option.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
