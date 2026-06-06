import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UnitCard } from "./UnitCard";
import { useCodexStore } from "@/stores/codexStore";
import type { CodexEntry, Unit } from "@/types/dataTypes";

const unit = (overrides: Partial<Unit>): Unit => ({
    unitKey: "Unit_Test",
    displayName: "Test Unit",
    artId: null,
    faction: "Kin",
    isMajorFaction: true,
    isHero: false,
    isChosen: false,
    spawnType: null,
    previousUnitKey: null,
    nextEvolutionUnitKeys: [],
    evolutionTierIndex: 0,
    unitClassKey: "UnitClass_Ranged",
    unitClassDisplayName: "Ranged",
    attackSkillKey: null,
    abilityKeys: [],
    descriptionLines: [],
    ...overrides,
});

const abilityEntry = (entryKey: string, displayName: string): CodexEntry => ({
    exportKind: "abilities",
    entryKey,
    displayName,
    kind: "Ability",
    category: null,
    descriptionLines: [],
    referenceKeys: [],
});

describe("UnitCard", () => {
    beforeEach(() => {
        useCodexStore.getState().reset();
    });

    afterEach(() => {
        cleanup();
        useCodexStore.getState().reset();
    });

    it("renders resolved ability SVG icons without hiding ability labels", () => {
        const entries = [
            abilityEntry("UnitAbility_Ranged_3", "Ranged Attack"),
            abilityEntry("UnitAbility_Prototype_LandUnit", "Land Unit"),
        ];

        useCodexStore.setState({
            entries,
            entriesByKindKey: {
                abilities: Object.fromEntries(entries.map((entry) => [entry.entryKey, entry])),
            },
        });

        const { container } = render(
            <UnitCard
                unit={unit({
                    abilityKeys: ["UnitAbility_Ranged_3", "UnitAbility_Prototype_LandUnit"],
                })}
                showArtwork={false}
            />
        );

        expect(screen.getByText("Ranged Attack")).toBeInTheDocument();
        expect(screen.getByText("Land Unit")).toBeInTheDocument();
        expect(container.querySelector('img.skillIcon[src="/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg"]'))
            .toBeInTheDocument();
        expect(container.querySelectorAll("img.skillIcon")).toHaveLength(1);
        expect(container.querySelector(".skillNoIcon")).toHaveTextContent("Land Unit");
    });

    it("renders game SVG icons for compact unit stats", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    descriptionLines: [
                        "+12 [Damage] Damage",
                        "+80 [Health] Health",
                        "+4 [Defense] Defense",
                        "+6 [MovementPoints] Movement",
                        "+15 [Focus] Critical Chance",
                        "2 [DustColored] Upkeep",
                    ],
                })}
                showArtwork={false}
            />
        );

        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("80")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();

        expect(container.querySelector('img.statIcon[src="/svg/heroes/UI_UnitItem_Damage.svg"]')).toBeInTheDocument();
        expect(container.querySelector('img.statIcon[src="/svg/units/UI_UnitItem_Health.svg"]')).toBeInTheDocument();
        expect(container.querySelector('img.statIcon[src="/svg/abilities/UI_UnitItem_Defense.svg"]')).toBeInTheDocument();
        expect(container.querySelector('img.statIcon[src="/svg/status-effects/UI_UnitItem_MovementPoints.svg"]'))
            .toBeInTheDocument();
        expect(container.querySelector('img.statIcon[src="/svg/units/UI_UnitItem_Focus.svg"]')).toBeInTheDocument();
        expect(container.querySelector('img.statIcon[src="/svg/resources/UI_Common_Resource_Money.svg"]'))
            .toBeInTheDocument();
    });

    it("renders colored faction SVG icons for major unit card badges", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    faction: "Kin",
                })}
                showArtwork={false}
            />
        );

        const icon = container.querySelector<HTMLElement>(".factionIcon");

        expect(icon).toBeInTheDocument();
        expect(icon).not.toHaveClass("codex-kindIcon--monochrome");
        expect(icon).toHaveStyle({
            "--faction-icon-path": 'url("/svg/factions/UI_Faction_KinOfSheredyn.svg")',
            "--faction-icon-color": "#3B82F6",
        });
    });

    it("renders class icons and tier as separate art metadata markers", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    unitClassKey: "UnitClass_Ranged",
                    unitClassDisplayName: "Ranged",
                    evolutionTierIndex: 0,
                })}
            />
        );

        expect(screen.getByLabelText("Ranged: bonus vs Flying")).toBeInTheDocument();
        expect(screen.getByLabelText("Tier I")).toHaveAttribute("data-tier-rank", "I");
        expect(container.querySelector(".tierRankNumber")).toHaveTextContent("1");
        expect(screen.queryByText("T1")).not.toBeInTheDocument();
        expect(screen.queryByText("Ranged Tier I")).not.toBeInTheDocument();
        expect(container.querySelector(".unitArtIdentityPlate")).toBeInTheDocument();
        expect(container.querySelector(".artContainer .unitArtTierSeal")).toBeInTheDocument();
        expect(container.querySelector(".unitIdentityStack .tierRankBadge")).not.toBeInTheDocument();
        expect(container.querySelector('img.unitClassIcon[src="/svg/units/UI_UnitItem_UnitClass_Ranged.svg"]'))
            .toBeInTheDocument();
        expect(container.querySelector(".unitClassIcon")).not.toHaveStyle({
            "--unit-class-icon-path": 'url("/svg/units/UI_UnitItem_UnitClass_Ranged.svg")',
        });
    });

    it("splits long dual class labels into icons without rendering truncated class text", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    unitClassKey: "UnitClass_JuggernaughtRanged",
                    unitClassDisplayName: "Juggernaught Ranged",
                    evolutionTierIndex: 0,
                })}
            />
        );

        expect(screen.getByLabelText("Juggernaught Ranged")).toBeInTheDocument();
        expect(screen.getByLabelText("Juggernaught: bonus vs Hero")).toBeInTheDocument();
        expect(screen.getByLabelText("Ranged: bonus vs Flying")).toBeInTheDocument();
        expect(screen.getByLabelText("Tier I")).toHaveAttribute("data-tier-rank", "I");
        expect(container.querySelector(".tierRankNumber")).toHaveTextContent("1");
        expect(screen.queryByText("T1")).not.toBeInTheDocument();
        expect(screen.queryByText("Juggernaught Ranged")).not.toBeInTheDocument();

        const iconPaths = Array.from(container.querySelectorAll<HTMLImageElement>(".unitClassIcon"))
            .map((icon) => icon.getAttribute("src"));

        expect(iconPaths).toEqual([
            "/svg/units/UI_UnitItem_UnitClass_Juggernaught.svg",
            "/svg/units/UI_UnitItem_UnitClass_Ranged.svg",
        ]);
    });

    it("shows fallback gameplay tooltip content for class icons when Codex entries are missing", async () => {
        render(
            <UnitCard
                unit={unit({
                    unitClassKey: "UnitClass_Ranged",
                    unitClassDisplayName: "Ranged",
                    evolutionTierIndex: 0,
                })}
            />
        );

        fireEvent.mouseEnter(screen.getByLabelText("Ranged: bonus vs Flying"), {
            clientX: 30,
            clientY: 30,
        });

        await waitFor(() => {
            expect(screen.getByText("Ranged")).toBeInTheDocument();
            expect(screen.getByText(/when attacking Flying units/i)).toBeInTheDocument();
        });
    });

    it("uses rich Codex ability tooltip content for class icons when available", async () => {
        const entries = [
            {
                ...abilityEntry("UnitAbility_Class_BonusVsFlying", "Anti-Air Training"),
                descriptionLines: ["Deals bonus damage against Flying units."],
            },
        ];

        useCodexStore.setState({
            entries,
            entriesByKindKey: {
                abilities: Object.fromEntries(entries.map((entry) => [entry.entryKey, entry])),
            },
        });

        render(
            <UnitCard
                unit={unit({
                    unitClassKey: "UnitClass_Ranged",
                    unitClassDisplayName: "Ranged",
                    abilityKeys: ["UnitAbility_Class_BonusVsFlying"],
                    evolutionTierIndex: 0,
                })}
            />
        );

        fireEvent.mouseEnter(screen.getByLabelText("Ranged: bonus vs Flying"), {
            clientX: 30,
            clientY: 30,
        });

        await waitFor(() => {
            expect(screen.getAllByText("Anti-Air Training").length).toBeGreaterThanOrEqual(2);
            expect(screen.getByText("Deals bonus damage against Flying units.")).toBeInTheDocument();
        });
    });

    it("shows tier tooltip content from the separate rank marker", async () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    evolutionTierIndex: 1,
                })}
            />
        );

        expect(screen.getByLabelText("Tier II")).toHaveAttribute("data-tier-rank", "II");
        expect(container.querySelector(".tierRankNumber")).toHaveTextContent("2");

        fireEvent.mouseEnter(screen.getByLabelText("Tier II"), {
            clientX: 30,
            clientY: 30,
        });

        await waitFor(() => {
            expect(screen.getByText("Tier II")).toBeInTheDocument();
            expect(screen.getByText("Evolution tier.")).toBeInTheDocument();
        });
    });

    it("renders Tier III as a numeric rank seal", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    evolutionTierIndex: 2,
                })}
            />
        );

        expect(screen.getByLabelText("Tier III")).toHaveAttribute("data-tier-rank", "III");
        expect(container.querySelector(".tierRankNumber")).toHaveTextContent("3");
    });

    it("uses the visible Mukag SVG for Tahuk major unit card badges", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    faction: "Tahuk",
                })}
                showArtwork={false}
            />
        );

        const icon = container.querySelector<HTMLElement>(".factionIcon");

        expect(icon).toBeInTheDocument();
        expect(icon).not.toHaveClass("codex-kindIcon--monochrome");
        expect(icon).toHaveStyle({
            "--faction-icon-path": 'url("/svg/hero-skills/UI_EmpireSymbol_Mukag01.svg")',
            "--faction-icon-color": "#06B6D4",
        });
    });

    it("renders minor faction card badges with the Endless Workshop accent color", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    faction: "Ametrine",
                    isMajorFaction: false,
                })}
                showArtwork={false}
            />
        );

        expect(screen.getByText("Ametrine")).toBeInTheDocument();
        const icon = container.querySelector<HTMLElement>(".factionIcon.minorFactionIcon");

        expect(icon).toBeInTheDocument();
        expect(container.querySelector("img.minorFactionIcon")).not.toBeInTheDocument();
        expect(icon).toHaveStyle({
            "--faction-icon-path": 'url("/svg/hero-skills/UI_MinorEmpireSymbol_Ametrine.svg")',
            "--faction-icon-color": "var(--unit-card-minor-accent, var(--ew-accent, #ff7f32))",
        });

        expect(container.querySelector(".unitIdentityStack")).toHaveStyle({
            "--unit-identity-color": "var(--unit-card-minor-accent, var(--ew-accent, #ff7f32))",
        });
    });

    it("shows zero for missing Focus / Critical Chance values", () => {
        const { container } = render(
            <UnitCard
                unit={unit({
                    descriptionLines: [
                        "+12 [Damage] Damage",
                        "+80 [Health] Health",
                    ],
                })}
                showArtwork={false}
            />
        );

        const focusStat = container.querySelector('img.statIcon[src="/svg/units/UI_UnitItem_Focus.svg"]')
            ?.closest(".stat");

        expect(focusStat).toHaveTextContent("0");
    });
});
