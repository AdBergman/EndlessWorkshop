import { render, screen } from "@testing-library/react";
import TechTooltip from "@/components/Tooltips/TechTooltip";
import { useGameData } from "@/context/GameDataContext";
import { Faction, Tech } from "@/types/dataTypes";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";

vi.mock("@/context/GameDataContext", () => ({
    useGameData: vi.fn(),
}));

const mockedUseGameData = vi.mocked(useGameData);

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

        mockedUseGameData.mockReturnValue({
            selectedFaction: {
                isMajor: true,
                enumFaction: Faction.KIN,
                minorName: null,
                uiLabel: "kin",
            },
        } as any);
    });

    it("renders district and improvement unlock labels from the normalized store domains", () => {
        render(
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
        expect(screen.queryByText("Missing_Key")).not.toBeInTheDocument();
    });

    it("renders unit unlock labels from the normalized unit store domain", () => {
        render(
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
    });
});
