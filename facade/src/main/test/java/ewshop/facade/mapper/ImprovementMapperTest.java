package ewshop.facade.mapper;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.StrategicCost;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.facade.dto.ImprovementDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementMapperTest {

    @Test
    void toDto_mapsAllFieldsCorrectly() {
        Improvement improvement = Improvement.builder()
                .name("Traveler's Shrine")
                .effects(List.of("+15 Approval"))
                .unique(UniqueType.CITY)
                .cost(List.of(new StrategicCost(StrategicResourceType.GLASSTEEL, 5)))
                .era(1)
                .build();

        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Traveler's Shrine");
        assertThat(dto.effects()).containsExactly("+15 Approval");
        assertThat(dto.unique()).isEqualTo("CITY");
        assertThat(dto.cost()).hasSize(1);
        assertThat(dto.era()).isEqualTo(1);
    }

    @Test
    void toDto_returnsEmptyListsWhenNull() {
        Improvement improvement = Improvement.builder()
                .name("EmptyImprovement")
                .build();

        ImprovementDto dto = ImprovementMapper.toDto(improvement);

        assertThat(dto.effects()).isEmpty();
        assertThat(dto.cost()).isEmpty();
    }

    @Test
    void toDto_returnsNullWhenInputIsNull() {
        assertThat(ImprovementMapper.toDto(null)).isNull();
    }
}
