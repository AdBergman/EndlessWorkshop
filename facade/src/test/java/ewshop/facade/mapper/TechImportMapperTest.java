package ewshop.facade.mapper;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TechImportMapperTest {

    @Test
    void toDomain_shouldReturnNull_whenInputIsNull() {
        // when
        TechImportSnapshot result = TechImportMapper.toDomain(null);

        // then
        assertThat(result).isNull();
    }

    @Test
    void toDomain_shouldThrow_whenTechKeyIsNullOrBlank() {
        // given
        TechImportTechDto nullKey = new TechImportTechDto(
                null,
                "Stonework",
                "Lore",
                false,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportTechDto blankKey = new TechImportTechDto(
                "   ",
                "Stonework",
                "Lore",
                false,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when / then
        assertThatThrownBy(() -> TechImportMapper.toDomain(nullKey))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Import techKey is required");

        assertThatThrownBy(() -> TechImportMapper.toDomain(blankKey))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Import techKey is required");
    }

    @Test
    void toDomain_shouldThrow_whenQuadrantIsNullOrBlank() {
        // given
        TechImportTechDto nullQuadrant = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                "Lore",
                false,
                2,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportTechDto blankQuadrant = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                "Lore",
                false,
                2,
                "   ",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when / then
        assertThatThrownBy(() -> TechImportMapper.toDomain(nullQuadrant))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Missing quadrant for techKey: Technology_X");

        assertThatThrownBy(() -> TechImportMapper.toDomain(blankQuadrant))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Missing quadrant for techKey: Technology_X");
    }

    @Test
    void toDomain_shouldMapDevelopmentQuadrant_toEconomy() {
        // given
        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Some Tech",
                null,
                false,
                2,
                "Development",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when
        TechImportSnapshot snap = TechImportMapper.toDomain(dto);

        // then
        assertThat(snap.type()).isEqualTo(TechType.ECONOMY);
    }

    @Test
    void toDomain_shouldMapDefenseSocietyDiscoveryQuadrants_toEnum() {
        // given
        TechImportTechDto defense = new TechImportTechDto(
                "Technology_DEF",
                "T1",
                null,
                false,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
        TechImportTechDto society = new TechImportTechDto(
                "Technology_SOC",
                "T2",
                null,
                false,
                2,
                "Society",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
        TechImportTechDto discovery = new TechImportTechDto(
                "Technology_DIS",
                "T3",
                null,
                false,
                2,
                "Discovery",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when / then
        assertThat(TechImportMapper.toDomain(defense).type()).isEqualTo(TechType.DEFENSE);
        assertThat(TechImportMapper.toDomain(society).type()).isEqualTo(TechType.SOCIETY);
        assertThat(TechImportMapper.toDomain(discovery).type()).isEqualTo(TechType.DISCOVERY);
    }

    @Test
    void toDomain_shouldThrow_whenQuadrantDoesNotMatchEnum_orAlias() {
        // given
        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Some Tech",
                null,
                false,
                2,
                "NotARealQuadrant",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when / then
        assertThatThrownBy(() -> TechImportMapper.toDomain(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid quadrant 'NotARealQuadrant' for techKey: Technology_X");
    }

    @Test
    void toDomain_shouldDefaultEraTo1_whenEraIndexIsNull() {
        // given
        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                null,
                false,
                null,
                "Defense",
                null,
                null,
                null,
                null
        );

        // when
        TechImportSnapshot snap = TechImportMapper.toDomain(dto);

        // then
        assertThat(snap.era()).isEqualTo(1);
    }

    @Test
    void toDomain_shouldMapHiddenFalse_whenHiddenIsNull() {
        // given
        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                null,
                null,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when
        TechImportSnapshot snap = TechImportMapper.toDomain(dto);

        // then
        assertThat(snap.hidden()).isFalse();
    }

    @Test
    void toDomain_shouldFilterNullAndBlank_andTrimPrereqLists() {
        // given
        List<String> prereqsWithNulls =
                Arrays.asList(" Technology_A ", null, "   ", "Technology_B");
        List<String> exclusiveWithBlanks =
                Arrays.asList(" Technology_C ", "   ");

        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                null,
                false,
                3,
                "Society",
                prereqsWithNulls,
                exclusiveWithBlanks,
                null,
                null
        );

        // when
        TechImportSnapshot snap = TechImportMapper.toDomain(dto);

        // then
        assertThat(snap.prereqTechKeys())
                .containsExactly("Technology_A", "Technology_B");

        // and
        assertThat(snap.exclusivePrereqTechKeys())
                .containsExactly("Technology_C");
        assertThat(snap.traitPrereqs()).isEmpty();
        assertThat(snap.unlocks()).isEmpty();
    }

    @Test
    void toDomain_shouldMapBasicFields() {
        // given
        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                "Lore text",
                true,
                4,
                "Discovery",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        // when
        TechImportSnapshot snap = TechImportMapper.toDomain(dto);

        // then
        assertThat(snap.techKey()).isEqualTo("Technology_X");
        assertThat(snap.displayName()).isEqualTo("Stonework");
        assertThat(snap.lore()).isEqualTo("Lore text");
        assertThat(snap.hidden()).isTrue();
        assertThat(snap.era()).isEqualTo(4);
        assertThat(snap.type()).isEqualTo(TechType.DISCOVERY);
    }
}