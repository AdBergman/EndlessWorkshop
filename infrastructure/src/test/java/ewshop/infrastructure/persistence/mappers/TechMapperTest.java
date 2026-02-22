package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.TechUnlockRef;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.model.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockRefEmbeddable;
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

        TechEntity techEntity = new TechEntity();
        techEntity.setTechKey("Tech_Architecture");
        techEntity.setName("Architecture");
        techEntity.setType(TechType.DISCOVERY);
        techEntity.setEra(2);
        techEntity.setDescriptionLines(List.of("Unlocks new buildings"));
        techEntity.setUnlocks(List.of(
                new TechUnlockRefEmbeddable("Constructible", "Aspect_District_Tier1_Industry"),
                new TechUnlockRefEmbeddable("Action", "ActionTypeCutForest")
        ));
        techEntity.setFactions(Set.of(MajorFaction.ASPECTS));
        techEntity.setTechCoords(new TechCoords(50.5, 75.5));
        techEntity.setPrereq(prereqEntity);

        Tech tech = techMapper.toDomain(techEntity);

        assertThat(tech).isNotNull();
        assertThat(tech.getName()).isEqualTo("Architecture");
        assertThat(tech.getTechKey()).isEqualTo("Tech_Architecture");
        assertThat(tech.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(tech.getEra()).isEqualTo(2);

        assertThat(tech.getDescriptionLines()).containsExactly("Unlocks new buildings");
        assertThat(tech.getUnlocks()).containsExactly(
                new TechUnlockRef("Constructible", "Aspect_District_Tier1_Industry"),
                new TechUnlockRef("Action", "ActionTypeCutForest")
        );

        assertThat(tech.getFactions()).containsExactly(MajorFaction.ASPECTS);

        assertThat(tech.getTechCoords()).isNotNull();
        assertThat(tech.getTechCoords().getXPct()).isEqualTo(50.5);
        assertThat(tech.getTechCoords().getYPct()).isEqualTo(75.5);

        assertThat(tech.getPrereq()).isNotNull();
        assertThat(tech.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(tech.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");

        assertThat(tech.getExcludes()).isNull();
    }

    @Test
    void toEntity_shouldMapAllFields() {
        Tech prereqTech = Tech.builder()
                .techKey("Tech_Masonry")
                .name("Masonry")
                .build();

        Tech tech = Tech.builder()
                .techKey("Tech_Architecture")
                .name("Architecture")
                .type(TechType.DISCOVERY)
                .era(2)
                .descriptionLines(List.of("Unlocks new buildings"))
                .unlocks(List.of(
                        new TechUnlockRef("Constructible", "Aspect_District_Tier1_Industry"),
                        new TechUnlockRef("Action", "ActionTypeCutForest")
                ))
                .factions(Set.of(MajorFaction.ASPECTS))
                .techCoords(new TechCoords(50.5, 75.5))
                .prereq(prereqTech)
                .build();

        TechEntity techEntity = techMapper.toEntity(tech);

        assertThat(techEntity).isNotNull();
        assertThat(techEntity.getName()).isEqualTo("Architecture");
        assertThat(techEntity.getTechKey()).isEqualTo("Tech_Architecture");
        assertThat(techEntity.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(techEntity.getEra()).isEqualTo(2);

        assertThat(techEntity.getDescriptionLines()).containsExactly("Unlocks new buildings");
        assertThat(techEntity.getUnlocks()).containsExactly(
                new TechUnlockRefEmbeddable("Constructible", "Aspect_District_Tier1_Industry"),
                new TechUnlockRefEmbeddable("Action", "ActionTypeCutForest")
        );

        assertThat(techEntity.getFactions()).containsExactlyInAnyOrder(MajorFaction.ASPECTS);

        assertThat(techEntity.getTechCoords()).isNotNull();
        assertThat(techEntity.getTechCoords().getXPct()).isEqualTo(50.5);
        assertThat(techEntity.getTechCoords().getYPct()).isEqualTo(75.5);

        assertThat(techEntity.getPrereq()).isNotNull();
        assertThat(techEntity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(techEntity.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");

        assertThat(techEntity.getExcludes()).isNull();
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
        TechEntity techEntity = new TechEntity();
        techEntity.setTechKey("Tech_Any");
        techEntity.setName("Any");
        techEntity.setDescriptionLines(null);
        techEntity.setUnlocks(null);
        techEntity.setFactions(null);

        Tech tech = techMapper.toDomain(techEntity);

        assertThat(tech).isNotNull();
        assertThat(tech.getDescriptionLines()).isNotNull().isEmpty();
        assertThat(tech.getUnlocks()).isNotNull().isEmpty();
        assertThat(tech.getFactions()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullCollectionsToEmpty() {
        Tech tech = Tech.builder()
                .techKey("Tech_Any")
                .name("Any")
                .descriptionLines(null)
                .unlocks(null)
                .factions(null)
                .build();

        TechEntity techEntity = techMapper.toEntity(tech);

        assertThat(techEntity).isNotNull();
        assertThat(techEntity.getDescriptionLines()).isNotNull().isEmpty();
        assertThat(techEntity.getUnlocks()).isNotNull().isEmpty();
        assertThat(techEntity.getFactions()).isNotNull().isEmpty();
    }

    @Test
    void updateReferences_shouldUpdatePrereqAndExcludes() {
        Tech prereqTech = Tech.builder()
                .techKey("Tech_Masonry")
                .name("Masonry")
                .build();

        Tech excludesTech = Tech.builder()
                .techKey("Tech_AlternativeTech")
                .name("AlternativeTech")
                .build();

        Tech tech = Tech.builder()
                .techKey("Tech_Architecture")
                .name("Architecture")
                .prereq(prereqTech)
                .excludes(excludesTech)
                .build();

        TechEntity techEntity = new TechEntity();
        techEntity.setTechKey("Tech_Architecture");
        techEntity.setName("Architecture");

        TechEntity prereqEntity = new TechEntity();
        prereqEntity.setTechKey("Tech_Masonry");
        prereqEntity.setName("Masonry");

        TechEntity excludesEntity = new TechEntity();
        excludesEntity.setTechKey("Tech_AlternativeTech");
        excludesEntity.setName("AlternativeTech");

        Map<String, TechEntity> savedByTechKey = Map.of(
                "Tech_Masonry", prereqEntity,
                "Tech_AlternativeTech", excludesEntity
        );

        techMapper.updateReferences(techEntity, tech, savedByTechKey);

        assertThat(techEntity.getPrereq()).isNotNull();
        assertThat(techEntity.getPrereq().getName()).isEqualTo("Masonry");
        assertThat(techEntity.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");

        assertThat(techEntity.getExcludes()).isNotNull();
        assertThat(techEntity.getExcludes().getName()).isEqualTo("AlternativeTech");
        assertThat(techEntity.getExcludes()).isNotNull();
        assertThat(techEntity.getExcludes().getTechKey()).isEqualTo("Tech_AlternativeTech");
    }
}