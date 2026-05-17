export type QuestExplorerMode = "strategy" | "lore";

export const DEFAULT_QUEST_EXPLORER_MODE: QuestExplorerMode = "strategy";

export function normalizeQuestExplorerMode(value: string | null | undefined): QuestExplorerMode {
    return value === "lore" ? "lore" : DEFAULT_QUEST_EXPLORER_MODE;
}
