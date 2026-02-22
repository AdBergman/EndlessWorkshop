package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.UnitSkill;
import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UnitSkillMapperLegacyTest {

    private final UnitSkillMapperLegacy unitSkillMapperLegacy = new UnitSkillMapperLegacy();

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        UnitSkillEntityLegacy entity = new UnitSkillEntityLegacy();
        entity.setName("Test Skill");
        entity.setAmount(10);
        entity.setTarget("Enemy");
        entity.setType("Damage");

        // Act
        UnitSkill domain = unitSkillMapperLegacy.toDomain(entity);

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
        UnitSkillEntityLegacy entity = unitSkillMapperLegacy.toEntity(domain);

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
        UnitSkillEntityLegacy entity = new UnitSkillEntityLegacy();
        entity.setName("Test Skill");
        entity.setAmount(null);
        entity.setTarget(null);
        entity.setType(null);

        // Act
        UnitSkill domain = unitSkillMapperLegacy.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Skill");
        assertThat(domain.getAmount()).isEqualTo(0);
        assertThat(domain.getTarget()).isEqualTo("");
        assertThat(domain.getType()).isEqualTo("");
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(unitSkillMapperLegacy.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(unitSkillMapperLegacy.toEntity(null)).isNull();
    }
}
