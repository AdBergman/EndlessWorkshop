export function shortenMechanicalStrategyRequirementLabel(displayText: string): string {
    return displayText
        .trim()
        .replace(/^Build constructible:\s*/i, "Build: ")
        .replace(/^Use faction action:\s*/i, "Use action: ");
}
