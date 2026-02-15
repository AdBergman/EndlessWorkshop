package ewshop.facade.mapper;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.response.TechDto;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TechMapperTest {

    @Test
    void toDto_shouldMapAllFields() {
        Tech prereqTech = Tech.builder()
                .techKey("Tech_Prereq")
                .name("Prereq Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .effects(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of())
                .build();

        Tech excludesTech = Tech.builder()
                .techKey("Tech_Excludes")
                .name("Excludes Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .effects(List.of())
                .techCoords(new TechCoords(0.2, 0.2))
                .factions(Set.of())
                .build();

        Tech tech = Tech.builder()
                .techKey("Tech_AdvancedRobotics")
                .name("Advanced Robotics")
                .era(4)
                .type(TechType.DISCOVERY)
                .effects(List.of("Production +10%", "New Unit Available"))
                .techCoords(new TechCoords(0.5, 0.75))
                .prereq(prereqTech)
                .excludes(excludesTech)
                .factions(Set.of(Faction.ASPECTS, Faction.LORDS))
                .build();

        TechDto dto = TechMapper.toDto(tech);

        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Advanced Robotics");
        assertThat(dto.techKey()).isEqualTo("Tech_AdvancedRobotics");
        assertThat(dto.era()).isEqualTo(4);
        assertThat(dto.type()).isEqualTo("Discovery");

        assertThat(dto.effects()).containsExactly("Production +10%", "New Unit Available");
        assertThat(dto.prereq()).isEqualTo("Tech_Prereq");
        assertThat(dto.excludes()).isEqualTo("Tech_Excludes");
        assertThat(dto.factions()).containsExactly("Aspects", "Lords");

        assertThat(dto.coords()).isNotNull();
        assertThat(dto.coords().xPct()).isEqualTo(0.5);
        assertThat(dto.coords().yPct()).isEqualTo(0.75);
    }

    @Test
    void toDto_shouldReturnNull_whenInputIsNull() {
        assertThat(TechMapper.toDto(null)).isNull();
    }

    @Test
    void toDto_shouldMapEmptyListsCorrectly() {
        Tech tech = Tech.builder()
                .techKey("Tech_BasicTech")
                .name("Basic Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .effects(List.of())
                .techCoords(new TechCoords(0.1, 0.2))
                .factions(Set.of())
                .build();

        TechDto dto = TechMapper.toDto(tech);

        assertThat(dto).isNotNull();
        assertThat(dto.effects()).isEmpty();
        assertThat(dto.factions()).isEmpty();
    }

    @Test
    void toDto_shouldHandleNullPrereqAndExcludes() {
        Tech tech = Tech.builder()
                .techKey("Tech_NoPrereqOrExcludes")
                .name("Tech without prereq or excludes")
                .era(1)
                .type(TechType.ECONOMY)
                .prereq(null)
                .excludes(null)
                .effects(List.of())
                .techCoords(new TechCoords(0.3, 0.4))
                .factions(Set.of())
                .build();

        TechDto dto = TechMapper.toDto(tech);

        assertThat(dto).isNotNull();
        assertThat(dto.prereq()).isNull();
        assertThat(dto.excludes()).isNull();
    }

    @Test
    void toDto_shouldFormatFactionsAndSortThem() {
        Tech tech = Tech.builder()
                .techKey("Tech_FactionTest")
                .name("Faction Test Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .effects(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of(Faction.NECROPHAGES, Faction.KIN, Faction.TAHUK))
                .build();

        TechDto dto = TechMapper.toDto(tech);

        assertThat(dto).isNotNull();
        assertThat(dto.factions()).containsExactly("Kin", "Necrophages", "Tahuk");
    }

    @Test
    void toDto_shouldFormatTechTypeCorrectly() {
        Tech techSociety = Tech.builder()
                .techKey("Tech_Society")
                .name("Society Tech")
                .type(TechType.SOCIETY)
                .era(1)
                .effects(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of())
                .build();

        Tech techDiscovery = Tech.builder()
                .techKey("Tech_Discovery")
                .name("Discovery Tech")
                .type(TechType.DISCOVERY)
                .era(1)
                .effects(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of())
                .build();

        assertThat(TechMapper.toDto(techSociety).type()).isEqualTo("Society");
        assertThat(TechMapper.toDto(techDiscovery).type()).isEqualTo("Discovery");
    }

    @Test
    void toDto_shouldThrow_whenCoordsMissing() {
        Tech tech = Tech.builder()
                .techKey("Tech_NoCoords")
                .name("No Coords")
                .era(1)
                .type(TechType.SOCIETY)
                .techCoords(null)
                .effects(List.of())
                .factions(Set.of())
                .build();

        assertThatThrownBy(() -> TechMapper.toDto(tech))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("techCoords required");
    }
}