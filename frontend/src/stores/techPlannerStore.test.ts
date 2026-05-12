import { useTechPlannerStore } from "@/stores/techPlannerStore";

describe("useTechPlannerStore", () => {
    beforeEach(() => {
        useTechPlannerStore.getState().reset();
    });

    it("sets selected tech keys from an array", () => {
        useTechPlannerStore.getState().setSelectedTechs(["Tech_First", "Tech_Second"]);

        expect(useTechPlannerStore.getState().selectedTechs).toEqual(["Tech_First", "Tech_Second"]);
    });

    it("supports updater-form selection changes", () => {
        useTechPlannerStore.getState().setSelectedTechs(["Tech_First"]);

        useTechPlannerStore.getState().setSelectedTechs((prev) => [...prev, "Tech_Second"]);

        expect(useTechPlannerStore.getState().selectedTechs).toEqual(["Tech_First", "Tech_Second"]);
    });

    it("toggles selected tech keys on and off", () => {
        useTechPlannerStore.getState().toggleSelectedTech("Tech_First");
        useTechPlannerStore.getState().toggleSelectedTech("Tech_Second");
        useTechPlannerStore.getState().toggleSelectedTech("Tech_First");

        expect(useTechPlannerStore.getState().selectedTechs).toEqual(["Tech_Second"]);
    });

    it("dedupes keys while preserving their first selected position", () => {
        useTechPlannerStore.getState().setSelectedTechs([
            "Tech_First",
            "Tech_Second",
            "Tech_First",
            " Tech_Third ",
            "Tech_Second",
        ]);

        expect(useTechPlannerStore.getState().selectedTechs).toEqual([
            "Tech_First",
            "Tech_Second",
            "Tech_Third",
        ]);
    });

    it("preserves append order when adding selected tech keys", () => {
        useTechPlannerStore.getState().setSelectedTechs(["Tech_First"]);

        useTechPlannerStore.getState().addSelectedTechs(["Tech_Third", "Tech_Second", "Tech_Third"]);

        expect(useTechPlannerStore.getState().selectedTechs).toEqual([
            "Tech_First",
            "Tech_Third",
            "Tech_Second",
        ]);
    });

    it("clears selected tech keys", () => {
        useTechPlannerStore.getState().setSelectedTechs(["Tech_First", "Tech_Second"]);

        useTechPlannerStore.getState().clearSelectedTechs();

        expect(useTechPlannerStore.getState().selectedTechs).toEqual([]);
    });
});
