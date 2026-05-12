import {
    abilityEntityRef,
    codexEntityKey,
    codexEntityRef,
    districtEntityRef,
    entityRefId,
    heroEntityRef,
    improvementEntityRef,
    isEntityKind,
    normalizeEntityRef,
    parseCodexEntityKey,
    parseCodexEntityRef,
    parseEntityRefId,
    populationEntityRef,
    techEntityRef,
    unitEntityRef,
    type EntityRef,
} from "./entityRef";

describe("entityRef", () => {
    it("normalizes supported entity refs without changing key casing", () => {
        expect(normalizeEntityRef({ kind: "tech", key: " Tech_A " })).toEqual({
            kind: "tech",
            key: "Tech_A",
        });

        expect(normalizeEntityRef({ kind: "unit", key: "Unit_Necro_Larva" })).toEqual({
            kind: "unit",
            key: "Unit_Necro_Larva",
        });
    });

    it("rejects invalid kinds and blank keys", () => {
        expect(isEntityKind("tech")).toBe(true);
        expect(isEntityKind("abilities")).toBe(false);
        expect(isEntityKind("")).toBe(false);

        expect(normalizeEntityRef({ kind: "abilities", key: "Ability_A" })).toBeNull();
        expect(normalizeEntityRef({ kind: "ability", key: "   " })).toBeNull();
        expect(normalizeEntityRef(null)).toBeNull();
    });

    it("creates stable IDs and round-trips encoded keys", () => {
        const ref: EntityRef = {
            kind: "unit",
            key: "Unit:With Spaces/And:Colons",
        };

        const id = entityRefId(ref);

        expect(id).toBe("unit:Unit%3AWith%20Spaces%2FAnd%3AColons");
        expect(parseEntityRefId(id)).toEqual(ref);
    });

    it("rejects invalid entity ref IDs", () => {
        expect(parseEntityRefId("")).toBeNull();
        expect(parseEntityRefId("tech")).toBeNull();
        expect(parseEntityRefId("unknown:Tech_A")).toBeNull();
        expect(parseEntityRefId("tech:")).toBeNull();
        expect(parseEntityRefId("tech:%E0%A4%A")).toBeNull();
    });

    it("preserves codex export kind and entry key semantics", () => {
        const ref = codexEntityRef("Abilities", "Ability:Bloom 2");

        expect(ref).toEqual({
            kind: "codex",
            key: "abilities:Ability%3ABloom%202",
        });
        expect(parseCodexEntityRef(ref!)).toEqual({
            exportKind: "abilities",
            entryKey: "Ability:Bloom 2",
        });
    });

    it("round-trips codex identities through generic entity ref IDs", () => {
        const ref = codexEntityRef("heroes", "Hero_A")!;
        const id = entityRefId(ref);
        const parsedRef = parseEntityRefId(id);

        expect(id).toBe("codex:heroes%3AHero_A");
        expect(parsedRef).toEqual(ref);
        expect(parseCodexEntityRef(parsedRef!)).toEqual({
            exportKind: "heroes",
            entryKey: "Hero_A",
        });
    });

    it("rejects malformed codex identities", () => {
        expect(codexEntityKey("", "Entry_A")).toBeNull();
        expect(codexEntityKey("units", "   ")).toBeNull();
        expect(parseCodexEntityKey("units")).toBeNull();
        expect(parseCodexEntityKey("units:")).toBeNull();
        expect(parseCodexEntityKey("%E0%A4%A:Entry_A")).toBeNull();
        expect(parseCodexEntityRef({ kind: "unit", key: "Unit_A" })).toBeNull();
    });

    it("creates basic adapter refs for current domains", () => {
        expect(techEntityRef({ techKey: "Tech_A" })).toEqual({ kind: "tech", key: "Tech_A" });
        expect(unitEntityRef({ unitKey: "Unit_A" })).toEqual({ kind: "unit", key: "Unit_A" });
        expect(districtEntityRef({ districtKey: "District_A" })).toEqual({
            kind: "district",
            key: "District_A",
        });
        expect(improvementEntityRef({ improvementKey: "Improvement_A" })).toEqual({
            kind: "improvement",
            key: "Improvement_A",
        });
        expect(abilityEntityRef("Ability_A")).toEqual({ kind: "ability", key: "Ability_A" });
        expect(heroEntityRef("Hero_A")).toEqual({ kind: "hero", key: "Hero_A" });
        expect(populationEntityRef("Population_A")).toEqual({
            kind: "population",
            key: "Population_A",
        });
    });
});
