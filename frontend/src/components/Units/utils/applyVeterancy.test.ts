import { applyVeterancyToStats, clampVeterancyLevel, isVeterancyApplicable } from "./applyVeterancy";
import type { UnitStats } from "@/lib/units/deriveUnit";

const stats = (overrides: Partial<UnitStats> = {}): UnitStats => ({
    damage: 40,
    health: 80,
    defense: 6,
    movement: 5,
    visionRange: 4,
    focus: 10,
    upkeep: 2,
    ...overrides,
});

describe("applyVeterancyToStats", () => {
    it("keeps level 0 at exported base stats", () => {
        expect(applyVeterancyToStats(stats(), 0)).toEqual(stats());
    });

    it("applies one cumulative level of defense, damage, and health bonuses", () => {
        expect(applyVeterancyToStats(stats(), 1)).toMatchObject({
            damage: 42,
            health: 84,
            defense: 8,
            movement: 5,
            focus: 10,
            upkeep: 2,
        });
    });

    it("applies level 5 cumulative bonuses", () => {
        expect(applyVeterancyToStats(stats(), 5)).toMatchObject({
            damage: 50,
            health: 100,
            defense: 16,
        });
    });

    it("treats missing exported defense as base 0 when previewing bonuses", () => {
        expect(applyVeterancyToStats(stats({ defense: null }), 0).defense).toBeNull();
        expect(applyVeterancyToStats(stats({ defense: null }), 5).defense).toBe(10);
    });

    it("rounds percentage bonuses to the nearest displayed whole stat", () => {
        expect(applyVeterancyToStats(stats({ damage: 33, health: 101 }), 1)).toMatchObject({
            damage: 35,
            health: 106,
        });
    });

    it("does not mutate source stats", () => {
        const source = stats({ damage: 33 });
        const result = applyVeterancyToStats(source, 5);

        expect(result).not.toBe(source);
        expect(source).toEqual(stats({ damage: 33 }));
    });

    it("returns base stats when veterancy does not apply", () => {
        expect(applyVeterancyToStats(stats(), 5, false)).toEqual(stats());
    });

    it("clamps requested levels into the supported 0-5 range", () => {
        expect(clampVeterancyLevel(-4)).toBe(0);
        expect(clampVeterancyLevel(99)).toBe(5);
        expect(clampVeterancyLevel(2.4)).toBe(2);
    });

    it("treats heroes as non-applicable", () => {
        expect(isVeterancyApplicable({ isHero: true })).toBe(false);
        expect(isVeterancyApplicable({ isHero: false })).toBe(true);
        expect(isVeterancyApplicable(null)).toBe(false);
    });
});
