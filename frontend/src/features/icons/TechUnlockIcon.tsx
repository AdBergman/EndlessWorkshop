import type { TechUnlockRef } from "@/types/dataTypes";
import type { ConstructibleUnlockKind } from "@/utils/unlocks";
import { IconImg } from "./IconImg";
import { getTechUnlockIconPath } from "./techUnlockIcons";

type TechUnlockIconProps = {
    unlock: TechUnlockRef;
    resolvedKind?: ConstructibleUnlockKind | "Constructible" | null;
    className?: string;
};

export function TechUnlockIcon({ unlock, resolvedKind, className }: TechUnlockIconProps) {
    const path = getTechUnlockIconPath(unlock, resolvedKind);
    if (!path) return null;

    return (
        <IconImg
            path={path}
            title={resolvedKind ?? unlock.unlockCategory ?? unlock.unlockType}
            className={className}
            size={16}
            decorative
        />
    );
}

