import { create } from "zustand";
import type React from "react";

type SelectedTechsUpdater = React.SetStateAction<string[]>;

type TechPlannerStore = {
    selectedTechs: string[];
    setSelectedTechs: (next: SelectedTechsUpdater) => void;
    toggleSelectedTech: (techKey: string) => void;
    addSelectedTechs: (techKeys: string[]) => void;
    clearSelectedTechs: () => void;
    reset: () => void;
};

const uniqueOrdered = (techKeys: string[]) => {
    const seen = new Set<string>();
    const next: string[] = [];

    for (const rawKey of techKeys) {
        const techKey = (rawKey ?? "").trim();
        if (!techKey || seen.has(techKey)) continue;
        seen.add(techKey);
        next.push(techKey);
    }

    return next;
};

const initialState = {
    selectedTechs: [] as string[],
};

export const useTechPlannerStore = create<TechPlannerStore>((set) => ({
    ...initialState,

    setSelectedTechs: (next) => {
        set((state) => {
            const resolved = typeof next === "function" ? next(state.selectedTechs) : next;
            return { selectedTechs: uniqueOrdered(resolved) };
        });
    },

    toggleSelectedTech: (techKey) => {
        const normalizedKey = (techKey ?? "").trim();
        if (!normalizedKey) return;

        set((state) => ({
            selectedTechs: state.selectedTechs.includes(normalizedKey)
                ? state.selectedTechs.filter((selectedTech) => selectedTech !== normalizedKey)
                : [...state.selectedTechs, normalizedKey],
        }));
    },

    addSelectedTechs: (techKeys) => {
        set((state) => ({
            selectedTechs: uniqueOrdered([...state.selectedTechs, ...techKeys]),
        }));
    },

    clearSelectedTechs: () => {
        set({ selectedTechs: [] });
    },

    reset: () => {
        set(initialState);
    },
}));

export const selectSelectedTechs = (state: TechPlannerStore) => state.selectedTechs;
export const selectSetSelectedTechs = (state: TechPlannerStore) => state.setSelectedTechs;
