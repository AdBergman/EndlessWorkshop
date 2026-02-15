package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
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
        this.techMapper = new TechMapper();
    }

    @Test
    void toDomain_shouldMapAllFields() {
        TechEntity prereqEntity = new TechEntity();
        prereqEntity.setTechKey("Tech_Masonry");
        prereqEntity.setName("Masonry");

        TechEntity entity = new TechEntity();
        entity.setTechKey("Tech_Architecture");
        entity.setName("Architecture");
        entity.setType(TechType.DISCOVERY);
        entity.setEra(2);
        entity.setEffectLines(List.of("Unlocks new buildings"));
        entity.setFactions(Set.of(Faction.ASPECTS));
        entity.setTechCoords(new TechCoords(50.5, 75.5));
        entity.setPrereq(prereqEntity);

        Tech domain = techMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Architecture");
        assertThat(domain.getTechKey()).isEqualTo("Tech_Architecture");
        assertThat(domain.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(domain.getEra()).isEqualTo(2);
        assertThat(domain.getEffects()).containsExactly("Unlocks new buildings");
        assertThat(domain.getFactions()).containsExactly(Faction.ASPECTS);

        assertThat(domain.getTechCoords()).isNotNull();
        assertThat(domain.getTechCoords().getXPct()).isEqualTo(50.5);
        assertThat(domain.getTechCoords().getYPct()).isEqualTo(75.5);

        assertThat(domain.getPrereq()).isNotNull();
        assertThat(domain.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(domain.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");

        assertThat(domain.getExcludes()).isNull();
    }

    @Test
    void toEntity_shouldMapAllFields() {
        Tech prereqDomain = Tech.builder()
                .techKey("Tech_Masonry")
                .name("Masonry")
                .build();

        Tech domain = Tech.builder()
                .techKey("Tech_Architecture")
                .name("Architecture")
                .type(TechType.DISCOVERY)
                .era(2)
                .effects(List.of("Unlocks new buildings"))
                .factions(Set.of(Faction.ASPECTS))
                .techCoords(new TechCoords(50.5, 75.5))
                .prereq(prereqDomain)
                .build();

        TechEntity entity = techMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Architecture");
        assertThat(entity.getTechKey()).isEqualTo("Tech_Architecture");
        assertThat(entity.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(entity.getEra()).isEqualTo(2);
        assertThat(entity.getEffectLines()).containsExactly("Unlocks new buildings");
        assertThat(entity.getFactions()).containsExactlyInAnyOrder(Faction.ASPECTS);

        assertThat(entity.getTechCoords()).isNotNull();
        assertThat(entity.getTechCoords().getXPct()).isEqualTo(50.5);
        assertThat(entity.getTechCoords().getYPct()).isEqualTo(75.5);

        assertThat(entity.getPrereq()).isNotNull();
        assertThat(entity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(entity.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");

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
    void toDomain_shouldMapNullCollectionsToEmpty() {
        TechEntity entity = new TechEntity();
        entity.setTechKey("Tech_Any");
        entity.setName("Any");
        entity.setEffectLines(null);
        entity.setFactions(null);

        Tech domain = techMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getEffects()).isNotNull().isEmpty();
        assertThat(domain.getFactions()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullCollectionsToEmpty() {
        Tech domain = Tech.builder()
                .techKey("Tech_Any")
                .name("Any")
                .effects(null)
                .factions(null)
                .build();

        TechEntity entity = techMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getEffectLines()).isNotNull().isEmpty();
        assertThat(entity.getFactions()).isNotNull().isEmpty();
    }

    @Test
    void updateReferences_shouldUpdatePrereqAndExcludes() {
        Tech prereqDomain = Tech.builder()
                .techKey("Tech_Masonry")
                .name("Masonry")
                .build();

        Tech excludesDomain = Tech.builder()
                .techKey("Tech_AlternativeTech")
                .name("AlternativeTech")
                .build();

        Tech domain = Tech.builder()
                .techKey("Tech_Architecture")
                .name("Architecture")
                .prereq(prereqDomain)
                .excludes(excludesDomain)
                .build();

        TechEntity entity = new TechEntity();
        entity.setTechKey("Tech_Architecture");
        entity.setName("Architecture");

        TechEntity prereqEntity = new TechEntity();
        prereqEntity.setTechKey("Tech_Masonry");
        prereqEntity.setName("Masonry");

        TechEntity excludesEntity = new TechEntity();
        excludesEntity.setTechKey("Tech_AlternativeTech");
        excludesEntity.setName("AlternativeTech");

        Map<String, TechEntity> savedMap = Map.of(
                "Tech_Masonry", prereqEntity,
                "Tech_AlternativeTech", excludesEntity
        );

        techMapper.updateReferences(entity, domain, savedMap);

        assertThat(entity.getPrereq()).isNotNull();
        assertThat(entity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(entity.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");

        assertThat(entity.getExcludes()).isNotNull();
        assertThat(entity.getExcludes().getName()).isEqualTo("AlternativeTech");
        assertThat(entity.getExcludes().getTechKey()).isEqualTo("Tech_AlternativeTech");
    }
}