import { create } from "zustand";
import type { EndGameExport, ParseWarning } from "@/types/endGameReport";

export type TechOrderSlice = EndGameExport["techOrder"] | null;
export type AllStatsSlice = EndGameExport["allStats"] | null;
export type CityBreakdownSlice = EndGameExport["cityBreakdown"] | null;

export type EndGameReportState =
    | { status: "empty" }
    | { status: "loading"; rawJsonText: string }
    | { status: "error"; rawJsonText: string; error: string; warnings: ParseWarning[] }
    | {
    status: "ok";
    rawJsonText: string;
    report: EndGameExport;
    techOrder: TechOrderSlice;
    allStats: AllStatsSlice;
    cityBreakdown: CityBreakdownSlice;
    warnings: ParseWarning[];
};

type Store = {
    state: EndGameReportState;

    // low-level escape hatch (kept)
    setState: (state: EndGameReportState) => void;

    // high-level helpers (recommended usage)
    setLoading: (rawJsonText: string) => void;
    setError: (params: { rawJsonText: string; error: string; warnings?: ParseWarning[] }) => void;
    setOk: (params: { rawJsonText: string; report: EndGameExport; warnings?: ParseWarning[] }) => void;

    clear: () => void;
};

export const useEndGameReportStore = create<Store>((set) => ({
    state: { status: "empty" },

    setState: (state) => set({ state }),

    setLoading: (rawJsonText) =>
        set({
            state: { status: "loading", rawJsonText },
        }),

    setError: ({ rawJsonText, error, warnings }) =>
        set({
            state: {
                status: "error",
                rawJsonText,
                error,
                warnings: warnings ?? [],
            },
        }),

    setOk: ({ rawJsonText, report, warnings }) =>
        set({
            state: {
                status: "ok",
                rawJsonText,
                report,
                techOrder: report.techOrder ?? null,
                allStats: report.allStats ?? null,
                cityBreakdown: report.cityBreakdown ?? null,
                warnings: warnings ?? [],
            },
        }),

    clear: () => set({ state: { status: "empty" } }),
}));