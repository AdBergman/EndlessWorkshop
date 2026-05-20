package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.quest.QuestChronicle;
import ewshop.domain.model.results.ImportResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class QuestChronicleRepositoryAdapterIT {

    private JdbcTemplate jdbcTemplate;
    private QuestChronicleRepositoryAdapter repository;

    @BeforeEach
    void setUp() {
        DataSource dataSource = new DriverManagerDataSource(
                "jdbc:h2:mem:quest_chronicle_" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "sa",
                ""
        );
        new ResourceDatabasePopulator(new ClassPathResource(
                "db/migration/common/V3_4_0__quest_chronicle_vertical_slice.sql"
        )).execute(dataSource);

        jdbcTemplate = new JdbcTemplate(dataSource);
        repository = new QuestChronicleRepositoryAdapter(jdbcTemplate);
    }

    @Test
    void replaceQuestChronicleInsertsFlatRowsAndReconstructsChronicle() {
        ImportResult firstImport = repository.replaceQuestChronicle(chronicle("Quest_A", "Source_A"));

        assertThat(firstImport.getInserted()).isEqualTo(1);
        assertThat(firstImport.getDeleted()).isZero();
        assertThat(count("quest_chronicle_import_batches")).isEqualTo(1);
        assertThat(count("quest_chronicle_entries")).isEqualTo(1);
        assertThat(count("quest_chronicle_source_aliases")).isEqualTo(1);
        assertThat(count("quest_chronicle_objectives")).isEqualTo(1);
        assertThat(count("quest_chronicle_paths")).isEqualTo(1);
        assertThat(count("quest_chronicle_requirements")).isEqualTo(2);
        assertThat(count("quest_chronicle_rewards")).isEqualTo(2);
        assertThat(count("quest_chronicle_transcript_blocks")).isEqualTo(1);
        assertThat(count("quest_chronicle_transcript_lines")).isEqualTo(1);

        QuestChronicle loaded = repository.findQuestChronicle();

        assertThat(loaded.exportKind()).isEqualTo("quest_chronicle");
        assertThat(loaded.entries()).hasSize(1);
        QuestChronicle.Entry entry = loaded.entries().getFirst();
        assertThat(entry.entryKey()).isEqualTo("Quest_A");
        assertThat(entry.sourceQuestKeys()).containsExactly("Source_A");
        assertThat(entry.objectives().getFirst().completionRequirements().getFirst().displayText())
                .isEqualTo("Use faction action: Kin Rally");
        assertThat(entry.paths().getFirst().rewards().getFirst().displayText()).isEqualTo("Gain Dust.");
        assertThat(entry.transcriptBlocks().getFirst().lines().getFirst().text()).isEqualTo("The trail begins.");

        ImportResult secondImport = repository.replaceQuestChronicle(chronicle("Quest_B", "Source_B"));

        assertThat(secondImport.getInserted()).isEqualTo(1);
        assertThat(secondImport.getDeleted()).isEqualTo(1);
        assertThat(repository.findQuestChronicle().entries().getFirst().entryKey()).isEqualTo("Quest_B");
        assertThat(count("quest_chronicle_entries")).isEqualTo(1);
        assertThat(count("quest_chronicle_requirements")).isEqualTo(2);
        assertThat(count("quest_chronicle_rewards")).isEqualTo(2);
    }

    private int count(String table) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
        return count == null ? 0 : count;
    }

    private static QuestChronicle chronicle(String entryKey, String sourceQuestKey) {
        QuestChronicle.Requirement objectiveRequirement = new QuestChronicle.Requirement(
                "Requirement_Objective",
                "faction_action",
                "completion",
                "required",
                "Use faction action: Kin Rally",
                "FactionAction_Kin_Rally",
                "FactionAction",
                "Kin Rally",
                "Faction",
                "Kin",
                "active",
                1,
                null
        );
        QuestChronicle.Requirement pathRequirement = new QuestChronicle.Requirement(
                "Requirement_Path",
                "stance",
                "selection",
                "required",
                "Be Open.",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
        QuestChronicle.Reward objectiveReward = new QuestChronicle.Reward(
                "Reward_Objective",
                List.of("Reward_Source_Objective"),
                "science",
                "Gain Science.",
                "+10 Science",
                10,
                "Resource",
                "Science",
                "Science",
                "Faction"
        );
        QuestChronicle.Reward pathReward = new QuestChronicle.Reward(
                "Reward_Path",
                List.of("Reward_Source_Path"),
                "dust",
                "Gain Dust.",
                "+5 Dust",
                5,
                "Resource",
                "Dust",
                "Dust",
                "Faction"
        );

        return new QuestChronicle(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_chronicle",
                "1",
                "questChronicle",
                List.of(new QuestChronicle.Entry(
                        entryKey,
                        sourceQuestKey,
                        List.of(sourceQuestKey),
                        "Group_A",
                        "source",
                        "First Chronicle",
                        List.of("Follow the first trail."),
                        "MajorFaction",
                        true,
                        true,
                        "Faction_Kin",
                        "FactionQuest_Kin",
                        1,
                        "Chapter 1",
                        1,
                        "Step 1",
                        "Branch_A",
                        "Open",
                        List.of("Quest_Next"),
                        List.of("Quest_Fail"),
                        List.of("Quest_End"),
                        List.of(new QuestChronicle.Objective(
                                "Find the trail.",
                                sourceQuestKey,
                                "Choice_A",
                                0,
                                List.of("Search nearby."),
                                List.of("Visit the marker."),
                                List.of("Lose the trail."),
                                List.of("Do not anger the council."),
                                List.of("Choose the open path."),
                                List.of("Gain Science."),
                                List.of(objectiveRequirement),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(objectiveReward)
                        )),
                        List.of(new QuestChronicle.Path(
                                "Choice_A",
                                "Open path",
                                "choice",
                                0,
                                sourceQuestKey,
                                "Choice_A",
                                List.of("Choose openness."),
                                List.of("Gain Dust."),
                                List.of("Quest_Next"),
                                List.of("Quest_Fail"),
                                List.of(pathRequirement),
                                List.of(pathReward)
                        )),
                        List.of(new QuestChronicle.TranscriptBlock(
                                "Dialog_A",
                                "intro",
                                sourceQuestKey,
                                "Choice_A",
                                0,
                                List.of(new QuestChronicle.TranscriptLine(0, "narrator", "Archive", "The trail begins."))
                        ))
                ))
        );
    }
}
