import {create} from "zustand";
import {EndGameExportV1, ParseWarning} from "@/types/endGameReport";

/**
 * Slice types: extracted sections from the report
 */
export type TechOrderSlice = EndGameExportV1["techOrder"] | null;
export type AllStatsSlice = EndGameExportV1["allStats"] | null;
export type CityBreakdownSlice = EndGameExportV1["cityBreakdown"] | null;

/**
 * Parsed end-game report state machine
 */
export type EndGameReportState =
    | { status: "empty" }
    | { status: "loading"; rawJsonText: string }
    | {
    status: "error";
    rawJsonText: string;
    error: string;
    warnings: ParseWarning[];
}
    | {
    status: "ok";
    rawJsonText: string;
    report: EndGameExportV1;
    techOrder: TechOrderSlice;
    allStats: AllStatsSlice;
    cityBreakdown: CityBreakdownSlice;
    warnings: ParseWarning[];
};

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