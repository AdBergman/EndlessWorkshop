package ewshop.facade.mapper;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.StrategicCost;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.facade.dto.response.ImprovementDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementMapperTest {

    @Test
    @DisplayName("toDto should map all fields correctly when input is fully populated")
    void toDto_shouldMapAllFields() {
        // Given
        Improvement improvement = Improvement.builder()
                .name("Farm")
                .effects(List.of("Food +1", "Production +1"))
                .unique(UniqueType.CITY)
                .cost(List.of(new StrategicCost(StrategicResourceType.TITANIUM, 10), new StrategicCost(StrategicResourceType.GLASSTEEL, 5)))
                .era(1)
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Farm");
        assertThat(dto.effects()).containsExactly("Food +1", "Production +1");
        assertThat(dto.unique()).isEqualTo("City");
        assertThat(dto.cost()).containsExactly("10 TITANIUM", "5 GLASSTEEL");
        assertThat(dto.era()).isEqualTo(1);
    }

    @Test
    @DisplayName("toDto should return null when input Improvement is null")
    void toDto_shouldReturnNull_whenInputIsNull() {
        // Given
        Improvement improvement = null;

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("toDto should map empty lists correctly when input lists are empty")
    void toDto_shouldMapEmptyListsCorrectly() {
        // Given
        Improvement improvement = Improvement.builder()
                .name("Empty Improvement")
                .effects(List.of())
                .unique(UniqueType.EMPIRE)
                .cost(List.of())
                .era(0)
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Empty Improvement");
        assertThat(dto.effects()).isEmpty();
        assertThat(dto.unique()).isEqualTo("Empire");
        assertThat(dto.cost()).isEmpty();
        assertThat(dto.era()).isEqualTo(0);
    }

    @Test
    @DisplayName("toDto should map null list fields to empty lists")
    void toDto_shouldMapNullListFieldsToEmptyLists() {
        // Given
        Improvement improvement = Improvement.builder()
                .name("Improvement with null lists")
                .effects(null)
                .unique(UniqueType.CITY)
                .cost(null)
                .era(2)
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Improvement with null lists");
        assertThat(dto.effects()).isEmpty();
        assertThat(dto.unique()).isEqualTo("City");
        assertThat(dto.cost()).isEmpty();
        assertThat(dto.era()).isEqualTo(2);
    }

    @Test
    @DisplayName("toDto should format UniqueType correctly")
    void toDto_shouldFormatUniqueTypeCorrectly() {
        // Given
        Improvement improvementCity = Improvement.builder().name("City Unique").unique(UniqueType.CITY).era(0).build();
        Improvement improvementEmpire = Improvement.builder().name("Empire Unique").unique(UniqueType.EMPIRE).era(0).build();
        Improvement improvementNull = Improvement.builder().name("Null Unique").unique(null).era(0).build();

        // When
        ImprovementDto dtoCity = ImprovementMapper.toDto(improvementCity);
        ImprovementDto dtoEmpire = ImprovementMapper.toDto(improvementEmpire);
        ImprovementDto dtoNull = ImprovementMapper.toDto(improvementNull);

        // Then
        assertThat(dtoCity.unique()).isEqualTo("City");
        assertThat(dtoEmpire.unique()).isEqualTo("Empire");
        assertThat(dtoNull.unique()).isEqualTo("");
    }

    @Test
    @DisplayName("toDto should convert StrategicCost correctly")
    void toDto_shouldConvertStrategicCostCorrectly() {
        // Given
        Improvement improvement = Improvement.builder()
                .name("Cost Test")
                .cost(List.of(
                        new StrategicCost(StrategicResourceType.HYPERIUM, 20),
                        new StrategicCost(StrategicResourceType.ERADIONE, 15)
                ))
                .era(3)
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto.cost()).containsExactly("20 HYPERIUM", "15 ERADIONE");
    }
}
