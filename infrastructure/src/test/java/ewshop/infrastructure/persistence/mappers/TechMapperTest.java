//package ewshop.infrastructure.persistence.mappers;
//
//import ewshop.domain.entity.Tech;
//import ewshop.domain.entity.TechCoords;
//import ewshop.domain.entity.TechUnlock;
//import ewshop.domain.entity.enums.Faction;
//import ewshop.domain.entity.enums.TechType;
//import ewshop.infrastructure.persistence.entities.TechEntity;
//import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//
//import java.util.List;
//import java.util.Set;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//class TechMapperTest {
//
//    private TechMapper techMapper;
//
//    @BeforeEach
//    void setUp() {
//        // Initialize full dependency chain for TechMapper
//        var convertorMapper = new ConvertorMapper();
//        var unitSpecializationMapper = new UnitSpecializationMapper();
//        var treatyMapper = new TreatyMapper();
//        var districtMapper = new DistrictMapper();
//        var strategicCostMapper = new StrategicCostMapper();
//        var improvementMapper = new ImprovementMapper(strategicCostMapper);
//        var techUnlockMapper = new TechUnlockMapper(
//                convertorMapper,
//                unitSpecializationMapper,
//                treatyMapper,
//                districtMapper,
//                improvementMapper
//        );
//        this.techMapper = new TechMapper(techUnlockMapper);
//    }
//
//    @Test
//    void toDomain_shouldMapAllFields() {
//        // Arrange: fully populated entity
//        TechUnlockEntity unlockEntity = new TechUnlockEntity();
//        unlockEntity.setUnlockText("Unlocks Advanced Quarry");
//
//        TechEntity prereqEntity = new TechEntity();
//        prereqEntity.setName("Masonry");
//
//        TechEntity entity = new TechEntity();
//        entity.setName("Architecture");
//        entity.setType(TechType.DISCOVERY);
//        entity.setEra(2);
//        entity.setEffects(List.of("Unlocks new buildings"));
//        entity.setFactions(Set.of(Faction.ASPECT));
//        entity.setTechCoords(new TechCoords(50.5, 75.5));
//        entity.setPrereq(prereqEntity);
//        entity.setUnlocks(List.of(unlockEntity));
//
//        // Act
//        Tech domain = techMapper.toDomain(entity);
//
//        // Assert
//        assertThat(domain).isNotNull();
//        assertThat(domain.getName()).isEqualTo("Architecture");
//        assertThat(domain.getType()).isEqualTo(TechType.DISCOVERY);
//        assertThat(domain.getEra()).isEqualTo(2);
//        assertThat(domain.getEffects()).containsExactly("Unlocks new buildings");
//        assertThat(domain.getFactions()).containsExactly(Faction.ASPECT);
//
//        assertThat(domain.getTechCoords()).isNotNull();
//        assertThat(domain.getTechCoords().getXPct()).isEqualTo(50.5);
//        assertThat(domain.getTechCoords().getYPct()).isEqualTo(75.5);
//
//        assertThat(domain.getPrereq()).isNotNull();
//        assertThat(domain.getPrereq().getName()).isEqualTo("Masonry");
//
//        assertThat(domain.getUnlocks()).hasSize(1);
//        assertThat(domain.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks Advanced Quarry");
//
//        // Defensive: ensure null/empty fields are handled gracefully
//        assertThat(domain.getExcludes()).isNull();
//    }
//
//    @Test
//    void toEntity_shouldMapAllFields() {
//        // Arrange: fully populated domain
//        Tech prereqDomain = Tech.builder().name("Masonry").build();
//        TechUnlock unlockDomain = TechUnlock.builder().unlockText("Unlocks Advanced Quarry").build();
//
//        Tech domain = Tech.builder()
//                .name("Architecture")
//                .type(TechType.DISCOVERY)
//                .era(2)
//                .effects(List.of("Unlocks new buildings"))
//                .factions(Set.of(Faction.ASPECT))
//                .techCoords(new TechCoords(50.5, 75.5))
//                .prereq(prereqDomain)
//                .unlocks(List.of(unlockDomain))
//                .build();
//
//        // Act
//        TechEntity entity = techMapper.toEntity(domain);
//
//        // Assert
//        assertThat(entity).isNotNull();
//        assertThat(entity.getName()).isEqualTo("Architecture");
//        assertThat(entity.getType()).isEqualTo(TechType.DISCOVERY);
//        assertThat(entity.getEra()).isEqualTo(2);
//        assertThat(entity.getEffects()).containsExactly("Unlocks new buildings");
//        assertThat(entity.getFactions()).containsExactly(Faction.ASPECT);
//
//        assertThat(entity.getTechCoords()).isNotNull();
//        assertThat(entity.getTechCoords().getXPct()).isEqualTo(50.5);
//        assertThat(entity.getTechCoords().getYPct()).isEqualTo(75.5);
//
//        assertThat(entity.getPrereq()).isNotNull();
//        assertThat(entity.getPrereq().getName()).isEqualTo("Masonry");
//
//        assertThat(entity.getUnlocks()).hasSize(1);
//        assertThat(entity.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks Advanced Quarry");
//
//        // Ensure null fields are still mapped safely
//        assertThat(entity.getExcludes()).isNull();
//    }
//}
