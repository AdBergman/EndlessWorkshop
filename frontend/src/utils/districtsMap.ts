import { District } from "@/types/dataTypes";
import districtsJson from "../data/districts.json";

// Tell TypeScript that districtsJson is an array of District
const districtsArray: District[] = districtsJson as District[];

export const districtsMap: Map<string, District> = new Map(
    districtsArray.map((dist: District) => [dist.name, dist])
);
