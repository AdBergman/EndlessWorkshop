import type {
    LoreLine,
    QuestBranch,
    QuestExplorerEntry,
    QuestExplorerExport,
    Requirement,
    Reward,
} from "./questExplorerContract";

const req = (
    requirementKey: string,
    kind: string,
    displayText: string,
    extra: Partial<Requirement> = {}
): Requirement => ({
    requirementKey,
    kind,
    displayText,
    ...extra,
});

const reward = (
    rewardKey: string,
    kind: string,
    displayText: string,
    extra: Partial<Reward> = {}
): Reward => ({
    rewardKey,
    kind,
    displayText,
    ...extra,
});

const branch = (
    branchKey: string,
    label: string,
    orderIndex: number,
    extra: Omit<QuestBranch, "branchKey" | "label" | "orderIndex">
): QuestBranch => ({
    branchKey,
    label,
    orderIndex,
    ...extra,
});

const narrator = (text: string): LoreLine => ({
    role: "narrator",
    text,
});

const speaker = (speakerLabel: string, text: string): LoreLine => ({
    role: "character",
    speakerLabel,
    text,
});

const mukagNavigation = {
    factionKey: "Faction_Mukag",
    factionName: "Mukag",
    questLineKey: "FactionQuest_Mukag",
    questLineName: "Holy Oculum Chronicle",
};

const reliquaryNavigation = {
    factionKey: "World_Curiosities",
    factionName: "World Curiosities",
    questLineKey: "Curiosity_Reliquary",
    questLineName: "Sunken Reliquary",
};

const entries: QuestExplorerEntry[] = [
    {
        entryKey: "mukag.monastery-approach",
        title: "First Monsoon",
        summaryLines: [
            "The Mukag send a quiet invitation after a season of strange blue rain.",
            "Your scouts find a monastery whose irrigation channels hum with old Oculum machinery.",
        ],
        questType: "Major Faction",
        isMandatory: true,
        isKeyNarrativeBeat: true,
        aliases: ["FactionQuest_Mukag_Chapter01_Step01", "Quest_Mukag_FirstMonsoon"],
        navigation: {
            ...mukagNavigation,
            chapter: 1,
            chapterLabel: "Chapter I: Rain over Stone",
            step: 1,
            stepLabel: "Approach",
            sequenceIndex: 10,
            chapterOrder: 1,
            stepOrder: 1,
            previousEntryKeys: [],
            nextEntryKeys: ["mukag.oculum-debate"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "mukag.monastery-approach.start",
                    phase: "start",
                    stepIndex: 0,
                    objectiveKey: "mukag.monastery-approach.objective.envoy",
                    lines: [
                        narrator("The first monsoon arrives without clouds. It falls upward from the terraces and settles as silver mist along the monastery walls."),
                        speaker("Pirazeh", "The Sages predicted a wound in the rain. They did not predict strangers would hear it before we did."),
                        speaker("Leader", "If the wound is political, we can bargain. If it is sacred, we should know before we step inside."),
                    ],
                },
                {
                    sectionKey: "mukag.monastery-approach.success",
                    phase: "success",
                    stepIndex: 1,
                    objectiveKey: "mukag.monastery-approach.objective.inspect",
                    lines: [
                        speaker("Pirazeh", "The abbot will receive you, but speak softly. The Oculum listens better than it obeys."),
                        narrator("A bronze iris opens in the chapel floor, revealing a stair threaded with cold turquoise light."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "mukag.monastery-approach.objective.envoy",
                    text: "Send a diplomatic envoy to the monastery before the monsoon fades.",
                    phase: "Start",
                    requirements: [
                        req("mukag.monastery-approach.req.envoy", "faction_action", "Use faction action: Monsoon Delegation", {
                            groupLabel: "Selection",
                            groupOrder: 10,
                            referenceKind: "FactionAction",
                            referenceKey: "FactionAction_MonsoonDelegation",
                            referenceDisplayName: "Monsoon Delegation",
                            codexEntryKey: "codex.faction-action.monsoon-delegation",
                        }),
                    ],
                    rewards: [
                        reward("mukag.monastery-approach.reward.influence", "influence", "+20 Influence with Mukag elders", {
                            amount: 20,
                            groupLabel: "Influence",
                            groupOrder: 10,
                            assetKind: "resource",
                            assetKey: "Resource_Influence",
                            assetDisplayName: "Influence",
                            codexEntryKey: "codex.resource.influence",
                            targetScopeLabel: "Empire",
                        }),
                    ],
                },
                {
                    objectiveKey: "mukag.monastery-approach.objective.inspect",
                    text: "Inspect the irrigation channels for active Oculum fragments.",
                    phase: "Success",
                    requirements: [
                        req("mukag.monastery-approach.req.scout", "unit", "Assign a scout hero to the monastery region", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                            targetRole: "Hero",
                            targetLabel: "Scout",
                        }),
                    ],
                    rewards: [
                        reward("mukag.monastery-approach.reward.science", "science", "+35 Science from recovered diagrams", {
                            amount: 35,
                            groupLabel: "Science",
                            groupOrder: 20,
                            assetKind: "resource",
                            assetKey: "Resource_Science",
                            assetDisplayName: "Science",
                            codexEntryKey: "codex.resource.science",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "mukag.oculum-debate",
        title: "A Fractured Lens",
        summaryLines: [
            "The Holy Oculum can reveal futures, but each faction inside the monastery wants a different future sanctioned.",
            "One decision will decide who may ask the lens questions, and which future the Mukag must learn to trust.",
        ],
        questType: "Major Faction",
        isMandatory: true,
        isKeyNarrativeBeat: true,
        aliases: ["FactionQuest_Mukag_Chapter01_Step02", "Quest_Mukag_OculumDebate"],
        navigation: {
            ...mukagNavigation,
            chapter: 1,
            chapterLabel: "Chapter I: Rain over Stone",
            step: 2,
            stepLabel: "Council",
            sequenceIndex: 20,
            chapterOrder: 1,
            stepOrder: 2,
            branchGroupKey: "mukag.oculum-debate.paths",
            branchLabel: "Oculum Custody Paths",
            isBranchStart: true,
            previousEntryKeys: ["mukag.monastery-approach"],
            nextEntryKeys: [
                "mukag.oculum-pious",
                "mukag.oculum-open",
                "mukag.oculum-bold",
            ],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "mukag.oculum-debate.start",
                    phase: "start",
                    stepIndex: 0,
                    objectiveKey: "mukag.oculum-debate.objective.mediate",
                    lines: [
                        narrator("Three delegations kneel around the Oculum, each reflected in a different pane of the same broken lens."),
                        speaker("Abbot Menyar", "The old rites kept us safe. Let the Oculum judge our devotion, not our ambition."),
                        speaker("Pirazeh", "The machine is not a judge. It is a memory, and memories can be read by more than priests."),
                        speaker("Leader", "Then we are not choosing what the Oculum is. We are choosing who is allowed to ask it questions."),
                    ],
                },
                {
                    sectionKey: "mukag.oculum-debate.choice",
                    phase: "choice",
                    stepIndex: 1,
                    objectiveKey: "mukag.oculum-debate.objective.mediate",
                    lines: [
                        narrator("The chamber waits. The lens rotates once, then shows three possible monsoons."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "mukag.oculum-debate.objective.mediate",
                    text: "Mediate the council before selecting who controls the Oculum.",
                    phase: "Choice",
                    requirements: [
                        req("mukag.oculum-debate.req.parley", "diplomacy", "Complete 2 Mukag parley actions", {
                            groupLabel: "Completion",
                            groupOrder: 10,
                            requiredCount: 2,
                        }),
                        req("mukag.oculum-debate.req.no-war", "diplomacy", "Must not be at war with Mukag-aligned cities", {
                            groupLabel: "Forbidden",
                            groupOrder: 30,
                            polarity: "forbidden",
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-debate.reward.trust", "status", "Mukag Council Trust", {
                            groupLabel: "Status Effects",
                            groupOrder: 30,
                            assetKind: "status",
                            assetKey: "Status_MukagCouncilTrust",
                            assetDisplayName: "Council Trust",
                            codexEntryKey: "codex.status.mukag-council-trust",
                        }),
                    ],
                },
            ],
        },
        branches: [
            branch("mukag.oculum.branch.pious", "Seal the rites", 10, {
                choiceKey: "mukag.oculum.choice.pious",
                groupKey: "mukag.oculum-debate.paths",
                groupLabel: "Oculum Custody Paths",
                nextEntryKeys: ["mukag.oculum-pious"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: ["mukag.precious-find"],
                lore: {
                    outcomePreviewLines: [
                        "Strengthens the priesthood and protects ritual authority.",
                        "Future rewards favor stability and approval from conservative cities.",
                    ],
                },
                strategy: {
                    conditions: ["Requires Council Trust", "Favors Pious political stance"],
                    requirements: [
                        req("mukag.oculum-pious.req.temple", "building", "Own a Temple or equivalent sacred district", {
                            groupLabel: "Selection",
                            groupOrder: 10,
                            targetRole: "District",
                            targetLabel: "Temple",
                            referenceKind: "Building",
                            referenceKey: "Building_Temple",
                            referenceDisplayName: "Temple",
                            codexEntryKey: "codex.building.temple",
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-pious.reward.approval", "approval", "+8 Approval in Mukag cities for 10 turns", {
                            groupLabel: "Status Effects",
                            groupOrder: 30,
                            formulaText: "Approval +8, 10 turns",
                        }),
                    ],
                },
            }),
            branch("mukag.oculum.branch.open", "Open the archive", 20, {
                choiceKey: "mukag.oculum.choice.open",
                groupKey: "mukag.oculum-debate.paths",
                groupLabel: "Oculum Custody Paths",
                nextEntryKeys: ["mukag.oculum-open"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: ["mukag.precious-find"],
                lore: {
                    outcomePreviewLines: [
                        "Shares the Oculum with scholars and governors.",
                        "Future rewards favor science, visibility, and diplomatic leverage.",
                    ],
                },
                strategy: {
                    conditions: ["Requires Council Trust", "Favors Open political stance"],
                    requirements: [
                        req("mukag.oculum-open.req.science", "resource", "Stockpile 120 Science", {
                            groupLabel: "Selection",
                            groupOrder: 10,
                            requiredCount: 120,
                            targetRole: "Resource",
                            targetLabel: "Science",
                            referenceKind: "Resource",
                            referenceKey: "Resource_Science",
                            referenceDisplayName: "Science",
                            codexEntryKey: "codex.resource.science",
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-open.reward.science", "science", "+90 Science and reveals one neighboring curiosity", {
                            amount: 90,
                            groupLabel: "Science",
                            groupOrder: 20,
                            assetKind: "resource",
                            assetKey: "Resource_Science",
                            assetDisplayName: "Science",
                            codexEntryKey: "codex.resource.science",
                        }),
                    ],
                },
            }),
            branch("mukag.oculum.branch.bold", "Command the lens", 30, {
                choiceKey: "mukag.oculum.choice.bold",
                groupKey: "mukag.oculum-debate.paths",
                groupLabel: "Oculum Custody Paths",
                nextEntryKeys: ["mukag.oculum-bold"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: ["mukag.precious-find"],
                lore: {
                    outcomePreviewLines: [
                        "Forces a decisive vision before the council can object.",
                        "Higher requirement pressure, stronger short-term empire bonuses.",
                    ],
                },
                strategy: {
                    conditions: ["Available immediately", "Favors Bold political stance"],
                    requirements: [
                        req("mukag.oculum-bold.req.hero", "hero", "Assign a level 3+ hero to force the reading", {
                            groupLabel: "Selection",
                            groupOrder: 10,
                            targetRole: "Hero",
                            requiredCount: 3,
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-bold.reward.empire", "empire_bonus", "+12% city FIDSI on the next monsoon", {
                            groupLabel: "Empire Bonuses",
                            groupOrder: 40,
                            formulaText: "City FIDSI x 1.12",
                        }),
                    ],
                },
            }),
        ],
    },
    {
        entryKey: "mukag.oculum-pious",
        title: "The Sealed Rite",
        summaryLines: [
            "The Oculum remains under priestly custody, and the monastery becomes a stabilizing ritual center.",
        ],
        questType: "Major Faction",
        isMandatory: true,
        aliases: ["FactionQuest_Mukag_Chapter01_Pious"],
        navigation: {
            ...mukagNavigation,
            chapter: 1,
            chapterLabel: "Chapter I: Rain over Stone",
            step: 3,
            stepLabel: "Rite Outcome",
            sequenceIndex: 30,
            chapterOrder: 1,
            stepOrder: 3,
            branchGroupKey: "mukag.oculum-debate.paths",
            branchLabel: "Seal the rites",
            branchOrder: 10,
            isBranchEnd: true,
            previousEntryKeys: ["mukag.oculum-debate"],
            nextEntryKeys: ["mukag.precious-find"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: ["mukag.precious-find"],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "mukag.oculum-pious.success",
                    phase: "success",
                    choiceKey: "mukag.oculum.choice.pious",
                    stepIndex: 0,
                    objectiveKey: "mukag.oculum-pious.objective.ward",
                    lines: [
                        speaker("Abbot Menyar", "Let the lens sleep behind incense and law. We will ask less of it, and perhaps it will answer more kindly."),
                        narrator("The priests wrap the Oculum in rain-silk. Outside, the city bells answer in a single low note."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "mukag.oculum-pious.objective.ward",
                    text: "Construct a ritual ward around the Oculum chamber.",
                    phase: "Success",
                    requirements: [
                        req("mukag.oculum-pious.req.production", "production", "Spend 180 Industry in a Mukag city", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                            requiredCount: 180,
                            targetRole: "City",
                            targetLabel: "Mukag city",
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-pious.reward.stability", "status", "Ritual Stability: unrest events reduced", {
                            groupLabel: "Status Effects",
                            groupOrder: 30,
                            assetKind: "status",
                            assetKey: "Status_RitualStability",
                            assetDisplayName: "Ritual Stability",
                            codexEntryKey: "codex.status.ritual-stability",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "mukag.oculum-open",
        title: "The Public Lens",
        summaryLines: [
            "The Oculum becomes an archive for scholars, governors, and cautious priests willing to read together.",
        ],
        questType: "Major Faction",
        isMandatory: true,
        aliases: ["FactionQuest_Mukag_Chapter01_Open"],
        navigation: {
            ...mukagNavigation,
            chapter: 1,
            chapterLabel: "Chapter I: Rain over Stone",
            step: 3,
            stepLabel: "Archive Outcome",
            sequenceIndex: 31,
            chapterOrder: 1,
            stepOrder: 3,
            branchGroupKey: "mukag.oculum-debate.paths",
            branchLabel: "Open the archive",
            branchOrder: 20,
            isBranchEnd: true,
            previousEntryKeys: ["mukag.oculum-debate"],
            nextEntryKeys: ["mukag.precious-find"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: ["mukag.precious-find"],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "mukag.oculum-open.success",
                    phase: "success",
                    choiceKey: "mukag.oculum.choice.open",
                    stepIndex: 0,
                    objectiveKey: "mukag.oculum-open.objective.archive",
                    lines: [
                        speaker("Pirazeh", "Knowledge does not become holy by being hidden. Let the archive breathe."),
                        narrator("Apprentices copy the lens readings onto mica sheets, careful to leave room for future corrections."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "mukag.oculum-open.objective.archive",
                    text: "Establish a shared Oculum archive in the capital.",
                    phase: "Success",
                    requirements: [
                        req("mukag.oculum-open.req.science-district", "building", "Own a science district in the capital", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                            targetRole: "District",
                            targetLabel: "Science district",
                            referenceKind: "District",
                            referenceKey: "District_Science",
                            referenceDisplayName: "Science district",
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-open.reward.research", "science", "Unlocks Oculum research memorandum", {
                            groupLabel: "Science",
                            groupOrder: 20,
                            assetKind: "technology",
                            assetKey: "Tech_OculumMemorandum",
                            assetDisplayName: "Oculum Memorandum",
                            codexEntryKey: "codex.tech.oculum-memorandum",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "mukag.oculum-bold",
        title: "The Forced Vision",
        summaryLines: [
            "The lens is commanded before consensus forms. The result is powerful, public, and politically expensive.",
        ],
        questType: "Major Faction",
        isMandatory: true,
        aliases: ["FactionQuest_Mukag_Chapter01_Bold"],
        navigation: {
            ...mukagNavigation,
            chapter: 1,
            chapterLabel: "Chapter I: Rain over Stone",
            step: 3,
            stepLabel: "Vision Outcome",
            sequenceIndex: 32,
            chapterOrder: 1,
            stepOrder: 3,
            branchGroupKey: "mukag.oculum-debate.paths",
            branchLabel: "Command the lens",
            branchOrder: 30,
            isBranchEnd: true,
            previousEntryKeys: ["mukag.oculum-debate"],
            nextEntryKeys: ["mukag.precious-find"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: ["mukag.precious-find"],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "mukag.oculum-bold.success",
                    phase: "success",
                    choiceKey: "mukag.oculum.choice.bold",
                    stepIndex: 0,
                    objectiveKey: "mukag.oculum-bold.objective.contain",
                    lines: [
                        speaker("Leader", "No more prayers. Show us the monsoon that wins."),
                        narrator("The Oculum flares. For one breath, everyone in the chamber sees a city crowned in rain and ash."),
                        speaker("Pirazeh", "You have your answer. You may not like who else heard it."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "mukag.oculum-bold.objective.contain",
                    text: "Contain the unrest caused by the forced vision.",
                    phase: "Success",
                    requirements: [
                        req("mukag.oculum-bold.req.garrison", "unit", "Station 2 units in Mukag territory", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                            requiredCount: 2,
                            targetRole: "Unit",
                        }),
                    ],
                    rewards: [
                        reward("mukag.oculum-bold.reward.production", "empire_bonus", "+15% Industry in the nearest city for 8 turns", {
                            groupLabel: "Empire Bonuses",
                            groupOrder: 40,
                            formulaText: "Industry x 1.15",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "mukag.precious-find",
        title: "Precious Find",
        summaryLines: [
            "Every path through the Oculum council converges on a buried reliquary map beneath the monastery.",
            "The chosen stance still colors the council, but the chronicle now returns to a shared path.",
        ],
        questType: "Major Faction",
        isMandatory: true,
        isKeyNarrativeBeat: true,
        aliases: ["FactionQuest_Mukag_Chapter02_Step01", "Quest_Mukag_PreciousFind"],
        navigation: {
            ...mukagNavigation,
            chapter: 2,
            chapterLabel: "Chapter II: Buried Rain",
            step: 1,
            stepLabel: "Convergence",
            sequenceIndex: 40,
            chapterOrder: 2,
            stepOrder: 1,
            previousEntryKeys: [
                "mukag.oculum-pious",
                "mukag.oculum-open",
                "mukag.oculum-bold",
            ],
            nextEntryKeys: ["curiosity.reliquary"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "mukag.precious-find.start",
                    phase: "start",
                    stepIndex: 0,
                    objectiveKey: "mukag.precious-find.objective.decode",
                    lines: [
                        narrator("Beneath the chamber is a map cut into black shell. Its rivers match no living coast."),
                        speaker("Pirazeh", "The Oculum was never looking up. It was looking under us."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "mukag.precious-find.objective.decode",
                    text: "Decode the reliquary map and reveal the drowned site.",
                    phase: "Start",
                    requirements: [
                        req("mukag.precious-find.req.archive", "research", "Complete the Oculum archive action", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                        }),
                    ],
                    rewards: [
                        reward("mukag.precious-find.reward.curiosity", "map_reveal", "Reveals Sunken Reliquary curiosity", {
                            groupLabel: "Map Reveals",
                            groupOrder: 50,
                            assetKind: "curiosity",
                            assetKey: "Curiosity_SunkenReliquary",
                            assetDisplayName: "Sunken Reliquary",
                            codexEntryKey: "codex.curiosity.sunken-reliquary",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "curiosity.reliquary",
        title: "The Sunken Reliquary",
        summaryLines: [
            "A drowned curiosity rises from the map beneath the Mukag monastery.",
            "The shell can be hatched, sealed, or broken, and all outcomes converge on the same underwater echo.",
        ],
        questType: "Curiosity",
        isKeyNarrativeBeat: false,
        aliases: ["CuriosityQuest_SunkenReliquary_Start"],
        navigation: {
            ...reliquaryNavigation,
            chapter: 1,
            chapterLabel: "Curiosity: Drowned Archive",
            step: 1,
            stepLabel: "Discovery",
            sequenceIndex: 50,
            chapterOrder: 1,
            stepOrder: 1,
            branchGroupKey: "curiosity.reliquary.paths",
            branchLabel: "Reliquary Resolution Paths",
            isBranchStart: true,
            previousEntryKeys: ["mukag.precious-find"],
            nextEntryKeys: [
                "curiosity.reliquary-hatch",
                "curiosity.reliquary-seal",
                "curiosity.reliquary-break",
            ],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "curiosity.reliquary.start",
                    phase: "start",
                    stepIndex: 0,
                    objectiveKey: "curiosity.reliquary.objective.resolve",
                    lines: [
                        narrator("At low tide, the reliquary rises from the mud like a sleeping casket made of lacquered shell."),
                        speaker("Surveyor", "It is warm. Either something inside is alive, or the old world left its lamps burning."),
                    ],
                },
                {
                    sectionKey: "curiosity.reliquary.choice",
                    phase: "choice",
                    stepIndex: 1,
                    objectiveKey: "curiosity.reliquary.objective.resolve",
                    lines: [
                        speaker("Leader", "We have one tide. Decide what survives contact with daylight."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "curiosity.reliquary.objective.resolve",
                    text: "Resolve the reliquary before the tide covers it again.",
                    phase: "Choice",
                    requirements: [
                        req("curiosity.reliquary.req.timer", "timer", "Complete within 4 turns", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                            durationTurns: 4,
                        }),
                    ],
                    rewards: [
                        reward("curiosity.reliquary.reward.base", "dust", "+35 Dust from exposed relic seams", {
                            amount: 35,
                            groupLabel: "Dust",
                            groupOrder: 10,
                            assetKind: "resource",
                            assetKey: "Resource_Dust",
                            assetDisplayName: "Dust",
                            codexEntryKey: "codex.resource.dust",
                        }),
                    ],
                },
            ],
        },
        branches: [
            branch("curiosity.reliquary.branch.hatch", "Hatch the shell", 10, {
                choiceKey: "curiosity.reliquary.choice.hatch",
                groupKey: "curiosity.reliquary.paths",
                groupLabel: "Reliquary Resolution Paths",
                nextEntryKeys: ["curiosity.reliquary-hatch"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: ["curiosity.reliquary-echo"],
                lore: {
                    outcomePreviewLines: [
                        "Risk a living relic and gain a stronger but less predictable reward.",
                    ],
                },
                strategy: {
                    conditions: ["Requires a hero present", "Adds a living relic outcome"],
                    requirements: [
                        req("curiosity.reliquary-hatch.req.hero", "hero", "Hero must be present at the curiosity", {
                            groupLabel: "Selection",
                            groupOrder: 10,
                            targetRole: "Hero",
                        }),
                    ],
                    rewards: [
                        reward("curiosity.reliquary-hatch.reward.unit", "unit", "Living Relic escort joins the nearest city", {
                            groupLabel: "Units",
                            groupOrder: 60,
                            assetKind: "unit",
                            assetKey: "Unit_LivingRelicEscort",
                            assetDisplayName: "Living Relic Escort",
                            codexEntryKey: "codex.unit.living-relic-escort",
                        }),
                    ],
                },
            }),
            branch("curiosity.reliquary.branch.seal", "Seal it again", 20, {
                choiceKey: "curiosity.reliquary.choice.seal",
                groupKey: "curiosity.reliquary.paths",
                groupLabel: "Reliquary Resolution Paths",
                nextEntryKeys: ["curiosity.reliquary-seal"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: ["curiosity.reliquary-echo"],
                lore: {
                    outcomePreviewLines: [
                        "Preserve the site and gain diplomatic leverage with cautious factions.",
                    ],
                },
                strategy: {
                    conditions: ["Requires no hostile army adjacent", "Preserves future diplomatic value"],
                    requirements: [
                        req("curiosity.reliquary-seal.req.safe", "territory", "No hostile army adjacent to the site", {
                            groupLabel: "Forbidden",
                            groupOrder: 30,
                            polarity: "forbidden",
                            targetRole: "Army",
                            state: "hostile",
                        }),
                    ],
                    rewards: [
                        reward("curiosity.reliquary-seal.reward.influence", "influence", "+45 Influence and a preserved-site status", {
                            amount: 45,
                            groupLabel: "Influence",
                            groupOrder: 10,
                            assetKind: "status",
                            assetKey: "Status_PreservedReliquary",
                            assetDisplayName: "Preserved Reliquary",
                            codexEntryKey: "codex.status.preserved-reliquary",
                        }),
                    ],
                },
            }),
            branch("curiosity.reliquary.branch.break", "Break it open", 30, {
                choiceKey: "curiosity.reliquary.choice.break",
                groupKey: "curiosity.reliquary.paths",
                groupLabel: "Reliquary Resolution Paths",
                nextEntryKeys: ["curiosity.reliquary-break"],
                failureEntryKeys: [],
                convergesIntoEntryKeys: ["curiosity.reliquary-echo"],
                lore: {
                    outcomePreviewLines: [
                        "Convert the relic into immediate resources at the cost of a warning.",
                    ],
                },
                strategy: {
                    conditions: ["Available immediately", "Adds a warning to the archive"],
                    requirements: [],
                    rewards: [
                        reward("curiosity.reliquary-break.reward.dust", "dust", "+110 Dust immediately", {
                            amount: 110,
                            groupLabel: "Dust",
                            groupOrder: 10,
                            assetKind: "resource",
                            assetKey: "Resource_Dust",
                            assetDisplayName: "Dust",
                            codexEntryKey: "codex.resource.dust",
                        }),
                    ],
                },
            }),
        ],
    },
    {
        entryKey: "curiosity.reliquary-hatch",
        title: "A Warm Carapace",
        summaryLines: [
            "The shell opens without breaking, and something ancient accepts the campfire as a substitute sun.",
        ],
        questType: "Curiosity",
        aliases: ["CuriosityQuest_SunkenReliquary_Hatch"],
        navigation: {
            ...reliquaryNavigation,
            chapter: 1,
            chapterLabel: "Curiosity: Drowned Archive",
            step: 2,
            stepLabel: "Living Outcome",
            sequenceIndex: 60,
            chapterOrder: 1,
            stepOrder: 2,
            branchGroupKey: "curiosity.reliquary.paths",
            branchLabel: "Hatch the shell",
            branchOrder: 10,
            isBranchEnd: true,
            previousEntryKeys: ["curiosity.reliquary"],
            nextEntryKeys: ["curiosity.reliquary-echo"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: ["curiosity.reliquary-echo"],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "curiosity.reliquary-hatch.success",
                    phase: "success",
                    choiceKey: "curiosity.reliquary.choice.hatch",
                    stepIndex: 0,
                    objectiveKey: "curiosity.reliquary-hatch.objective.escort",
                    lines: [
                        narrator("A pearl-bright creature unfolds, too fragile to be a weapon and too patient to be tame."),
                        speaker("Surveyor", "It follows the map light. I think it remembers where the water used to be."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "curiosity.reliquary-hatch.objective.escort",
                    text: "Escort the living relic away from the tide line.",
                    phase: "Success",
                    requirements: [
                        req("curiosity.reliquary-hatch.req.escort", "unit", "Keep one army on the curiosity for 1 turn", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                            durationTurns: 1,
                        }),
                    ],
                    rewards: [
                        reward("curiosity.reliquary-hatch.reward.escort", "unit", "Living Relic Escort", {
                            groupLabel: "Units",
                            groupOrder: 60,
                            assetKind: "unit",
                            assetKey: "Unit_LivingRelicEscort",
                            assetDisplayName: "Living Relic Escort",
                            codexEntryKey: "codex.unit.living-relic-escort",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "curiosity.reliquary-seal",
        title: "The Kept Door",
        summaryLines: [
            "The reliquary is sealed with new marks added beside the old ones, turning restraint into a message.",
        ],
        questType: "Curiosity",
        aliases: ["CuriosityQuest_SunkenReliquary_Seal"],
        navigation: {
            ...reliquaryNavigation,
            chapter: 1,
            chapterLabel: "Curiosity: Drowned Archive",
            step: 2,
            stepLabel: "Preserved Outcome",
            sequenceIndex: 61,
            chapterOrder: 1,
            stepOrder: 2,
            branchGroupKey: "curiosity.reliquary.paths",
            branchLabel: "Seal it again",
            branchOrder: 20,
            isBranchEnd: true,
            previousEntryKeys: ["curiosity.reliquary"],
            nextEntryKeys: ["curiosity.reliquary-echo"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: ["curiosity.reliquary-echo"],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "curiosity.reliquary-seal.success",
                    phase: "success",
                    choiceKey: "curiosity.reliquary.choice.seal",
                    stepIndex: 0,
                    objectiveKey: "curiosity.reliquary-seal.objective.mark",
                    lines: [
                        speaker("Leader", "Some doors are more useful closed."),
                        narrator("The tide returns over the renewed seal, but a low sound follows the army inland."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "curiosity.reliquary-seal.objective.mark",
                    text: "Mark the preserved site for future diplomatic claims.",
                    phase: "Success",
                    requirements: [
                        req("curiosity.reliquary-seal.req.marker", "territory", "Control the region containing the curiosity", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                        }),
                    ],
                    rewards: [
                        reward("curiosity.reliquary-seal.reward.status", "status", "Preserved Reliquary claim", {
                            groupLabel: "Status Effects",
                            groupOrder: 30,
                            assetKind: "status",
                            assetKey: "Status_PreservedReliquary",
                            assetDisplayName: "Preserved Reliquary",
                            codexEntryKey: "codex.status.preserved-reliquary",
                            targetScopeLabel: "Region",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
    {
        entryKey: "curiosity.reliquary-break",
        title: "Bright Shards",
        summaryLines: [
            "The reliquary breaks cleanly. The treasure is immediate, but the echo that follows is not grateful.",
        ],
        questType: "Curiosity",
        aliases: ["CuriosityQuest_SunkenReliquary_Break"],
        navigation: {
            ...reliquaryNavigation,
            chapter: 1,
            chapterLabel: "Curiosity: Drowned Archive",
            step: 2,
            stepLabel: "Extraction Outcome",
            sequenceIndex: 62,
            chapterOrder: 1,
            stepOrder: 2,
            branchGroupKey: "curiosity.reliquary.paths",
            branchLabel: "Break it open",
            branchOrder: 30,
            isBranchEnd: true,
            previousEntryKeys: ["curiosity.reliquary"],
            nextEntryKeys: ["curiosity.reliquary-echo"],
            failureEntryKeys: [],
            convergesIntoEntryKeys: ["curiosity.reliquary-echo"],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "curiosity.reliquary-break.success",
                    phase: "success",
                    choiceKey: "curiosity.reliquary.choice.break",
                    stepIndex: 0,
                    objectiveKey: "curiosity.reliquary-break.objective.extract",
                    lines: [
                        narrator("The shell fractures into bright coin-sized plates. Each plate reflects a different night sky."),
                        speaker("Surveyor", "We are rich. We are also, somehow, being counted."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "curiosity.reliquary-break.objective.extract",
                    text: "Extract relic shards before the site collapses.",
                    phase: "Success",
                    requirements: [
                        req("curiosity.reliquary-break.req.extract", "action", "Use one army action to extract shards", {
                            groupLabel: "Completion",
                            groupOrder: 20,
                        }),
                    ],
                    rewards: [
                        reward("curiosity.reliquary-break.reward.dust", "dust", "+110 Dust", {
                            amount: 110,
                            groupLabel: "Dust",
                            groupOrder: 10,
                            assetKind: "resource",
                            assetKey: "Resource_Dust",
                            assetDisplayName: "Dust",
                            codexEntryKey: "codex.resource.dust",
                            targetScopeLabel: "Empire",
                        }),
                    ],
                },
            ],
        },
        branches: [],
        quality: {
            warnings: [
                {
                    code: "prototype.outcome_warning",
                    message: "Breaking the shell leaves a caution marker on this archive outcome.",
                },
            ],
        },
    },
    {
        entryKey: "curiosity.reliquary-echo",
        title: "Echo Beneath the Reed",
        summaryLines: [
            "The curiosity outcomes converge into a single epilogue, though each choice leaves a different afterimage.",
        ],
        questType: "Curiosity",
        aliases: ["CuriosityQuest_SunkenReliquary_Echo"],
        navigation: {
            ...reliquaryNavigation,
            chapter: 1,
            chapterLabel: "Curiosity: Drowned Archive",
            step: 3,
            stepLabel: "Convergence",
            sequenceIndex: 70,
            chapterOrder: 1,
            stepOrder: 3,
            previousEntryKeys: [
                "curiosity.reliquary-hatch",
                "curiosity.reliquary-seal",
                "curiosity.reliquary-break",
            ],
            nextEntryKeys: [],
            failureEntryKeys: [],
            convergesIntoEntryKeys: [],
        },
        loreView: {
            sections: [
                {
                    sectionKey: "curiosity.reliquary-echo.other",
                    phase: "other",
                    stepIndex: 0,
                    objectiveKey: "curiosity.reliquary-echo.objective.record",
                    lines: [
                        narrator("For three nights, reeds along the coast repeat the same note. No scout can find the source."),
                        speaker("Pirazeh", "The old world rarely ends. It changes rooms."),
                    ],
                },
            ],
        },
        strategyView: {
            objectives: [
                {
                    objectiveKey: "curiosity.reliquary-echo.objective.record",
                    text: "Record the echo as a permanent archive clue.",
                    phase: "Archive",
                    requirements: [],
                    rewards: [
                        reward("curiosity.reliquary-echo.reward.codex", "codex", "Adds Drowned Archive note to the codex", {
                            groupLabel: "Codex",
                            groupOrder: 70,
                            assetKind: "codex",
                            assetKey: "Codex_DrownedArchive",
                            assetDisplayName: "Drowned Archive",
                            codexEntryKey: "codex.note.drowned-archive",
                        }),
                    ],
                },
            ],
        },
        branches: [],
    },
];

export const mockQuestExplorerExport: QuestExplorerExport = {
    exportKind: "quest_explorer",
    schemaVersion: "quest_explorer.v3",
    exportedAtUtc: "2026-05-20T00:00:00Z",
    gameVersion: "EL2 prototype mock",
    exporterVersion: "mock.frontend-prototype.v3",
    entries,
};
