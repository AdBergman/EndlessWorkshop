package ewshop.facade.integration;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;
import ewshop.domain.repository.TechRepository;
import ewshop.facade.dto.response.TechDto;
import ewshop.facade.interfaces.TechFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechFacadeTest extends BaseIT {

    @Autowired
    private TechFacade techFacade;

    @Autowired
    private TechRepository techRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(techFacade).isNotNull();
        assertThat(techRepository).isNotNull();
    }

    @Test
    void shouldReturnAllTechs() {
        // Given
        Tech stonework = Tech.builder()
                .name("Stonework")
                .era(1)
                .type(TechType.DEFENSE)
                .effects(List.of("+100 Fortification on Capital"))
                .factions(Set.of(Faction.ASPECTS, Faction.KIN))
                .techCoords(new TechCoords(10.0, 20.0))
                .build();

        Tech agriculture = Tech.builder()
                .name("Agriculture")
                .era(1)
                .type(TechType.DISCOVERY)
                .effects(List.of("Unlocks Farms"))
                .factions(Set.of(Faction.LORDS))
                .techCoords(new TechCoords(30.0, 40.0))
                .build();

        techRepository.save(stonework);
        techRepository.save(agriculture);
        entityManager.flush();

        // When
        List<TechDto> result = techFacade.getAllTechs();

        // Then
        assertThat(result).hasSize(2);

        // Verify Stonework DTO
        TechDto stoneworkDto = result.stream()
                .filter(t -> "Stonework".equals(t.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Stonework DTO not found"));
        assertThat(stoneworkDto.era()).isEqualTo(1);
        assertThat(stoneworkDto.type()).isEqualTo("Defense");
        assertThat(stoneworkDto.effects()).containsExactly("+100 Fortification on Capital");
        assertThat(stoneworkDto.factions()).containsExactlyInAnyOrder("Aspects", "Kin");

        // Verify Agriculture DTO
        TechDto agricultureDto = result.stream()
                .filter(t -> "Agriculture".equals(t.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Agriculture DTO not found"));
        assertThat(agricultureDto.era()).isEqualTo(1);
        assertThat(agricultureDto.type()).isEqualTo("Discovery");
        assertThat(agricultureDto.effects()).containsExactly("Unlocks Farms");
        assertThat(agricultureDto.factions()).containsExactly("Lords");
    }

}
