import { Tech, Improvement } from "@/types/dataTypes";

const IMPROVEMENT_PREFIX = "Improvement: ";

/**
 * Finds all improvements unlocked by the currently selected techs.
 * Compatible with array-based data from the API.
 */
export const getUnlockedImprovements = (
    selectedTechs: Tech[],
    improvements: Improvement[]
): Improvement[] => {
    const unlockedImprovementNames = new Set<string>();

    // Collect all improvement unlocks from selected techs
    for (const tech of selectedTechs) {
        for (const unlockLine of tech.unlocks ?? []) {
            if (unlockLine.startsWith(IMPROVEMENT_PREFIX)) {
                const impName = unlockLine.substring(IMPROVEMENT_PREFIX.length).trim().toLowerCase();
                unlockedImprovementNames.add(impName);
            }
        }
    }

    // Filter matching improvement objects from API
    return improvements.filter(
        (imp) => unlockedImprovementNames.has(imp.name.trim().toLowerCase())
    );
};
