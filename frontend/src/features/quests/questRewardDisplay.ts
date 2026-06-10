import type { QuestCodexReferenceSource } from "@/features/quests/questCodexReference";
import type { Reward } from "@/types/questTypes";

export type QuestRewardDisplay = QuestCodexReferenceSource & {
    displayText: string;
    formulaText: string | null;
    amount: number | null;
    kind: string;
    targetScopeLabel: string | null;
};

export function rewardDisplayFromReward(reward: Reward): QuestRewardDisplay | null {
    const displayText = reward.displayText.trim();
    if (!displayText) return null;

    return {
        displayText,
        formulaText: cleanFormulaText(reward.formulaText),
        amount: reward.amount,
        kind: reward.kind,
        targetScopeLabel: reward.targetScopeLabel,
        assetKind: reward.assetKind,
        assetKey: reward.assetKey,
        assetDisplayName: reward.assetDisplayName,
        referenceKind: reward.referenceKind,
        referenceKey: reward.referenceKey,
        referenceDisplayName: reward.referenceDisplayName,
        codexEntryKey: reward.codexEntryKey,
    };
}

export function rewardDisplaysFromRewards(rewards: Reward[]): QuestRewardDisplay[] {
    return rewards
        .map(rewardDisplayFromReward)
        .filter((reward): reward is QuestRewardDisplay => Boolean(reward));
}

export function rewardDisplayTexts(rewards: QuestRewardDisplay[]): string[] {
    return uniqueRewardDisplays(rewards).map((reward) => reward.displayText);
}

export function rewardDisplaysFromText(values: string[]): QuestRewardDisplay[] {
    return uniqueTextValues(values).map((displayText) => ({
        displayText,
        formulaText: null,
        amount: null,
        kind: "",
        targetScopeLabel: null,
        assetKind: null,
        assetKey: null,
        assetDisplayName: null,
        referenceKind: null,
        referenceKey: null,
        referenceDisplayName: null,
        codexEntryKey: null,
    }));
}

export function rewardDisplaysForList(
    rewards: QuestRewardDisplay[],
    fallbackValues: string[] = []
): QuestRewardDisplay[] {
    const normalizedRewards = uniqueRewardDisplays(rewards);
    return normalizedRewards.length > 0 ? normalizedRewards : rewardDisplaysFromText(fallbackValues);
}

export function uniqueRewardDisplays(rewards: QuestRewardDisplay[]): QuestRewardDisplay[] {
    const seen = new Set<string>();

    return rewards.reduce<QuestRewardDisplay[]>((accumulator, reward) => {
        const key = rewardDisplayKey(reward);
        if (seen.has(key)) return accumulator;
        seen.add(key);
        accumulator.push({
            ...reward,
            displayText: reward.displayText.trim(),
            formulaText: cleanFormulaText(reward.formulaText),
        });
        return accumulator;
    }, []);
}

export function sameRewardDisplays(left: QuestRewardDisplay[], right: QuestRewardDisplay[]): boolean {
    const leftKeys = uniqueRewardDisplays(left).map(rewardDisplayKey);
    const rightKeys = uniqueRewardDisplays(right).map(rewardDisplayKey);
    if (leftKeys.length !== rightKeys.length) return false;

    const rightKeySet = new Set(rightKeys);
    return leftKeys.every((key) => rightKeySet.has(key));
}

export function formatStrategyRewardFormula(formulaText: string): string {
    return formulaText
        .replace(/\*/g, "×")
        .replace(/\bTechnology Era\b/g, "Tech Era");
}

function rewardDisplayKey(reward: QuestRewardDisplay): string {
    return [
        reward.displayText.trim(),
        cleanFormulaText(reward.formulaText) ?? "",
        reward.amount ?? "",
        reward.kind.trim(),
        reward.targetScopeLabel?.trim() ?? "",
        reward.referenceKind?.trim() ?? "",
        reward.referenceKey?.trim() ?? "",
        reward.assetKind?.trim() ?? "",
        reward.assetKey?.trim() ?? "",
        reward.codexEntryKey?.trim() ?? "",
    ].join("\u0000");
}

function cleanFormulaText(value: string | null): string | null {
    const formulaText = value?.trim() ?? "";
    return formulaText || null;
}

function uniqueTextValues(values: string[]): string[] {
    const seen = new Set<string>();

    return values.reduce<string[]>((accumulator, value) => {
        const displayText = value.trim();
        if (!displayText || seen.has(displayText)) return accumulator;
        seen.add(displayText);
        accumulator.push(displayText);
        return accumulator;
    }, []);
}
