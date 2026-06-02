import { CodexKindIcon } from "@/features/icons/CodexKindIcon";

type KindOption = {
    kind: string;
    label: string;
    count: number;
};

type Props = {
    options: KindOption[];
    activeKind: string;
    onSelect: (kind: string) => void;
};

export default function KindFilter({ options, activeKind, onSelect }: Props) {
    return (
        <div className="codex-kindFilter" aria-label="Filter codex by kind" role="toolbar">
            {options.map((option) => {
                const isActive = option.kind === activeKind;

                return (
                    <button
                        key={option.kind}
                        type="button"
                        className={`codex-kindFilter__chip ${isActive ? "is-active" : ""}`}
                        onClick={() => onSelect(option.kind)}
                        aria-pressed={isActive}
                    >
                        <CodexKindIcon
                            kind={option.kind}
                            label={option.label}
                            className="codex-kindIcon codex-kindIcon--chip"
                            size={16}
                        />
                        <span>{option.label}</span>
                        <span className="codex-kindFilter__count">{option.count}</span>
                    </button>
                );
            })}
        </div>
    );
}
