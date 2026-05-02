export function isValidDisplayName(name: string | null | undefined): boolean {
    const normalized = (name ?? "").trim().toLowerCase();
    if (!normalized) return true;

    return !(
        normalized.startsWith("%") ||
        normalized.startsWith("tbd") ||
        normalized.startsWith("[tbd]") ||
        /\d{3}/.test(normalized)
    );
}
