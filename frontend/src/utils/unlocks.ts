import { Tech, Improvement } from "@/types/dataTypes";

const IMPROVEMENT_PREFIX = "Improvement: ";

/**
 * Parses the currently selected techs to find all unique improvements they unlock.
 * @param selectedTechs - The array of currently selected Tech objects.
 * @param improvementsMap - The map of all available improvements.
 * @returns An array of unique Improvement objects unlocked by the selected techs.
 */
export const getUnlockedImprovements = (
    selectedTechs: Tech[],
    improvementsMap: Map<string, Improvement>
): Improvement[] => {
    const unlockedImprovementNames = new Set<string>();

    // Iterate through each selected tech to find what it unlocks
    for (const tech of selectedTechs) {
        for (const unlockLine of tech.unlocks) {
            if (unlockLine.startsWith(IMPROVEMENT_PREFIX)) {
                const improvementName = unlockLine.substring(IMPROVEMENT_PREFIX.length);
                unlockedImprovementNames.add(improvementName);
            }
        }
    }

    // Look up the full Improvement objects from the map
    const unlockedImprovements: Improvement[] = [];
    for (const name of unlockedImprovementNames) {
        const improvement = improvementsMap.get(name);
        if (improvement) {
            unlockedImprovements.push(improvement);
        }
    }

    return unlockedImprovements;
};
