package ewshop.facade.mapper;

import ewshop.domain.model.District;
import ewshop.facade.dto.response.DistrictDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictMapperTest {

    @Test
    @DisplayName("toDto should map all fields correctly when input is fully populated")
    void toDto_shouldMapAllFields() {
        District district = District.builder()
                .districtKey("Aspect_District_Tier1_Science")
                .displayName("Laboratory")
                .category("Science")
                .descriptionLines(List.of(
                        "+1 Science on special tiles",
                        "+2 Science per level"
                ))
                .build();

        DistrictDto dto = DistrictMapper.toDto(district);

        assertThat(dto).isNotNull();
        assertThat(dto.districtKey()).isEqualTo("Aspect_District_Tier1_Science");
        assertThat(dto.displayName()).isEqualTo("Laboratory");
        assertThat(dto.category()).isEqualTo("Science");
        assertThat(dto.descriptionLines()).containsExactly(
                "+1 Science on special tiles",
                "+2 Science per level"
        );
    }

    @Test
    @DisplayName("toDto should return null when input District is null")
    void toDto_shouldReturnNull_whenInputIsNull() {
        assertThat(DistrictMapper.toDto(null)).isNull();
    }

    @Test
    @DisplayName("toDto should map empty lists correctly")
    void toDto_shouldMapEmptyListsCorrectly() {
        District district = District.builder()
                .districtKey("Aspect_District_Empty")
                .displayName("Empty District")
                .category(null)
                .descriptionLines(List.of())
                .build();

        DistrictDto dto = DistrictMapper.toDto(district);

        assertThat(dto).isNotNull();
        assertThat(dto.districtKey()).isEqualTo("Aspect_District_Empty");
        assertThat(dto.displayName()).isEqualTo("Empty District");
        assertThat(dto.category()).isNull();
        assertThat(dto.descriptionLines()).isEmpty();
    }

    @Test
    @DisplayName("toDto should map null list fields to empty lists")
    void toDto_shouldMapNullListFieldsToEmptyLists() {
        District district = District.builder()
                .districtKey("Aspect_District_Nulls")
                .displayName("District with null lists")
                .category("Science")
                .descriptionLines(null)
                .build();

        DistrictDto dto = DistrictMapper.toDto(district);

        assertThat(dto).isNotNull();
        assertThat(dto.descriptionLines()).isNotNull().isEmpty();
    }
}