package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.District;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictMapperTest {

    private final DistrictMapper districtMapper = new DistrictMapper();

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup: Create an entity with all fields set
        DistrictEntity entity = new DistrictEntity();
        entity.setName("Test District");
        entity.setInfo(List.of("Info 1"));
        entity.setEffect("+1 Food");
        entity.setTileBonus(List.of("+1 Production on Hills"));
        entity.setAdjacencyBonus(List.of("+1 Science per adjacent University"));
        entity.setPlacementPrereq("Must be placed on a River");

        // Act: Map to domain
        District domain = districtMapper.toDomain(entity);

        // Assert: Check all fields
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test District");
        assertThat(domain.getInfo()).containsExactly("Info 1");
        assertThat(domain.getEffect()).isEqualTo("+1 Food");
        assertThat(domain.getTileBonus()).containsExactly("+1 Production on Hills");
        assertThat(domain.getAdjacencyBonus()).containsExactly("+1 Science per adjacent University");
        assertThat(domain.getPlacementPrereq()).isEqualTo("Must be placed on a River");
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup: Create a domain object with all fields set
        District domain = District.builder()
                .name("Test District")
                .info(List.of("Info 1"))
                .effect("+1 Food")
                .tileBonus(List.of("+1 Production on Hills"))
                .adjacencyBonus(List.of("+1 Science per adjacent University"))
                .placementPrereq("Must be placed on a River")
                .build();

        // Act: Map to entity
        DistrictEntity entity = districtMapper.toEntity(domain);

        // Assert: Check all fields
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test District");
        assertThat(entity.getInfo()).containsExactly("Info 1");
        assertThat(entity.getEffect()).isEqualTo("+1 Food");
        assertThat(entity.getTileBonus()).containsExactly("+1 Production on Hills");
        assertThat(entity.getAdjacencyBonus()).containsExactly("+1 Science per adjacent University");
        assertThat(entity.getPlacementPrereq()).isEqualTo("Must be placed on a River");
    }

    @Test
    void toDomain_shouldMapNullListsToEmptyLists() {
        // Setup
        DistrictEntity entity = new DistrictEntity();
        entity.setName("Test District");
        entity.setInfo(null);
        entity.setTileBonus(null);
        entity.setAdjacencyBonus(null);

        // Act
        District domain = districtMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getInfo()).isNotNull().isEmpty();
        assertThat(domain.getTileBonus()).isNotNull().isEmpty();
        assertThat(domain.getAdjacencyBonus()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullListsToEmptyLists() {
        // Setup
        District domain = District.builder()
                .name("Test District")
                .info(null)
                .tileBonus(null)
                .adjacencyBonus(null)
                .build();

        // Act
        DistrictEntity entity = districtMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getInfo()).isNotNull().isEmpty();
        assertThat(entity.getTileBonus()).isNotNull().isEmpty();
        assertThat(entity.getAdjacencyBonus()).isNotNull().isEmpty();
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(districtMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(districtMapper.toEntity(null)).isNull();
    }
}
