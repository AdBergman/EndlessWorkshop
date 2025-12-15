import { create } from "zustand";

export type EmpireMetricKey =
    | "Food"
    | "Industry"
    | "Dust"
    | "Science"
    | "Influence"
    | "Approval"
    | "Populations"
    | "Technologies"
    | "Units"
    | "Cities"
    | "Territories"
    | "Score";

type Store = {
    selectedMetric: EmpireMetricKey;
    selectedEmpires: number[]; // indices
    setMetric: (m: EmpireMetricKey) => void;
    toggleEmpire: (idx: number) => void;
    selectAll: (empireCount: number) => void;
    clearAll: () => void;
    ensureDefaults: (empireCount: number) => void;
};

export const useEmpireStatsViewStore = create<Store>((set, get) => ({
    selectedMetric: "Score",
    selectedEmpires: [0],

    setMetric: (m) => set({ selectedMetric: m }),

    toggleEmpire: (idx) =>
        set((s) => {
            const has = s.selectedEmpires.includes(idx);
            const next = has
                ? s.selectedEmpires.filter((x) => x !== idx)
                : [...s.selectedEmpires, idx];
            next.sort((a, b) => a - b);
            return { selectedEmpires: next };
        }),

    selectAll: (empireCount) =>
        set({
            selectedEmpires: Array.from({ length: empireCount }, (_, i) => i),
        }),

    clearAll: () => set({ selectedEmpires: [] }),

    ensureDefaults: (empireCount) => {
        const { selectedEmpires } = get();
        // If nothing selected, default to player empire 0 (if it exists)
        if (selectedEmpires.length === 0 && empireCount > 0) {
            set({ selectedEmpires: [0] });
        }
    },
}));