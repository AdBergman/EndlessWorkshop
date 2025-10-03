package ewshop.domain.repository.mappers;

import ewshop.domain.entity.*;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.repository.entities.*;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup TechUnlockEntity
        TechUnlockEntity unlockEntity = new TechUnlockEntity();
        unlockEntity.setUnlockText("Unlock bonus");
        // other fields can be null for now

        // Setup TechEntity
        TechEntity entity = new TechEntity();
        entity.setName("Tech A");
        entity.setType(TechType.DISCOVERY);
        entity.setEra(1);
        entity.setEffects(List.of("Effect 1", "Effect 2"));
        entity.setFactions(Set.of(Faction.KIN));
        entity.setUnlocks(List.of(unlockEntity));

        // Map to domain
        Tech domain = TechMapper.toDomain(entity);

        // Assertions
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Tech A");
        assertThat(domain.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(domain.getEra()).isEqualTo(1);
        assertThat(domain.getEffects()).containsExactly("Effect 1", "Effect 2");
        assertThat(domain.getFactions()).containsExactly(Faction.KIN);
        assertThat(domain.getUnlocks()).hasSize(1);
        assertThat(domain.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlock bonus");
    }

    @Test
    void testToEntityMapping() {
        // Setup TechUnlock domain object
        TechUnlock unlock = TechUnlock.builder()
                .unlockText("Unlock bonus")
                .build();

        // Setup Tech domain object
        Tech domain = Tech.builder()
                .name("Tech A")
                .type(TechType.DISCOVERY)
                .era(1)
                .effects(List.of("Effect 1", "Effect 2"))
                .factions(Set.of(Faction.KIN))
                .addUnlock(unlock)
                .build();

        // Map to entity
        TechEntity entity = TechMapper.toEntity(domain);

        // Assertions
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Tech A");
        assertThat(entity.getType()).isEqualTo(TechType.DISCOVERY);
        assertThat(entity.getEra()).isEqualTo(1);
        assertThat(entity.getEffects()).containsExactly("Effect 1", "Effect 2");
        assertThat(entity.getFactions()).containsExactly(Faction.KIN);
        assertThat(entity.getUnlocks()).hasSize(1);
        assertThat(entity.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlock bonus");
    }
}
