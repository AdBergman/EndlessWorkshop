package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitCost;
import ewshop.domain.entity.UnitSkill;
import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.entity.enums.CostType;
import ewshop.domain.entity.enums.FIDSI;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.UnitCostEmbeddable;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationSkillEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UnitSpecializationMapperTest {

    private UnitSpecializationMapper unitSpecializationMapper;

    @BeforeEach
    void setUp() {
        unitSpecializationMapper = new UnitSpecializationMapper();
    }

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        UnitSkillEntity skillEntity = new UnitSkillEntity();
        skillEntity.setName("Charge");
        skillEntity.setType("Combat");
        skillEntity.setTarget("Enemy");
        skillEntity.setAmount(10);

        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName("Knight");
        entity.setDescription("A heavy cavalry unit.");
        entity.setType(ewshop.domain.entity.enums.UnitType.INFANTRY);
        entity.setHealth(150);
        entity.setDefense(10);
        entity.setMinDamage(20);
        entity.setMaxDamage(30);
        entity.setMovementPoints(4);
        entity.setFaction(Faction.ASPECTS.name());
        entity.setTier(2);
        entity.setUpkeep(5);
        entity.setArtId("art_knight");
        entity.setUpgradesTo(Set.of("Lancer"));

        UnitCostEmbeddable cost1 = new UnitCostEmbeddable(100, FIDSI.INDUSTRY, null);
        UnitCostEmbeddable cost2 = new UnitCostEmbeddable(10, null, StrategicResourceType.TITANIUM);
        entity.setCosts(Set.of(cost1, cost2));

        UnitSpecializationSkillEntity skillJoin = new UnitSpecializationSkillEntity(entity, skillEntity, null);
        entity.setUnitSkills(Set.of(skillJoin));

        // Act
        UnitSpecialization domain = unitSpecializationMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Knight");
        assertThat(domain.getDescription()).isEqualTo("A heavy cavalry unit.");
        assertThat(domain.getType()).isEqualTo(ewshop.domain.entity.enums.UnitType.INFANTRY);
        assertThat(domain.getHealth()).isEqualTo(150);
        assertThat(domain.getDefense()).isEqualTo(10);
        assertThat(domain.getMinDamage()).isEqualTo(20);
        assertThat(domain.getMaxDamage()).isEqualTo(30);
        assertThat(domain.getMovementPoints()).isEqualTo(4);
        assertThat(domain.getFaction()).isEqualTo(Faction.ASPECTS);
        assertThat(domain.getMinorFaction()).isNull();
        assertThat(domain.getTier()).isEqualTo(2);
        assertThat(domain.getUpkeep()).isEqualTo(5);
        assertThat(domain.getArtId()).isEqualTo("art_knight");
        assertThat(domain.getUpgradesTo()).containsExactly("Lancer");

        assertThat(domain.getCosts()).hasSize(2).containsExactlyInAnyOrder(
                UnitCost.builder().amount(100).type(CostType.INDUSTRY).build(),
                UnitCost.builder().amount(10).type(CostType.TITANIUM).build()
        );

        assertThat(domain.getSkills()).hasSize(1);
        UnitSkill mappedSkill = domain.getSkills().iterator().next();
        assertThat(mappedSkill.getName()).isEqualTo("Charge");
        assertThat(mappedSkill.getAmount()).isEqualTo(10);
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup
        UnitSkill skillDomain = UnitSkill.builder().name("Charge").build();
        UnitSpecialization domain = UnitSpecialization.builder()
                .name("Knight")
                .description("A heavy cavalry unit.")
                .type(ewshop.domain.entity.enums.UnitType.INFANTRY)
                .health(150)
                .defense(10)
                .minDamage(20)
                .maxDamage(30)
                .movementPoints(4)
                .faction(Faction.ASPECTS)
                .tier(2)
                .upkeep(5)
                .artId("art_knight")
                .upgradesTo(Set.of("Lancer"))
                .cost(List.of(
                        UnitCost.builder().amount(100).type(CostType.INDUSTRY).build(),
                        UnitCost.builder().amount(10).type(CostType.TITANIUM).build()
                ))
                .skills(Set.of(skillDomain))
                .build();

        UnitSkillEntity persistedSkill = new UnitSkillEntity();
        persistedSkill.setName("Charge");
        Set<UnitSkillEntity> persistedSkills = Set.of(persistedSkill);

        // Act
        UnitSpecializationEntity entity = unitSpecializationMapper.toEntity(domain, persistedSkills);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Knight");
        assertThat(entity.getFaction()).isEqualTo(Faction.ASPECTS.name());
        assertThat(entity.getUpgradesTo()).containsExactly("Lancer");

        assertThat(entity.getCosts()).hasSize(2).containsExactlyInAnyOrder(
                new UnitCostEmbeddable(100, FIDSI.INDUSTRY, null),
                new UnitCostEmbeddable(10, null, StrategicResourceType.TITANIUM)
        );

        assertThat(entity.getUnitSkills()).hasSize(1);
        UnitSpecializationSkillEntity mappedSkillJoin = entity.getUnitSkills().iterator().next();
        assertThat(mappedSkillJoin.getSkill().getName()).isEqualTo("Charge");
    }

    @Test
    void toDomain_shouldHandleNullCollectionsGracefully() {
        // Setup
        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName("Test Unit");
        entity.setCosts(null);
        entity.setUnitSkills(null);
        entity.setUpgradesTo(null);

        // Act
        UnitSpecialization domain = unitSpecializationMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getCosts()).isNotNull().isEmpty();
        assertThat(domain.getSkills()).isNotNull().isEmpty();
        assertThat(domain.getUpgradesTo()).isNotNull().isEmpty();
    }

    @Test
    void toDomain_shouldMapMinorFactionCorrectly() {
        // Setup
        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName("Sisters of Mercy");
        entity.setFaction("MinorFaction_Sisters");

        // Act
        UnitSpecialization domain = unitSpecializationMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getFaction()).isNull();
        assertThat(domain.getMinorFaction()).isEqualTo("MinorFaction_Sisters");
    }
    
    @Test
    void toEntity_shouldMapMinorFactionCorrectly() {
        // Setup
        UnitSpecialization domain = UnitSpecialization.builder()
                .name("Sisters of Mercy")
                .minorFaction("MinorFaction_Sisters")
                .build();

        // Act
        UnitSpecializationEntity entity = unitSpecializationMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getFaction()).isEqualTo("MinorFaction_Sisters");
    }

    @Test
    void toEntity_shouldThrowExceptionForMissingPersistedSkill() {
        // Setup
        UnitSpecialization domain = UnitSpecialization.builder()
                .name("Knight")
                .skills(Set.of(UnitSkill.builder().name("NonExistentSkill").build()))
                .build();

        // Act & Assert
        assertThatThrownBy(() -> unitSpecializationMapper.toEntity(domain, Collections.emptySet()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("UnitSkill 'NonExistentSkill' not found in persisted set");
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(unitSpecializationMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(unitSpecializationMapper.toEntity(null)).isNull();
    }
}
