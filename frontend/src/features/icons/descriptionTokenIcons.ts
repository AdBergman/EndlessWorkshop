import descriptionTokenIconsJson from "../../../public/svg/description-token-icons.json";
import { getDescriptionTokenAliasIcon } from "./descriptionTokenIconAliases";
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

type DescriptionTokenIconRegistryJson = Record<string, DescriptionTokenIcon>;

const descriptionTokenIconRegistry = buildDescriptionTokenIconRegistry(
    descriptionTokenIconsJson as DescriptionTokenIconRegistryJson
);

function normalizeToken(token: string): string {
    const trimmed = token.trim();
    return trimmed.startsWith("[") && trimmed.endsWith("]")
        ? trimmed.slice(1, -1).trim()
        : trimmed;
}

function normalizeLookupKey(token: string): string {
    return normalizeToken(token).toLowerCase();
}

function buildDescriptionTokenIconRegistry(registry: DescriptionTokenIconRegistryJson): Map<string, DescriptionTokenIcon> {
    const index = new Map<string, DescriptionTokenIcon>();

    for (const [token, icon] of Object.entries(registry)) {
        if (!token.trim() || !icon?.path?.trim()) continue;
        index.set(normalizeLookupKey(token), icon);
    }

    return index;
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

    const registryIcon = descriptionTokenIconRegistry.get(normalizeLookupKey(normalizedToken));
    if (registryIcon) {
        return resolveDescriptionTokenIconVariant(registryIcon, context);
    }

    const resourceIconPath = getResourceTokenIconPath(normalizedToken);

    if (resourceIconPath) {
        return {
            path: resourceIconPath,
        };
    }

    const aliasIcon = getDescriptionTokenAliasIcon(normalizedToken);
    if (aliasIcon) {
        return resolveDescriptionTokenIconVariant(aliasIcon, context);
    }

    return null;
}
