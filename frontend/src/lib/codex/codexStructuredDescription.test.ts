import {
    getCodexReadablePreviewLine,
    getCodexStructuredSummary,
    parseCodexStructuredDescription,
} from "@/lib/codex/codexStructuredDescription";
import type { CodexEntry } from "@/types/dataTypes";

function entry(exportKind: string, descriptionLines: string[]): CodexEntry {
    return {
        exportKind,
        entryKey: `${exportKind}_Example`,
        displayName: "Example",
        descriptionLines,
        referenceKeys: [],
    };
}

describe("codexStructuredDescription", () => {
    it("parses equipment facts from existing description lines", () => {
        const parsed = parseCodexStructuredDescription(entry("equipment", [
            "Type: Weapon",
            "Slot: Main hand",
            "Rarity: Rare",
            "Tier: 2",
            "Access pool: Hero",
            "Value: 120",
            "Forged for close combat.",
        ]));

        expect(parsed.facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Type=Weapon",
            "Slot=Main hand",
            "Rarity=Rare",
            "Tier=2",
            "Source=Hero",
            "Market value=120",
        ]);
        expect(parsed.bodyLines).toEqual(["Forged for close combat."]);
        expect(getCodexStructuredSummary(entry("equipment", [
            "Type: Weapon",
            "Slot: Main hand",
            "Rarity: Rare",
            "Tier: 2",
        ]))).toBe("Weapon / Main hand / Rare / Tier 2");
    });

    it("parses population facts, worker effects, and thresholds", () => {
        const parsed = parseCodexStructuredDescription(entry("populations", [
            "Faction: Mukag",
            "Type: Minor faction population",
            "Base food cost: 60",
            "Worker: +4 Dust on Scribes",
            "At 5 population: Unlocks The Consortium’s Bazaar",
            "At 15 population: +1 Dust on Consortium Population",
            "+4 Food consumption",
        ]));

        expect(parsed.facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Type=Minor faction population",
            "Faction=Tahuk",
            "Base food cost=60",
        ]);
        expect(parsed.sections).toEqual([
            { label: "Worker", lines: ["+4 Dust on Scribes"] },
        ]);
        expect(parsed.timeline.map((item) => `${item.label}=${item.value}`)).toEqual([
            "5 population=Unlocks The Consortium’s Bazaar",
            "15 population=+1 Dust on Consortium Population",
        ]);
        expect(parsed.bodyLines).toEqual(["+4 Food consumption"]);
    });

    it("prefers exported structured population metadata over parsing fallback description lines", () => {
        const parsed = parseCodexStructuredDescription({
            ...entry("populations", [
                "Faction: Faction_Aspect",
                "Type: Major faction population",
                "At 5 population: Fallback should not win",
            ]),
            facts: [
                { label: "Faction", value: "Faction_Aspect", referenceKey: "Faction_Aspect" },
                { label: "Base food cost", value: "60" },
            ],
            sections: [
                {
                    title: "Worker effects",
                    lines: ["+1 [CultureColored] Influence"],
                },
                {
                    title: "Threshold rewards",
                    items: [
                        {
                            label: "At 5 population",
                            facts: [{ label: "Reward", value: "Nutrient Extractor" }],
                        },
                        {
                            label: "At 15 population",
                            facts: [{ label: "Reward", value: "Descriptor" }],
                            lines: ["+1 [CultureColored] Influence on Aspect Population"],
                        },
                    ],
                },
            ],
        });

        expect(parsed.facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Faction=Aspects",
            "Base food cost=60",
        ]);
        expect(parsed.sections).toEqual([
            { label: "Worker effects", lines: ["+1 [CultureColored] Influence"] },
        ]);
        expect(parsed.timeline.map((item) => `${item.label}=${item.value}`)).toEqual([
            "At 5 population=Nutrient Extractor",
            "At 15 population=+1 [CultureColored] Influence on Aspect Population",
        ]);
        expect(parsed.bodyLines).toEqual([]);
        expect(getCodexStructuredSummary({
            ...entry("populations", []),
            facts: [
                { label: "Type", value: "Major faction population" },
                { label: "Faction", value: "Faction_Aspect" },
                { label: "Base food cost", value: "60" },
            ],
        })).toBe("Major faction population / Aspects / Base food cost 60");
    });

    it("keeps generic exported section items structured for metadata-only entries", () => {
        const parsed = parseCodexStructuredDescription({
            ...entry("actions", []),
            facts: [
                { label: "Category", value: "Constructible Action" },
                { label: "Kind", value: "Action" },
            ],
            sections: [
                {
                    title: "Cost modifiers",
                    items: [
                        {
                            label: "Influence cost multiplier",
                            facts: [
                                { label: "Cost type", value: "Influence" },
                                { label: "Display value", value: "-50%" },
                            ],
                            lines: ["Applies to bridge construction."],
                        },
                        {
                            label: "Bridge planning ability",
                            referenceKey: "UnitAbility_BridgePlanning",
                        },
                    ],
                },
            ],
        });

        expect(parsed.hasStructuredContent).toBe(true);
        expect(parsed.bodyLines).toEqual([]);
        expect(parsed.facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Category=Constructible Action",
            "Kind=Action",
        ]);
        expect(parsed.sections).toEqual([
            {
                label: "Cost modifiers",
                lines: [],
                items: [
                    {
                        label: "Influence cost multiplier",
                        referenceKey: null,
                        facts: [
                            { label: "Cost type", value: "Influence", sourceLine: "Cost type: Influence" },
                            { label: "Display value", value: "-50%", sourceLine: "Display value: -50%" },
                        ],
                        lines: ["Applies to bridge construction."],
                    },
                    {
                        label: "Bridge planning ability",
                        referenceKey: "UnitAbility_BridgePlanning",
                        facts: [],
                        lines: [],
                    },
                ],
            },
        ]);
    });

    it("filters non-player facts and duplicate classification from exported metadata", () => {
        expect(parseCodexStructuredDescription({
            ...entry("actions", []),
            facts: [
                { label: "Reference key", value: "ActionTypeBuildBridge" },
                { label: "Kind", value: "Action" },
                { label: "Category", value: "Action" },
                { label: "UI category", value: "Construction" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Category=Action",
            "UI category=Construction",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("modifiers", []),
            facts: [
                { label: "Category", value: "Cost Modifier" },
                { label: "Cost type", value: "Turn" },
                { label: "Operation", value: "Mult" },
                { label: "Value", value: "0.50" },
                { label: "Kind", value: "Cost Modifier" },
                { label: "Display value", value: "-50%" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Cost type=Turn",
            "Effect=-50%",
            "Category=Cost Modifier",
        ]);

        expect(getCodexStructuredSummary({
            ...entry("modifiers", []),
            facts: [
                { label: "Category", value: "Cost Modifier" },
                { label: "Cost type", value: "Turn" },
                { label: "Operation", value: "Mult" },
                { label: "Value", value: "0.50" },
                { label: "Kind", value: "Cost Modifier" },
                { label: "Display value", value: "-50%" },
            ],
        })).toBe("Turn / -50% / Cost Modifier");
    });

    it("formats raw content facts into player-facing labels and values", () => {
        expect(parseCodexStructuredDescription({
            ...entry("diplomatictreaties", []),
            facts: [
                { label: "Category", value: "War" },
                { label: "Bilateral", value: "No" },
                { label: "Kind", value: "Diplomatic Treaty" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Category=War",
            "Participation=One-sided",
            "Kind=Diplomatic Treaty",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("equipment", []),
            facts: [
                { label: "Type", value: "Accessory" },
                { label: "Tier", value: "0" },
                { label: "Access pool", value: "Marketplace" },
                { label: "Value", value: "50.00" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Type=Accessory",
            "Tier=Base",
            "Source=Marketplace",
            "Market value=50",
        ]);

        expect(parseCodexStructuredDescription(entry("heroes", [
            "Faction: Ametrine",
            "Class: UnitClass_Infantry_Hero",
        ])).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Class=Infantry Hero",
            "Faction=Ametrine",
        ]);
    });

    it("orders facts by category scan value", () => {
        expect(parseCodexStructuredDescription({
            ...entry("actions", []),
            facts: [
                { label: "Kind", value: "Action" },
                { label: "Action type", value: "Decree" },
                { label: "UI category", value: "Construction" },
                { label: "Category", value: "Constructible Action" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Category=Constructible Action",
            "UI category=Construction",
            "Action type=Decree",
            "Kind=Action",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("councilors", []),
            facts: [
                { label: "Partner effect", value: "Courier's Tongue" },
                { label: "Councilor effect", value: "Surveyor" },
                { label: "Faction", value: "Aspects" },
                { label: "Role", value: "Development" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Role=Development",
            "Faction=Aspects",
            "Councilor effect=Surveyor",
            "Partner effect=Courier's Tongue",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("traits", []),
            facts: [
                { label: "Kind", value: "Trait" },
                { label: "Required affinity", value: "Aspects" },
                { label: "Cost", value: "10" },
                { label: "Category", value: "Affinity - Aspects" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Category=Affinity - Aspects",
            "Cost=10",
            "Required affinity=Aspects",
            "Kind=Trait",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("units", []),
            facts: [
                { label: "Kind", value: "Unit" },
                { label: "Faction", value: "Aspects" },
                { label: "Tier", value: "0" },
                { label: "Spawn type", value: "Land" },
                { label: "Class", value: "UnitClass_Flying" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Class=Flying",
            "Tier=Base",
            "Faction=Aspects",
            "Spawn type=Land",
            "Kind=Unit",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("equipment", []),
            facts: [
                { label: "Value", value: "50.00" },
                { label: "Access pool", value: "Marketplace" },
                { label: "Rarity", value: "Common" },
                { label: "Type", value: "Accessory" },
                { label: "Tier", value: "0" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Type=Accessory",
            "Rarity=Common",
            "Tier=Base",
            "Source=Marketplace",
            "Market value=50",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("quests", []),
            facts: [
                { label: "Kind", value: "Quest" },
                { label: "Mandatory", value: "Yes" },
                { label: "Chapter", value: "2" },
                { label: "Category", value: "Faction" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Category=Faction",
            "Chapter=2",
            "Mandatory=Yes",
            "Kind=Quest",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("tech", []),
            facts: [
                { label: "Kind", value: "Technology" },
                { label: "Faction", value: "Aspects" },
                { label: "Quadrant", value: "Empire" },
                { label: "Era", value: "2" },
                { label: "Tier", value: "1" },
            ],
        }).facts.map((fact) => `${fact.label}=${fact.value}`)).toEqual([
            "Tier=1",
            "Era=2",
            "Quadrant=Empire",
            "Faction=Aspects",
            "Kind=Technology",
        ]);
    });

    it("prioritizes decision-critical sections for category scanning", () => {
        expect(parseCodexStructuredDescription({
            ...entry("equipment", []),
            sections: [
                { title: "Effects", lines: ["+10 Damage"] },
                { title: "Granted abilities", items: [{ label: "Scoped Shot", referenceKey: "UnitAbility_ScopedShot" }] },
            ],
        }).sections.map((section) => section.label)).toEqual([
            "Granted abilities",
            "Effects",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("traits", []),
            sections: [
                { title: "Effects", lines: ["+5 Industry"] },
                { title: "Exclusions", lines: ["Cannot combine with Keep."] },
                { title: "Unlocks", lines: ["Unlocks Iron Games I."] },
            ],
        }).sections.map((section) => section.label)).toEqual([
            "Unlocks",
            "Exclusions",
            "Effects",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("quests", []),
            sections: [
                { title: "Choices", lines: ["Choose a side."] },
                { title: "Rewards", lines: ["Gain Dust."] },
                { title: "Objective", lines: ["Explore the ruin."] },
                { title: "Requirements", lines: ["Requires a nearby army."] },
            ],
        }).sections.map((section) => section.label)).toEqual([
            "Objective",
            "Requirements",
            "Rewards",
            "Choices",
        ]);
    });

    it("builds readable previews from cleaned structured content", () => {
        expect(getCodexReadablePreviewLine({
            ...entry("actions", []),
            sections: [
                {
                    title: "Cost modifiers",
                    items: [
                        {
                            label: "Turn cost multiplier",
                            facts: [
                                { label: "Cost type", value: "Turn" },
                                { label: "Value", value: "0.50" },
                            ],
                            lines: ["Temporary Bridge takes less time to build."],
                        },
                    ],
                },
            ],
        })).toBe("Temporary Bridge takes less time to build.");

        expect(getCodexReadablePreviewLine(entry("heroes", [
            "+1000000 Leader Priority",
            "+140 Health",
        ]))).toBe("+140 Health");

        expect(getCodexReadablePreviewLine(entry("equipment", [
            "Type: Accessory",
            "Tier: 0",
            "Forged for scouting.",
        ]))).toBe("Accessory / Tier Base");
    });

    it("hides internal leader priority lines from hero and unit descriptions", () => {
        expect(parseCodexStructuredDescription(entry("heroes", [
            "Faction: Ametrine",
            "Class: UnitClass_Infantry_Hero",
            "+1000000 Leader Priority",
            "+3 Leader Priority",
            "+140 Health",
        ])).bodyLines).toEqual(["+140 Health"]);

        expect(parseCodexStructuredDescription({
            ...entry("units", []),
            facts: [{ label: "Class", value: "Flying" }],
            sections: [
                {
                    title: "Stats",
                    lines: [
                        "+10000 Leader Priority",
                        "+250 [Health] Health",
                    ],
                },
            ],
        }).sections).toEqual([
            { label: "Stats", lines: ["+250 [Health] Health"] },
        ]);
    });

    it("hides zero-value effect lines while preserving fractional gains", () => {
        expect(parseCodexStructuredDescription(entry("abilities", [
            "+0% Specialization Cost if %Effect_UnitVeterancy_Level2",
            "+0 [Might] Might on Heroes",
            "+0.25 [Strategic05Colored] Eradione on District",
            "+1 [DustColored] Dust on City",
        ])).bodyLines).toEqual([
            "+0.25 [Strategic05Colored] Eradione on District",
            "+1 [DustColored] Dust on City",
        ]);

        expect(parseCodexStructuredDescription({
            ...entry("tech", []),
            facts: [{ label: "Tier", value: "1" }],
            sections: [
                {
                    title: "Effects",
                    lines: [
                        "+0 [DustColored] Dust on [FoodColored] Farms Districts",
                        "+0.5 [MoneyColored] Dust per [Technology] Technology sold in Libraries.",
                    ],
                },
            ],
        }).sections).toEqual([
            {
                label: "Effects",
                lines: ["+0.5 [MoneyColored] Dust per [Technology] Technology sold in Libraries."],
            },
        ]);
    });

    it("parses councilor, trait, hero, and minor faction facts conservatively", () => {
        expect(getCodexStructuredSummary({
            ...entry("abilities", ["When using this Active Skill:"]),
            facts: [
                { label: "Category", value: "Active" },
                { label: "Target", value: "Enemies" },
                { label: "Range", value: "3" },
                { label: "Cost", value: "1 Battle Token" },
            ],
        })).toBe("Active / Enemies / Range 3 / Cost 1 Battle Token");

        expect(getCodexStructuredSummary({
            ...entry("abilities", []),
            facts: [
                { label: "Kind", value: "Ability" },
                { label: "Category", value: "Passive" },
            ],
        })).toBe("Passive");

        expect(parseCodexStructuredDescription(entry("councilors", [
            "Faction: KinOfSheredyn",
            "Role: Governor",
            "Councilor effect: +2 Science",
            "Partner effect: +1 Influence",
        ])).sections.map((section) => section.label)).toEqual(["Councilor effect", "Partner effect"]);

        expect(getCodexStructuredSummary({
            ...entry("councilors", []),
            facts: [
                { label: "Faction", value: "Noquensii" },
                { label: "Councilor effect", value: "Visionary" },
                { label: "Partner effect", value: "Supernova" },
                { label: "Role", value: "Discovery" },
            ],
        })).toBe("Discovery / Visionary / Supernova");

        expect(getCodexStructuredSummary(entry("traits", [
            "Category: Faction",
            "Cost: 2",
            "Required affinity: Aspect",
            "Quest-only note.",
        ]))).toBe("Faction / Cost 2 / Aspects");

        expect(getCodexStructuredSummary(entry("traits", [
            "Category: Faction",
            "Category: AI Behavior",
            "Excludes: Diplomat",
        ]))).toBe("AI Behavior");

        expect(getCodexStructuredSummary(entry("heroes", [
            "Faction: Hero",
            "Class: Archer",
            "Attack: 42",
        ]))).toBe("Archer");

        expect(getCodexStructuredSummary(entry("heroes", [
            "Faction: Tahuk",
            "Class: Defender",
            "Attack: 30",
        ]))).toBe("Tahuk / Defender");

        expect(getCodexStructuredSummary({
            ...entry("heroes", []),
            facts: [
                { label: "Faction", value: "Last Lords" },
                { label: "Class", value: "Infantry Hero" },
            ],
        })).toBe("Last Lords / Infantry Hero");

        expect(getCodexStructuredSummary({
            ...entry("districts", []),
            facts: [
                { label: "Kind", value: "District" },
                { label: "Category", value: "Resource" },
                { label: "Tier", value: "2" },
            ],
        })).toBe("Resource / Tier 2 / District");

        expect(getCodexStructuredSummary({
            ...entry("districts", []),
            facts: [
                { label: "Kind", value: "District" },
            ],
        })).toBe("District");

        expect(getCodexStructuredSummary({
            ...entry("improvements", []),
            facts: [
                { label: "Kind", value: "Improvement" },
                { label: "Category", value: "Bridge" },
            ],
        })).toBe("Bridge");

        expect(getCodexStructuredSummary(entry("minorfactions", [
            "Disposition: Diplomatic",
            "Faction affinity: Necrophage",
            "Population: Noquensii",
            "Unit: Singer",
            "Trait: Silver Tongue",
        ]))).toBe("Diplomatic / Necrophages / Noquensii / Singer");

        expect(getCodexStructuredSummary({
            ...entry("minorfactions", []),
            facts: [
                { label: "Kind", value: "MinorFaction" },
                { label: "Disposition", value: "Pacifist" },
                { label: "Faction affinity", value: "Noquensii" },
            ],
            sections: [
                {
                    title: "Associated content",
                    lines: ["Noquensii", "Harper", "Elite Harper", "Mighty Harper"],
                },
            ],
        })).toBe("Pacifist / Noquensii / Harper / Elite Harper");
    });

    it("keeps unknown lines as fallback body content", () => {
        const parsed = parseCodexStructuredDescription(entry("abilities", [
            "A plain ability description.",
            "Unexpected exporter line: still readable.",
        ]));

        expect(parsed.hasStructuredContent).toBe(false);
        expect(parsed.bodyLines).toEqual([
            "A plain ability description.",
            "Unexpected exporter line: still readable.",
        ]);
        expect(getCodexStructuredSummary(entry("abilities", ["A plain ability description."]))).toBe("");
    });
});
