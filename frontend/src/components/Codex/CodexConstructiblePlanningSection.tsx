import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import type {
    CodexConstructibleLink,
    CodexConstructibleRichEnrichment,
} from "@/lib/codex/codexConstructibleRichEnrichment";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";

type Props = {
    enrichment: CodexConstructibleRichEnrichment;
    onSelect: (entry: CodexEntry) => void;
};

export default function CodexConstructiblePlanningSection({ enrichment, onSelect }: Props) {
    if (
        enrichment.unlockedBy.length === 0 &&
        enrichment.upgradesInto.length === 0 &&
        enrichment.placementLines.length === 0
    ) {
        return null;
    }

    return (
        <section
            className="codex-detail__section codex-constructiblePlanning"
            aria-labelledby="codex-constructible-planning-heading"
        >
            <div className="codex-sectionLabel" id="codex-constructible-planning-heading">
                Planning
            </div>

            <div className="codex-constructiblePlanning__groups">
                {enrichment.unlockedBy.length > 0 ? (
                    <ConstructiblePlanningLinkGroup
                        label="Unlocked by"
                        links={enrichment.unlockedBy}
                        onSelect={onSelect}
                    />
                ) : null}
                {enrichment.upgradesInto.length > 0 ? (
                    <ConstructiblePlanningLinkGroup
                        label="Upgrades into"
                        links={enrichment.upgradesInto}
                        onSelect={onSelect}
                    />
                ) : null}
                {enrichment.placementLines.length > 0 ? (
                    <div className="codex-constructiblePlanning__group">
                        <div className="codex-constructiblePlanning__label">Placement</div>
                        <div className="codex-constructiblePlanning__value">
                            {enrichment.placementLines.map((line, index) => (
                                <span className="codex-constructiblePlanning__inlineItem" key={line}>
                                    {index > 0 ? (
                                        <span className="codex-constructiblePlanning__separator">·</span>
                                    ) : null}
                                    <span>{line}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function ConstructiblePlanningLinkGroup({
    label,
    links,
    onSelect,
}: {
    label: string;
    links: readonly CodexConstructibleLink[];
    onSelect: (entry: CodexEntry) => void;
}) {
    return (
        <div className="codex-constructiblePlanning__group">
            <div className="codex-constructiblePlanning__label">{label}</div>
            <div className="codex-constructiblePlanning__value">
                {links.map((link, index) => (
                    <span className="codex-constructiblePlanning__linkWrap" key={link.entry.entryKey}>
                        {index > 0 ? <span className="codex-constructiblePlanning__separator">·</span> : null}
                        <CodexInlineEntityLink entry={link.entry} onSelect={onSelect}>
                            {renderCodexLabel(link.label)}
                        </CodexInlineEntityLink>
                        {link.note ? (
                            <span className="codex-constructiblePlanning__note">{link.note}</span>
                        ) : null}
                    </span>
                ))}
            </div>
        </div>
    );
}
