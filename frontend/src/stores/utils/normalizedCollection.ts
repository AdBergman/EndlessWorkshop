export type NormalizedCollection<T> = {
    items: T[];
    byKey: Record<string, T>;
    keys: string[];
    duplicateKeys: string[];
};

type NormalizeCollectionOptions = {
    normalizeKey?: (key: string | null | undefined) => string;
};

const defaultNormalizeKey = (key: string | null | undefined) => (key ?? "").trim();

export function normalizeCollection<T>(
    rawItems: readonly T[],
    getKey: (item: T) => string | null | undefined,
    options: NormalizeCollectionOptions = {}
): NormalizedCollection<T> {
    const normalizeKey = options.normalizeKey ?? defaultNormalizeKey;
    const byKey: Record<string, T> = {};
    const keys: string[] = [];
    const duplicateKeys: string[] = [];
    const duplicateKeySet = new Set<string>();

    for (const item of rawItems) {
        const key = normalizeKey(getKey(item));
        if (!key) continue;

        if (byKey[key]) {
            if (!duplicateKeySet.has(key)) {
                duplicateKeys.push(key);
                duplicateKeySet.add(key);
            }
        } else {
            keys.push(key);
        }

        byKey[key] = item;
    }

    return {
        byKey,
        keys,
        duplicateKeys,
        items: keys.map((key) => byKey[key]).filter((item): item is T => !!item),
    };
}
