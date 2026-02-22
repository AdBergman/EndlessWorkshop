package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.UnitCost;
import ewshop.domain.model.UnitSkill;
import ewshop.domain.model.UnitSpecialization;
import ewshop.domain.model.enums.CostType;
import ewshop.domain.model.enums.FIDSI;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.UnitCostEmbeddableLegacy;
import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntityLegacy;
import ewshop.infrastructure.persistence.entities.UnitSpecializationSkillEntityLegacy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UnitSpecializationMapperLegacyTest {

    private UnitSpecializationMapperLegacy unitSpecializationMapperLegacy;

    @BeforeEach
    void setUp() {
        unitSpecializationMapperLegacy = new UnitSpecializationMapperLegacy();
    }

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        UnitSkillEntityLegacy skillEntity = new UnitSkillEntityLegacy();
        skillEntity.setName("Charge");
        skillEntity.setType("Combat");
        skillEntity.setTarget("Enemy");
        skillEntity.setAmount(10);

        UnitSpecializationEntityLegacy entity = new UnitSpecializationEntityLegacy();
        entity.setName("Knight");
        entity.setDescription("A heavy cavalry unit.");
        entity.setType(ewshop.domain.model.enums.UnitType.INFANTRY);
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

        UnitCostEmbeddableLegacy cost1 = new UnitCostEmbeddableLegacy(100, FIDSI.INDUSTRY, null);
        UnitCostEmbeddableLegacy cost2 = new UnitCostEmbeddableLegacy(10, null, StrategicResourceType.TITANIUM);
        entity.setCosts(Set.of(cost1, cost2));

        UnitSpecializationSkillEntityLegacy skillJoin = new UnitSpecializationSkillEntityLegacy(entity, skillEntity, null);
        entity.setUnitSkills(Set.of(skillJoin));

        // Act
        UnitSpecialization domain = unitSpecializationMapperLegacy.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Knight");
        assertThat(domain.getDescription()).isEqualTo("A heavy cavalry unit.");
        assertThat(domain.getType()).isEqualTo(ewshop.domain.model.enums.UnitType.INFANTRY);
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
                .type(ewshop.domain.model.enums.UnitType.INFANTRY)
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

        UnitSkillEntityLegacy persistedSkill = new UnitSkillEntityLegacy();
        persistedSkill.setName("Charge");
        Set<UnitSkillEntityLegacy> persistedSkills = Set.of(persistedSkill);

        // Act
        UnitSpecializationEntityLegacy entity = unitSpecializationMapperLegacy.toEntity(domain, persistedSkills);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Knight");
        assertThat(entity.getFaction()).isEqualTo(Faction.ASPECTS.name());
        assertThat(entity.getUpgradesTo()).containsExactly("Lancer");

        assertThat(entity.getCosts()).hasSize(2).containsExactlyInAnyOrder(
                new UnitCostEmbeddableLegacy(100, FIDSI.INDUSTRY, null),
                new UnitCostEmbeddableLegacy(10, null, StrategicResourceType.TITANIUM)
        );

        assertThat(entity.getUnitSkills()).hasSize(1);
        UnitSpecializationSkillEntityLegacy mappedSkillJoin = entity.getUnitSkills().iterator().next();
        assertThat(mappedSkillJoin.getSkill().getName()).isEqualTo("Charge");
    }

    @Test
    void toDomain_shouldHandleNullCollectionsGracefully() {
        // Setup
        UnitSpecializationEntityLegacy entity = new UnitSpecializationEntityLegacy();
        entity.setName("Test Unit");
        entity.setCosts(null);
        entity.setUnitSkills(null);
        entity.setUpgradesTo(null);

        // Act
        UnitSpecialization domain = unitSpecializationMapperLegacy.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getCosts()).isNotNull().isEmpty();
        assertThat(domain.getSkills()).isNotNull().isEmpty();
        assertThat(domain.getUpgradesTo()).isNotNull().isEmpty();
    }

    @Test
    void toDomain_shouldMapMinorFactionCorrectly() {
        // Setup
        UnitSpecializationEntityLegacy entity = new UnitSpecializationEntityLegacy();
        entity.setName("Sisters of Mercy");
        entity.setFaction("MinorFaction_Sisters");

        // Act
        UnitSpecialization domain = unitSpecializationMapperLegacy.toDomain(entity);

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
        UnitSpecializationEntityLegacy entity = unitSpecializationMapperLegacy.toEntity(domain);

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
        assertThatThrownBy(() -> unitSpecializationMapperLegacy.toEntity(domain, Collections.emptySet()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("UnitSkill 'NonExistentSkill' not found in persisted set");
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(unitSpecializationMapperLegacy.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(unitSpecializationMapperLegacy.toEntity(null)).isNull();
    }
}
