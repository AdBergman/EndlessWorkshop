package ewshop.facade.mapper;

import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.service.QuestExplorerProgressionDiagnosticReporter;
import ewshop.domain.service.QuestExplorerProgressionProjector;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class QuestExplorerProgressionProjectorTest {

    @Test
    void projectionGroupsByChapterOrderAndStepOrder() {
        QuestExplorer.Progression progression = project(List.of(
                entry("FactionQuest_Mukag_Chapter01_Step01", "New Dawn", "FactionQuest_Mukag", "Faction_Mukag", 1, 0, 1),
                entry("FactionQuest_Mukag_Chapter01_Step02", "Raise the Signal", "FactionQuest_Mukag", "Faction_Mukag", 1, 1, 2),
                entry("FactionQuest_Mukag_Chapter02_Step01", "Forgotten Power", "FactionQuest_Mukag", "Faction_Mukag", 2, 0, 3)
        ));

        QuestExplorer.Questline questline = progression.questlines().getFirst();

        assertThat(questline.chapters()).extracting(QuestExplorer.Chapter::chapterOrder).containsExactly(1, 2);
        assertThat(questline.chapters().getFirst().steps())
                .extracting(QuestExplorer.Step::stepOrder)
                .containsExactly(0, 1);
        assertThat(questline.chapters().getFirst().steps())
                .extracting(QuestExplorer.Step::stepNumber)
                .containsExactly(1, 2);
    }

    @Test
    void variantsDoNotIncreaseStepCountWhenBranchGroupPointsAtCanonicalStepAlias() {
        QuestExplorer.Progression progression = project(List.of(
                entry(
                        "FactionQuest_Mukag_Chapter02_Step01",
                        "Forgotten Power",
                        "FactionQuest_Mukag",
                        "Faction_Mukag",
                        2,
                        0,
                        1,
                        List.of("FactionQuest_Mukag_Chapter02_Step02"),
                        null,
                        null,
                        null
                ),
                entry(
                        "FactionQuest_Mukag_Chapter02_Step02_Choice01",
                        "Pious",
                        "FactionQuest_Mukag",
                        "Faction_Mukag",
                        2,
                        7,
                        2,
                        List.of(),
                        "FactionQuest_Mukag_Chapter02_Step02",
                        "Pious",
                        2
                ),
                entry(
                        "FactionQuest_Mukag_Chapter02_Step02_Choice02",
                        "Open",
                        "FactionQuest_Mukag",
                        "Faction_Mukag",
                        2,
                        8,
                        3,
                        List.of(),
                        "FactionQuest_Mukag_Chapter02_Step02",
                        "Open",
                        1
                )
        ));

        QuestExplorer.Chapter chapter = progression.questlines().getFirst().chapters().getFirst();
        QuestExplorer.Step step = chapter.steps().get(1);

        assertThat(chapter.steps()).extracting(QuestExplorer.Step::stepOrder).containsExactly(0, 1);
        assertThat(chapter.steps()).extracting(QuestExplorer.Step::detailEntryKey).containsExactly(
                "FactionQuest_Mukag_Chapter02_Step01",
                "FactionQuest_Mukag_Chapter02_Step01"
        );
        assertThat(chapter.steps()).extracting(QuestExplorer.Step::projectionKind).containsExactly(
                "real_entry_backed",
                "virtual_alias_expanded"
        );
        assertThat(step.stepOrder()).isEqualTo(1);
        assertThat(step.stepKey()).isEqualTo("FactionQuest_Mukag:Faction_Mukag:chapter-2:step-1");
        assertThat(step.detailEntryKey()).isEqualTo("FactionQuest_Mukag_Chapter02_Step01");
        assertThat(step.sourceEntryKeys()).containsExactly(
                "FactionQuest_Mukag_Chapter02_Step01",
                "FactionQuest_Mukag_Chapter02_Step02_Choice01",
                "FactionQuest_Mukag_Chapter02_Step02_Choice02"
        );
        assertThat(step.aliasEntryKeys()).containsExactly(
                "FactionQuest_Mukag_Chapter02_Step02"
        );
        assertThat(step.variants()).extracting(QuestExplorer.Variant::entryKey).containsExactly(
                "FactionQuest_Mukag_Chapter02_Step01",
                "FactionQuest_Mukag_Chapter02_Step02_Choice02",
                "FactionQuest_Mukag_Chapter02_Step02_Choice01"
        );
        assertThat(step.variants()).extracting(QuestExplorer.Variant::variantKind).containsExactly(
                "entry",
                "branch_variant",
                "branch_variant"
        );
    }

    @Test
    void variantLinksIncludeNavigationAndBranchEdges() {
        QuestExplorer.Entry branchy = entry(
                "FactionQuest_Necrophage_Chapter03_Step01_Choice01",
                "Dead lands",
                "FactionQuest_Necrophage",
                "Faction_Necrophage",
                3,
                0,
                1,
                List.of(),
                null,
                "Dead lands",
                1,
                List.of("Quest_Previous"),
                List.of("Quest_Next_A"),
                List.of("Quest_Failure_A"),
                List.of("Quest_Converge_A"),
                List.of(new QuestExplorer.Branch(
                        "branch",
                        "choice",
                        "Dead lands",
                        1,
                        null,
                        null,
                        List.of("Quest_Next_B"),
                        List.of("Quest_Failure_B"),
                        List.of("Quest_Converge_B"),
                        null,
                        null
                ))
        );

        QuestExplorer.Variant variant = project(List.of(branchy))
                .questlines().getFirst()
                .chapters().getFirst()
                .steps().getFirst()
                .variants().getFirst();

        assertThat(variant.previousEntryKeys()).containsExactly("Quest_Previous");
        assertThat(variant.nextEntryKeys()).containsExactly("Quest_Next_A", "Quest_Next_B");
        assertThat(variant.failureEntryKeys()).containsExactly("Quest_Failure_A", "Quest_Failure_B");
        assertThat(variant.convergesIntoEntryKeys()).containsExactly("Quest_Converge_A", "Quest_Converge_B");
    }

    @Test
    void numericQuestlineVariantsCollapseOnlyWhenFactionAndQuestlineBaseKeysMatch() {
        QuestExplorer.Progression progression = project(List.of(
                entry("FactionQuest_Necrophage_Chapter01_Step01", "Brave New World", "FactionQuest_Necrophage", "Faction_Necrophage", 1, 0, 1),
                entry("FactionQuest_Necrophage02_Chapter01_Step01", "Brave New World", "FactionQuest_Necrophage02", "Faction_Necrophage02", 1, 0, 2),
                entry("FactionQuest_Rival_Chapter01_Step01", "Rival Base", "FactionQuest_Rival", "Faction_Rival", 1, 0, 3),
                entry("FactionQuest_Rival02_Chapter01_Step01", "Rival Unsafe", "FactionQuest_Rival02", "Faction_Other02", 1, 0, 4)
        ));

        assertThat(progression.questlines())
                .extracting(QuestExplorer.Questline::questLineFamilyKey)
                .containsExactly("FactionQuest_Necrophage", "FactionQuest_Rival", "FactionQuest_Rival02");
        assertThat(progression.questlines().getFirst().chapters().getFirst().steps().getFirst().variants())
                .extracting(QuestExplorer.Variant::entryKey)
                .containsExactly("FactionQuest_Necrophage_Chapter01_Step01", "FactionQuest_Necrophage02_Chapter01_Step01");
        assertThat(progression.debugSummary().numericQuestlineVariantsCollapsed())
                .singleElement()
                .satisfies(collapse -> {
                    assertThat(collapse.sourceQuestLineKey()).isEqualTo("FactionQuest_Necrophage02");
                    assertThat(collapse.targetQuestLineFamilyKey()).isEqualTo("FactionQuest_Necrophage");
                    assertThat(collapse.entryCount()).isEqualTo(1);
                });
    }

    @Test
    void tutorialScenarioEntriesArePlacedBeforeChapterOneWhenTheyMatchAnExistingFamily() {
        QuestExplorer.Progression progression = project(List.of(
                entry("TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01", "A New Home", null, null, 1, 0, 0),
                entry("FactionQuest_KinOfSheredyn_Chapter01_Step01", "The Missing Youth", "FactionQuest_KinOfSheredyn", "Faction_KinOfSheredyn", 1, 0, 1)
        ));

        QuestExplorer.Questline questline = progression.questlines().getFirst();

        assertThat(questline.questLineFamilyKey()).isEqualTo("FactionQuest_KinOfSheredyn");
        assertThat(questline.chapters()).extracting(QuestExplorer.Chapter::chapterOrder).containsExactly(0, 1);
        assertThat(questline.chapters().getFirst().title()).isEqualTo("Tutorial");
        assertThat(progression.debugSummary().tutorialEntriesPlaced())
                .containsExactly("TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01 -> FactionQuest_KinOfSheredyn before Chapter 1");
    }

    @Test
    void debugSummaryFlagsSuspiciousBranchVariantsWithoutParentStep() {
        QuestExplorer.Progression progression = project(List.of(
                entry(
                        "FactionQuest_Necrophage_Chapter03_Step01_Choice01",
                        "Dead lands",
                        "FactionQuest_Necrophage",
                        "Faction_Necrophage",
                        null,
                        null,
                        1,
                        List.of(),
                        "Missing_Parent",
                        "Dead lands",
                        1
                )
        ));

        assertThat(progression.questlines()).isEmpty();
        assertThat(progression.debugSummary().entriesWithMissingChapterOrStepOrder())
                .containsExactly("FactionQuest_Necrophage_Chapter03_Step01_Choice01");
        assertThat(progression.debugSummary().suspiciousBranchVariantsWithoutParentStep())
                .containsExactly("FactionQuest_Necrophage_Chapter03_Step01_Choice01 references missing branchGroupKey Missing_Parent");
    }

    @Test
    void parseableMissingPositionEntriesAreAssignedButStillReported() {
        QuestExplorer.Progression progression = project(List.of(
                entry(
                        "FactionQuest_Necrophage_Chapter03_Step01",
                        "Virgin Lands",
                        "FactionQuest_Necrophage",
                        "Faction_Necrophage",
                        3,
                        0,
                        1,
                        List.of("FactionQuest_Necrophage_Chapter03_Step02"),
                        null,
                        null,
                        null
                ),
                entry(
                        "FactionQuest_Necrophage_Chapter03_Step02_Choice1",
                        "The outsider seeks a site",
                        "FactionQuest_Necrophage",
                        "Faction_Necrophage",
                        null,
                        null,
                        2
                )
        ));

        QuestExplorer.Chapter chapter = progression.questlines().getFirst().chapters().getFirst();

        assertThat(chapter.steps()).extracting(QuestExplorer.Step::stepOrder).containsExactly(0, 1);
        assertThat(chapter.steps().get(1).variants())
                .extracting(QuestExplorer.Variant::entryKey)
                .contains("FactionQuest_Necrophage_Chapter03_Step02_Choice1");
        assertThat(progression.debugSummary().entriesWithMissingChapterOrStepOrder())
                .containsExactly("FactionQuest_Necrophage_Chapter03_Step02_Choice1");
    }

    @Test
    void debugSummaryReportsMissingMajorFactionChaptersAndOneStepChapters() {
        QuestExplorer.Progression progression = project(List.of(
                entry("FactionQuest_Aspect_Chapter01_Step01", "The Great Dieback", "FactionQuest_Aspect", "Faction_Aspect", 1, 0, 1)
        ));

        assertThat(progression.debugSummary().missingMajorFactionChapters())
                .singleElement()
                .satisfies(missing -> assertThat(missing.missingChapterNumbers()).containsExactly(2, 3, 4, 5, 6));
        assertThat(progression.debugSummary().chaptersWithOnlyOneStep())
                .singleElement()
                .satisfies(chapter -> {
                    assertThat(chapter.questLineFamilyKey()).isEqualTo("FactionQuest_Aspect");
                    assertThat(chapter.chapterOrder()).isEqualTo(1);
                });
    }

    @Test
    void mapperCarriesProgressionDtoWithoutDroppingEntries() {
        QuestExplorer.Entry entry = entry(
                "FactionQuest_Mukag_Chapter02_Step01",
                "Forgotten Power",
                "FactionQuest_Mukag",
                "Faction_Mukag",
                2,
                0,
                1
        );
        QuestExplorer source = new QuestExplorer(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3",
                List.of(entry)
        );
        QuestExplorer model = new QuestExplorer(
                source.gameVersion(),
                source.exporterVersion(),
                source.exportedAtUtc(),
                source.exportKind(),
                source.schemaVersion(),
                source.entries(),
                QuestExplorerProgressionProjector.project(source)
        );

        var dto = QuestExplorerMapper.toDto(model);

        assertThat(dto.entries()).extracting(quest -> quest.entryKey()).containsExactly("FactionQuest_Mukag_Chapter02_Step01");
        assertThat(dto.progression().questlines().getFirst().chapters().getFirst().steps().getFirst().detailEntryKey())
                .isEqualTo("FactionQuest_Mukag_Chapter02_Step01");
    }

    @Test
    void diagnosticReportIsDeterministicAndReportsValidationWarnings() {
        QuestExplorer explorer = explorer(List.of(
                entry(
                        "FactionQuest_Aspect_Chapter01_Step01",
                        "The Great Dieback",
                        "FactionQuest_Aspect",
                        "Faction_Aspect",
                        1,
                        0,
                        1,
                        List.of(),
                        null,
                        null,
                        null,
                        List.of(),
                        List.of("Missing_Quest"),
                        List.of(),
                        List.of("Missing_Convergence"),
                        List.of()
                ),
                entry("FactionQuest_Aspect_Chapter00_Missing", "Missing", "FactionQuest_Aspect", "Faction_Aspect", null, null, 2)
        ));

        String firstReport = QuestExplorerProgressionDiagnosticReporter.createReport(explorer);
        String secondReport = QuestExplorerProgressionDiagnosticReporter.createReport(explorer);

        assertThat(firstReport).isEqualTo(secondReport);
        assertThat(firstReport)
                .contains("warningCount: 6")
                .contains("entriesMissingChapterOrStepOrder (1):")
                .contains("invalidNextOrConvergenceLinks (2):")
                .contains("projectionKind: real_entry_backed")
                .contains("detailEntryKey: FactionQuest_Aspect_Chapter01_Step01")
                .contains("FactionQuest_Aspect_Chapter01_Step01 navigation.nextEntryKeys -> Missing_Quest")
                .contains("FactionQuest_Aspect_Chapter01_Step01 navigation.convergesIntoEntryKeys -> Missing_Convergence")
                .contains("orphanUnassignedEntries (1):")
                .contains("FactionQuest_Aspect_Chapter00_Missing");
    }

    @Test
    void diagnosticReportFlagsCrossProgressionLinks() {
        QuestExplorer explorer = explorer(List.of(
                entry(
                        "FactionQuest_KinOfSheredyn_Chapter06B_Step01",
                        "Kin Ending",
                        "FactionQuest_KinOfSheredyn",
                        "Faction_KinOfSheredyn",
                        6,
                        0,
                        1,
                        List.of(),
                        null,
                        null,
                        null,
                        List.of(),
                        List.of("FactionQuest_Mukag_Chapter06B_Step01"),
                        List.of(),
                        List.of(),
                        List.of()
                ),
                entry(
                        "FactionQuest_Mukag_Chapter06B_Step01",
                        "Mukag Ending",
                        "FactionQuest_Mukag",
                        "Faction_Mukag",
                        6,
                        0,
                        2
                )
        ));

        String report = QuestExplorerProgressionDiagnosticReporter.createReport(explorer);

        assertThat(report)
                .contains("invalidNextOrConvergenceLinks (1):")
                .contains("FactionQuest_KinOfSheredyn_Chapter06B_Step01 navigation.nextEntryKeys -> FactionQuest_Mukag_Chapter06B_Step01 crosses progression group FactionQuest_KinOfSheredyn/Faction_KinOfSheredyn -> FactionQuest_Mukag/Faction_Mukag");
    }

    @Test
    void writesCurrentFixtureDiagnosticReportWhenFixtureIsPresent() throws Exception {
        Path exportPath = firstExisting(
                Path.of("../local-imports/exports/ewshop_quest_explorer_export_0.80.json"),
                Path.of("local-imports/exports/ewshop_quest_explorer_export_0.80.json")
        );
        Assumptions.assumeTrue(exportPath != null, "local quest_explorer export fixture is not present");

        QuestExplorer source = objectMapper().readValue(exportPath.toFile(), QuestExplorer.class);
        QuestExplorer.Progression progression = QuestExplorerProgressionProjector.project(source);
        QuestExplorer projectedExplorer = new QuestExplorer(
                source.gameVersion(),
                source.exporterVersion(),
                source.exportedAtUtc(),
                source.exportKind(),
                source.schemaVersion(),
                source.entries(),
                progression
        );
        String report = QuestExplorerProgressionDiagnosticReporter.createReport(projectedExplorer);
        Path reportPath = Path.of("target/quest-explorer-progression-diagnostic.txt");
        Files.createDirectories(reportPath.getParent());
        Files.writeString(reportPath, report);

        assertThat(Files.readString(reportPath)).isEqualTo(report);
        assertThat(report).isEqualTo(QuestExplorerProgressionDiagnosticReporter.createReport(projectedExplorer));
        assertThat(report)
                .contains("totalEntries: 149")
                .contains("questlineFamilies: 20")
                .contains("projectedMajorQuestlines: 5")
                .contains("invalidNextOrConvergenceLinks (2):")
                .contains("orphanUnassignedEntries: 15")
                .contains("orphanUnassignedEntries (15):")
                .contains("projectionKind: virtual_alias_expanded")
                .contains("detailEntryKey:")
                .contains("aliasEntryKeys:")
                .contains("FactionQuest_KinOfSheredyn_Chapter06B_Step01 navigation.nextEntryKeys -> FactionQuest_Mukag_Chapter06B_Step01 crosses progression group FactionQuest_KinOfSheredyn/Faction_KinOfSheredyn -> FactionQuest_Mukag/Faction_Mukag")
                .contains("FactionQuest_KinOfSheredyn02/Faction_KinOfSheredyn02 -> FactionQuest_KinOfSheredyn/Faction_KinOfSheredyn entries=7")
                .contains("FactionQuest_Necrophage02/Faction_Necrophage02 -> FactionQuest_Necrophage/Faction_Necrophage entries=6")
                .contains("TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01 -> FactionQuest_KinOfSheredyn before Chapter 1");

        assertThat(chapterOrders(questline(progression, "FactionQuest_KinOfSheredyn")))
                .containsExactly(0, 1, 2, 3, 4, 5, 6);
        assertThat(chapterOrders(questline(progression, "FactionQuest_Aspect"))).containsExactly(1, 2, 3, 4, 5, 6);
        assertThat(chapterOrders(questline(progression, "FactionQuest_LastLord"))).containsExactly(1, 2, 3, 4, 5, 6);
        assertThat(chapterOrders(questline(progression, "FactionQuest_Mukag"))).containsExactly(1, 2, 3, 4, 5, 6);
        assertThat(chapterOrders(questline(progression, "FactionQuest_Necrophage"))).containsExactly(1, 2, 3, 4, 5, 6);

        QuestExplorer.Chapter mukagChapter2 = chapter(questline(progression, "FactionQuest_Mukag"), 2);
        assertThat(mukagChapter2.steps()).extracting(QuestExplorer.Step::stepOrder).containsExactly(0, 1);
        assertThat(mukagChapter2.steps().get(1).variants()).hasSize(7);
        assertThat(progression.debugSummary().entriesWithMissingChapterOrStepOrder()).hasSize(40);
        assertThat(progression.debugSummary().chaptersWithOnlyOneStep()).hasSize(3);
        assertThat(progression.debugSummary().missingMajorFactionChapters()).isEmpty();
    }

    private static ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
    }

    private static QuestExplorer.Progression project(List<QuestExplorer.Entry> entries) {
        return QuestExplorerProgressionProjector.project(explorer(entries));
    }

    private static QuestExplorer explorer(List<QuestExplorer.Entry> entries) {
        return new QuestExplorer(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    private static QuestExplorer.Questline questline(QuestExplorer.Progression progression, String questLineFamilyKey) {
        return progression.questlines().stream()
                .filter(questline -> questLineFamilyKey.equals(questline.questLineFamilyKey()))
                .findFirst()
                .orElseThrow();
    }

    private static QuestExplorer.Chapter chapter(QuestExplorer.Questline questline, int chapterOrder) {
        return questline.chapters().stream()
                .filter(chapter -> chapter.chapterOrder() == chapterOrder)
                .findFirst()
                .orElseThrow();
    }

    private static List<Integer> chapterOrders(QuestExplorer.Questline questline) {
        return questline.chapters().stream().map(QuestExplorer.Chapter::chapterOrder).toList();
    }

    private static Path firstExisting(Path... paths) {
        for (Path path : paths) {
            if (Files.isRegularFile(path)) return path;
        }
        return null;
    }

    private static QuestExplorer.Entry entry(
            String entryKey,
            String title,
            String questLineKey,
            String factionKey,
            Integer chapterOrder,
            Integer stepOrder,
            int sequenceIndex
    ) {
        return entry(entryKey, title, questLineKey, factionKey, chapterOrder, stepOrder, sequenceIndex, List.of(), null, null, null);
    }

    private static QuestExplorer.Entry entry(
            String entryKey,
            String title,
            String questLineKey,
            String factionKey,
            Integer chapterOrder,
            Integer stepOrder,
            int sequenceIndex,
            List<String> aliases,
            String branchGroupKey,
            String branchLabel,
            Integer branchOrder
    ) {
        return entry(
                entryKey,
                title,
                questLineKey,
                factionKey,
                chapterOrder,
                stepOrder,
                sequenceIndex,
                aliases,
                branchGroupKey,
                branchLabel,
                branchOrder,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }

    private static QuestExplorer.Entry entry(
            String entryKey,
            String title,
            String questLineKey,
            String factionKey,
            Integer chapterOrder,
            Integer stepOrder,
            int sequenceIndex,
            List<String> aliases,
            String branchGroupKey,
            String branchLabel,
            Integer branchOrder,
            List<String> previousEntryKeys,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            List<QuestExplorer.Branch> branches
    ) {
        return new QuestExplorer.Entry(
                entryKey,
                title,
                List.of("Summary"),
                "Faction Quest",
                true,
                false,
                aliases,
                new QuestExplorer.Navigation(
                        factionKey,
                        factionKey == null ? null : factionKey.replace("Faction_", "").replace("_", " "),
                        questLineKey,
                        questLineKey,
                        chapterOrder,
                        chapterOrder == null ? null : "Chapter " + chapterOrder,
                        stepOrder,
                        stepOrder == null ? null : "Step " + stepOrder,
                        sequenceIndex,
                        chapterOrder,
                        stepOrder,
                        branchGroupKey,
                        branchLabel,
                        branchOrder,
                        null,
                        null,
                        previousEntryKeys,
                        nextEntryKeys,
                        failureEntryKeys,
                        convergesIntoEntryKeys
                ),
                new QuestExplorer.LoreView(List.of()),
                new QuestExplorer.StrategyView(List.of()),
                branches,
                null
        );
    }
}
