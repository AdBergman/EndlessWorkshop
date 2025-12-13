package ewshop.facade.mapper;

import ewshop.domain.entity.*;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.entity.enums.UnitType;
import ewshop.facade.dto.response.TechDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechMapperTest {

    // Dummy Treaty class for testing purposes, as it's used in TechUnlock but not provided
    static class Treaty {
        private final String name;

        public Treaty(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    @Test
    @DisplayName("toDto should map all fields correctly when input is fully populated")
    void toDto_shouldMapAllFields() {
        // Given
        Tech prereqTech = Tech.builder().name("Prereq Tech").build();
        Tech excludesTech = Tech.builder().name("Excludes Tech").build();

        Improvement improvement = Improvement.builder().name("Advanced Farm").build();
        District district = District.builder().name("Research District").build();
        Convertor convertor = Convertor.builder().name("Energy Converter").build();
        UnitSpecialization unitSpecialization = UnitSpecialization.builder().name("Elite Infantry").type(UnitType.INFANTRY).build();

        TechUnlock unlockImprovement = TechUnlock.builder().improvement(improvement).build();
        TechUnlock unlockDistrict = TechUnlock.builder().district(district).build();
        TechUnlock unlockConvertor = TechUnlock.builder().convertor(convertor).build();
        TechUnlock unlockUnit = TechUnlock.builder().unitSpecialization(unitSpecialization).build();
        TechUnlock unlockText = TechUnlock.builder().unlockText("New Technology Unlocked").build();

        Tech tech = Tech.builder()
                .name("Advanced Robotics")
                .era(4)
                .type(TechType.DISCOVERY)
                .effects(List.of("Production +10%", "New Unit Available"))
                .techCoords(new TechCoords(0.5, 0.75))
                .prereq(prereqTech)
                .excludes(excludesTech)
                .factions(Set.of(Faction.ASPECTS, Faction.LORDS))
                .unlocks(List.of(unlockImprovement, unlockDistrict, unlockConvertor, unlockUnit, unlockText))
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Advanced Robotics");
        assertThat(dto.era()).isEqualTo(4);
        assertThat(dto.type()).isEqualTo("Discovery");
        assertThat(dto.unlocks()).containsExactlyInAnyOrder(
                "Improvement: Advanced Farm",
                "District: Research District",
                "Convertor: Energy Converter",
                "Unit: Elite Infantry",
                "Treaty: Trade Agreement",
                "New Technology Unlocked"
        );
        assertThat(dto.effects()).containsExactly("Production +10%", "New Unit Available");
        assertThat(dto.prereq()).isEqualTo("Prereq Tech");
        assertThat(dto.factions()).containsExactly("Aspects", "Lords"); // Sorted alphabetically
        assertThat(dto.excludes()).isEqualTo("Excludes Tech");
        assertThat(dto.coords()).isNotNull();
        assertThat(dto.coords().xPct()).isEqualTo(0.5);
        assertThat(dto.coords().yPct()).isEqualTo(0.75);
    }

    @Test
    @DisplayName("toDto should return null when input Tech is null")
    void toDto_shouldReturnNull_whenInputIsNull() {
        // Given
        Tech tech = null;

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("toDto should map empty lists correctly when input lists are empty")
    void toDto_shouldMapEmptyListsCorrectly() {
        // Given
        Tech tech = Tech.builder()
                .name("Basic Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .effects(List.of())
                .techCoords(new TechCoords(0.1, 0.2))
                .factions(Set.of())
                .unlocks(List.of())
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Basic Tech");
        assertThat(dto.era()).isEqualTo(1);
        assertThat(dto.type()).isEqualTo("Society");
        assertThat(dto.unlocks()).isEmpty();
        assertThat(dto.effects()).isEmpty();
        assertThat(dto.prereq()).isNull();
        assertThat(dto.factions()).isEmpty();
        assertThat(dto.excludes()).isNull();
        assertThat(dto.coords()).isNotNull();
        assertThat(dto.coords().xPct()).isEqualTo(0.1);
        assertThat(dto.coords().yPct()).isEqualTo(0.2);
    }

    @Test
    @DisplayName("toDto should handle null prereq and excludes fields")
    void toDto_shouldHandleNullPrereqAndExcludes() {
        // Given
        Tech tech = Tech.builder()
                .name("Tech without prereq or excludes")
                .era(1)
                .type(TechType.ECONOMY)
                .prereq(null)
                .excludes(null)
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.prereq()).isNull();
        assertThat(dto.excludes()).isNull();
    }

    @Test
    @DisplayName("toDto should handle null coords field")
    void toDto_shouldHandleNullCoords() {
        // Given
        Tech tech = Tech.builder()
                .name("Tech without coords")
                .era(1)
                .type(TechType.DEFENSE)
                .techCoords(null)
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.coords()).isNull();
    }

    @Test
    @DisplayName("toDto should handle null factions and effects lists")
    void toDto_shouldHandleNullFactionsAndEffects() {
        // Given
        Tech tech = Tech.builder()
                .name("Tech with null lists")
                .era(1)
                .type(TechType.SOCIETY)
                .effects(null)
                .factions(null)
                .unlocks(null)
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.effects()).isEmpty();
        assertThat(dto.factions()).isEmpty();
        assertThat(dto.unlocks()).isEmpty();
    }

    @Test
    @DisplayName("toDto should format factions and sort them alphabetically")
    void toDto_shouldFormatFactionsAndSortThem() {
        // Given
        Tech tech = Tech.builder()
                .name("Faction Test Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .factions(Set.of(Faction.NECROPHAGES, Faction.KIN, Faction.TAHUK))
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.factions()).containsExactly("Kin", "Necrophages", "Tahuk"); // Sorted alphabetically
    }

    @Test
    @DisplayName("toDto should format TechType correctly")
    void toDto_shouldFormatTechTypeCorrectly() {
        // Given
        Tech techSociety = Tech.builder().name("Society Tech").type(TechType.SOCIETY).era(1).build();
        Tech techDiscovery = Tech.builder().name("Discovery Tech").type(TechType.DISCOVERY).era(1).build();
        Tech techNullType = Tech.builder().name("Null Type Tech").type(null).era(1).build();

        // When
        TechDto dtoSociety = TechMapper.toDto(techSociety);
        TechDto dtoDiscovery = TechMapper.toDto(techDiscovery);
        TechDto dtoNullType = TechMapper.toDto(techNullType);

        // Then
        assertThat(dtoSociety.type()).isEqualTo("Society");
        assertThat(dtoDiscovery.type()).isEqualTo("Discovery");
        assertThat(dtoNullType.type()).isEqualTo("");
    }

    @Test
    @DisplayName("toDto should map unlocks correctly with different types and nulls")
    void toDto_shouldMapUnlocksCorrectly_withDifferentTypes() {
        // Given
        Improvement improvement = Improvement.builder().name("Basic Improvement").build();
        District district = District.builder().name("Basic District").build();

        TechUnlock unlockImprovement = TechUnlock.builder().improvement(improvement).build();
        TechUnlock unlockDistrict = TechUnlock.builder().district(district).build();
        TechUnlock unlockText = TechUnlock.builder().unlockText("Generic Unlock").build();
        TechUnlock unlockNull = TechUnlock.builder().build(); // All fields null

        Tech tech = Tech.builder()
                .name("Unlock Test Tech")
                .era(1)
                .type(TechType.SOCIETY)
                .unlocks(List.of(unlockImprovement, unlockDistrict, unlockText, unlockNull))
                .build();

        // When
        TechDto dto = TechMapper.toDto(tech);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.unlocks()).containsExactlyInAnyOrder(
                "Improvement: Basic Improvement",
                "District: Basic District",
                "Generic Unlock"
        );
        // Ensure that the unlockNull (which results in "(unknown unlock)") is filtered out
        assertThat(dto.unlocks()).doesNotContain("(unknown unlock)");
    }
}
