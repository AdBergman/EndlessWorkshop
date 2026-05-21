export type QuestExplorerMode = "strategy" | "lore";

export const DEFAULT_QUEST_EXPLORER_MODE: QuestExplorerMode = "lore";

export function normalizeQuestExplorerMode(value: string | null | undefined): QuestExplorerMode {
    return value === "strategy" ? "strategy" : DEFAULT_QUEST_EXPLORER_MODE;
}
