import { cleanup, render, screen } from "@testing-library/react";
import TechTooltip from "@/components/Tooltips/TechTooltip";
import { Faction, Tech } from "@/types/dataTypes";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";

const hoveredTech: Tech = {
    techKey: "Tech_Trade",
    name: "Trade",
    era: 1,
    type: "Empire",
    unlocks: [
        { unlockType: "Constructible", unlockKey: "District_Harbor" },
        { unlockType: "Constructible", unlockKey: "Improvement_Market" },
        { unlockType: "Constructible", unlockKey: "Missing_Key" },
    ],
    descriptionLines: [],
    prereq: null,
    factions: [],
    excludes: null,
    coords: { xPct: 50, yPct: 50 },
};

describe("TechTooltip district/improvement unlock resolution", () => {
    beforeEach(() => {
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        useDistrictStore.setState({
            districtsByKey: {
                District_Harbor: {
                    districtKey: "District_Harbor",
                    displayName: "Harbor",
                    descriptionLines: [],
                },
            },
        });
        useImprovementStore.setState({
            improvementsByKey: {
                Improvement_Market: {
                    improvementKey: "Improvement_Market",
                    displayName: "Market",
                    descriptionLines: [],
                    unique: "City",
                    cost: [],
                },
            },
        });
        useUnitStore.setState({
            unitsByKey: {
                Unit_Scout: {
                    unitKey: "Unit_Scout",
                    displayName: "Scout",
                    artId: null,
                    faction: "Kin",
                    isMajorFaction: true,
                    isHero: false,
                    isChosen: false,
                    spawnType: null,
                    previousUnitKey: null,
                    nextEvolutionUnitKeys: [],
                    evolutionTierIndex: 1,
                    unitClassKey: null,
                    attackSkillKey: null,
                    abilityKeys: [],
                    descriptionLines: [],
                },
            },
        });

        useFactionSelectionStore.getState().setSelectedFaction({
            isMajor: true,
            enumFaction: Faction.KIN,
            minorName: null,
            uiLabel: "kin",
        });
    });

    afterEach(() => {
        cleanup();
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
        useFactionSelectionStore.getState().reset();
    });

    it("renders district and improvement unlock labels from the normalized store domains", () => {
        const { container } = render(
            <TechTooltip
                hoveredTech={hoveredTech}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
            />
        );

        expect(screen.getByText("District:")).toBeInTheDocument();
        expect(screen.getByText("Harbor")).toBeInTheDocument();
        expect(screen.getByText("Improvement:")).toBeInTheDocument();
        expect(screen.getByText("Market")).toBeInTheDocument();
        expect(container.querySelector('img.techUnlockIcon[src="/svg/factions/UI_Common_District.svg"]'))
            .toBeInTheDocument();
        expect(container.querySelector('img.techUnlockIcon[src="/svg/constructibles/UI_CityConstructionMode_Improvement.svg"]'))
            .toBeInTheDocument();
        expect(screen.queryByText("Missing_Key")).not.toBeInTheDocument();
    });

    it("renders unresolved constructible fallback rows without hover links", () => {
        const { container } = render(
            <TechTooltip
                hoveredTech={{
                    ...hoveredTech,
                    unlocks: [
                        {
                            unlockType: "Constructible",
                            unlockKey: "Converter_IndustryToFood",
                            unlockCategory: "Food",
                            fallbackDescriptionLines: [
                                "When placed in the first slot, [IndustryColored] Industry converts to [FoodColored] Food.",
                            ],
                        },
                    ],
                }}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
            />
        );

        expect(screen.getByText(/Constructible:/)).toBeInTheDocument();
        expect(screen.getByText("Converter_IndustryToFood")).toBeInTheDocument();
        expect(screen.getByText(/Industry converts to/)).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "IndustryColored" })).toHaveAttribute(
            "src",
            "/svg/constructibles/UI_Common_Resource_Industry.svg"
        );
        expect(screen.getByRole("img", { name: "FoodColored" })).toHaveAttribute(
            "src",
            "/svg/constructibles/UI_Common_Resource_Food.svg"
        );
        expect(container.querySelector('img.techUnlockIcon[src="/svg/technologies/UI_Technology_UnlockCategory_DistrictImprovement_Food.svg"]'))
            .toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /Converter_IndustryToFood/ })).not.toBeInTheDocument();
    });

    it("renders unit unlock labels from the normalized unit store domain", () => {
        const { container } = render(
            <TechTooltip
                hoveredTech={{
                    ...hoveredTech,
                    unlocks: [
                        {
                            unlockType: "Constructible",
                            unlockKey: "Unit_Scout",
                            unlockCategory: "Unit",
                        },
                    ],
                }}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
            />
        );

        expect(screen.getByText("Unit:")).toBeInTheDocument();
        expect(screen.getByText("Scout")).toBeInTheDocument();
        expect(container.querySelector('img.techUnlockIcon[src="/svg/common/UI_Common_Unit.svg"]')).toBeInTheDocument();
    });
});
