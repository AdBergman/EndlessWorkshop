package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.District;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup
        DistrictEntity entity = new DistrictEntity();
        entity.setName("Test District");
        entity.setInfo(List.of("Info 1"));
        entity.setEffect("+1 Food");
        entity.setTileBonus(List.of("+1 on Forest"));
        entity.setAdjacencyBonus(List.of("+2 next to River"));
        entity.setPlacementPrereq("Must be on coast");

        // Act
        District domain = DistrictMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test District");
        assertThat(domain.getInfo()).containsExactly("Info 1");
        assertThat(domain.getEffect()).isEqualTo("+1 Food");
        assertThat(domain.getTileBonus()).containsExactly("+1 on Forest");
        assertThat(domain.getAdjacencyBonus()).containsExactly("+2 next to River");
        assertThat(domain.getPlacementPrereq()).isEqualTo("Must be on coast");
    }

    @Test
    void testToEntityMapping() {
        // Setup
        District domain = District.builder()
                .name("Test District")
                .info(List.of("Info 1"))
                .effect("+1 Food")
                .tileBonus(List.of("+1 on Forest"))
                .adjacencyBonus(List.of("+2 next to River"))
                .placementPrereq("Must be on coast")
                .build();

        // Act
        DistrictEntity entity = DistrictMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test District");
        assertThat(entity.getInfo()).containsExactly("Info 1");
        assertThat(entity.getEffect()).isEqualTo("+1 Food");
        assertThat(entity.getTileBonus()).containsExactly("+1 on Forest");
        assertThat(entity.getAdjacencyBonus()).containsExactly("+2 next to River");
        assertThat(entity.getPlacementPrereq()).isEqualTo("Must be on coast");
    }
}
