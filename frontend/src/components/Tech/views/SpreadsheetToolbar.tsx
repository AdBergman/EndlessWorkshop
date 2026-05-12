import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import "./SpreadsheetToolbar.css";
import { Tech, Improvement, District, Unit } from "@/types/dataTypes";
import { useGameData } from "@/context/GameDataContext";
import { stripDescriptionTokens } from "@/lib/descriptionLine/descriptionLineRenderer";
import { deriveUnit } from "@/lib/units/deriveUnit";
import { selectDistrictsByKey, useDistrictStore } from "@/stores/districtStore";
import { selectImprovementsByKey, useImprovementStore } from "@/stores/improvementStore";
import { selectUnitsByKey, useUnitStore } from "@/stores/unitStore";
import { resolveConstructibleUnlock } from "@/utils/unlocks";

export type SheetView = "techs" | "improvements" | "districts" | "units";

interface SpreadsheetToolbarProps {
    selectedTechs: Tech[];
    unlockedImprovements: (Improvement & { era: number })[];
    unlockedDistricts: (District & { era: number })[];
    unlockedUnits: (Unit & { era: number })[];

    onDeselectAll: () => void;
    generateShareLink: () => void;
    onSort: () => void;
    activeSheet: SheetView;
    setActiveSheet: (view: SheetView) => void;
}

const exportDescriptionLines = (lines: string[] | undefined) =>
    (lines ?? []).map(stripDescriptionTokens).join("; ");

export function formatTechUnlocks(
    tech: Tech,
    deps: {
        districtsByKey: Record<string, District>;
        improvementsByKey: Record<string, Improvement>;
        unitsByKey: Record<string, Unit>;
    }
): string {
    const { districtsByKey, improvementsByKey, unitsByKey } = deps;

    return (tech.unlocks ?? [])
        .map((u) => ({
            type: (u.unlockType ?? "").trim().toUpperCase(),
            key: (u.unlockKey ?? "").trim(),
            unlockCategory: u.unlockCategory,
            constructibleKind: u.constructibleKind,
        }))
        .filter((u) => u.type === "CONSTRUCTIBLE" && !!u.key)
        .map((u) => {
            const resolved = resolveConstructibleUnlock(
                {
                    unlockType: u.type,
                    unlockKey: u.key,
                    unlockCategory: u.unlockCategory,
                    constructibleKind: u.constructibleKind,
                },
                { districtsByKey, improvementsByKey, unitsByKey }
            );
            return resolved ? `${resolved.kind}: ${resolved.displayName}` : null;
        })
        .filter((s): s is string => !!s)
        .join("; ");
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
                                                                   selectedTechs,
                                                                   unlockedImprovements,
                                                                   unlockedDistricts,
                                                                   unlockedUnits,
                                                                   onDeselectAll,
                                                                   generateShareLink,
                                                                   onSort,
                                                                   activeSheet,
                                                                   setActiveSheet,
                                                               }) => {
    const { selectedFaction } = useGameData();
    const districtsByKey = useDistrictStore(selectDistrictsByKey);
    const improvementsByKey = useImprovementStore(selectImprovementsByKey);
    const unitsByKey = useUnitStore(selectUnitsByKey);
    const factionLabel = selectedFaction?.uiLabel?.toLowerCase() ?? "all-factions";

    const { data, headers, filename } = useMemo(() => {
        switch (activeSheet) {
            case "improvements":
                return {
                    filename: `endless-workshop-${factionLabel}-improvements.csv`,
                    headers: ["Era", "Name", "Description Lines", "Unique", "Cost"],
                    data: unlockedImprovements.map((improvement) => ({
                        Era: improvement.era ?? "",
                        Name: improvement.displayName ?? "",
                        "Description Lines": exportDescriptionLines(improvement.descriptionLines),
                        Unique: improvement.unique ?? "",
                        Cost: (improvement.cost ?? []).join("; "),
                    })),
                };

            case "districts":
                return {
                    filename: `endless-workshop-${factionLabel}-districts.csv`,
                    headers: ["Era", "Name", "Description Lines"],
                    data: unlockedDistricts.map((district) => ({
                        Era: district.era ?? "",
                        Name: district.displayName ?? "",
                        "Description Lines": exportDescriptionLines(district.descriptionLines),
                    })),
                };

            case "units":
                return {
                    filename: `endless-workshop-${factionLabel}-units.csv`,
                    headers: ["Era", "Name", "Class", "Tier", "Health", "Defense", "Damage", "Movement", "Upkeep"],
                    data: unlockedUnits.map((unit) => {
                        const d = deriveUnit(unit);
                        const def = d.stats.defense ?? 0;

                        return {
                            Era: unit.era ?? "",
                            Name: d.displayName ?? "",
                            Class: d.classLabel ?? "",
                            Tier: d.tierLabel ?? "",
                            Health: d.stats.health ?? "",
                            Defense: def,
                            Damage: d.stats.damage ?? "",
                            Movement: d.stats.movement ?? "",
                            Upkeep: d.stats.upkeep ?? "",
                        };
                    }),
                };

            case "techs":
            default:
                return {
                    filename: `endless-workshop-${factionLabel}-techs.csv`,
                    headers: ["Name", "Era", "Type", "Unlocks", "Description"],
                    data: selectedTechs.map((tech) => ({
                        Name: tech.name ?? "",
                        Era: tech.era ?? "",
                        Type: tech.type ?? "",
                        Unlocks: formatTechUnlocks(tech, { districtsByKey, improvementsByKey, unitsByKey }),
                        Description: exportDescriptionLines(tech.descriptionLines),
                    })),
                };
        }
    }, [
        activeSheet,
        factionLabel,
        unlockedImprovements,
        unlockedDistricts,
        unlockedUnits,
        selectedTechs,
        districtsByKey,
        improvementsByKey,
        unitsByKey,
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
