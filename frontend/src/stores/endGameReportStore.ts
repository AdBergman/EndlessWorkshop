import { create } from "zustand";

type EndGameReportState = {
  rawJsonText: string | null;
  setRawJsonText: (text: string | null) => void;
  clear: () => void;
};

/**
 * Minimal "sticky import" store.
 * Stores only the raw JSON text so the report persists across route changes.
 */
export const useEndGameReportStore = create<EndGameReportState>((set) => ({
  rawJsonText: null,
  setRawJsonText: (text) => set({ rawJsonText: text }),
  clear: () => set({ rawJsonText: null }),
}));
