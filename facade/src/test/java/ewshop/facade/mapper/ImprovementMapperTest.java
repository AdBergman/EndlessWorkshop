package ewshop.facade.mapper;

import ewshop.domain.model.Improvement;
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
                .constructibleKey("DistrictImprovement_Test_01")
                .displayName("Crystal Forge")
                .category("Industry")
                .descriptionLines(List.of("Line 1", "Line 2"))
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.improvementKey()).isEqualTo("DistrictImprovement_Test_01");
        assertThat(dto.displayName()).isEqualTo("Crystal Forge");
        assertThat(dto.category()).isEqualTo("Industry");
        assertThat(dto.descriptionLines()).containsExactly("Line 1", "Line 2");
    }

    @Test
    @DisplayName("toDto should return null when input Improvement is null")
    void toDto_shouldReturnNull_whenInputIsNull() {
        assertThat(ImprovementMapper.toDto(null)).isNull();
    }

    @Test
    @DisplayName("toDto should map empty lists correctly when descriptionLines is empty")
    void toDto_shouldMapEmptyListsCorrectly() {
        // Given
        Improvement improvement = Improvement.builder()
                .constructibleKey("DistrictImprovement_Empty_01")
                .displayName("Empty Improvement")
                .category(null)
                .descriptionLines(List.of())
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.improvementKey()).isEqualTo("DistrictImprovement_Empty_01");
        assertThat(dto.displayName()).isEqualTo("Empty Improvement");
        assertThat(dto.category()).isNull();
        assertThat(dto.descriptionLines()).isEmpty();
    }

    @Test
    @DisplayName("toDto should map null descriptionLines to empty list")
    void toDto_shouldMapNullDescriptionLinesToEmptyList() {
        // Given
        Improvement improvement = Improvement.builder()
                .constructibleKey("DistrictImprovement_NullLines_01")
                .displayName("Null Lines")
                .category("Economy")
                .descriptionLines(null)
                .build();

        // When
        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.descriptionLines()).isNotNull().isEmpty();
    }
}