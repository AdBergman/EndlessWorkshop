import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import type {
    CodexUnitEvolutionLink,
    CodexUnitRichEnrichment,
} from "@/lib/codex/codexUnitRichEnrichment";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";

type Props = {
    enrichment: CodexUnitRichEnrichment;
    onSelect: (entry: CodexEntry) => void;
};

export default function CodexUnitProfileSection({ enrichment, onSelect }: Props) {
    if (!enrichment.previousUnit && enrichment.evolvesInto.length === 0) {
        return null;
    }

    return (
        <section className="codex-detail__section codex-unitProfile" aria-labelledby="codex-unit-profile-heading">
            <div className="codex-sectionLabel" id="codex-unit-profile-heading">
                Evolution
            </div>

            <div className="codex-unitProfile__groups">
                {enrichment.previousUnit ? (
                    <UnitEvolutionGroup
                        label="Previous"
                        links={[enrichment.previousUnit]}
                        onSelect={onSelect}
                    />
                ) : null}
                {enrichment.evolvesInto.length > 0 ? (
                    <UnitEvolutionGroup
                        label="Evolves into"
                        links={enrichment.evolvesInto}
                        onSelect={onSelect}
                    />
                ) : null}
            </div>
        </section>
    );
}

function UnitEvolutionGroup({
    label,
    links,
    onSelect,
}: {
    label: string;
    links: readonly CodexUnitEvolutionLink[];
    onSelect: (entry: CodexEntry) => void;
}) {
    return (
        <div className="codex-unitProfile__group">
            <div className="codex-unitProfile__label">{label}</div>
            <div className="codex-unitProfile__links">
                {links.map((link, index) => (
                    <span className="codex-unitProfile__linkWrap" key={link.entry.entryKey}>
                        {index > 0 ? <span className="codex-unitProfile__separator">·</span> : null}
                        <CodexInlineEntityLink entry={link.entry} onSelect={onSelect}>
                            {renderCodexLabel(link.label)}
                        </CodexInlineEntityLink>
                    </span>
                ))}
            </div>
        </div>
    );
}
