export function isValidDisplayName(name: string | null | undefined, factionEntry = false): boolean {
    const normalized = (name ?? "").trim().toLowerCase();
    if (!normalized) return true;

    return !(
        normalized.startsWith("%") ||
        normalized.startsWith("tbd") ||
        normalized.startsWith("[tbd]") ||
        (!factionEntry && /\d{3}/.test(normalized))
    );
}
