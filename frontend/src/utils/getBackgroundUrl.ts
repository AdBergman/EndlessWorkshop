export const getBackgroundUrl = (faction: string, era: number) => {
    const legacyBackground = ["Kin", "Lords", "Tahuk", "Necrophage"];

    // Check for era 6 and legacy faction
    if (era === 6) {
        if (legacyBackground.includes(faction)) {
            return '/graphics/techEraScreens/default_era_6_old.png';
        }
        return '/graphics/techEraScreens/default_era_6.png';
    }

    return `/graphics/techEraScreens/${faction.toLowerCase()}_era_${era}.png`;
};