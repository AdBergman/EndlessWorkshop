package ewshop.facade.mapper;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.model.enums.Faction;
import ewshop.facade.dto.response.SavedTechBuildDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SavedTechBuildMapperTest {

    @Test
    @DisplayName("toDto should map all fields correctly when input is fully populated")
    void toDto_shouldMapAllFields() {
        // Given
        UUID uuid = UUID.randomUUID();
        LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
        SavedTechBuild savedTechBuild = SavedTechBuild.builder()
                .uuid(uuid)
                .name("My Awesome Tech Build")
                .faction(Faction.ASPECTS)
                .techIds(List.of("tech1", "tech2", "tech3"))
                .createdAt(createdAt)
                .build();

        // When
        SavedTechBuildDto dto = SavedTechBuildMapper.toDto(savedTechBuild);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.uuid()).isEqualTo(uuid);
        assertThat(dto.name()).isEqualTo("My Awesome Tech Build");
        assertThat(dto.selectedFaction()).isEqualTo("Aspects");
        assertThat(dto.techIds()).containsExactly("tech1", "tech2", "tech3");
        assertThat(dto.createdAt()).isEqualTo(createdAt);
    }

    @Test
    @DisplayName("toDto should return null when input SavedTechBuild is null")
    void toDto_shouldReturnNull_whenInputIsNull() {
        // Given
        SavedTechBuild savedTechBuild = null;

        // When
        SavedTechBuildDto dto = SavedTechBuildMapper.toDto(savedTechBuild);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("toDto should map empty lists correctly when input lists are empty")
    void toDto_shouldMapEmptyListsCorrectly() {
        // Given
        UUID uuid = UUID.randomUUID();
        LocalDateTime createdAt = LocalDateTime.now();
        SavedTechBuild savedTechBuild = SavedTechBuild.builder()
                .uuid(uuid)
                .name("Empty Tech Build")
                .faction(Faction.KIN)
                .techIds(List.of())
                .createdAt(createdAt)
                .build();

        // When
        SavedTechBuildDto dto = SavedTechBuildMapper.toDto(savedTechBuild);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.uuid()).isEqualTo(uuid);
        assertThat(dto.name()).isEqualTo("Empty Tech Build");
        assertThat(dto.selectedFaction()).isEqualTo("Kin");
        assertThat(dto.techIds()).isEmpty();
        assertThat(dto.createdAt()).isEqualTo(createdAt);
    }

    @Test
    @DisplayName("toDto should map null techIds list to empty list")
    void toDto_shouldMapNullTechIdsListToEmptyList() {
        // Given
        UUID uuid = UUID.randomUUID();
        LocalDateTime createdAt = LocalDateTime.now();
        SavedTechBuild savedTechBuild = SavedTechBuild.builder()
                .uuid(uuid)
                .name("Null TechIds Build")
                .faction(Faction.LORDS)
                .techIds(null)
                .createdAt(createdAt)
                .build();

        // When
        SavedTechBuildDto dto = SavedTechBuildMapper.toDto(savedTechBuild);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.uuid()).isEqualTo(uuid);
        assertThat(dto.name()).isEqualTo("Null TechIds Build");
        assertThat(dto.selectedFaction()).isEqualTo("Lords");
        assertThat(dto.techIds()).isEmpty();
        assertThat(dto.createdAt()).isEqualTo(createdAt);
    }
}
