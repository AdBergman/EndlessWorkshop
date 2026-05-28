import { getQuestCategoryKey } from "@/features/quests/questCategories";
import type {
    LoreSection,
    QuestExplorerEntry,
    QuestProgressionChapter,
    QuestProgressionQuestline,
    QuestProgressionStep,
} from "@/types/questTypes";

export function stepPositionLabel(step: QuestProgressionStep): string {
    if (step.stepNumber != null) return `Step ${step.stepNumber}`;
    if (step.stepOrder != null) return `Order ${step.stepOrder}`;
    return "Step";
}

export function chapterPositionLabel(chapter: QuestProgressionChapter): string {
    const chapterNumber = chapter.chapterNumber ?? chapter.chapterOrder;
    return chapterNumber == null ? "Chapter" : `Chapter ${chapterNumber}`;
}

export function questChapterDisplayLabel(
    chapter: QuestProgressionChapter,
    context: {
        entry?: QuestExplorerEntry | null;
        questline?: QuestProgressionQuestline | null;
    } = {}
): string {
    const chapterNumber = chapter.chapterNumber ?? chapter.chapterOrder;
    if (chapterNumber === 0 && isKinChapterContext(context)) return "Tutorial";
    return chapterPositionLabel(chapter);
}

function isKinChapterContext({
    entry,
    questline,
}: {
    entry?: QuestExplorerEntry | null;
    questline?: QuestProgressionQuestline | null;
}): boolean {
    return [
        entry?.entryKey,
        entry?.navigation.factionKey,
        entry?.navigation.factionName,
        entry?.navigation.questLineKey,
        entry?.navigation.questLineName,
        questline?.factionKey,
        questline?.factionFamilyKey,
        questline?.factionName,
        questline?.questLineKey,
        questline?.questLineFamilyKey,
        questline?.questLineName,
    ].some((value) => {
        const normalized = (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        return normalized === "kin" || normalized.includes("kinofsheredyn");
    });
}

export function phaseDisplayLabel(phase: string | null | undefined, fallback = "Objective"): string {
    const normalized = (phase ?? "").trim().toLowerCase();
    if (!normalized) return fallback;

    const labels: Record<string, string> = {
        start: "Opening",
        intro: "Opening",
        success: "Resolution",
        failure: "Setback",
        choice: "Choice",
        completion: "Objective",
        other: fallback,
    };

    return labels[normalized] ?? normalized
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function objectiveVariantLabel(index: number): string {
    return `Objective ${index + 1}`;
}

export function lorePhaseKey(phase: string | null | undefined): string {
    return (phase ?? "").trim().toLowerCase();
}

export function isResolutionLoreSection(section: LoreSection): boolean {
    return lorePhaseKey(section.phase) === "success" || lorePhaseKey(section.phase) === "resolution";
}

export function isMinorFactionVariantQuest(entry: QuestExplorerEntry): boolean {
    return getQuestCategoryKey(entry.questType) === "minorFaction"
        && entry.strategyView.objectives.length > 1;
}
