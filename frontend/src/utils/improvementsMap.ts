import { Improvement } from "../types/dataTypes";
import improvementsJson from "../data/improvements.json";

// Tell TypeScript that improvementsJson is an array of Improvement
const improvementsArray: Improvement[] = improvementsJson as Improvement[];

export const improvementsMap: Map<string, Improvement> = new Map(
    improvementsArray.map((imp: Improvement) => [imp.name, imp])
);
