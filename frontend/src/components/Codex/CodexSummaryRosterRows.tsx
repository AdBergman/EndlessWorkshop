import { IconImg } from "@/features/icons/IconImg";
import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexMajorFactionText,
    getCodexEntryLabel,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";
import type { CodexGrantedAbilityPreview as GrantedAbilityPreview } from "@/lib/codex/codexGrantedAbilityPreviews";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";
import type {
    HeroArchiveMetadataItem,
    HeroFactionIdentity,
    UnitArchiveMetadataItem,
    UnitFactionIdentity,
} from "./CodexSummaryDetailViewModel";

type RosterRowProps = {
    entry: CodexEntry;
    onSelectEntry: (entry: CodexListItem) => void;
};

type HeroArchiveRowProps = RosterRowProps & {
    heroClassMetadata: HeroArchiveMetadataItem[];
    heroFactionIdentity: HeroFactionIdentity | null;
    heroGrantedAbilityOverflowCount: number;
    heroStatPreviewLines: string[];
    visibleHeroGrantedAbilityLinks: CodexEntry[];
};

export function HeroArchiveRow({
    entry,
    heroClassMetadata,
    heroFactionIdentity,
    heroGrantedAbilityOverflowCount,
    heroStatPreviewLines,
    onSelectEntry,
    visibleHeroGrantedAbilityLinks,
}: HeroArchiveRowProps) {
    return (
        <div
            key={entry.entryKey}
            className="codex-summaryList__item codex-summaryList__item--heroArchive"
        >
            <span className="codex-summaryList__heroArchiveMain">
                <span className="codex-summaryList__titleLine codex-summaryList__titleLine--hero">
                    <button
                        type="button"
                        className="codex-summaryList__entryButton codex-summaryList__entryButton--heroTitle"
                        onClick={() => onSelectEntry(entry)}
                    >
                        <span className="codex-summaryList__titleIdentity">
                            <span className="codex-summaryList__name">
                                {renderCodexLabel(getCodexEntryLabel(entry))}
                            </span>
                        </span>
                    </button>
                </span>

                <button
                    type="button"
                    className="codex-summaryList__entryButton codex-summaryList__entryButton--heroStats"
                    onClick={() => onSelectEntry(entry)}
                >
                    <span
                        className="codex-summaryList__heroStats"
                        aria-label="Hero stat preview"
                    >
                        {heroStatPreviewLines.length > 0 ? (
                            heroStatPreviewLines.map((line, index) => (
                                <span
                                    className="codex-summaryList__heroStatLine"
                                    key={`${entry.entryKey}-hero-stat-${index}`}
                                >
                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                </span>
                            ))
                        ) : (
                            <span className="codex-summaryList__statusFallback">
                                No public hero stats exported yet.
                            </span>
                        )}
                    </span>
                </button>
            </span>

            <span
                className="codex-summaryList__metadata codex-summaryList__metadata--hero"
                aria-label="Hero metadata"
            >
                <span className="codex-summaryList__heroMetaTop">
                    {heroClassMetadata.length > 0 ? (
                        <span
                            className="codex-summaryList__heroClassLine"
                            aria-label="Hero class"
                        >
                            {heroClassMetadata.map((item) => (
                                <span
                                    key={`${item.key}-${item.value}`}
                                    className="codex-summaryList__metadataText"
                                >
                                    {item.value}
                                </span>
                            ))}
                        </span>
                    ) : null}
                    {heroFactionIdentity ? (
                        heroFactionIdentity.iconPath ? (
                            <span
                                className="codex-summaryList__metadataIcon codex-summaryList__metadataIcon--heroFaction"
                                title={heroFactionIdentity.label}
                                aria-label={heroFactionIdentity.label}
                            >
                                <IconImg
                                    path={heroFactionIdentity.iconPath}
                                    title={heroFactionIdentity.label}
                                    className="codex-kindIcon codex-kindIcon--summaryFaction"
                                    size={18}
                                    decorative
                                />
                            </span>
                        ) : (
                            <span
                                className="codex-summaryList__metadataText codex-summaryList__metadataText--heroFaction"
                                aria-label="Hero faction"
                            >
                                {heroFactionIdentity.label}
                            </span>
                        )
                    ) : null}
                </span>
                {visibleHeroGrantedAbilityLinks.length > 0 || heroGrantedAbilityOverflowCount > 0 ? (
                    <span
                        className="codex-summaryList__heroTagLine"
                        aria-label="Hero tags"
                    >
                        {visibleHeroGrantedAbilityLinks.map((abilityEntry) => (
                            <span
                                className="codex-summaryList__metadataLink"
                                key={`${entry.entryKey}-${abilityEntry.entryKey}`}
                            >
                                <CodexInlineEntityLink
                                    entry={abilityEntry}
                                    onSelect={(ability) => onSelectEntry(ability)}
                                >
                                    {renderCodexLabel(getCodexEntryLabel(abilityEntry))}
                                </CodexInlineEntityLink>
                            </span>
                        ))}
                        {heroGrantedAbilityOverflowCount > 0 ? (
                            <span className="codex-summaryList__grantedAbilityOverflow">
                                +{heroGrantedAbilityOverflowCount} more
                            </span>
                        ) : null}
                    </span>
                ) : null}
            </span>
        </div>
    );
}

type UnitArchiveRowProps = RosterRowProps & {
    unitArchiveMetadata: UnitArchiveMetadataItem[];
    unitFactionIdentity: UnitFactionIdentity | null;
    unitGrantedAbilityOverflowCount: number;
    unitStatPreviewLines: string[];
    visibleUnitGrantedAbilityPreviews: GrantedAbilityPreview[];
};

export function UnitArchiveRow({
    entry,
    onSelectEntry,
    unitArchiveMetadata,
    unitFactionIdentity,
    unitGrantedAbilityOverflowCount,
    unitStatPreviewLines,
    visibleUnitGrantedAbilityPreviews,
}: UnitArchiveRowProps) {
    return (
        <div
            key={entry.entryKey}
            className="codex-summaryList__item codex-summaryList__item--unitArchive"
        >
            <span className="codex-summaryList__unitArchiveMain">
                <span className="codex-summaryList__titleLine codex-summaryList__titleLine--unit">
                    <button
                        type="button"
                        className="codex-summaryList__entryButton codex-summaryList__entryButton--unitTitle"
                        onClick={() => onSelectEntry(entry)}
                    >
                        <span className="codex-summaryList__titleIdentity">
                            <span className="codex-summaryList__name">
                                {renderCodexLabel(getCodexEntryLabel(entry))}
                            </span>
                        </span>
                    </button>
                </span>

                <button
                    type="button"
                    className="codex-summaryList__entryButton codex-summaryList__entryButton--unitStats"
                    onClick={() => onSelectEntry(entry)}
                >
                    <span
                        className="codex-summaryList__unitStats"
                        aria-label="Unit stat preview"
                    >
                        {unitStatPreviewLines.length > 0 ? (
                            unitStatPreviewLines.map((line, index) => (
                                <span
                                    className="codex-summaryList__unitStatLine"
                                    key={`${entry.entryKey}-unit-stat-${index}`}
                                >
                                    {renderDescriptionLine(formatCodexMajorFactionText(line))}
                                </span>
                            ))
                        ) : (
                            <span className="codex-summaryList__statusFallback">
                                No public unit stats exported yet.
                            </span>
                        )}
                    </span>
                </button>
            </span>

            <span
                className="codex-summaryList__metadata codex-summaryList__metadata--unit"
                aria-label="Unit metadata"
            >
                <span className="codex-summaryList__unitMetaTop">
                    {unitArchiveMetadata.length > 0 ? (
                        <span
                            className="codex-summaryList__unitMetadataLine"
                            aria-label="Unit type"
                        >
                            {unitArchiveMetadata.map((item) => (
                                <span
                                    key={`${item.key}-${item.value}`}
                                    className="codex-summaryList__metadataText"
                                >
                                    {item.value}
                                </span>
                            ))}
                        </span>
                    ) : null}
                    {unitFactionIdentity ? (
                        unitFactionIdentity.iconPath ? (
                            <span
                                className="codex-summaryList__metadataIcon codex-summaryList__metadataIcon--unitFaction"
                                title={unitFactionIdentity.label}
                                aria-label={unitFactionIdentity.label}
                            >
                                <IconImg
                                    path={unitFactionIdentity.iconPath}
                                    title={unitFactionIdentity.label}
                                    className="codex-kindIcon codex-kindIcon--summaryFaction"
                                    size={18}
                                    decorative
                                />
                            </span>
                        ) : (
                            <span
                                className="codex-summaryList__metadataText codex-summaryList__metadataText--unitFaction"
                                aria-label="Unit faction"
                            >
                                {unitFactionIdentity.label}
                            </span>
                        )
                    ) : null}
                </span>

                {visibleUnitGrantedAbilityPreviews.length > 0 || unitGrantedAbilityOverflowCount > 0 ? (
                    <span
                        className="codex-summaryList__unitTagLine"
                        aria-label="Unit tags"
                    >
                        {visibleUnitGrantedAbilityPreviews.map((grantedPreview) => (
                            <span
                                className="codex-summaryList__metadataLink"
                                key={`${entry.entryKey}-${grantedPreview.ability.entryKey}`}
                            >
                                <CodexInlineEntityLink
                                    entry={grantedPreview.ability}
                                    onSelect={(ability) => onSelectEntry(ability)}
                                >
                                    {renderCodexLabel(grantedPreview.label)}
                                </CodexInlineEntityLink>
                            </span>
                        ))}
                        {unitGrantedAbilityOverflowCount > 0 ? (
                            <span className="codex-summaryList__grantedAbilityOverflow">
                                +{unitGrantedAbilityOverflowCount} more
                            </span>
                        ) : null}
                    </span>
                ) : null}
            </span>
        </div>
    );
}
