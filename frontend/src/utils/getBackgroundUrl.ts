export const getBackgroundUrl = (faction: string, era: number) => {
    return `/graphics/techEraScreens/${faction.toLowerCase()}_era_${era}.webp`;
};