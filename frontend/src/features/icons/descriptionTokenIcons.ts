import { getIconByDescriptionToken } from "./semanticIconManifest";
import { getResourceTokenIconPath } from "./resourceTokenIcons";

export type DescriptionTokenIcon = {
    path: string;
    color?: string;
    variants?: Record<string, { path: string; color?: string }>;
};

export type DescriptionTokenIconContext = {
    line?: string;
    tokenIndex?: number;
};

function normalizeToken(token: string): string {
    const trimmed = token.trim();
    return trimmed.startsWith("[") && trimmed.endsWith("]")
        ? trimmed.slice(1, -1).trim()
        : trimmed;
}

function nearestNumberBeforeToken(context: DescriptionTokenIconContext | undefined): string | null {
    if (!context?.line || typeof context.tokenIndex !== "number" || context.tokenIndex < 0) {
        return null;
    }

    const beforeToken = context.line.slice(0, context.tokenIndex);
    const match = beforeToken.match(/[-+]?\d+(?:\.\d+)?\s*$/);
    if (!match) {
        return null;
    }

    const value = Number(match[0].trim());
    return Number.isInteger(value) ? String(value) : null;
}

export function resolveDescriptionTokenIconVariant(
    icon: DescriptionTokenIcon,
    context: DescriptionTokenIconContext | undefined
): DescriptionTokenIcon {
    const variantKey = nearestNumberBeforeToken(context);
    if (!variantKey || !icon.variants?.[variantKey]) {
        return icon;
    }

    return {
        ...icon,
        ...icon.variants[variantKey],
    };
}

export function getDescriptionTokenIcon(
    token: string,
    context?: DescriptionTokenIconContext
): DescriptionTokenIcon | null {
    const normalizedToken = normalizeToken(token);
    const resourceIconPath = getResourceTokenIconPath(normalizedToken);

    if (resourceIconPath) {
        return {
            path: resourceIconPath,
        };
    }

    const icon = getIconByDescriptionToken(normalizedToken);
    if (!icon) {
        return null;
    }

    return resolveDescriptionTokenIconVariant(
        {
            path: icon.path,
            color: icon.color,
        },
        context
    );
}
