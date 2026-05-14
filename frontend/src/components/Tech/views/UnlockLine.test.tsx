import { cleanup, render, screen } from "@testing-library/react";
import UnlockLine from "@/components/Tech/views/UnlockLine";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useUnitStore } from "@/stores/unitStore";

describe("UnlockLine district/improvement resolution", () => {
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
    });

    afterEach(() => {
        cleanup();
        useDistrictStore.getState().reset();
        useImprovementStore.getState().reset();
        useUnitStore.getState().reset();
    });

    it("renders district and improvement unlock lines from their own store domains", () => {
        const { rerender } = render(
            <UnlockLine unlock={{ unlockType: "Constructible", unlockKey: "District_Harbor" }} />
        );

        expect(screen.getByText(/District:/)).toBeInTheDocument();
        expect(screen.getByText("Harbor")).toBeInTheDocument();

        rerender(
            <UnlockLine unlock={{ unlockType: "Constructible", unlockKey: "Improvement_Market" }} />
        );

        expect(screen.getByText(/Improvement:/)).toBeInTheDocument();
        expect(screen.getByText("Market")).toBeInTheDocument();
    });

    it("renders nothing for missing district or improvement keys", () => {
        const { container } = render(
            <UnlockLine unlock={{ unlockType: "Constructible", unlockKey: "Missing_Key" }} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("renders unresolved constructible fallback text when descriptor lines are available", () => {
        render(
            <UnlockLine
                unlock={{
                    unlockType: "Constructible",
                    unlockKey: "Converter_IndustryToFood",
                    fallbackDescriptionLines: [
                        "When placed in the first slot, [IndustryColored] Industry converts to [FoodColored] Food.",
                    ],
                }}
            />
        );

        expect(screen.getByText(/Constructible:/)).toBeInTheDocument();
        expect(screen.getByText("Converter_IndustryToFood")).toBeInTheDocument();
        expect(screen.getByText(/Industry converts to/)).toBeInTheDocument();
    });

    it("uses backend unlockCategory when a key exists in both domains", () => {
        useDistrictStore.setState({
            districtsByKey: {
                Shared_Key: {
                    districtKey: "Shared_Key",
                    displayName: "Shared District",
                    descriptionLines: [],
                },
            },
        });
        useImprovementStore.setState({
            improvementsByKey: {
                Shared_Key: {
                    improvementKey: "Shared_Key",
                    displayName: "Shared Improvement",
                    descriptionLines: [],
                    unique: "City",
                    cost: [],
                },
            },
        });

        render(
            <UnlockLine
                unlock={{
                    unlockType: "Constructible",
                    unlockKey: "Shared_Key",
                    unlockCategory: "Improvement",
                }}
            />
        );

        expect(screen.getByText(/Improvement:/)).toBeInTheDocument();
        expect(screen.getByText("Shared Improvement")).toBeInTheDocument();
        expect(screen.queryByText("Shared District")).not.toBeInTheDocument();
    });

    it("resolves unit lines from the normalized unit store", () => {
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

        render(
            <UnlockLine
                unlock={{
                    unlockType: "Constructible",
                    unlockKey: "Unit_Scout",
                    unlockCategory: "Unit",
                }}
            />
        );

        expect(screen.getByText(/Unit:/)).toBeInTheDocument();
        expect(screen.getByText("Scout")).toBeInTheDocument();
    });

    it("renders backend Unit unlockType lines through the centralized resolver", () => {
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

        render(
            <UnlockLine
                unlock={{
                    unlockType: "Unit",
                    unlockKey: "Unit_Scout",
                }}
            />
        );

        expect(screen.getByText(/Unit:/)).toBeInTheDocument();
        expect(screen.getByText("Scout")).toBeInTheDocument();
    });
});
