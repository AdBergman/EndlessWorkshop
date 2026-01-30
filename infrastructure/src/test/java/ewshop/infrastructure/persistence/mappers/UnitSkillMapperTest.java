package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.UnitSkill;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UnitSkillMapperTest {

    private final UnitSkillMapper unitSkillMapper = new UnitSkillMapper();

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        UnitSkillEntity entity = new UnitSkillEntity();
        entity.setName("Test Skill");
        entity.setAmount(10);
        entity.setTarget("Enemy");
        entity.setType("Damage");

        // Act
        UnitSkill domain = unitSkillMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Skill");
        assertThat(domain.getAmount()).isEqualTo(10);
        assertThat(domain.getTarget()).isEqualTo("Enemy");
        assertThat(domain.getType()).isEqualTo("Damage");
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup
        UnitSkill domain = UnitSkill.builder()
                .name("Test Skill")
                .amount(10)
                .target("Enemy")
                .type("Damage")
                .build();

        // Act
        UnitSkillEntity entity = unitSkillMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Skill");
        assertThat(entity.getAmount()).isEqualTo(10);
        assertThat(entity.getTarget()).isEqualTo("Enemy");
        assertThat(entity.getType()).isEqualTo("Damage");
    }

    @Test
    void toDomain_shouldHandleNulls() {
        // Setup
        UnitSkillEntity entity = new UnitSkillEntity();
        entity.setName("Test Skill");
        entity.setAmount(null);
        entity.setTarget(null);
        entity.setType(null);

        // Act
        UnitSkill domain = unitSkillMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Skill");
        assertThat(domain.getAmount()).isEqualTo(0);
        assertThat(domain.getTarget()).isEqualTo("");
        assertThat(domain.getType()).isEqualTo("");
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(unitSkillMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(unitSkillMapper.toEntity(null)).isNull();
    }
}
