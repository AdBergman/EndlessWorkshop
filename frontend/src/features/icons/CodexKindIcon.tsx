import { IconImg } from "./IconImg";
import { getCodexKindIconPath } from "./codexKindIcons";

type CodexKindIconProps = {
    kind: string;
    label: string;
    className?: string;
    size?: number;
};

export function CodexKindIcon({ kind, label, className, size = 18 }: CodexKindIconProps) {
    const path = getCodexKindIconPath(kind);
    if (!path) return null;
    const classes = ["codex-kindIcon--monochrome", className].filter(Boolean).join(" ");

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
