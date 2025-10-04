package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.TechUnlock;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechMapperTest {

    private TechMapper techMapper;

    @BeforeEach
    void setUp() {
        // Manually create the full dependency chain for the unit test
        var convertorMapper = new ConvertorMapper();
        var unitSpecializationMapper = new UnitSpecializationMapper();
        var treatyMapper = new TreatyMapper();
        var districtMapper = new DistrictMapper();
        var improvementMapper = new ImprovementMapper(new StrategicCostMapper());
        var techUnlockMapper = new TechUnlockMapper(convertorMapper, unitSpecializationMapper, treatyMapper, districtMapper, improvementMapper);
        this.techMapper = new TechMapper(techUnlockMapper);
    }

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup: Create a complex entity with all fields populated
        TechUnlockEntity unlockEntity = new TechUnlockEntity();
        unlockEntity.setUnlockText("Unlocks Advanced Quarry");

        TechEntity prereqEntity = new TechEntity();
        prereqEntity.setName("Masonry");

        TechEntity entity = new TechEntity();
        entity.setName("Architecture");
        entity.setType(TechType.DISCOVERY);
        entity.setEra(2);
        entity.setEffects(List.of("Unlocks new buildings"));
        entity.setFactions(Set.of(Faction.ASPECT));
        entity.setTechCoords(new TechCoords(50.5, 75.5));
        entity.setPrereq(prereqEntity);
        entity.setUnlocks(List.of(unlockEntity));

        // Act: Map to domain
        Tech domain = techMapper.toDomain(entity);

        // Assert: Check every single field
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Architecture");
        assertThat(domain.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(domain.getEra()).isEqualTo(2);
        assertThat(domain.getEffects()).containsExactly("Unlocks new buildings");
        assertThat(domain.getFactions()).containsExactly(Faction.ASPECT);
        assertThat(domain.getTechCoords()).isNotNull();
        assertThat(domain.getTechCoords().getxPct()).isEqualTo(50.5);
        assertThat(domain.getTechCoords().getyPct()).isEqualTo(75.5);
        assertThat(domain.getPrereq()).isNotNull();
        assertThat(domain.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(domain.getUnlocks()).hasSize(1);
        assertThat(domain.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks Advanced Quarry");
        assertThat(domain.getExcludes()).isNull(); // Ensure null fields are handled
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup: Create a complex domain object with all fields populated
        Tech prereqDomain = Tech.builder().name("Masonry").build();
        TechUnlock unlockDomain = TechUnlock.builder().unlockText("Unlocks Advanced Quarry").build();

        Tech domain = Tech.builder()
                .name("Architecture")
                .type(TechType.DISCOVERY)
                .era(2)
                .effects(List.of("Unlocks new buildings"))
                .factions(Set.of(Faction.ASPECT))
                .techCoords(new TechCoords(50.5, 75.5))
                .prereq(prereqDomain)
                .unlocks(List.of(unlockDomain))
                .build();

        // Act: Map to entity
        TechEntity entity = techMapper.toEntity(domain);

        // Assert: Check every single field
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Architecture");
        assertThat(entity.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(entity.getEra()).isEqualTo(2);
        assertThat(entity.getEffects()).containsExactly("Unlocks new buildings");
        assertThat(entity.getFactions()).containsExactly(Faction.ASPECT);
        assertThat(entity.getTechCoords()).isNotNull();
        assertThat(entity.getTechCoords().getxPct()).isEqualTo(50.5);
        assertThat(entity.getTechCoords().getyPct()).isEqualTo(75.5);
        assertThat(entity.getPrereq()).isNotNull();
        assertThat(entity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(entity.getUnlocks()).hasSize(1);
        assertThat(entity.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks Advanced Quarry");
        assertThat(entity.getExcludes()).isNull(); // Ensure null fields are handled
    }
}
