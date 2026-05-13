import { normalizeCollection } from "./normalizedCollection";

describe("normalizeCollection", () => {
    it("indexes items by normalized key while preserving first-seen key order", () => {
        const collection = normalizeCollection(
            [
                { key: " Alpha ", value: 1 },
                { key: "Beta", value: 2 },
                { key: "Alpha", value: 3 },
            ],
            (item) => item.key
        );

        expect(collection.keys).toEqual(["Alpha", "Beta"]);
        expect(collection.byKey).toEqual({
            Alpha: { key: "Alpha", value: 3 },
            Beta: { key: "Beta", value: 2 },
        });
        expect(collection.items).toEqual([
            { key: "Alpha", value: 3 },
            { key: "Beta", value: 2 },
        ]);
    });

    it("skips blank keys and reports each duplicate key once", () => {
        const collection = normalizeCollection(
            [
                { key: "", value: "blank" },
                { key: "Alpha", value: "first" },
                { key: "Alpha", value: "second" },
                { key: "Alpha", value: "third" },
                { key: "  ", value: "spaces" },
            ],
            (item) => item.key
        );

        expect(collection.keys).toEqual(["Alpha"]);
        expect(collection.duplicateKeys).toEqual(["Alpha"]);
        expect(collection.items).toEqual([{ key: "Alpha", value: "third" }]);
    });

    it("accepts a domain-specific key normalizer", () => {
        const collection = normalizeCollection(
            [
                { key: "unit_a", value: 1 },
                { key: "UNIT_A", value: 2 },
            ],
            (item) => item.key,
            { normalizeKey: (key) => (key ?? "").trim().toUpperCase() }
        );

        expect(collection.keys).toEqual(["UNIT_A"]);
        expect(collection.duplicateKeys).toEqual(["UNIT_A"]);
        expect(collection.byKey.UNIT_A).toEqual({ key: "UNIT_A", value: 2 });
    });
});
