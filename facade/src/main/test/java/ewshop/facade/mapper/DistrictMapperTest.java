package ewshop.facade.mapper;

import ewshop.domain.entity.District;
import ewshop.facade.dto.DistrictDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictMapperTest {

    @Test
    void toDto_mapsAllFieldsCorrectly() {
        District district = District.builder()
                .name("Bridge")
                .info(List.of("No adjacent bridge"))
                .effect("+2 Industry")
                .tileBonus(List.of("+1 Industry on tile producing Industry"))
                .adjacencyBonus(List.of("+1 Industry for each adjacent Ridge"))
                .placementPrereq("Must be on river")
                .build();

        DistrictDto dto = DistrictMapper.toDto(district);

        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Bridge");
        assertThat(dto.info()).containsExactly("No adjacent bridge");
        assertThat(dto.effect()).isEqualTo("+2 Industry");
        assertThat(dto.tileBonus()).containsExactly("+1 Industry on tile producing Industry");
        assertThat(dto.adjacencyBonus()).containsExactly("+1 Industry for each adjacent Ridge");
        assertThat(dto.placementPrereq()).isEqualTo("Must be on river");
    }

    @Test
    void toDto_returnsEmptyListsWhenNull() {
        District district = District.builder()
                .name("EmptyDistrict")
                .build();

        DistrictDto dto = DistrictMapper.toDto(district);

        assertThat(dto.info()).isEmpty();
        assertThat(dto.tileBonus()).isEmpty();
        assertThat(dto.adjacencyBonus()).isEmpty();
    }

    @Test
    void toDto_returnsNullWhenInputIsNull() {
        assertThat(DistrictMapper.toDto(null)).isNull();
    }
}
