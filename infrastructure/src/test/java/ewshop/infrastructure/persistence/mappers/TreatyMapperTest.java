package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Treaty;
import ewshop.infrastructure.persistence.entities.TreatyEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TreatyMapperTest {

    private final TreatyMapper treatyMapper = new TreatyMapper();

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        TreatyEntity entity = new TreatyEntity();
        entity.setName("Test Treaty");
        entity.setDescription("Test Description");

        // Act
        Treaty domain = treatyMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Treaty");
        assertThat(domain.getDescription()).isEqualTo("Test Description");
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup
        Treaty domain = Treaty.builder()
                .name("Test Treaty")
                .description("Test Description")
                .build();

        // Act
        TreatyEntity entity = treatyMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Treaty");
        assertThat(entity.getDescription()).isEqualTo("Test Description");
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(treatyMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(treatyMapper.toEntity(null)).isNull();
    }
}
