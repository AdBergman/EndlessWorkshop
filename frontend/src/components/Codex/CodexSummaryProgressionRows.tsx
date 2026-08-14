import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import {
    formatCodexMajorFactionText,
    getCodexEntryLabel,
    type CodexListItem,
} from "@/lib/codex/codexPresentation";
import type { CodexTechUnlockSummary as TechUnlockSummary } from "@/lib/codex/codexTechUnlockSummaries";
import type { CodexGrantedAbilityPreview as GrantedAbilityPreview } from "@/lib/codex/codexGrantedAbilityPreviews";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";
import type {
    DiplomacyArchiveMetadataItem,
    EquipmentArchiveMetadataItem,
    QuestArchiveLink,
    TechArchiveMetadataItem,
} from "./CodexSummaryDetailViewModel";

type ProgressionRowProps = {
    entry: CodexEntry;
    onSelectEntry: (entry: CodexListItem) => void;
};

type QuestArchiveRowProps = ProgressionRowProps & {
    preview: string;
    questArchiveLinkOverflowCount: number;
    questArchivePreviewLines: string[];
    visibleQuestArchiveLinks: QuestArchiveLink[];
};

export function QuestArchiveRow({
    entry,
    onSelectEntry,
    preview,
    questArchiveLinkOverflowCount,
    questArchivePreviewLines,
    visibleQuestArchiveLinks,
}: QuestArchiveRowProps) {
    return (
        <div
            key={entry.entryKey}
            className="codex-summaryList__item codex-summaryList__item--questArchive"
        >
            <button
                type="button"
                className="codex-summaryList__entryButton codex-summaryList__entryButton--quest"
                onClick={() => onSelectEntry(entry)}
            >
                <span className="codex-summaryList__titleLine">
                    <span className="codex-summaryList__titleIdentity">
                        <span className="codex-summaryList__name">
                            {renderCodexLabel(getCodexEntryLabel(entry))}
                        </span>
                    </span>
                </span>
                <span className="codex-summaryList__description">
                    {preview
                        ? renderDescriptionLine(formatCodexMajorFactionText(preview))
                        : "No public description has been added for this entry yet."}
                </span>
                {questArchivePreviewLines.length > 0 ? (
                    <span
                        className="codex-summaryList__questSignals"
                        aria-label="Quest archive preview"
                    >
                        {questArchivePreviewLines.map((line, index) => (
                            <span
                                className="codex-summaryList__questSignal"
                                key={`${entry.entryKey}-quest-signal-${index}`}
                            >
                                {renderDescriptionLine(formatCodexMajorFactionText(line))}
                            </span>
                        ))}
                    </span>
                ) : null}
            </button>

            {visibleQuestArchiveLinks.length > 0 ? (
                <div
                    className="codex-summaryList__grantedAbilityLinks codex-summaryList__questLinks"
                    aria-label="Exact quest links"
                >
                    <span className="codex-summaryList__grantedAbilityLinksLabel">
                        Links:
                    </span>
                    <span className="codex-summaryList__grantedAbilityLinkList">
                        {visibleQuestArchiveLinks.map((link, index) => (
                            <span
                                className="codex-summaryList__grantedAbilityLinkItem"
                                key={`${entry.entryKey}-${link.entry.entryKey}`}
                            >
                                {index > 0 ? (
                                    <span
                                        className="codex-summaryList__grantedAbilitySeparator"
                                        aria-hidden="true"
                                    >
                                        ·
                                    </span>
                                ) : null}
                                <CodexInlineEntityLink
                                    entry={link.entry}
                                    onSelect={(linkedEntry) => onSelectEntry(linkedEntry)}
                                >
                                    {renderCodexLabel(link.label)}
                                </CodexInlineEntityLink>
                            </span>
                        ))}
                        {questArchiveLinkOverflowCount > 0 ? (
                            <span className="codex-summaryList__grantedAbilityOverflow">
                                +{questArchiveLinkOverflowCount} more
                            </span>
                        ) : null}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

type EquipmentArchiveRowProps = ProgressionRowProps & {
    equipmentArchiveMetadata: EquipmentArchiveMetadataItem[];
    equipmentEffectPreviewLines: string[];
    equipmentGrantedAbilityOverflowCount: number;
    visibleEquipmentGrantedAbilityPreviews: GrantedAbilityPreview[];
};

export function EquipmentArchiveRow({
    entry,
    equipmentArchiveMetadata,
    equipmentEffectPreviewLines,
    equipmentGrantedAbilityOverflowCount,
    onSelectEntry,
    visibleEquipmentGrantedAbilityPreviews,
}: EquipmentArchiveRowProps) {
    return (
        <div
            key={entry.entryKey}
            className="codex-summaryList__item codex-summaryList__item--equipmentArchive"
        >
            <button
                type="button"
                className="codex-summaryList__entryButton codex-summaryList__entryButton--equipment"
                onClick={() => onSelectEntry(entry)}
            >
                <span className="codex-summaryList__titleLine">
                    <span className="codex-summaryList__titleIdentity">
                        <span className="codex-summaryList__name">
                            {renderCodexLabel(getCodexEntryLabel(entry))}
                        </span>
                    </span>
                    {equipmentArchiveMetadata.length > 0 ? (
                        <span
                            className="codex-summaryList__metadata codex-summaryList__metadata--equipment"
                            aria-label="Equipment metadata"
                        >
                            {equipmentArchiveMetadata.map((item) => (
                                <span
                                    key={`${item.key}-${item.value}`}
                                    className="codex-summaryList__metadataText"
                                >
                                    {item.value}
                                </span>
                            ))}
                        </span>
                    ) : null}
                </span>

                <span
                    className="codex-summaryList__equipmentEffects"
                    aria-label="Equipment effect preview"
                >
                    {equipmentEffectPreviewLines.length > 0 ? (
                        equipmentEffectPreviewLines.map((line, index) => (
                            <span
                                className="codex-summaryList__equipmentEffectLine"
                                key={`${entry.entryKey}-equipment-preview-${index}`}
                            >
                                {renderDescriptionLine(formatCodexMajorFactionText(line))}
                            </span>
                        ))
                    ) : visibleEquipmentGrantedAbilityPreviews.length === 0 ? (
                        <span className="codex-summaryList__statusFallback">
                            No public equipment effects exported yet.
                        </span>
                    ) : null}
                </span>
            </button>

            {visibleEquipmentGrantedAbilityPreviews.length > 0 ? (
                <div
                    className="codex-summaryList__grantedAbilityLinks"
                    aria-label="Granted abilities"
                >
                    <span className="codex-summaryList__grantedAbilityLinksLabel">
                        Grants:
                    </span>
                    <span className="codex-summaryList__grantedAbilityLinkList">
                        {visibleEquipmentGrantedAbilityPreviews.map((grantedPreview, index) => (
                            <span
                                className="codex-summaryList__grantedAbilityLinkItem"
                                key={`${entry.entryKey}-${grantedPreview.ability.entryKey}`}
                            >
                                {index > 0 ? (
                                    <span
                                        className="codex-summaryList__grantedAbilitySeparator"
                                        aria-hidden="true"
                                    >
                                        ·
                                    </span>
                                ) : null}
                                <CodexInlineEntityLink
                                    entry={grantedPreview.ability}
                                    onSelect={(ability) => onSelectEntry(ability)}
                                >
                                    {renderCodexLabel(grantedPreview.label)}
                                </CodexInlineEntityLink>
                            </span>
                        ))}
                        {equipmentGrantedAbilityOverflowCount > 0 ? (
                            <span className="codex-summaryList__grantedAbilityOverflow">
                                +{equipmentGrantedAbilityOverflowCount} more
                            </span>
                        ) : null}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

type DiplomacyArchiveRowProps = ProgressionRowProps & {
    diplomacyArchiveMetadata: DiplomacyArchiveMetadataItem[];
    diplomacyArchiveSignalLines: string[];
    preview: string;
};

export function DiplomacyArchiveRow({
    diplomacyArchiveMetadata,
    diplomacyArchiveSignalLines,
    entry,
    onSelectEntry,
    preview,
}: DiplomacyArchiveRowProps) {
    return (
        <button
            key={entry.entryKey}
            type="button"
            className="codex-summaryList__item codex-summaryList__item--diplomacyArchive"
            onClick={() => onSelectEntry(entry)}
        >
            <span className="codex-summaryList__titleLine">
                <span className="codex-summaryList__titleIdentity">
                    <span className="codex-summaryList__name">
                        {renderCodexLabel(getCodexEntryLabel(entry))}
                    </span>
                </span>
                {diplomacyArchiveMetadata.length > 0 ? (
                    <span
                        className="codex-summaryList__metadata codex-summaryList__metadata--diplomacy"
                        aria-label="Treaty metadata"
                    >
                        {diplomacyArchiveMetadata.map((item) => (
                            <span
                                key={`${item.key}-${item.value}`}
                                className="codex-summaryList__metadataText"
                            >
                                {item.value}
                            </span>
                        ))}
                    </span>
                ) : null}
            </span>
            <span className="codex-summaryList__description">
                {preview
                    ? renderDescriptionLine(formatCodexMajorFactionText(preview))
                    : "No public description has been added for this entry yet."}
            </span>
            {diplomacyArchiveSignalLines.length > 0 ? (
                <span
                    className="codex-summaryList__diplomacySignals"
                    aria-label="Treaty effect signals"
                >
                    {diplomacyArchiveSignalLines.map((line, index) => (
                        <span
                            className="codex-summaryList__diplomacySignal"
                            key={`${entry.entryKey}-diplomacy-signal-${index}`}
                        >
                            {renderDescriptionLine(formatCodexMajorFactionText(line))}
                        </span>
                    ))}
                </span>
            ) : null}
        </button>
    );
}

type TechArchiveRowProps = ProgressionRowProps & {
    techArchiveMetadata: TechArchiveMetadataItem[];
    techEffectPreviewLines: string[];
    techUnlockOverflowCount: number;
    visibleTechUnlockLinks: TechUnlockSummary[];
};

export function TechArchiveRow({
    entry,
    onSelectEntry,
    techArchiveMetadata,
    techEffectPreviewLines,
    techUnlockOverflowCount,
    visibleTechUnlockLinks,
}: TechArchiveRowProps) {
    return (
        <div
            key={entry.entryKey}
            className="codex-summaryList__item codex-summaryList__item--techArchive"
        >
            <button
                type="button"
                className="codex-summaryList__entryButton codex-summaryList__entryButton--tech"
                onClick={() => onSelectEntry(entry)}
            >
                <span className="codex-summaryList__titleLine">
                    <span className="codex-summaryList__titleIdentity">
                        <span className="codex-summaryList__name">
                            {renderCodexLabel(getCodexEntryLabel(entry))}
                        </span>
                    </span>
                    {techArchiveMetadata.length > 0 ? (
                        <span
                            className="codex-summaryList__metadata codex-summaryList__metadata--tech"
                            aria-label="Tech metadata"
                        >
                            {techArchiveMetadata.map((item) => (
                                <span
                                    key={`${item.key}-${item.value}`}
                                    className="codex-summaryList__metadataText"
                                >
                                    {item.value}
                                </span>
                            ))}
                        </span>
                    ) : null}
                </span>

                <span
                    className="codex-summaryList__techEffects"
                    aria-label="Tech effect preview"
                >
                    {techEffectPreviewLines.length > 0 ? (
                        techEffectPreviewLines.map((line, index) => (
                            <span
                                className="codex-summaryList__techEffectLine"
                                key={`${entry.entryKey}-tech-preview-${index}`}
                            >
                                {renderDescriptionLine(formatCodexMajorFactionText(line))}
                            </span>
                        ))
                    ) : (
                        <span className="codex-summaryList__statusFallback">
                            No public tech effects exported yet.
                        </span>
                    )}
                </span>
            </button>

            {visibleTechUnlockLinks.length > 0 ? (
                <div
                    className="codex-summaryList__grantedAbilityLinks"
                    aria-label="Tech unlocks"
                >
                    <span className="codex-summaryList__grantedAbilityLinksLabel">
                        Unlocks:
                    </span>
                    <span className="codex-summaryList__grantedAbilityLinkList">
                        {visibleTechUnlockLinks.map((unlock, index) => (
                            <span
                                className="codex-summaryList__grantedAbilityLinkItem"
                                key={`${entry.entryKey}-${unlock.target.entryKey}`}
                            >
                                {index > 0 ? (
                                    <span
                                        className="codex-summaryList__grantedAbilitySeparator"
                                        aria-hidden="true"
                                    >
                                        ·
                                    </span>
                                ) : null}
                                <CodexInlineEntityLink
                                    entry={unlock.target}
                                    onSelect={(unlockEntry) => onSelectEntry(unlockEntry)}
                                >
                                    {renderCodexLabel(unlock.label)}
                                </CodexInlineEntityLink>
                            </span>
                        ))}
                        {techUnlockOverflowCount > 0 ? (
                            <span className="codex-summaryList__grantedAbilityOverflow">
                                +{techUnlockOverflowCount} more
                            </span>
                        ) : null}
                    </span>
                </div>
            ) : null}
        </div>
    );
}
