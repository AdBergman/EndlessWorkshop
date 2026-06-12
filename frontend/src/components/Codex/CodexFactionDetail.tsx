import { useMemo } from "react";
import { parseCodexFactionDescription, type CodexFactionTrait } from "@/lib/codex/codexFactionPresentation";
import { formatCodexMajorFactionText } from "@/lib/codex/codexPresentation";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";

type Props = {
    entry: CodexEntry;
};

function anchorSafe(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        || "entry";
}

function sectionId(entry: CodexEntry, suffix: string): string {
    return `codex-faction-${anchorSafe(entry.entryKey)}-${suffix}`;
}

function traitId(entry: CodexEntry, trait: CodexFactionTrait, index: number): string {
    return sectionId(entry, `trait-${index + 1}-${anchorSafe(trait.name)}`);
}

function stripPrefix(line: string, prefix: "Affinity" | "Trait"): string {
    return line.replace(new RegExp(`^${prefix}:\\s*`, "i"), "").trim();
}

function RenderLine({ line, className }: { line: string; className: string }) {
    return (
        <p className={className}>
            {renderDescriptionLine(formatCodexMajorFactionText(line))}
        </p>
    );
}

function getExportedSectionLines(entry: CodexEntry, title: string): string[] {
    return (entry.sections ?? [])
        .find((section) => section.title?.trim().toLowerCase() === title.toLowerCase())
        ?.lines
        ?.map((line) => line.trim())
        .filter(Boolean) ?? [];
}

export default function CodexFactionDetail({ entry }: Props) {
    const parsed = useMemo(
        () => parseCodexFactionDescription(entry.descriptionLines),
        [entry.descriptionLines]
    );
    const unlockLines = useMemo(
        () => getExportedSectionLines(entry, "Unlocks"),
        [entry]
    );

    const affinityId = sectionId(entry, "affinity");
    const unlocksId = sectionId(entry, "unlocks");
    const traitsId = sectionId(entry, "traits");
    const notesId = sectionId(entry, "notes");

    const hasStructuredContent =
        Boolean(parsed.affinityLine) ||
        unlockLines.length > 0 ||
        parsed.traits.length > 0 ||
        parsed.ungroupedLines.length > 0;

    return (
        <section className="codex-detail__section codex-factionDossier" aria-labelledby="codex-faction-dossier-heading">
            <div className="codex-sectionLabel" id="codex-faction-dossier-heading">
                Faction dossier
            </div>

            {!hasStructuredContent ? (
                <p className="codex-detail__placeholder">No public description has been added for this entry yet.</p>
            ) : null}

            {parsed.affinityLine ? (
                <section
                    className="codex-factionBlock"
                    id={affinityId}
                    tabIndex={-1}
                    aria-labelledby={`${affinityId}-heading`}
                >
                    <h3 className="codex-factionBlock__heading" id={`${affinityId}-heading`}>Affinity</h3>
                    <RenderLine
                        line={stripPrefix(parsed.affinityLine, "Affinity")}
                        className="codex-factionBlock__lead"
                    />
                </section>
            ) : null}

            {unlockLines.length > 0 ? (
                <section
                    className="codex-factionBlock"
                    id={unlocksId}
                    tabIndex={-1}
                    aria-labelledby={`${unlocksId}-heading`}
                >
                    <h3 className="codex-factionBlock__heading" id={`${unlocksId}-heading`}>Unlocks</h3>
                    <div className="codex-detail__description codex-detail__description--factionNotes">
                        {unlockLines.map((line, index) => (
                            <RenderLine
                                key={`${entry.entryKey}-unlock-${index}`}
                                line={line}
                                className="codex-detail__line"
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {parsed.traits.length > 0 ? (
                <section
                    className="codex-factionBlock"
                    id={traitsId}
                    tabIndex={-1}
                    aria-labelledby={`${traitsId}-heading`}
                >
                    <div className="codex-factionBlock__header">
                        <h3 className="codex-factionBlock__heading" id={`${traitsId}-heading`}>Traits</h3>
                        <span className="codex-factionBlock__count">{parsed.traits.length}</span>
                    </div>

                    <div className="codex-factionTraits">
                        {parsed.traits.map((trait, index) => {
                            const id = traitId(entry, trait, index);

                            return (
                                <section
                                    className="codex-factionTrait"
                                    id={id}
                                    key={`${trait.name}-${index}`}
                                    tabIndex={-1}
                                    aria-labelledby={`${id}-heading`}
                                >
                                    <h4 className="codex-factionTrait__name" id={`${id}-heading`}>
                                        {renderDescriptionLine(formatCodexMajorFactionText(trait.name))}
                                    </h4>
                                    <div className="codex-factionTrait__body">
                                        {trait.bodyLines.map((line, bodyIndex) => (
                                            <RenderLine
                                                key={`${id}-${bodyIndex}`}
                                                line={line}
                                                className="codex-factionTrait__line"
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            {parsed.ungroupedLines.length > 0 ? (
                <section
                    className="codex-factionBlock"
                    id={notesId}
                    tabIndex={-1}
                    aria-labelledby={`${notesId}-heading`}
                >
                    <h3 className="codex-factionBlock__heading" id={`${notesId}-heading`}>Notes</h3>
                    <div className="codex-detail__description codex-detail__description--factionNotes">
                        {parsed.ungroupedLines.map((line, index) => (
                            <RenderLine
                                key={`${entry.entryKey}-note-${index}`}
                                line={line}
                                className="codex-detail__line"
                            />
                        ))}
                    </div>
                </section>
            ) : null}
        </section>
    );
}
