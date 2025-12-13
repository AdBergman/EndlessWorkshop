package ewshop.facade.mapper;

import ewshop.domain.entity.District;
import ewshop.facade.dto.response.DistrictDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictMapperTest {

    @Test
    @DisplayName("toDto should map all fields correctly when input is fully populated")
    void toDto_shouldMapAllFields() {
        // Given
        District district = District.builder()
                .name("Commercial Hub")
                .info(List.of("Provides gold", "Requires river"))
                .effect("Gold +5")
                .tileBonus(List.of("Adjacent to river: +2 Gold"))
                .adjacencyBonus(List.of("Adjacent to City Center: +1 Gold"))
                .placementPrereq("Flat land")
                .build();

        // When
        DistrictDto dto = DistrictMapper.toDto(district);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Commercial Hub");
        assertThat(dto.info()).containsExactly("Provides gold", "Requires river");
        assertThat(dto.effect()).isEqualTo("Gold +5");
        assertThat(dto.tileBonus()).containsExactly("Adjacent to river: +2 Gold");
        assertThat(dto.adjacencyBonus()).containsExactly("Adjacent to City Center: +1 Gold");
        assertThat(dto.placementPrereq()).isEqualTo("Flat land");
    }

    @Test
    @DisplayName("toDto should return null when input District is null")
    void toDto_shouldReturnNull_whenInputIsNull() {
        // Given
        District district = null;

        // When
        DistrictDto dto = DistrictMapper.toDto(district);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("toDto should map empty lists correctly when input lists are empty")
    void toDto_shouldMapEmptyListsCorrectly() {
        // Given
        District district = District.builder()
                .name("Empty District")
                .info(List.of())
                .effect("No effect")
                .tileBonus(List.of())
                .adjacencyBonus(List.of())
                .placementPrereq("")
                .build();

        // When
        DistrictDto dto = DistrictMapper.toDto(district);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Empty District");
        assertThat(dto.info()).isEmpty();
        assertThat(dto.effect()).isEqualTo("No effect");
        assertThat(dto.tileBonus()).isEmpty();
        assertThat(dto.adjacencyBonus()).isEmpty();
        assertThat(dto.placementPrereq()).isEqualTo("");
    }

    @Test
    @DisplayName("toDto should map null list fields to empty lists")
    void toDto_shouldMapNullListFieldsToEmptyLists() {
        // Given
        District district = District.builder()
                .name("District with null lists")
                .info(null)
                .effect("Some effect")
                .tileBonus(null)
                .adjacencyBonus(null)
                .placementPrereq("Some prereq")
                .build();

        // When
        DistrictDto dto = DistrictMapper.toDto(district);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("District with null lists");
        assertThat(dto.info()).isEmpty();
        assertThat(dto.effect()).isEqualTo("Some effect");
        assertThat(dto.tileBonus()).isEmpty();
        assertThat(dto.adjacencyBonus()).isEmpty();
        assertThat(dto.placementPrereq()).isEqualTo("Some prereq");
    }
}
