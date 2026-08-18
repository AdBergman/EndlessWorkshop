import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import type {
    CodexDistrictReferenceLink,
    CodexDistrictReferenceModel,
} from "@/lib/codex/codexDistrictReference";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";

type Props = {
    model: CodexDistrictReferenceModel;
    onSelect: (entry: CodexEntry) => void;
};

export default function CodexDistrictReferenceSection({ model, onSelect }: Props) {
    return (
        <section
            className="codex-detail__section codex-districtReference"
            aria-labelledby="codex-district-reference-heading"
        >
            <div className="codex-sectionLabel" id="codex-district-reference-heading">
                District Reference
            </div>

            <div className="codex-districtReference__groups">
                {model.profileItems.length > 0 ? (
                    <TextGroup label="Strategic profile" values={model.profileItems} />
                ) : null}

                {model.effectLines.length > 0 ? (
                    <div className="codex-districtReference__group codex-districtReference__group--effects">
                        <div className="codex-districtReference__label">Strategic effects</div>
                        <div className="codex-districtReference__lines">
                            {model.effectLines.map((line, index) => (
                                <p className="codex-detail__line" key={`${line}-${index}`}>
                                    {renderDescriptionLine(line)}
                                </p>
                            ))}
                        </div>
                    </div>
                ) : null}

                {model.extractedResources.length > 0 ? (
                    <LinkGroup
                        label="Extracts"
                        links={model.extractedResources}
                        onSelect={onSelect}
                    />
                ) : null}

                {model.unlockedBy.length > 0 ? (
                    <LinkGroup label="Unlocked by" links={model.unlockedBy} onSelect={onSelect} />
                ) : null}

                {model.upgradesFrom.length > 0 ? (
                    <LinkGroup
                        label="Upgrades from"
                        links={model.upgradesFrom}
                        onSelect={onSelect}
                    />
                ) : null}

                {model.upgradesInto.length > 0 ? (
                    <LinkGroup
                        label="Upgrades into"
                        links={model.upgradesInto}
                        onSelect={onSelect}
                    />
                ) : null}

                {model.placementLines.length > 0 ? (
                    <TextGroup label="Known placement" values={model.placementLines} />
                ) : null}

                {model.recordNotes.length > 0 ? (
                    <TextGroup label="Record notes" values={model.recordNotes} />
                ) : null}
            </div>
        </section>
    );
}

function TextGroup({ label, values }: { label: string; values: readonly string[] }) {
    return (
        <div className="codex-districtReference__group">
            <div className="codex-districtReference__label">{label}</div>
            <div className="codex-districtReference__value">
                {values.map((value, index) => (
                    <span className="codex-districtReference__inlineItem" key={value}>
                        {index > 0 ? <span className="codex-districtReference__separator">·</span> : null}
                        <span>{value}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

function LinkGroup({
    label,
    links,
    onSelect,
}: {
    label: string;
    links: readonly CodexDistrictReferenceLink[];
    onSelect: (entry: CodexEntry) => void;
}) {
    return (
        <div className="codex-districtReference__group">
            <div className="codex-districtReference__label">{label}</div>
            <div className="codex-districtReference__value">
                {links.map((link, index) => (
                    <span className="codex-districtReference__linkWrap" key={link.entry.entryKey}>
                        {index > 0 ? <span className="codex-districtReference__separator">·</span> : null}
                        <CodexInlineEntityLink entry={link.entry} onSelect={onSelect}>
                            {renderCodexLabel(link.label)}
                        </CodexInlineEntityLink>
                        {link.note ? (
                            <span className="codex-districtReference__note">{link.note}</span>
                        ) : null}
                    </span>
                ))}
            </div>
        </div>
    );
}
