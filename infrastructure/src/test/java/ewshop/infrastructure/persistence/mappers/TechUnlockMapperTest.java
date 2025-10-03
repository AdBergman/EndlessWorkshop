package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.TechUnlock;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TechUnlockMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup
        ImprovementEntity improvementEntity = new ImprovementEntity();
        improvementEntity.setName("Test Improvement");
        // Initialize collections to prevent NullPointerException in the mapper
        improvementEntity.setEffects(List.of());
        improvementEntity.setCost(List.of());

        TechUnlockEntity entity = new TechUnlockEntity();
        entity.setUnlockText("Plain text unlock");
        entity.setImprovement(improvementEntity);

        // Act
        TechUnlock domain = TechUnlockMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getUnlockText()).isEqualTo("Plain text unlock");
        assertThat(domain.getImprovement()).isNotNull();
        assertThat(domain.getImprovement().getName()).isEqualTo("Test Improvement");
        // Assert other nested objects are null
        assertThat(domain.getDistrict()).isNull();
        assertThat(domain.getTreaty()).isNull();
    }

    @Test
    void testToEntityMapping() {
        // Setup
        // The builder in the domain object correctly initializes empty lists, so no change is needed here.
        Improvement improvement = Improvement.builder().name("Test Improvement").build();
        TechUnlock domain = TechUnlock.builder()
                .unlockText("Plain text unlock")
                .improvement(improvement)
                .build();

        // Act
        TechUnlockEntity entity = TechUnlockMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getUnlockText()).isEqualTo("Plain text unlock");
        assertThat(entity.getImprovement()).isNotNull();
        assertThat(entity.getImprovement().getName()).isEqualTo("Test Improvement");
        // Assert other nested objects are null
        assertThat(entity.getDistrict()).isNull();
        assertThat(entity.getTreaty()).isNull();
    }
}
