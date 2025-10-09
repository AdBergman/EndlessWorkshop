
export const getBackgroundUrl = (faction: string, era: number) => {
    if (era === 6) return '/graphics/techEraScreens/default_era_6.png';
    return `/graphics/techEraScreens/${faction.toLowerCase()}_era_${era}.png`;
};
