package ewshop.facade.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.model.quest.QuestChronicle;
import ewshop.facade.dto.importing.quests.QuestChronicleImportBatchDto;
import ewshop.facade.dto.response.quests.QuestChronicleDto;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class QuestChronicleMapperTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void mapsChronicleImportToDomainAndResponseDto() {
        QuestChronicle model = QuestChronicleMapper.toModel(batch());

        assertThat(model.entries()).hasSize(1);
        assertThat(model.entries().getFirst().entryKey()).isEqualTo("Quest_A");
        assertThat(model.entries().getFirst().sourceQuestKeys()).containsExactly("Source_A");
        assertThat(model.entries().getFirst().objectives().getFirst().completionLines()).containsExactly("Visit the ruin.");

        var dto = QuestChronicleMapper.toDto(model);
        assertThat(dto.entries().getFirst().paths().getFirst().pathKey()).isEqualTo("Choice_A");
    }

    @Test
    void rejectsWrongExportKind() {
        assertThatThrownBy(() -> QuestChronicleMapper.toModel(new QuestChronicleImportBatchDto(
                null, null, null, null, "legacy_quest_export", null, null, List.of()
        ))).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("quest_chronicle");
    }

    @Test
    void mapsQuestChronicleV2ContractShapeWithoutLosingNestedFields() throws Exception {
        InputStream stream = getClass().getResourceAsStream("/quests/quest_chronicle_current_contract_minimal.json");
        QuestChronicleImportBatchDto importDto = objectMapper.readValue(stream, QuestChronicleImportBatchDto.class);

        QuestChronicleDto dto = QuestChronicleMapper.toDto(QuestChronicleMapper.toModel(importDto));

        assertThat(dto.schemaVersion()).isEqualTo("quest_chronicle.v2");
        assertThat(dto.contractSurface()).isEqualTo("frontend-direct");
        assertThat(dto.entries()).hasSize(1);

        var entry = dto.entries().getFirst();
        assertThat(entry.sourceQuestKeys()).containsExactly("Source_Quest_A");
        assertThat(entry.objectives().getFirst().rewards().getFirst().sourceRewardKeys())
                .containsExactly("Reward_Source_A");
        assertThat(entry.transcriptBlocks().getFirst().lines().getFirst().speakerLabel()).isNull();
    }

    @Test
    void rejectsDuplicateEntryKeysBeforePersistence() {
        QuestChronicleImportBatchDto.EntryDto entry = batch().entries().getFirst();
        QuestChronicleImportBatchDto duplicate = new QuestChronicleImportBatchDto(
                null, null, null, null, "quest_chronicle", null, null, List.of(entry, entry)
        );

        assertThatThrownBy(() -> QuestChronicleMapper.toModel(duplicate))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Duplicate entryKey");
    }

    private static QuestChronicleImportBatchDto batch() {
        return new QuestChronicleImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "quest_chronicle",
                "1",
                "questChronicle",
                List.of(new QuestChronicleImportBatchDto.EntryDto(
                        "Quest_A",
                        "Source_A",
                        List.of("Source_A"),
                        null,
                        null,
                        "First Quest",
                        List.of("Summary"),
                        "Curiosity",
                        true,
                        false,
                        "Faction_Kin",
                        "FactionQuest_Kin",
                        1,
                        "Chapter 1",
                        1,
                        "Step 1",
                        null,
                        null,
                        List.of("Quest_B"),
                        List.of(),
                        List.of(),
                        List.of(new QuestChronicleImportBatchDto.ObjectiveDto(
                                "Find the ruin.",
                                "Source_A",
                                "Choice_A",
                                0,
                                List.of("Find the ruin."),
                                List.of("Visit the ruin."),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of("Gain Dust."),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of()
                        )),
                        List.of(new QuestChronicleImportBatchDto.PathDto(
                                "Choice_A",
                                "First Quest",
                                "choiceDisplayName",
                                1,
                                "Source_A",
                                "Choice_A",
                                List.of("Visit the ruin."),
                                List.of("Gain Dust."),
                                List.of("Quest_B"),
                                List.of(),
                                List.of(),
                                List.of()
                        )),
                        List.of()
                ))
        );
    }
}
