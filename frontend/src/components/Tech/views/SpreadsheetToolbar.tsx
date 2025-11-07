import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { useGameData } from "@/context/GameDataContext";
import { Tech, Improvement, District, Unit } from "@/types/dataTypes";

export type SheetView = "techs" | "improvements" | "districts" | "units";

interface SpreadsheetToolbarProps {
    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
    activeSheet: SheetView;
    setActiveSheet: (view: SheetView) => void;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
                                                                   onDeselectAll,
                                                                   generateShareLink,
                                                                   onSort,
                                                                   activeSheet,
                                                                   setActiveSheet,
                                                               }) => {
    const { techs, improvements, districts, units, selectedTechs, selectedFaction } = useGameData();

    const factionLabel = selectedFaction?.uiLabel?.toLowerCase() ?? "all-factions";

    // Compute selected tech objects
    const selectedTechObjects = useMemo(
        () =>
            selectedTechs
                .map((name) => techs.get(name))
                .filter((t): t is Tech => !!t),
        [selectedTechs, techs]
    );

    // --- Compute unlocked improvements, districts, and units based on tech unlock strings ---
    const unlockedImprovements = useMemo(() => {
        const list: Improvement[] = [];
        const prefix = "Improvement: ";
        for (const tech of selectedTechObjects) {
            for (const unlock of tech.unlocks ?? []) {
                if (unlock.startsWith(prefix)) {
                    const name = unlock.substring(prefix.length).trim();
                    const imp = improvements.get(name);
                    if (imp) list.push(imp);
                }
            }
        }
        return list;
    }, [selectedTechObjects, improvements]);

    const unlockedDistricts = useMemo(() => {
        const list: District[] = [];
        const prefix = "District: ";
        for (const tech of selectedTechObjects) {
            for (const unlock of tech.unlocks ?? []) {
                if (unlock.startsWith(prefix)) {
                    const name = unlock.substring(prefix.length).trim();
                    const dist = districts.get(name);
                    if (dist) list.push(dist);
                }
            }
        }
        return list;
    }, [selectedTechObjects, districts]);

    const unlockedUnits = useMemo(() => {
        const list: Unit[] = [];
        const prefixes = ["Unit: ", "Unit Specialization: "]; // ✅ handle both possible data formats

        for (const tech of selectedTechObjects) {
            for (const unlock of tech.unlocks ?? []) {
                const prefix = prefixes.find((p) => unlock.startsWith(p));
                if (!prefix) continue;

                const name = unlock.substring(prefix.length).trim();
                const unit = units.get(name);
                if (unit) list.push(unit);
            }
        }
        return list;
    }, [selectedTechObjects, units]);

    // --- Build CSV data depending on active sheet ---
    const { data, headers, filename } = useMemo(() => {
        switch (activeSheet) {
            case "improvements":
                return {
                    filename: `endless-workshop-${factionLabel}-improvements.csv`,
                    headers: ["Name", "Unique", "Effects", "Cost"],
                    data: unlockedImprovements.map((imp) => ({
                        Name: imp.name,
                        Unique: imp.unique ?? "",
                        Effects: imp.effects?.join("; ") ?? "",
                        Cost: imp.cost?.join("; ") ?? "",
                    })),
                };

            case "districts":
                return {
                    filename: `endless-workshop-${factionLabel}-districts.csv`,
                    headers: [
                        "Name",
                        "Effect",
                        "Info",
                        "Tile Bonus",
                        "Adjacency Bonus",
                        "Placement Prerequisite",
                    ],
                    data: unlockedDistricts.map((d) => ({
                        Name: d.name,
                        Effect: d.effect ?? "",
                        Info: d.info?.join("; ") ?? "",
                        "Tile Bonus": d.tileBonus?.join("; ") ?? "",
                        "Adjacency Bonus": d.adjacencyBonus?.join("; ") ?? "",
                        "Placement Prerequisite": d.placementPrereq ?? "None",
                    })),
                };

            case "units":
                return {
                    filename: `endless-workshop-${factionLabel}-units.csv`,
                    headers: [
                        "Name",
                        "Tier",
                        "Type",
                        "Health",
                        "Defense",
                        "Damage (Min–Max)",
                        "Movement",
                        "Skills",
                    ],
                    data: unlockedUnits.map((u) => ({
                        Name: u.name,
                        Tier: u.tier ?? "",
                        Type: u.type ?? "",
                        Health: u.health ?? "",
                        Defense: u.defense ?? "",
                        "Damage (Min–Max)": `${u.minDamage ?? ""}-${u.maxDamage ?? ""}`,
                        Movement: u.movementPoints ?? "",
                        Skills: u.skills?.join("; ") ?? "",
                    })),
                };

            case "techs":
            default:
                return {
                    filename: `endless-workshop-${factionLabel}-techs.csv`,
                    headers: ["Name", "Era", "Type", "Unlocks", "Effects"],
                    data: selectedTechObjects.map((t) => ({
                        Name: t.name,
                        Era: t.era ?? "",
                        Type: t.type ?? "",
                        Unlocks: t.unlocks?.join("; ") ?? "",
                        Effects: t.effects?.join("; ") ?? "",
                    })),
                };
        }
    }, [
        activeSheet,
        factionLabel,
        unlockedImprovements,
        unlockedDistricts,
        unlockedUnits,
        selectedTechObjects,
    ]);

    return (
        <div className="spreadsheet-toolbar">
            <div className="action-buttons">
                <button onClick={onSort}>Sort</button>
                <button onClick={onDeselectAll}>Deselect All</button>
                <button onClick={generateShareLink}>Copy Link</button>
                <CSVLink data={data} headers={headers} filename={filename}>
                    <button>Export CSV</button>
                </CSVLink>
            </div>

            <div className="view-toggle-buttons">
                <button
                    onClick={() => setActiveSheet("techs")}
                    className={activeSheet === "techs" ? "active" : ""}
                >
                    Techs
                </button>
                <button
                    onClick={() => setActiveSheet("improvements")}
                    className={activeSheet === "improvements" ? "active" : ""}
                >
                    Improvements
                </button>
                <button
                    onClick={() => setActiveSheet("districts")}
                    className={activeSheet === "districts" ? "active" : ""}
                >
                    Districts
                </button>
                <button
                    onClick={() => setActiveSheet("units")}
                    className={activeSheet === "units" ? "active" : ""}
                >
                    Units
                </button>
            </div>
        </div>
    );
};

export default SpreadsheetToolbar;
