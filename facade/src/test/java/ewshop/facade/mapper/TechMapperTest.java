package ewshop.facade.mapper;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.TechUnlockRef;
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
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of())
                .build();

        Tech excludesTech = Tech.builder()
                .techKey("Tech_Excludes")
                .name("Excludes Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.2, 0.2))
                .factions(Set.of())
                .build();

        Tech tech = Tech.builder()
                .techKey("Tech_AdvancedRobotics")
                .name("Advanced Robotics")
                .era(4)
                .type(TechType.DISCOVERY)
                .descriptionLines(List.of("Production +10%", "New Unit Available"))
                .unlocks(List.of(
                        new TechUnlockRef("Constructible", "Aspect_District_Tier1_Industry"),
                        new TechUnlockRef("Action", "ActionTypeCutForest")
                ))
                .techCoords(new TechCoords(0.5, 0.75))
                .prereq(prereqTech)
                .excludes(excludesTech)
                .factions(Set.of(Faction.ASPECTS, Faction.LORDS))
                .build();

        TechDto techDto = TechMapper.toDto(tech);

        assertThat(techDto).isNotNull();
        assertThat(techDto.name()).isEqualTo("Advanced Robotics");
        assertThat(techDto.techKey()).isEqualTo("Tech_AdvancedRobotics");
        assertThat(techDto.era()).isEqualTo(4);
        assertThat(techDto.type()).isEqualTo("Discovery");

        assertThat(techDto.descriptionLines())
                .containsExactly("Production +10%", "New Unit Available");

        assertThat(techDto.unlocks()).hasSize(2);
        assertThat(techDto.unlocks().get(0).unlockType()).isEqualTo("Constructible");
        assertThat(techDto.unlocks().get(0).unlockKey()).isEqualTo("Aspect_District_Tier1_Industry");
        assertThat(techDto.unlocks().get(1).unlockType()).isEqualTo("Action");
        assertThat(techDto.unlocks().get(1).unlockKey()).isEqualTo("ActionTypeCutForest");

        assertThat(techDto.prereq()).isEqualTo("Tech_Prereq");
        assertThat(techDto.excludes()).isEqualTo("Tech_Excludes");
        assertThat(techDto.factions()).containsExactly("Aspects", "Lords");

        assertThat(techDto.coords()).isNotNull();
        assertThat(techDto.coords().xPct()).isEqualTo(0.5);
        assertThat(techDto.coords().yPct()).isEqualTo(0.75);
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
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.1, 0.2))
                .factions(Set.of())
                .build();

        TechDto techDto = TechMapper.toDto(tech);

        assertThat(techDto).isNotNull();
        assertThat(techDto.descriptionLines()).isEmpty();
        assertThat(techDto.unlocks()).isEmpty();
        assertThat(techDto.factions()).isEmpty();
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
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.3, 0.4))
                .factions(Set.of())
                .build();

        TechDto techDto = TechMapper.toDto(tech);

        assertThat(techDto).isNotNull();
        assertThat(techDto.prereq()).isNull();
        assertThat(techDto.excludes()).isNull();
    }

    @Test
    void toDto_shouldFormatFactionsAndSortThem() {
        Tech tech = Tech.builder()
                .techKey("Tech_FactionTest")
                .name("Faction Test Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of(Faction.NECROPHAGES, Faction.KIN, Faction.TAHUK))
                .build();

        TechDto techDto = TechMapper.toDto(tech);

        assertThat(techDto).isNotNull();
        assertThat(techDto.factions()).containsExactly("Kin", "Necrophages", "Tahuk");
    }

    @Test
    void toDto_shouldFormatTechTypeCorrectly() {
        Tech societyTech = Tech.builder()
                .techKey("Tech_Society")
                .name("Society Tech")
                .type(TechType.SOCIETY)
                .era(1)
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of())
                .build();

        Tech discoveryTech = Tech.builder()
                .techKey("Tech_Discovery")
                .name("Discovery Tech")
                .type(TechType.DISCOVERY)
                .era(1)
                .descriptionLines(List.of())
                .unlocks(List.of())
                .techCoords(new TechCoords(0.1, 0.1))
                .factions(Set.of())
                .build();

        assertThat(TechMapper.toDto(societyTech).type()).isEqualTo("Society");
        assertThat(TechMapper.toDto(discoveryTech).type()).isEqualTo("Discovery");
    }

    @Test
    void toDto_shouldThrow_whenCoordsMissing() {
        Tech techWithoutCoords = Tech.builder()
                .techKey("Tech_NoCoords")
                .name("No Coords")
                .era(1)
                .type(TechType.SOCIETY)
                .techCoords(null)
                .descriptionLines(List.of())
                .unlocks(List.of())
                .factions(Set.of())
                .build();

        assertThatThrownBy(() -> TechMapper.toDto(techWithoutCoords))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("techCoords required");
    }
}