import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLoreChronicleStream } from "@/features/quests/questPathFlow";
import {
    progressionQuestline,
    questEntry,
    testBranch,
    testObjective,
} from "@/features/quests/testUtils/questExplorerFixtures";
import {
    choiceKeyScopedPayload,
    choiceResetPayload,
    choiceResetWithWorldPayload,
    continuousLorePayload,
    gatedContinuationPayload,
    loreChronologyPayload,
    minorVariantPayload,
    payload,
    projectedLocalContinuationPayload,
    scopedReaderPayload,
    serializedContinuationPayload,
    stagedContinuationPayload,
    stagedNecroLorePayload,
    terminalNoLinkPayload,
} from "@/features/quests/testUtils/questExplorerPageFixtures";
import {
    expectElementBefore,
    intersectLoreSegment,
    mockedApiClient,
    renderPage,
    renderPageWithHistory,
    stubIntersectionObservers,
} from "@/features/quests/testUtils/questExplorerPageTestUtils";
import { useFactionSelectionStore } from "@/stores/factionSelectionStore";
import { useQuestStore } from "@/stores/questStore";

vi.mock("@/api/apiClient", () => ({
    apiClient: {
        getQuestExplorer: vi.fn(),
    },
}));

describe("QuestExplorerPage Lore chronicle behavior", () => {
    beforeEach(() => {
        useQuestStore.getState().reset();
        useFactionSelectionStore.getState().reset();
        mockedApiClient.getQuestExplorer.mockReset();
        mockedApiClient.getQuestExplorer.mockResolvedValue(payload);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("derives stable lore chronicle stream segment identities", () => {
        const chapterOne = progressionQuestline({
            title: "Stream Opening",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Stream Opening", detailEntryKey: "Quest_Stream_A" },
            ],
        }).chapters[0];
        const chapterTwo = progressionQuestline({
            chapterNumber: 2,
            chapterOrder: 2,
            title: "Stream Continuation",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Stream Continuation", detailEntryKey: "Quest_Stream_B" },
            ],
        }).chapters[0];
        const questline = progressionQuestline({
            title: "Stream Opening",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Stream Opening", detailEntryKey: "Quest_Stream_A" },
            ],
        });
        const fullProgression = {
            questlines: [{ ...questline, chapters: [chapterOne, chapterTwo] }],
            debugSummary: null,
        };
        const entries = [
            questEntry({
                entryKey: "Quest_Stream_A",
                title: "Stream Opening",
                branches: [{
                    ...testBranch("Branch_Stream_Next", "Continue to chapter two"),
                    nextEntryKeys: ["Quest_Stream_B"],
                }],
                navigation: {
                    chapter: 1,
                    chapterLabel: "Chapter 1",
                    chapterOrder: 1,
                    step: 1,
                    stepLabel: "Step 1",
                    stepOrder: 1,
                    sequenceIndex: 0,
                    nextEntryKeys: ["Quest_Stream_B"],
                },
            }),
            questEntry({
                entryKey: "Quest_Stream_B",
                title: "Stream Continuation",
                navigation: {
                    chapter: 2,
                    chapterLabel: "Chapter 2",
                    chapterOrder: 2,
                    step: 1,
                    stepLabel: "Step 1",
                    stepOrder: 1,
                    sequenceIndex: 1,
                    previousEntryKeys: ["Quest_Stream_A"],
                },
            }),
        ];
        const entriesByKey = Object.fromEntries(entries.map((entry) => [entry.entryKey, entry]));
        const selectedProgression = {
            questline: fullProgression.questlines[0],
            chapter: chapterOne,
            activeStepKeys: new Set<string>([chapterOne.steps[0].stepKey]),
            activeVariantEntryKeys: new Set<string>(),
            focusedStepIndex: 0,
        };

        const initialStream = buildLoreChronicleStream({
            selectedProgression,
            fullProgression,
            entriesByKey,
            loreChoicePathsByContext: {},
            showRawHiddenRows: false,
        });
        const selectedContextKey = initialStream.selectedContextKey ?? "";

        expect(initialStream.segments).toHaveLength(1);
        expect(initialStream.segments[0].contextKey).toBe(selectedContextKey);
        expect(initialStream.segments[0].railEntryKey).toBe("Quest_Stream_A");

        const selectedStream = buildLoreChronicleStream({
            selectedProgression,
            fullProgression,
            entriesByKey,
            loreChoicePathsByContext: {
                [selectedContextKey]: [{
                    stepKey: chapterOne.steps[0].stepKey,
                    choiceId: "branch:Branch_Stream_Next",
                    branchKey: "Branch_Stream_Next",
                    choiceKey: null,
                    sectionRole: null,
                    semanticStageKind: "unknown",
                    choiceGroupKey: null,
                    branchStepOrder: null,
                    hasDependentContinuations: false,
                    label: "Continue to chapter two",
                    targetEntryKey: "Quest_Stream_B",
                    nextEntryKeys: ["Quest_Stream_B"],
                }],
            },
            showRawHiddenRows: false,
        });

        expect(selectedStream.segments).toHaveLength(2);
        expect(selectedStream.segments.map((segment) => segment.railEntryKey)).toEqual(["Quest_Stream_A", "Quest_Stream_B"]);

        const renamedStream = buildLoreChronicleStream({
            selectedProgression: {
                ...selectedProgression,
                chapter: { ...chapterOne, title: "Renamed Stream Opening" },
            },
            fullProgression,
            entriesByKey,
            loreChoicePathsByContext: {},
            showRawHiddenRows: false,
        });

        expect(renamedStream.selectedContextKey).toBe(selectedContextKey);
    });

    it("keeps only the first sentence from the first major faction opening line in the chronicle intro", async () => {
        const questline = progressionQuestline({
            title: "A Fragile Dawn",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "A Fragile Dawn", detailEntryKey: "Quest_LongLead" },
            ],
        });
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            ...payload,
            entries: [
                questEntry({
                    entryKey: "Quest_LongLead",
                    title: "A Fragile Dawn",
                    questType: "Faction Quest",
                    summaryLines: ["The Last Lords gather before daybreak."],
                    loreView: {
                        sections: [
                            {
                                sectionKey: "Quest_LongLead:opening",
                                phase: "intro",
                                choiceKey: null,
                                stepIndex: null,
                                objectiveKey: null,
                                lines: [
                                    {
                                        speakerLabel: null,
                                        role: "character",
                                        text: "Dawn broke quietly over the Last Lords. The war-council carried every old grievance into the hall, and the long argument continued after the first bells.",
                                    },
                                    {
                                        speakerLabel: null,
                                        role: "narrator",
                                        text: "Messengers waited at the threshold for a verdict.",
                                    },
                                ],
                            },
                        ],
                    },
                }),
            ],
            progression: {
                questlines: [questline],
                debugSummary: null,
            },
        });

        renderPage("/quests/Quest_LongLead?mode=lore");

        await screen.findByRole("heading", { name: "A Fragile Dawn" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const lead = within(chronicle).getByText("Dawn broke quietly over the Last Lords.");
        const remainingOpening = within(chronicle).getByText("The war-council carried every old grievance into the hall, and the long argument continued after the first bells.");

        expect(lead.closest(".questExplorer-loreIntro")).not.toBeNull();
        expect(remainingOpening.closest(".questExplorer-loreIntro")).toBeNull();
        expect(remainingOpening.closest(".questExplorer-loreSection")).not.toBeNull();
        expect(within(chronicle).getByRole("heading", { name: "Opening" })).toBeInTheDocument();
        expectElementBefore(lead, remainingOpening);
    });

    it("preserves speaker attribution in major faction chronicle intros", async () => {
        const questline = progressionQuestline({
            title: "Forgotten Power",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Forgotten Power", detailEntryKey: "Quest_SpeakerLead" },
            ],
        });
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            ...payload,
            entries: [
                questEntry({
                    entryKey: "Quest_SpeakerLead",
                    title: "Forgotten Power",
                    questType: "Faction Quest",
                    summaryLines: ["The Tahuks argue over the Oculum."],
                    loreView: {
                        sections: [
                            {
                                sectionKey: "Quest_SpeakerLead:opening",
                                phase: "start",
                                choiceKey: null,
                                stepIndex: null,
                                objectiveKey: null,
                                lines: [
                                    {
                                        speakerLabel: "Jalo",
                                        role: "character",
                                        text: "Meng, you conniving slime! Mark my words, the Oculum will not sit idle for long.",
                                    },
                                ],
                            },
                        ],
                    },
                }),
            ],
            progression: {
                questlines: [questline],
                debugSummary: null,
            },
        });

        renderPage("/quests/Quest_SpeakerLead?mode=lore");

        await screen.findByRole("heading", { name: "Forgotten Power" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const intro = chronicle.querySelector(".questExplorer-loreIntro") as HTMLElement;
        const speaker = within(intro).getByText("Jalo:");
        const lead = within(intro).getByText("Meng, you conniving slime!");
        const remainingOpening = within(chronicle).getByText("Mark my words, the Oculum will not sit idle for long.");

        expect(speaker.closest(".questExplorer-loreIntro")).not.toBeNull();
        expect(lead.closest(".questExplorer-loreIntro")).not.toBeNull();
        expect(remainingOpening.closest(".questExplorer-loreIntro")).toBeNull();
        expect(remainingOpening.closest(".questExplorer-loreSection")).not.toBeNull();
    });

    it("renders lore as a continuous selected chronicle and stops at the next unresolved continuation", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(within(chronicle).queryByText("Stream Continuation")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Stream Ending")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("heading", { name: "Continue the chronicle" })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("heading", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Next Choices")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));

        expect(within(chronicle).getByText("Stream Continuation")).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter three/ })).toBeInTheDocument();
        expect(within(chronicle).queryByText("Stream Ending")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter three/ }));

        expect(within(chronicle).getByText("Stream Ending")).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");
    });

    it("lets the left rail follow the visible lore segment without mutating selected entry", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);

        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");

        await waitFor(() => {
            expect(observers.at(-1)?.elements.length).toBeGreaterThanOrEqual(2);
        });

        const rail = screen.getByRole("complementary");
        expect(within(rail).getByRole("button", { name: /Stream Opening\s+Chapter 1\s+1 step/ })).toHaveAttribute("aria-current", "page");

        intersectLoreSegment(observers, "Quest_Stream_B");

        expect(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ })).toHaveAttribute("aria-current", "page");
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter three/ })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A");
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A");
            expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");
        });
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");

        await user.click(screen.getByRole("button", { name: "Lore" }));

        const restoredChronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(restoredChronicle).getByText("Stream Continuation")).toBeInTheDocument();
        expect(within(restoredChronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");
    });

    it("treats a left rail click as canonical navigation rather than passive Lore scroll", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");

        const rail = screen.getByRole("complementary");
        await user.click(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_B"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_B");
        expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");
        expect(await screen.findByRole("heading", { name: "Stream Continuation" })).toBeInTheDocument();
    });

    it("promotes a passively highlighted rail item to canonical navigation when clicked", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPage("/quests/Quest_Stream_A?mode=lore");

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));

        await waitFor(() => {
            expect(observers.at(-1)?.elements.length).toBeGreaterThanOrEqual(2);
        });
        intersectLoreSegment(observers, "Quest_Stream_B");

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });

        const rail = screen.getByRole("complementary");
        await user.click(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_B"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_B");
        expect(screen.getByTestId("route-location").textContent ?? "").not.toContain("loreEntry=");
    });

    it("replaces passive Lore scroll URL updates without adding a rollback history entry", async () => {
        const user = userEvent.setup();
        const observers = stubIntersectionObservers();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPageWithHistory([
            "/quests/Quest_Stream_C?mode=lore",
            "/quests/Quest_Stream_A?mode=lore",
        ]);

        await screen.findByRole("heading", { name: "Stream Opening" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        await user.click(within(chronicle).getByRole("button", { name: /Continue to chapter two/ }));

        await waitFor(() => {
            expect(observers.at(-1)?.elements.length).toBeGreaterThanOrEqual(2);
        });
        intersectLoreSegment(observers, "Quest_Stream_B");

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A");
            expect(screen.getByTestId("route-location")).toHaveTextContent("loreEntry=Quest_Stream_B");
        });
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A");
        expect(within(chronicle).getByRole("button", { name: /Continue to chapter two/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Back" }));

        await waitFor(() => {
            expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_C?mode=lore");
        });
        expect(await screen.findByRole("heading", { name: "Stream Ending" })).toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_C");
    });

    it("restores the canonical entry when browser back leaves a rail navigation", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(continuousLorePayload);
        renderPageWithHistory([
            "/quests/Quest_Stream_C?mode=lore",
            "/quests/Quest_Stream_A?mode=lore",
        ]);

        expect(await screen.findByRole("heading", { name: "Stream Opening" })).toBeInTheDocument();

        const rail = screen.getByRole("complementary");
        await user.click(within(rail).getByRole("button", { name: /Stream Continuation\s+Chapter 2\s+1 step/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_B"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_B");

        await user.click(screen.getByRole("button", { name: "Back" }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_Stream_A"));
        expect(screen.getByTestId("route-location")).toHaveTextContent("/quests/Quest_Stream_A?mode=lore");
        expect(await screen.findByRole("heading", { name: "Stream Opening" })).toBeInTheDocument();
    });

    it("scopes lore content to the focused step before rendering decision and continuation stages", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(scopedReaderPayload);
        renderPage("/quests/Quest_Scoped");

        await screen.findByRole("heading", { name: "Forked Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getByText("Shared opening belongs before the choice.")).toBeInTheDocument();
        expect(within(chronicle).getByText("Step one lore belongs before the choice.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Future untagged lore must wait for the path.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Step two lore must wait for a selected sequence.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Step three lore must not pre-render.")).not.toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Take the ash road/ })).toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Take the ash road/ }));

        expect(within(chronicle).getByText("Only ash road lore is revealed.")).toBeInTheDocument();
        expect(within(chronicle).queryByText("Ash road later lore remains hidden.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Coral road lore remains hidden.")).not.toBeInTheDocument();
    });

    it("appends selected branch lore after the choice without mutating the pre-choice transcript", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(loreChronologyPayload);
        renderPage("/quests/Quest_Chronology?mode=lore");

        await screen.findByRole("heading", { name: "Stable Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const sharedOpening = within(chronicle).getByText("Shared opening remains before the choice.");
        const ashChoice = within(chronicle).getByRole("button", { name: /Take the ash road/ });

        expectElementBefore(sharedOpening, ashChoice);
        expect(within(chronicle).queryByText("Ash branch consequence appends after the choice.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Coral branch consequence remains hidden.")).not.toBeInTheDocument();

        await user.click(ashChoice);

        const sharedOpeningAfterChoice = within(chronicle).getByText("Shared opening remains before the choice.");
        const selectedAshChoice = within(chronicle).getByRole("button", { name: /Take the ash road/ });
        const ashConsequence = within(chronicle).getByText("Ash branch consequence appends after the choice.");

        expect(within(chronicle).getAllByText("Shared opening remains before the choice.")).toHaveLength(1);
        expectElementBefore(sharedOpeningAfterChoice, selectedAshChoice);
        expectElementBefore(selectedAshChoice, ashConsequence);
        expect(within(chronicle).queryByText("Coral branch consequence remains hidden.")).not.toBeInTheDocument();
    });

    it("keeps Necrophage-style staged continuation lore after the selected anchor without carry-forward noise", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedNecroLorePayload);
        renderPage("/quests/Quest_Necro_Ch6?mode=lore");

        await screen.findByRole("heading", { name: "A Bitter Truth" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        const opening = within(chronicle).getByText("The swarm learns the bitter truth.");
        const siteChoice = within(chronicle).getByRole("button", { name: /Interact with Site of the Ancients using a hero/ });

        expectElementBefore(opening, siteChoice);
        expect(within(chronicle).queryByText("Chronicle carry-forward")).not.toBeInTheDocument();

        await user.click(siteChoice);

        const selectedSiteChoice = within(chronicle).getByRole("button", { name: /Interact with Site of the Ancients using a hero/ });
        const siteOpening = within(chronicle).getByText("The old site opens after the chosen continuation.");
        const siteResolution = within(chronicle).getByText("The relic is recovered before the next choice.");
        const enhanceChoice = within(chronicle).getByRole("button", { name: /Enhance Hero/ });

        expect(within(chronicle).getAllByText("The swarm learns the bitter truth.")).toHaveLength(1);
        expectElementBefore(selectedSiteChoice, siteOpening);
        expectElementBefore(siteOpening, siteResolution);
        expectElementBefore(siteResolution, enhanceChoice);
        expect(within(chronicle).getByRole("button", { name: /Save Girl/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Execute Kazra/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The saved girl path remains hidden until selected.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Chronicle carry-forward")).not.toBeInTheDocument();

        await user.click(enhanceChoice);

        expect(within(chronicle).getByRole("button", { name: /Rehabilitate Kazra/ })).toBeInTheDocument();
        expect(within(chronicle).getByRole("button", { name: /Execute Kazra/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Release Kazra/ })).not.toBeInTheDocument();
    });

    it("uses branch continuity metadata to prevent same-step future lore from leaking", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceKeyScopedPayload);
        renderPage("/quests/Quest_Keyed");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("The shared setup belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current beat belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current resolution belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).queryByText("The next beat waits for the selected continuation.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The future beat must not leak.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("Continuation revealed")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Find Pryzja/ }));

        const selectedChoice = within(chronicle).getByRole("button", { name: /Find Pryzja/ });
        const nextChoice = within(chronicle).getByRole("button", { name: /Eliminate the threat/ });

        expect(within(chronicle).queryByText("Continuation revealed")).not.toBeInTheDocument();
        expect(nextChoice).toBeInTheDocument();
        expect(within(chronicle).queryByText("The next beat waits for the selected continuation.")).not.toBeInTheDocument();
        expectElementBefore(selectedChoice, nextChoice);
        expect(within(chronicle).queryByText("The future beat must not leak.")).not.toBeInTheDocument();
    });

    it("keeps passive setup lore scoped before carried continuation stages", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(serializedContinuationPayload);
        renderPage("/quests/Quest_Keyed");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("The shared setup belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current beat belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getAllByText("The current resolution belongs before the first choice.")).toHaveLength(1);
        expect(within(chronicle).getByRole("button", { name: /Eliminate the threat/ })).toBeInTheDocument();
        expect(within(chronicle).queryByRole("button", { name: /Find Pryzja/ })).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The next beat waits for the selected continuation.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The future beat must not leak.")).not.toBeInTheDocument();
    });

    it("keeps raw Lore diagnostics available while duplicate body ownership is guarded", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(serializedContinuationPayload);
        renderPage("/quests/Quest_Keyed?debugQuestProgression=true");

        await screen.findByRole("heading", { name: "Keyed Chronicle" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).getAllByText("The current beat belongs before the first choice.")).toHaveLength(1);
        expect(screen.getByRole("region", { name: "Quest progression debug" })).toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "Show raw hidden rows" }));

        expect(screen.getByRole("checkbox", { name: "Show raw hidden rows" })).toBeChecked();
        expect(screen.getByRole("region", { name: "Quest progression debug" })).toBeInTheDocument();
        expect(within(chronicle).getAllByRole("button", { name: /Find Pryzja/ }).length).toBeGreaterThan(0);
    });

    it("keeps revealedBy lore sections hidden until their owner branch is selected", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(projectedLocalContinuationPayload);
        renderPage("/quests/Quest_Projector?mode=lore");

        await screen.findByRole("heading", { name: "Projected Setup" });

        const chronicle = screen.getByRole("region", { name: "Selected progression" });
        expect(within(chronicle).queryByText("The carried next beat is now readable.")).not.toBeInTheDocument();
        expect(within(chronicle).queryByText("The carried future beat resolves the local chapter.")).not.toBeInTheDocument();

        await user.click(within(chronicle).getByRole("button", { name: /Search/ }));

        expect(within(chronicle).getByText("The carried next beat is now readable.")).toBeInTheDocument();
        expect(within(chronicle).getByText("The carried future beat resolves the local chapter.")).toBeInTheDocument();
    });

    it("groups minor faction lore by shared opening, objective variants, and shared resolution", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(minorVariantPayload);
        renderPage("/quests");

        await user.click(await screen.findByRole("radio", { name: /^Minor Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Ancient Graveyard" })).toBeInTheDocument();

        expect(screen.getAllByRole("heading", { name: "Opening" })).toHaveLength(1);
        expect(screen.getByText("A somber atmosphere hangs over the settlement.")).toBeInTheDocument();
        expect(screen.getByText("Objective 1")).toBeInTheDocument();
        expect(screen.getByText("Objective 2")).toBeInTheDocument();
        expect(screen.getByText("The ground speaks, but we cannot hear it.")).toBeInTheDocument();
        expect(screen.getByText("A trading post is certain to bring us news.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Resolution" })).toBeInTheDocument();
        expect(screen.getByText("Thanks to your help, we know the way back.")).toBeInTheDocument();
    });

    it("changing an earlier decision resets downstream revealed content", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));

        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveTextContent("Read the shore signs.");

        const shoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(shoreChoice);

        expect(shoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("Read the shore signs.").length).toBeGreaterThan(0);
        expect(shoreChoice).toHaveTextContent("Read the shore signs.");
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
        expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A");
    });

    it("preserves a Lore selected sequence across Lore to Strategy to Lore", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByRole("button", { name: /Study the shore/ }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Lore" }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);
    });

    it("keeps Lore decision controls from selecting Strategy stage controls", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        const shoreChoice = screen.getByRole("button", { name: /Study the shore/ });
        await user.click(shoreChoice);

        expect(shoreChoice).toHaveAttribute("aria-current", "true");
        expect(screen.getAllByText("The shore path opens.").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "Strategy" }));

        expect(screen.getByRole("button", { name: /Study the shore/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("Continuation revealed")).not.toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
    });

    it("preserves Lore selections by chapter context while Strategy remains entry-scoped", async () => {
        const user = userEvent.setup();
        const baseProgression = choiceResetPayload.progression!;
        const baseQuestline = baseProgression.questlines[0]!;
        const secondChapter = progressionQuestline({
            chapterNumber: 2,
            chapterOrder: 2,
            title: "Later Archive",
            steps: [
                { stepNumber: 1, stepOrder: 1, title: "Later Archive", detailEntryKey: "Quest_D" },
                { stepNumber: 2, stepOrder: 2, title: "Later Result", detailEntryKey: "Quest_E" },
            ],
        }).chapters[0];
        mockedApiClient.getQuestExplorer.mockResolvedValue({
            ...choiceResetPayload,
            entries: [
                ...choiceResetPayload.entries,
                questEntry({
                    entryKey: "Quest_D",
                    title: "Later Archive",
                    summaryLines: ["Another chapter waits."],
                    navigation: {
                        chapter: 2,
                        chapterLabel: "Chapter 2",
                        chapterOrder: 2,
                        step: 1,
                        stepLabel: "Step 1",
                        stepOrder: 1,
                        sequenceIndex: 3,
                        previousEntryKeys: [],
                        nextEntryKeys: [],
                    },
                    branches: [{
                        ...testBranch("Branch_D", "Open later record"),
                        groupLabel: "Later Archive",
                        nextEntryKeys: ["Quest_E"],
                        lore: { outcomePreviewLines: ["The later continuation opens."] },
                    }],
                    strategyView: { objectives: [testObjective("Objective_D", "Hold the later archive.")] },
                }),
                questEntry({
                    entryKey: "Quest_E",
                    title: "Later Result",
                    summaryLines: ["The later continuation opens."],
                    navigation: {
                        chapter: 2,
                        chapterLabel: "Chapter 2",
                        chapterOrder: 2,
                        step: 2,
                        stepLabel: "Step 2",
                        stepOrder: 2,
                        sequenceIndex: 4,
                        previousEntryKeys: ["Quest_D"],
                        nextEntryKeys: [],
                    },
                    strategyView: { objectives: [testObjective("Objective_E", "Resolve the later archive.")] },
                }),
            ],
            progression: {
                debugSummary: baseProgression.debugSummary,
                questlines: [{ ...baseQuestline, chapters: [...baseQuestline.chapters, secondChapter] }],
            },
        });
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });

        await user.click(screen.getByRole("button", { name: /Study the shore/ }));
        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: /Later Archive/ }));

        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_D"));
        expect(screen.queryByRole("button", { name: /Follow the marker/ })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Later Archive", level: 2 })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lore" }));
        const laterChoice = screen.getByRole("button", { name: /Open later record/ });
        await user.click(laterChoice);
        expect(laterChoice).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: /Archive of the First Tide/ }));
        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_A"));

        expect(screen.getByRole("button", { name: /Study the shore/ })).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", { name: "Strategy" }));
        expect(screen.getByRole("button", { name: /Follow the marker/ })).not.toHaveAttribute("aria-current", "true");
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Lore" }));
        await user.click(screen.getByRole("button", { name: /Later Archive/ }));
        await waitFor(() => expect(useQuestStore.getState().selectedEntryKey).toBe("Quest_D"));
        expect(screen.getByRole("button", { name: /Open later record/ })).toHaveAttribute("aria-current", "true");
    });

    it("clears an incompatible semantic selection after category changes away and back", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(choiceResetWithWorldPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "Archive of the First Tide" });
        await user.click(screen.getByRole("button", { name: "Strategy" }));
        await user.click(screen.getByRole("button", { name: /Follow the marker/ }));
        expect(screen.getAllByText("Secure the old marker.").length).toBeGreaterThan(0);

        await user.click(screen.getByLabelText(/World Quests/));
        expect(await screen.findByRole("heading", { name: "Lost Curiosity" })).toBeInTheDocument();

        await user.click(screen.getByRole("radio", { name: /^Faction Quests\s+\d+$/ }));
        expect(await screen.findByRole("heading", { name: "Archive of the First Tide" })).toBeInTheDocument();
        expect(screen.queryByText("Secure the marker path.")).not.toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("renders terminal no-link Lore outcomes as narrative conclusions", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(terminalNoLinkPayload);
        renderPage("/quests/Quest_A?mode=lore");

        expect(await screen.findByRole("heading", { name: "End of the Chronicle" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /End the story/ }));

        const conclusion = screen.getByRole("region", { name: "Chronicle conclusion" });
        expect(conclusion).toHaveTextContent(/The story concludes here with\s+"End the story"\./);
        expect(within(conclusion).getByText("The End")).toBeInTheDocument();
        expect(screen.queryByText("Chronicle pauses")).not.toBeInTheDocument();
        expect(screen.queryByText(/archive does not identify/)).not.toBeInTheDocument();
    });

    it("gates continuation branches until their prerequisite branch is selected", async () => {
        const user = userEvent.setup();
        mockedApiClient.getQuestExplorer.mockResolvedValue(gatedContinuationPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "The Hunt" });

        expect(screen.getByRole("button", { name: /Track/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Lure/ })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Capture the rogue Lieutenant/ })).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Choose a path" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Track/ }));

        expect(screen.queryByText("Continue Selected Path")).not.toBeInTheDocument();
        const trackButton = screen.getByRole("button", { name: /Track/ });
        const continuationRevealed = screen.getByText("Continuation revealed");
        expect(continuationRevealed).toBeInTheDocument();
        expect(screen.getByText("Capture the rogue Lieutenant.")).toBeInTheDocument();
        const revealedOutcome = screen.getByText("The quarry is cornered.");
        expect(revealedOutcome).toBeInTheDocument();
        expectElementBefore(trackButton, continuationRevealed);
        expectElementBefore(continuationRevealed, revealedOutcome);
        expect(screen.queryByRole("button", { name: /Capture the rogue Lieutenant/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/does not identify the next continuation/)).not.toBeInTheDocument();

        expect(screen.getByText("The hunt resolves.")).toBeInTheDocument();
        expect(screen.queryByText("This step will be revealed after you make your choice.")).not.toBeInTheDocument();
    });

    it("collapses staged continuation convergence rows outside debug mode", async () => {
        mockedApiClient.getQuestExplorer.mockResolvedValue(stagedContinuationPayload);
        renderPage("/quests/Quest_A");

        await screen.findByRole("heading", { name: "A Gamble" });
        const chronicle = screen.getByRole("region", { name: "Selected progression" });

        expect(screen.queryByText("Continue Selected Path")).not.toBeInTheDocument();
        expect(screen.getByText("Possible continuations")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Choose a path" })).not.toBeInTheDocument();
        expect(screen.queryByText("Next Choices")).not.toBeInTheDocument();
        expect(screen.queryByText("Continuations")).not.toBeInTheDocument();
        expect(within(chronicle).getAllByRole("button", { name: /Pious/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Open/ })).toHaveLength(1);
        expect(within(chronicle).getAllByRole("button", { name: /Bold/ })).toHaveLength(1);
        expect(screen.queryByText("Far Pious")).not.toBeInTheDocument();
        expect(screen.queryByText("Far Open")).not.toBeInTheDocument();
        expect(screen.queryByText("Far Bold")).not.toBeInTheDocument();
    });
});
