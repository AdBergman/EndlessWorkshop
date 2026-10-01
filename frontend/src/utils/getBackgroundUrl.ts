import { factionIdentityToken } from "@/utils/factionIdentity";

const backgrounds: Record<string, string> = {
    kinofsheredyn: "kin", lastlord: "lords", aspect: "aspects", necrophage: "necrophages", mukag: "tahuk",
};

export const getBackgroundUrl = (faction: string, era: number) => {
    const asset = backgrounds[factionIdentityToken(faction)] ?? "kin";
    return `/graphics/techEraScreens/${asset}_era_${era}.webp`;
};
