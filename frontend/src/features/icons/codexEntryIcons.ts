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

function getExplicitAbilityIconPath(entry: Pick<CodexEntry, "exportKind" | "svgIcon">): string | null {
    const exportKind = entry.exportKind.trim().toLowerCase();
    const icon = entry.svgIcon;
    if (exportKind !== "abilities" || !icon || icon.source !== "ability-icons" || !icon.key.trim()) return null;

    return getAbilityIconPath(icon.key);
}

export function getCodexEntryIconPath(entry: Pick<CodexEntry, "exportKind" | "entryKey" | "displayName" | "svgIcon">): string | null {
    const exportKind = entry.exportKind.trim().toLowerCase();

    return getDisplayNameResourceIconPath(entry.displayName)
        ?? getExtractorResourceIconPath(entry.entryKey)
        ?? (exportKind === "factions" || exportKind === "minorfactions" ? getFactionIconPath(entry.entryKey) : null)
        ?? getExplicitAbilityIconPath(entry)
        ?? (exportKind === "abilities" ? null : getCodexKindIconPath(entry.exportKind));
}
