import CodexSearch from "@/components/Codex/CodexSearch";
import { CodexKindIcon } from "@/features/icons/CodexKindIcon";
import type { CodexEntry } from "@/types/dataTypes";

export type CodexCategoryShelfOption = {
    kind: string;
    label: string;
    count: number;
};

type Props = {
    activeKind: string;
    categoryCount: number;
    categoryShelfOptions: readonly CodexCategoryShelfOption[];
    enableCategoryShelf: boolean;
    entryCount: number;
    resultCount: number;
    searchSuggestions: CodexEntry[];
    searchValue: string;
    totalSearchCount: number;
    useCompactHeader: boolean;
    onConfirmSearch: () => void;
    onSearchChange: (nextValue: string) => void;
    onSelectCategory: (kind: string) => void;
    onSelectSearchSuggestion: (entry: CodexEntry) => void;
};

export default function CodexTopPanel({
    activeKind,
    categoryCount,
    categoryShelfOptions,
    enableCategoryShelf,
    entryCount,
    resultCount,
    searchSuggestions,
    searchValue,
    totalSearchCount,
    useCompactHeader,
    onConfirmSearch,
    onSearchChange,
    onSelectCategory,
    onSelectSearchSuggestion,
}: Props) {
    return (
        <header className={`codex-header ${useCompactHeader ? "codex-header--compact" : ""}`}>
            <div className={`codex-header__top ${useCompactHeader ? "codex-header__top--compact" : ""}`}>
                <div className="codex-header__copy">
                    <div className="codex-eyebrow">Endless Workshop archive</div>
                    {!useCompactHeader ? (
                        <h2 className="codex-pageTitle" id="codex-page-title">
                            Encyclopedia
                        </h2>
                    ) : null}
                </div>

                <div className="codex-header__stats" aria-label="Codex encyclopedia statistics">
                    <span className="codex-header__stat">
                        <strong>{entryCount}</strong>
                        <span>entries</span>
                    </span>
                    <span className="codex-header__stat">
                        <strong>{categoryCount}</strong>
                        <span>categories</span>
                    </span>
                </div>
            </div>

            <div className="codex-controlBand">
                <CodexSearch
                    value={searchValue}
                    onChange={onSearchChange}
                    resultCount={resultCount}
                    totalCount={totalSearchCount}
                    suggestions={searchSuggestions}
                    onSelectSuggestion={onSelectSearchSuggestion}
                    onConfirmQuery={onConfirmSearch}
                    enableAutocomplete={false}
                />
            </div>
            {enableCategoryShelf ? (
                <div
                    className="codex-categoryShelf"
                    aria-label="Codex categories"
                >
                    <div className="codex-categoryShelf__label">Categories</div>
                    <div
                        className="codex-categoryShelf__chips codex-categoryShelf__chips--wrap"
                        role="toolbar"
                        aria-label="Filter codex by category"
                    >
                        {categoryShelfOptions.map((option) => {
                            const isActive = option.kind === activeKind;

                            return (
                                <button
                                    key={option.kind}
                                    type="button"
                                    className={`codex-categoryShelf__chip codex-kindFilter__chip ${
                                        isActive ? "is-active" : ""
                                    }`}
                                    onClick={() => onSelectCategory(option.kind)}
                                    aria-pressed={isActive}
                                    aria-label={`${option.label} ${option.count}`}
                                >
                                    <CodexKindIcon
                                        kind={option.kind}
                                        label={option.label}
                                        className="codex-kindIcon codex-kindIcon--chip"
                                        size={15}
                                    />
                                    <span>{option.label}</span>
                                    <span className="codex-kindFilter__count">
                                        {isActive ? `${option.count} entries` : option.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </header>
    );
}
