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

    return (
        <IconImg
            path={path}
            title={label}
            className={className}
            size={size}
            decorative
        />
    );
}

