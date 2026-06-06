import { buildEvolutionLayers } from "@/components/Units/unitEvolution";
import type { Unit } from "@/types/dataTypes";

const unit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Root",
    displayName: "Root",
    artId: null,
    faction: "Kin",
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: null,
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: null,
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

describe("buildEvolutionLayers", () => {
    it("traverses normalized unit records by key without Map iteration", () => {
        const root = unit({
            unitKey: " Unit_Root ",
            displayName: "Root",
            nextEvolutionUnitKeys: ["Unit_Bravo", " Unit_Alpha "],
        });
        const alpha = unit({
            unitKey: "Unit_Alpha",
            displayName: "Alpha",
            previousUnitKey: "Unit_Root",
            evolutionTierIndex: 1,
            nextEvolutionUnitKeys: ["Unit_Final"],
        });
        const bravo = unit({
            unitKey: "Unit_Bravo",
            displayName: "Bravo",
            previousUnitKey: "Unit_Root",
            evolutionTierIndex: 1,
        });
        const final = unit({
            unitKey: "Unit_Final",
            displayName: "Final",
            previousUnitKey: "Unit_Alpha",
            evolutionTierIndex: 2,
        });

        const layers = buildEvolutionLayers(root, {
            Unit_Alpha: alpha,
            Unit_Bravo: bravo,
            Unit_Final: final,
        });

        expect(layers.map((layer) => layer.map((u) => u.unitKey))).toEqual([
            ["Unit_Bravo", "Unit_Alpha"],
            ["Unit_Final"],
        ]);
    });

    it("preserves branch order across tiers so paired upgrades do not cross visually", () => {
        const root = unit({
            unitKey: "Unit_Archer",
            displayName: "Archer",
            nextEvolutionUnitKeys: ["Unit_HeavyArcher", "Unit_Bloodletter"],
        });
        const heavyArcher = unit({
            unitKey: "Unit_HeavyArcher",
            displayName: "Heavy Archer",
            previousUnitKey: "Unit_Archer",
            evolutionTierIndex: 1,
            nextEvolutionUnitKeys: ["Unit_Bowmaster"],
        });
        const bowmaster = unit({
            unitKey: "Unit_Bowmaster",
            displayName: "Bowmaster",
            previousUnitKey: "Unit_HeavyArcher",
            evolutionTierIndex: 2,
        });
        const bloodletter = unit({
            unitKey: "Unit_Bloodletter",
            displayName: "Bloodletter",
            previousUnitKey: "Unit_Archer",
            evolutionTierIndex: 1,
            nextEvolutionUnitKeys: ["Unit_Executor"],
        });
        const executor = unit({
            unitKey: "Unit_Executor",
            displayName: "Executor",
            previousUnitKey: "Unit_Bloodletter",
            evolutionTierIndex: 2,
        });

        const layers = buildEvolutionLayers(root, {
            Unit_Bloodletter: bloodletter,
            Unit_Bowmaster: bowmaster,
            Unit_Executor: executor,
            Unit_HeavyArcher: heavyArcher,
        });

        expect(layers.map((layer) => layer.map((u) => u.unitKey))).toEqual([
            ["Unit_HeavyArcher", "Unit_Bloodletter"],
            ["Unit_Bowmaster", "Unit_Executor"],
        ]);
    });

    it("skips missing units, respects max depth, and avoids cycles", () => {
        const root = unit({
            unitKey: "Unit_Root",
            nextEvolutionUnitKeys: ["Unit_Missing", "Unit_Child"],
        });
        const child = unit({
            unitKey: "Unit_Child",
            displayName: "Child",
            previousUnitKey: "Unit_Root",
            evolutionTierIndex: 1,
            nextEvolutionUnitKeys: ["Unit_Root", "Unit_Grandchild"],
        });
        const grandchild = unit({
            unitKey: "Unit_Grandchild",
            displayName: "Grandchild",
            previousUnitKey: "Unit_Child",
            evolutionTierIndex: 2,
        });

        const layers = buildEvolutionLayers(root, {
            Unit_Child: child,
            Unit_Grandchild: grandchild,
        }, 1);

        expect(layers.map((layer) => layer.map((u) => u.unitKey))).toEqual([["Unit_Child"]]);
    });
});
