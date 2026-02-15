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
        DistrictEntity entity = new DistrictEntity();
        entity.setDistrictKey("Aspect_District_Tier1_Science");
        entity.setDisplayName("Laboratory");
        entity.setCategory("Science");
        entity.setDescriptionLines(List.of(
                "+1 [ScienceColored] on Tile producing at least two types of yields",
                "+2 [ScienceColored] Science per District Level"
        ));

        District domain = districtMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getDistrictKey()).isEqualTo("Aspect_District_Tier1_Science");
        assertThat(domain.getDisplayName()).isEqualTo("Laboratory");
        assertThat(domain.getCategory()).isEqualTo("Science");
        assertThat(domain.getDescriptionLines()).containsExactly(
                "+1 [ScienceColored] on Tile producing at least two types of yields",
                "+2 [ScienceColored] Science per District Level"
        );
    }

    @Test
    void toEntity_shouldMapAllFields() {
        District domain = District.builder()
                .districtKey("Aspect_District_Tier1_Science")
                .displayName("Laboratory")
                .category("Science")
                .descriptionLines(List.of(
                        "+1 [ScienceColored] on Tile producing at least two types of yields",
                        "+2 [ScienceColored] Science per District Level"
                ))
                .build();

        DistrictEntity entity = districtMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getDistrictKey()).isEqualTo("Aspect_District_Tier1_Science");
        assertThat(entity.getDisplayName()).isEqualTo("Laboratory");
        assertThat(entity.getCategory()).isEqualTo("Science");
        assertThat(entity.getDescriptionLines()).containsExactly(
                "+1 [ScienceColored] on Tile producing at least two types of yields",
                "+2 [ScienceColored] Science per District Level"
        );
    }

    @Test
    void toDomain_shouldMapNullListsToEmptyLists() {
        DistrictEntity entity = new DistrictEntity();
        entity.setDistrictKey("Aspect_District_Tier1_Science");
        entity.setDisplayName("Laboratory");
        entity.setCategory("Science");
        entity.setDescriptionLines(null);

        District domain = districtMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getDescriptionLines()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullListsToEmptyLists() {
        District domain = District.builder()
                .districtKey("Aspect_District_Tier1_Science")
                .displayName("Laboratory")
                .category("Science")
                .descriptionLines(null)
                .build();

        DistrictEntity entity = districtMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getDescriptionLines()).isNotNull().isEmpty();
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