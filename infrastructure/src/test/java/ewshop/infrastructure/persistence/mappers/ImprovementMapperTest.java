package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Improvement;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementMapperTest {

    private final ImprovementMapper improvementMapper = new ImprovementMapper();

    @Test
    void toDomain_shouldMapAllFields() {
        ImprovementEntity entity = new ImprovementEntity();
        entity.setConstructibleKey("Improvement_Test_01");
        entity.setDisplayName("Test Improvement");
        entity.setCategory("Economy");
        entity.setDescriptionLines(List.of("Line 1", "Line 2"));

        Improvement domain = improvementMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getConstructibleKey()).isEqualTo("Improvement_Test_01");
        assertThat(domain.getDisplayName()).isEqualTo("Test Improvement");
        assertThat(domain.getCategory()).isEqualTo("Economy");
        assertThat(domain.getDescriptionLines()).containsExactly("Line 1", "Line 2");
    }

    @Test
    void toEntity_shouldMapAllFields() {
        Improvement domain = Improvement.builder()
                .constructibleKey("Improvement_Test_01")
                .displayName("Test Improvement")
                .category("Economy")
                .descriptionLines(List.of("Line 1", "Line 2"))
                .build();

        ImprovementEntity entity = improvementMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getConstructibleKey()).isEqualTo("Improvement_Test_01");
        assertThat(entity.getDisplayName()).isEqualTo("Test Improvement");
        assertThat(entity.getCategory()).isEqualTo("Economy");
        assertThat(entity.getDescriptionLines()).containsExactly("Line 1", "Line 2");
    }

    @Test
    void toDomain_shouldHandleNullDescriptionLinesAsEmptyList() {
        ImprovementEntity entity = new ImprovementEntity();
        entity.setConstructibleKey("Improvement_Test_01");
        entity.setDisplayName("Test Improvement");
        entity.setCategory(null);
        entity.setDescriptionLines(null);

        Improvement domain = improvementMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getDescriptionLines()).isNotNull();
        // Depending on your Improvement.Builder impl, this will be either empty or copied.
        // With your current builder, null should become empty.
        assertThat(domain.getDescriptionLines()).isEmpty();
    }

    @Test
    void toEntity_shouldHandleNullDescriptionLinesAsEmptyList() {
        Improvement domain = Improvement.builder()
                .constructibleKey("Improvement_Test_01")
                .displayName("Test Improvement")
                .category(null)
                .descriptionLines(null)
                .build();

        ImprovementEntity entity = improvementMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getDescriptionLines()).isNotNull();
        assertThat(entity.getDescriptionLines()).isEmpty();
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(improvementMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(improvementMapper.toEntity(null)).isNull();
    }
}