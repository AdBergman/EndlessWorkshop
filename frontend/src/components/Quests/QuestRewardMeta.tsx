import { Fragment } from "react";

import { QuestCodexReferenceLink } from "@/components/Quests/QuestCodexReferenceLink";
import { getDescriptionTokenIcon, type DescriptionTokenIcon } from "@/features/icons/descriptionTokenIcons";
import {
    formatStrategyRewardFormula,
    rewardDisplaysForList,
    type QuestRewardDisplay,
} from "@/features/quests/questRewardDisplay";

export function RewardFormulaDetail({ formulaText }: { formulaText: string | null }) {
    if (!formulaText) return null;

    return (
        <small className="questExplorer-inlineMetaDetail">
            {formatStrategyRewardFormula(formulaText)}
        </small>
    );
}

export function InlineRewardMetaList({
    label,
    rewards,
    fallbackValues = [],
}: {
    label: string;
    rewards: QuestRewardDisplay[];
    fallbackValues?: string[];
}) {
    const displayRewards = rewardDisplaysForList(rewards, fallbackValues);
    if (displayRewards.length === 0) return null;

    return (
        <div className="questExplorer-inlineMeta questExplorer-inlineMeta--reward">
            <strong>{label}</strong>
            <ul>
                {displayRewards.map((reward, index) => (
                    <QuestRewardRow
                        key={`${label}:${index}:${reward.displayText}:${reward.formulaText ?? ""}`}
                        reward={reward}
                    />
                ))}
            </ul>
        </div>
    );
}

export function QuestRewardRow({ reward }: { reward: QuestRewardDisplay }) {
    const icon = rewardMarkerIcon(reward);

    return (
        <li className={icon ? "questExplorer-inlineMetaItem--iconReward" : undefined}>
            {icon ? (
                <span className="questExplorer-rewardStack">
                    <QuestRewardKindIcon icon={icon} />
                    <span className="questExplorer-rewardStackBody">
                        <QuestRewardLabel reward={reward} />
                        <RewardFormulaDetail formulaText={reward.formulaText} />
                    </span>
                </span>
            ) : (
                <>
                    <QuestRewardInline reward={reward} icon={icon} />
                    <RewardFormulaDetail formulaText={reward.formulaText} />
                </>
            )}
        </li>
    );
}

export function InlineStageRewardMeta({
    label,
    rewards,
    fallbackValues = [],
}: {
    label: string;
    rewards: QuestRewardDisplay[];
    fallbackValues?: string[];
}) {
    const displayRewards = rewardDisplaysForList(rewards, fallbackValues);
    const formulaTexts = displayRewards
        .map((reward) => reward.formulaText)
        .filter((formulaText): formulaText is string => Boolean(formulaText));
    if (displayRewards.length === 0) return null;

    return (
        <span className="questExplorer-choiceCardMeta">
            <b>{label}</b>{" "}
            {displayRewards.map((reward, index) => (
                <Fragment key={`${label}:${index}:${reward.displayText}:${reward.formulaText ?? ""}`}>
                    {index > 0 ? "; " : null}
                    <QuestRewardInline reward={reward} />
                </Fragment>
            ))}
            {formulaTexts.length > 0 ? (
                <small className="questExplorer-inlineMetaDetail">
                    {formulaTexts
                        .map((formulaText) => formatStrategyRewardFormula(formulaText))
                        .join("; ")}
                </small>
            ) : null}
        </span>
    );
}

function QuestRewardInline({
    reward,
    icon = rewardMarkerIcon(reward),
}: {
    reward: QuestRewardDisplay;
    icon?: DescriptionTokenIcon | null;
}) {
    return (
        <span className="questExplorer-rewardLine">
            <QuestRewardKindIcon icon={icon} />
            <QuestRewardLabel reward={reward} />
        </span>
    );
}

function QuestRewardLabel({ reward }: { reward: QuestRewardDisplay }) {
    return (
        <QuestCodexReferenceLink source={reward} showTooltip>
            <span>{formatStrategyRewardLabel(reward)}</span>
        </QuestCodexReferenceLink>
    );
}

function formatStrategyRewardLabel(reward: QuestRewardDisplay): string {
    const formulaBackedLabel = formulaBackedTechnologyEraRewardLabel(reward);
    return formulaBackedLabel
        ? formulaBackedLabel
        : reward.displayText;
}

function QuestRewardKindIcon({ icon }: { icon: DescriptionTokenIcon | null | undefined }) {
    if (!icon) return null;

    return (
        <img
            className="questExplorer-rewardIcon"
            src={icon.path}
            alt=""
            aria-hidden="true"
        />
    );
}

function economyRewardIcon(kind: string) {
    const token = economyRewardIconToken(kind);
    return token ? getDescriptionTokenIcon(token) : null;
}

function economyRewardIconToken(kind: string): string | null {
    switch (kind.trim().toLowerCase()) {
        case "money":
            return "DustColored";
        case "influence":
            return "Influence";
        case "science":
            return "ScienceColored";
        case "food":
            return "FoodColored";
        default:
            return null;
    }
}

function rewardMarkerIcon(reward: QuestRewardDisplay): DescriptionTokenIcon | null {
    return economyRewardIcon(reward.kind)
        ?? knownResourceRewardIcon(reward);
}

function formulaBackedTechnologyEraRewardLabel(reward: QuestRewardDisplay): string | null {
    if (!reward.formulaText) return null;

    const match = reward.displayText.trim().match(/^gain\s+(.+?)\s+based\s+on\s+technology\s+era\.?$/i);
    const rewardSubject = match?.[1]?.trim();
    return rewardSubject ? `Gain ${rewardSubject}` : null;
}

function knownResourceRewardIcon(reward: QuestRewardDisplay): DescriptionTokenIcon | null {
    const label = formulaBackedTechnologyEraRewardLabel(reward)
        ?.replace(/^gain\s+/i, "")
        ?? reward.assetDisplayName
        ?? "";
    const token = knownResourceRewardIconToken(label);

    return token ? getDescriptionTokenIcon(token) : null;
}

function knownResourceRewardIconToken(label: string): string | null {
    switch (label.trim().toLowerCase()) {
        case "titanium":
            return "Strategic01Colored";
        case "glassteel":
            return "Strategic02Colored";
        case "lazualin":
        case "lazuline":
            return "Strategic03Colored";
        case "hyperium":
            return "Strategic04Colored";
        case "eradione":
            return "Strategic05Colored";
        case "thalitine":
        case "tthalitine":
            return "Strategic06Colored";
        default:
            return null;
    }
}
