import { create } from "zustand";
import { EndGameExportV1, ParseWarning } from "@/types/endGameReport";

export type EndGameReportState =
    | { status: "empty" }
    | { status: "loading"; rawJsonText: string }
    | { status: "error"; rawJsonText: string; error: string; warnings: ParseWarning[] }
    | { status: "ok"; rawJsonText: string; report: EndGameExportV1; warnings: ParseWarning[] };

type Store = {
    state: EndGameReportState;

    setState: (state: EndGameReportState) => void;
    clear: () => void;
};

export const useEndGameReportStore = create<Store>((set) => ({
    state: { status: "empty" },

    setState: (state) => set({ state }),
    clear: () => set({ state: { status: "empty" } }),
}));