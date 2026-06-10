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
    const icon = economyRewardIcon(reward.kind);

    return (
        <li className={icon ? "questExplorer-inlineMetaItem--iconReward" : undefined}>
            <QuestRewardInline reward={reward} icon={icon} />
            <RewardFormulaDetail formulaText={reward.formulaText} />
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
    icon = economyRewardIcon(reward.kind),
}: {
    reward: QuestRewardDisplay;
    icon?: DescriptionTokenIcon | null;
}) {
    return (
        <span className="questExplorer-rewardLine">
            <QuestRewardKindIcon icon={icon} />
            <QuestCodexReferenceLink source={reward} showTooltip>
                <span>{formatStrategyRewardLabel(reward)}</span>
            </QuestCodexReferenceLink>
        </span>
    );
}

function formatStrategyRewardLabel(reward: QuestRewardDisplay): string {
    const resourceLabel = economyRewardLabel(reward.kind);
    if (!resourceLabel || !reward.formulaText) return reward.displayText;

    const compactFormulaRewardPattern = new RegExp(`^gain\\s+${resourceLabel}\\s+based\\s+on\\s+technology\\s+era\\.?$`, "i");
    return compactFormulaRewardPattern.test(reward.displayText.trim())
        ? `Gain ${resourceLabel}`
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

function economyRewardLabel(kind: string): string | null {
    switch (kind.trim().toLowerCase()) {
        case "money":
            return "Dust";
        case "influence":
            return "Influence";
        case "science":
            return "Science";
        case "food":
            return "Food";
        default:
            return null;
    }
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
