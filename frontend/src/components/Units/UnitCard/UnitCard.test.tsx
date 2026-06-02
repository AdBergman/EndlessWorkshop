import { cleanup, render, screen } from "@testing-library/react";
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
