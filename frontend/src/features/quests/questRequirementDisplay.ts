import type { QuestCodexReferenceSource } from "@/features/quests/questCodexReference";
import type { Requirement } from "@/types/questTypes";

export type QuestRequirementDisplay = QuestCodexReferenceSource & {
    requirementKey: string;
    kind: string;
    polarity: string | null;
    groupLabel: string | null;
    groupOrder: number | null;
    targetRole: string | null;
    targetLabel: string | null;
    requiredCount: number | null;
    durationTurns: number | null;
    state: string | null;
};

export function requirementDisplayFromRequirement(requirement: Requirement): QuestRequirementDisplay | null {
    const displayText = requirement.displayText.trim();
    if (!displayText) return null;

    return {
        requirementKey: requirement.requirementKey,
        displayText,
        kind: requirement.kind,
        polarity: requirement.polarity,
        groupLabel: requirement.groupLabel,
        groupOrder: requirement.groupOrder,
        targetRole: requirement.targetRole,
        targetLabel: requirement.targetLabel,
        requiredCount: requirement.requiredCount,
        durationTurns: requirement.durationTurns,
        state: requirement.state,
        referenceKind: requirement.referenceKind,
        referenceKey: requirement.referenceKey,
        referenceDisplayName: requirement.referenceDisplayName,
        codexEntryKey: requirement.codexEntryKey,
    };
}

export function requirementDisplaysFromRequirements(requirements: Requirement[]): QuestRequirementDisplay[] {
    return requirements
        .map(requirementDisplayFromRequirement)
        .filter((requirement): requirement is QuestRequirementDisplay => Boolean(requirement));
}

export function requirementDisplayTexts(requirements: QuestRequirementDisplay[]): string[] {
    return uniqueRequirementDisplays(requirements).map((requirement) => requirement.displayText);
}

export function requirementDisplaysFromText(values: string[]): QuestRequirementDisplay[] {
    return uniqueTextValues(values).map((displayText, index) => ({
        requirementKey: `fallback:${index}:${displayText}`,
        displayText,
        kind: "",
        polarity: null,
        groupLabel: null,
        groupOrder: null,
        targetRole: null,
        targetLabel: null,
        requiredCount: null,
        durationTurns: null,
        state: null,
        referenceKind: null,
        referenceKey: null,
        referenceDisplayName: null,
        codexEntryKey: null,
    }));
}

export function requirementDisplaysForList(
    requirements: QuestRequirementDisplay[],
    fallbackValues: string[] = []
): QuestRequirementDisplay[] {
    const normalizedRequirements = uniqueRequirementDisplays(requirements);
    return normalizedRequirements.length > 0 ? normalizedRequirements : requirementDisplaysFromText(fallbackValues);
}

export function uniqueRequirementDisplays(requirements: QuestRequirementDisplay[]): QuestRequirementDisplay[] {
    const seen = new Set<string>();

    return requirements.reduce<QuestRequirementDisplay[]>((accumulator, requirement) => {
        const key = requirementDisplayKey(requirement);
        if (seen.has(key)) return accumulator;
        seen.add(key);
        accumulator.push({
            ...requirement,
            displayText: requirement.displayText.trim(),
        });
        return accumulator;
    }, []);
}

export function sameRequirementDisplays(
    left: QuestRequirementDisplay[],
    right: QuestRequirementDisplay[]
): boolean {
    const leftKeys = uniqueRequirementDisplays(left).map(requirementDisplayKey);
    const rightKeys = uniqueRequirementDisplays(right).map(requirementDisplayKey);
    if (leftKeys.length !== rightKeys.length) return false;

    const rightKeySet = new Set(rightKeys);
    return leftKeys.every((key) => rightKeySet.has(key));
}

function requirementDisplayKey(requirement: QuestRequirementDisplay): string {
    return [
        requirement.displayText.trim(),
        requirement.kind.trim(),
        requirement.referenceKind?.trim() ?? "",
        requirement.referenceKey?.trim() ?? "",
        requirement.codexEntryKey?.trim() ?? "",
    ].join("\u0000");
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
