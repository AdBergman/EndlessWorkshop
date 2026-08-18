import { useMemo } from "react";
import {
    buildCodexFactionStrategyProfile,
    parseCodexFactionDescription,
    type CodexFactionTrait,
    type CodexFactionStrategyProfile,
} from "@/lib/codex/codexFactionPresentation";
import type { CodexFactionPackageGroup } from "@/lib/codex/codexFactionPackage";
import { formatCodexMajorFactionText } from "@/lib/codex/codexPresentation";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry, RichFaction } from "@/types/dataTypes";
import CodexFactionPackage from "./CodexFactionPackage";

type Props = {
    entry: CodexEntry;
    richFaction?: RichFaction | null;
    packageGroups: CodexFactionPackageGroup[];
    onSelectEntry: (entry: CodexEntry) => void;
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

function getPackageCounts(groups: readonly CodexFactionPackageGroup[]): Record<string, number> {
    return groups.reduce<Record<string, number>>((acc, group) => {
        acc[group.id] = group.totalCount;
        return acc;
    }, {});
}

export function CodexFactionStrategyProfileSection({ profile }: { profile: CodexFactionStrategyProfile }) {
    if (profile.metrics.length === 0 && !profile.loreLine && profile.signalLines.length === 0) {
        return null;
    }

    return (
        <section className="codex-detail__section codex-factionProfile" aria-labelledby="codex-faction-profile-heading">
            <div className="codex-sectionLabel" id="codex-faction-profile-heading">
                Strategy profile
            </div>

            <div className="codex-factionProfile__intro">
                <span className="codex-factionProfile__kind">{profile.kindLabel}</span>
                {profile.loreLine ? (
                    <p className="codex-factionProfile__lore">
                        {renderDescriptionLine(formatCodexMajorFactionText(profile.loreLine))}
                    </p>
                ) : null}
            </div>

            {profile.metrics.length > 0 ? (
                <dl className="codex-factionProfile__metrics" aria-label="Faction planning summary">
                    {profile.metrics.map((item) => (
                        <div className="codex-factionProfile__metric" key={item.id}>
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {profile.signalLines.length > 0 ? (
                <div className="codex-factionProfile__signals" aria-label="Strategic hooks">
                    {profile.signalLines.map((line, index) => (
                        <p className="codex-factionProfile__signal" key={`${line}-${index}`}>
                            {renderDescriptionLine(formatCodexMajorFactionText(line))}
                        </p>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

export default function CodexFactionDetail({ entry, richFaction, packageGroups, onSelectEntry }: Props) {
    const parsed = useMemo(
        () => parseCodexFactionDescription(entry.descriptionLines),
        [entry.descriptionLines]
    );
    const strategyProfile = useMemo(
        () => buildCodexFactionStrategyProfile(entry, getPackageCounts(packageGroups), richFaction),
        [entry, packageGroups, richFaction]
    );
    const unlockLines = useMemo(
        () => getExportedSectionLines(entry, "Unlocks"),
        [entry]
    );
    const unlocksId = sectionId(entry, "unlocks");
    const traitsId = sectionId(entry, "traits");
    const notesId = sectionId(entry, "notes");

    const hasStructuredContent =
        Boolean(parsed.affinityLine) ||
        unlockLines.length > 0 ||
        parsed.traits.length > 0 ||
        parsed.ungroupedLines.length > 0;

    return (
        <>
            <CodexFactionStrategyProfileSection profile={strategyProfile} />

            <section className="codex-detail__section codex-factionDossier" aria-labelledby="codex-faction-dossier-heading">
                <div className="codex-sectionLabel" id="codex-faction-dossier-heading">
                    Faction dossier
                </div>

                {!hasStructuredContent ? (
                    <p className="codex-detail__placeholder">No public description has been added for this entry yet.</p>
                ) : null}

                {parsed.ungroupedLines.length > 0 ? (
                    <section
                        className="codex-factionBlock"
                        id={notesId}
                        tabIndex={-1}
                        aria-labelledby={`${notesId}-heading`}
                    >
                        <h3 className="codex-factionBlock__heading" id={`${notesId}-heading`}>Core Effects</h3>
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

            </section>

            <CodexFactionPackage groups={packageGroups} onSelectEntry={onSelectEntry} />
        </>
    );
}
