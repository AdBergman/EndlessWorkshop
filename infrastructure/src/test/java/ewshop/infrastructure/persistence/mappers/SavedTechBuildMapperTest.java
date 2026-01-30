package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.model.enums.Faction;
import ewshop.infrastructure.persistence.entities.SavedTechBuildEntity;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SavedTechBuildMapperTest {

    private final SavedTechBuildMapper savedTechBuildMapper = new SavedTechBuildMapper();

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        UUID uuid = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        SavedTechBuildEntity entity = new SavedTechBuildEntity();
        entity.setUuid(uuid);
        entity.setName("Test Build");
        entity.setFaction(Faction.ASPECTS);
        entity.setTechIds(List.of("tech1", "tech2"));
        entity.setCreatedAt(now);

        // Act
        SavedTechBuild domain = savedTechBuildMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getUuid()).isEqualTo(uuid);
        assertThat(domain.getName()).isEqualTo("Test Build");
        assertThat(domain.getFaction()).isEqualTo(Faction.ASPECTS);
        assertThat(domain.getTechIds()).containsExactly("tech1", "tech2");
        assertThat(domain.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup
        UUID uuid = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        SavedTechBuild domain = SavedTechBuild.builder()
                .uuid(uuid)
                .name("Test Build")
                .faction(Faction.ASPECTS)
                .techIds(List.of("tech1", "tech2"))
                .createdAt(now)
                .build();

        // Act
        SavedTechBuildEntity entity = savedTechBuildMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getUuid()).isEqualTo(uuid);
        assertThat(entity.getName()).isEqualTo("Test Build");
        assertThat(entity.getFaction()).isEqualTo(Faction.ASPECTS);
        assertThat(entity.getTechIds()).containsExactly("tech1", "tech2");
        assertThat(entity.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void toDomain_shouldMapNullListsToEmptyLists() {
        // Setup
        SavedTechBuildEntity entity = new SavedTechBuildEntity();
        entity.setTechIds(null);

        // Act
        SavedTechBuild domain = savedTechBuildMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getTechIds()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullListsToEmptyLists() {
        // Setup
        SavedTechBuild domain = SavedTechBuild.builder()
                .techIds(null)
                .build();

        // Act
        SavedTechBuildEntity entity = savedTechBuildMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getTechIds()).isNotNull().isEmpty();
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(savedTechBuildMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(savedTechBuildMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_shouldGenerateUuidIfNull() {
        // Setup
        SavedTechBuild domain = SavedTechBuild.builder()
                .uuid(null)
                .build();

        // Act
        SavedTechBuildEntity entity = savedTechBuildMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getUuid()).isNotNull();
    }
}
