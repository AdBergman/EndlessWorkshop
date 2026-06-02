import { extractBracketTokens } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import { getAbilityIconPath } from "./abilityIconResolver";
import { getCodexKindIconPath } from "./codexKindIcons";
import { getFactionIconPath } from "./factionIconResolver";
import { getExtractorResourceIconPath, getResourceTokenIconPath } from "./resourceTokenIcons";

function getDisplayNameResourceIconPath(displayName: string): string | null {
    for (const token of extractBracketTokens(displayName)) {
        const path = getResourceTokenIconPath(token);
        if (path) return path;
    }

    return null;
}

export function getCodexEntryIconPath(entry: Pick<CodexEntry, "exportKind" | "entryKey" | "displayName">): string | null {
    const exportKind = entry.exportKind.trim().toLowerCase();

    return getDisplayNameResourceIconPath(entry.displayName)
        ?? getExtractorResourceIconPath(entry.entryKey)
        ?? (exportKind === "factions" || exportKind === "minorfactions" ? getFactionIconPath(entry.entryKey) : null)
        ?? (exportKind === "abilities" ? getAbilityIconPath(entry.entryKey) : null)
        ?? getCodexKindIconPath(entry.exportKind);
}
