import { getRawIcon } from "./iconManifest";

const RESOURCE_TOKEN_RE = /^(LuxuryResource|StrategicResource)(\d{1,2})$/i;

type ResourceTokenKind = "Luxury" | "Strategic";

function normalizeToken(token: string): string {
    const trimmed = token.trim();
    return trimmed.startsWith("[") && trimmed.endsWith("]")
        ? trimmed.slice(1, -1).trim()
        : trimmed;
}

function normalizeResourceNumber(value: string): string | null {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1) {
        return null;
    }

    return String(number).padStart(2, "0");
}

function resourceRawKey(kind: ResourceTokenKind, numberText: string): string | null {
    const normalizedNumber = normalizeResourceNumber(numberText);
    return normalizedNumber ? `extractor_${kind}${normalizedNumber}` : null;
}

export function getResourceTokenIconPath(token: string): string | null {
    const normalized = normalizeToken(token);

    if (/^ResourceStrategic$/i.test(normalized)) {
        return getRawIcon("resourceTypeAny") ?? getRawIcon("constructibleCategoryResource");
    }

    const match = normalized.match(RESOURCE_TOKEN_RE);
    if (!match) {
        return null;
    }

    const kind = match[1]?.toLowerCase().startsWith("luxury") ? "Luxury" : "Strategic";
    const rawKey = resourceRawKey(kind, match[2] ?? "");

    return rawKey ? getRawIcon(rawKey) : null;
}

export function getExtractorResourceIconPath(entryKey: string): string | null {
    const match = entryKey.trim().match(/^Extractor_(Luxury|Strategic)(\d{1,2})$/i);
    if (!match) {
        return null;
    }

    const kind = match[1]?.toLowerCase() === "luxury" ? "Luxury" : "Strategic";
    const rawKey = resourceRawKey(kind, match[2] ?? "");

    return rawKey ? getRawIcon(rawKey) : null;
}
