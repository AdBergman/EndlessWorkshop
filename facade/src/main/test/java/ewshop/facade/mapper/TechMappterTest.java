package ewshop.facade.mapper;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.facade.dto.TechDto;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechMapperTest {

    @Test
    void toDto_mapsAllFieldsCorrectly() {
        Tech tech = Tech.builder()
                .name("Stonework")
                .era(1)
                .type(TechType.DEFENSE)
                .effects(List.of("+100 Fortification on Capital"))
                .factions(Set.of(Faction.ASPECT, Faction.KIN))
                .build();

        TechDto dto = TechMapper.toDto(tech);

        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Stonework");
        assertThat(dto.era()).isEqualTo(1);
        assertThat(dto.type()).isEqualTo("DEFENSE");
        assertThat(dto.effects()).isEqualTo("+100 Fortification on Capital");
        assertThat(dto.factions()).isEqualTo("ASPECT, KIN"); // sorted by name in mapper
    }

    @Test
    void toDto_returnsNullWhenInputIsNull() {
        TechDto dto = TechMapper.toDto(null);
        assertThat(dto).isNull();
    }
}
