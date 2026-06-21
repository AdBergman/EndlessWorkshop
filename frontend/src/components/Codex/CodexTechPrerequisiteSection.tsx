import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import type {
    CodexTechPrerequisiteLink,
    CodexTechRichEnrichment,
} from "@/lib/codex/codexTechRichEnrichment";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";

type Props = {
    enrichment: CodexTechRichEnrichment;
    onSelect: (entry: CodexEntry) => void;
};

export default function CodexTechPrerequisiteSection({ enrichment, onSelect }: Props) {
    if (enrichment.prerequisites.length === 0 && enrichment.exclusivePrerequisites.length === 0) {
        return null;
    }

    return (
        <section className="codex-detail__section codex-techPrerequisites" aria-labelledby="codex-tech-prereq-heading">
            <div className="codex-sectionLabel" id="codex-tech-prereq-heading">
                Prerequisites
            </div>

            <div className="codex-techPrerequisites__groups">
                {enrichment.prerequisites.length > 0 ? (
                    <TechPrerequisiteGroup
                        label="Requires"
                        links={enrichment.prerequisites}
                        onSelect={onSelect}
                    />
                ) : null}
                {enrichment.exclusivePrerequisites.length > 0 ? (
                    <TechPrerequisiteGroup
                        label="Exclusive with"
                        links={enrichment.exclusivePrerequisites}
                        onSelect={onSelect}
                    />
                ) : null}
            </div>
        </section>
    );
}

function TechPrerequisiteGroup({
    label,
    links,
    onSelect,
}: {
    label: string;
    links: readonly CodexTechPrerequisiteLink[];
    onSelect: (entry: CodexEntry) => void;
}) {
    return (
        <div className="codex-techPrerequisites__group">
            <div className="codex-techPrerequisites__label">{label}</div>
            <div className="codex-techPrerequisites__links">
                {links.map((link, index) => (
                    <span className="codex-techPrerequisites__linkWrap" key={link.entry.entryKey}>
                        {index > 0 ? <span className="codex-techPrerequisites__separator">·</span> : null}
                        <CodexInlineEntityLink entry={link.entry} onSelect={onSelect}>
                            {renderCodexLabel(link.label)}
                        </CodexInlineEntityLink>
                    </span>
                ))}
            </div>
        </div>
    );
}
