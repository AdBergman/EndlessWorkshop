export const FACTION_COLORS = {
    KIN: {
        border: "#3B82F6",      // blue-500 — noble, disciplined
        accent: "#60A5FA",
    },
    LORDS: {
        border: "#EF4444",      // red-500 — greed, power, passion
        accent: "#F87171",
    },
    NECROPHAGES: {
        border: "#10B981",      // green-500 — toxic, organic
        accent: "#34D399",
    },
    ASPECTS: {
        border: "#8B5CF6",      // violet-500 — mystical, crystalline
        accent: "#A78BFA",
    },
    TAHUK: {
        border: "#06B6D4",      // cyan-500 — scientific, clean, precise
        accent: "#22D3EE",
    },

    MINOR: {
        border: "#8f5e3a", // deep bronze edge — grounded, readable
        accent: "#c15512", // warm copper-orange highlight
    },

    PLACEHOLDER: {
        border: "#c15512",      // amber-600 — rich tone
        accent: "#ffa100",      // amber-400 — warm highlight
    },
} as const;


export const FACTION_GRADIENT: Record<string, string> = {
    KIN: "linear-gradient(90deg, #6ab3ff, #4faaff, #1a73e8)",          // blue-ish, soft, smooth transition
    LORDS: "linear-gradient(90deg, #f06666, #e53935, #b71c1c)",       // red-ish, warm, rich
    NECROPHAGES: "linear-gradient(90deg, #a4d168, #8bc34a, #558b2f)", // green-ish, natural, soft
    TAHUK: "linear-gradient(90deg, #fff566, #ffeb3b, #fbc02d)",       // yellow-ish, bright, smooth
    ASPECTS: "linear-gradient(90deg, #b366d1, #9c27b0, #6a1b9a)",     // purple-ish, mystical, soft

    MINOR: "linear-gradient(90deg, #8f5e3a 0%, #ae7046 40%, #c15512 100%)",

    PLACEHOLDER: "linear-gradient(90deg, #f7d878, #f4d35e, #e2b842)"  // gold, soft, neutral
};
