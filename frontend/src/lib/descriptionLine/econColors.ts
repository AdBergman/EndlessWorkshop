export const ECON_METRICS = ["Food", "Industry", "Dust", "Science", "Influence"] as const;
export type EconomyMetricKey = (typeof ECON_METRICS)[number];

const ECON_COLORS: Record<EconomyMetricKey, string> = {
    Food: "#4caf50",
    Industry: "#ff7f32",
    Dust: "#ffd54f",
    Science: "#4fc3f7",
    Influence: "#661277",
};

export function getEconomyMetricColor(key: EconomyMetricKey): string {
    return ECON_COLORS[key];
}