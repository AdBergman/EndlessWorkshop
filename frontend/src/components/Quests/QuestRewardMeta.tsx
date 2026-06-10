import { Fragment } from "react";

import { QuestCodexReferenceLink } from "@/components/Quests/QuestCodexReferenceLink";
import { getDescriptionTokenIcon } from "@/features/icons/descriptionTokenIcons";
import {
    formatStrategyRewardFormula,
    rewardDisplaysForList,
    type QuestRewardDisplay,
} from "@/features/quests/questRewardDisplay";

export function RewardFormulaDetail({ formulaText }: { formulaText: string | null }) {
    if (!formulaText) return null;

    return (
        <small className="questExplorer-inlineMetaDetail">
            Formula: {formatStrategyRewardFormula(formulaText)}
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
                    <li key={`${label}:${index}:${reward.displayText}:${reward.formulaText ?? ""}`}>
                        <span className="questExplorer-rewardLine">
                            <QuestRewardKindIcon reward={reward} />
                            <QuestCodexReferenceLink source={reward} showTooltip>
                                <span>{reward.displayText}</span>
                            </QuestCodexReferenceLink>
                        </span>
                        <RewardFormulaDetail formulaText={reward.formulaText} />
                    </li>
                ))}
            </ul>
        </div>
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
                    <span className="questExplorer-rewardLine">
                        <QuestRewardKindIcon reward={reward} />
                        <QuestCodexReferenceLink source={reward} showTooltip>
                            {reward.displayText}
                        </QuestCodexReferenceLink>
                    </span>
                </Fragment>
            ))}
            {formulaTexts.length > 0 ? (
                <small className="questExplorer-inlineMetaDetail">
                    {formulaTexts
                        .map((formulaText) => `Formula: ${formatStrategyRewardFormula(formulaText)}`)
                        .join("; ")}
                </small>
            ) : null}
        </span>
    );
}

function QuestRewardKindIcon({ reward }: { reward: QuestRewardDisplay }) {
    const token = economyRewardIconToken(reward.kind);
    const icon = token ? getDescriptionTokenIcon(token) : null;
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
