export function stringifyJsonLd(node: Record<string, unknown>): string {
    return JSON.stringify(node).replace(/</g, "\\u003c");
}
