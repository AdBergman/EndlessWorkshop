package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.TechUnlock;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechMapperTest {

    private TechMapper techMapper;

    @BeforeEach
    void setUp() {
        var convertorMapper = new ConvertorMapper();
        var unitSpecializationMapper = new UnitSpecializationMapper();
        var treatyMapper = new TreatyMapper();
        var districtMapper = new DistrictMapper();
        var strategicCostMapper = new StrategicCostMapper();
        var improvementMapper = new ImprovementMapper(strategicCostMapper);
        var techUnlockMapper = new TechUnlockMapper(
                convertorMapper,
                unitSpecializationMapper,
                treatyMapper,
                districtMapper,
                improvementMapper
        );
        this.techMapper = new TechMapper(techUnlockMapper);
    }

    @Test
    void toDomain_shouldMapAllFields() {
        // Arrange
        TechUnlockEntity unlockEntity = new TechUnlockEntity();
        unlockEntity.setUnlockText("Unlocks Advanced Quarry");

        TechEntity prereqEntity = new TechEntity();
        prereqEntity.setName("Masonry");

        TechEntity entity = new TechEntity();
        entity.setName("Architecture");
        entity.setType(TechType.DISCOVERY);
        entity.setEra(2);
        entity.setEffects(List.of("Unlocks new buildings"));
        entity.setFactions(Set.of(Faction.ASPECTS));
        entity.setTechCoords(new TechCoords(50.5, 75.5));
        entity.setPrereq(prereqEntity);
        entity.setUnlocks(List.of(unlockEntity));

        // Act
        Tech domain = techMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Architecture");
        assertThat(domain.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(domain.getEra()).isEqualTo(2);
        assertThat(domain.getEffects()).containsExactly("Unlocks new buildings");
        assertThat(domain.getFactions()).containsExactly(Faction.ASPECTS);
        assertThat(domain.getTechCoords()).isNotNull();
        assertThat(domain.getTechCoords().getXPct()).isEqualTo(50.5);
        assertThat(domain.getTechCoords().getYPct()).isEqualTo(75.5);
        assertThat(domain.getPrereq()).isNotNull();
        assertThat(domain.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(domain.getUnlocks()).hasSize(1);
        assertThat(domain.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks Advanced Quarry");
        assertThat(domain.getExcludes()).isNull();
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Arrange
        Tech prereqDomain = Tech.builder().name("Masonry").build();
        TechUnlock unlockDomain = TechUnlock.builder().unlockText("Unlocks Advanced Quarry").build();

        Tech domain = Tech.builder()
                .name("Architecture")
                .type(TechType.DISCOVERY)
                .era(2)
                .effects(List.of("Unlocks new buildings"))
                .factions(Set.of(Faction.ASPECTS))
                .techCoords(new TechCoords(50.5, 75.5))
                .prereq(prereqDomain)
                .unlocks(List.of(unlockDomain))
                .build();

        // Act
        TechEntity entity = techMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Architecture");
        assertThat(entity.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(entity.getEra()).isEqualTo(2);
        assertThat(entity.getEffects()).containsExactly("Unlocks new buildings");
        assertThat(entity.getFactions()).containsExactlyInAnyOrder(Faction.ASPECTS);
        assertThat(entity.getTechCoords()).isNotNull();
        assertThat(entity.getTechCoords().getXPct()).isEqualTo(50.5);
        assertThat(entity.getTechCoords().getYPct()).isEqualTo(75.5);
        assertThat(entity.getPrereq()).isNotNull();
        assertThat(entity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(entity.getUnlocks()).hasSize(1);
        assertThat(entity.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks Advanced Quarry");
        assertThat(entity.getExcludes()).isNull();
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(techMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(techMapper.toEntity(null)).isNull();
    }

    @Test
    void toDomain_shouldMapNullListsToEmptyLists() {
        // Setup
        TechEntity entity = new TechEntity();
        entity.setEffects(null);
        entity.setFactions(null);
        entity.setUnlocks(null);

        // Act
        Tech domain = techMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getEffects()).isNotNull().isEmpty();
        assertThat(domain.getFactions()).isNotNull().isEmpty();
        assertThat(domain.getUnlocks()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullListsToEmptyLists() {
        // Setup
        Tech domain = Tech.builder()
                .effects(null)
                .factions(null)
                .unlocks(null)
                .build();

        // Act
        TechEntity entity = techMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getEffects()).isNotNull().isEmpty();
        assertThat(entity.getFactions()).isNotNull().isEmpty();
        assertThat(entity.getUnlocks()).isNotNull().isEmpty();
    }

    @Test
    void updateReferences_shouldUpdatePrereqAndExcludes() {
        // Arrange
        Tech prereqDomain = Tech.builder().name("Masonry").build();
        Tech excludesDomain = Tech.builder().name("AlternativeTech").build();
        Tech domain = Tech.builder()
                .name("Architecture")
                .prereq(prereqDomain)
                .excludes(excludesDomain)
                .build();

        TechEntity entity = new TechEntity();
        entity.setName("Architecture");

        TechEntity prereqEntity = new TechEntity();
        prereqEntity.setName("Masonry");

        TechEntity excludesEntity = new TechEntity();
        excludesEntity.setName("AlternativeTech");

        Map<String, TechEntity> savedMap = Map.of(
                "Masonry", prereqEntity,
                "AlternativeTech", excludesEntity
        );

        // Act
        techMapper.updateReferences(entity, domain, savedMap);

        // Assert
        assertThat(entity.getPrereq()).isNotNull();
        assertThat(entity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(entity.getExcludes()).isNotNull();
        assertThat(entity.getExcludes().getName()).isEqualTo("AlternativeTech");
    }
}
