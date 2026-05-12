import { renderHook } from "@testing-library/react";
import { useCodex } from "@/hooks/useCodex";
import { useCodexStore } from "@/stores/codexStore";

describe("useCodex", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
        useCodexStore.setState({
            entries: [
                {
                    exportKind: "abilities",
                    entryKey: "Shared_Key",
                    displayName: "Ability Label",
                    descriptionLines: ["Ability tooltip."],
                    referenceKeys: [],
                },
                {
                    exportKind: "units",
                    entryKey: "Shared_Key",
                    displayName: "Unit Label",
                    descriptionLines: ["Unit tooltip."],
                    referenceKeys: [],
                },
                {
                    exportKind: "abilities",
                    entryKey: "Blank_Label",
                    displayName: "",
                    descriptionLines: ["Hidden tooltip."],
                    referenceKeys: [],
                },
            ],
            entriesByKey: {
                Shared_Key: {
                    exportKind: "units",
                    entryKey: "Shared_Key",
                    displayName: "Unit Label",
                    descriptionLines: ["Unit tooltip."],
                    referenceKeys: [],
                },
                Blank_Label: {
                    exportKind: "abilities",
                    entryKey: "Blank_Label",
                    displayName: "",
                    descriptionLines: ["Hidden tooltip."],
                    referenceKeys: [],
                },
            },
            entriesByKind: {
                abilities: [
                    {
                        exportKind: "abilities",
                        entryKey: "Shared_Key",
                        displayName: "Ability Label",
                        descriptionLines: ["Ability tooltip."],
                        referenceKeys: [],
                    },
                    {
                        exportKind: "abilities",
                        entryKey: "Blank_Label",
                        displayName: "",
                        descriptionLines: ["Hidden tooltip."],
                        referenceKeys: [],
                    },
                ],
                units: [
                    {
                        exportKind: "units",
                        entryKey: "Shared_Key",
                        displayName: "Unit Label",
                        descriptionLines: ["Unit tooltip."],
                        referenceKeys: [],
                    },
                ],
            },
            entriesByKindKey: {
                abilities: {
                    Shared_Key: {
                        exportKind: "abilities",
                        entryKey: "Shared_Key",
                        displayName: "Ability Label",
                        descriptionLines: ["Ability tooltip."],
                        referenceKeys: [],
                    },
                    Blank_Label: {
                        exportKind: "abilities",
                        entryKey: "Blank_Label",
                        displayName: "",
                        descriptionLines: ["Hidden tooltip."],
                        referenceKeys: [],
                    },
                },
                units: {
                    Shared_Key: {
                        exportKind: "units",
                        entryKey: "Shared_Key",
                        displayName: "Unit Label",
                        descriptionLines: ["Unit tooltip."],
                        referenceKeys: [],
                    },
                },
            },
            loading: false,
            error: null,
        });
    });

    afterEach(() => {
        useCodexStore.getState().reset();
    });

    it("resolves entries by export kind and entry key without GameDataContext", () => {
        const { result } = renderHook(() => useCodex());

        expect(result.current.getEntry("abilities", "Shared_Key")?.displayName).toBe("Ability Label");
        expect(result.current.getEntry("units", "Shared_Key")?.displayName).toBe("Unit Label");
        expect(result.current.getVisibleEntry("abilities", "Shared_Key")?.displayName).toBe("Ability Label");
        expect(result.current.getVisibleLabel("units", "Shared_Key")).toBe("Unit Label");
        expect(result.current.getTooltipLines("abilities", "Shared_Key")).toEqual(["Ability tooltip."]);
    });

    it("keeps visible-entry filtering behavior for blank labels", () => {
        const { result } = renderHook(() => useCodex());

        expect(result.current.getEntry("abilities", "Blank_Label")).toBeDefined();
        expect(result.current.getVisibleEntry("abilities", "Blank_Label")).toBeUndefined();
        expect(result.current.getVisibleLabel("abilities", "Blank_Label")).toBeNull();
        expect(result.current.getTooltipLines("abilities", "Blank_Label")).toEqual([]);
    });

    it("returns empty lookup results for missing entries", () => {
        const { result } = renderHook(() => useCodex());

        expect(result.current.getEntry("abilities", "Missing_Key")).toBeUndefined();
        expect(result.current.getVisibleEntry("abilities", "Missing_Key")).toBeUndefined();
        expect(result.current.getVisibleLabel("abilities", "Missing_Key")).toBeNull();
        expect(result.current.getTooltipLines("abilities", "Missing_Key")).toEqual([]);
    });
});
