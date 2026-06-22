import type { CodexEntry } from "@/types/dataTypes";
import { IconImg } from "./IconImg";
import { getCodexEntryIconPath } from "./codexEntryIcons";

type CodexEntryIconProps = {
    entry: Pick<CodexEntry, "exportKind" | "entryKey" | "displayName" | "svgIcon">;
    label: string;
    className?: string;
    size?: number;
};

export function CodexEntryIcon({ entry, label, className, size = 18 }: CodexEntryIconProps) {
    const path = getCodexEntryIconPath(entry);
    if (!path) return null;
    const isMajorFaction = entry.exportKind.trim().toLowerCase() === "factions";
    const classes = [
        isMajorFaction ? "codex-kindIcon--monochrome" : null,
        className,
    ].filter(Boolean).join(" ");

    return (
        <IconImg
            path={path}
            title={label}
            className={classes}
            size={size}
            decorative
        />
    );
}
