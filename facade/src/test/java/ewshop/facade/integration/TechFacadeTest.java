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

        Tech stoneworkTech = Tech.builder()
                .name("Stonework")
                .techKey("Stonework_X")
                .era(1)
                .type(TechType.DEFENSE)
                .descriptionLines(List.of("+100 Fortification on Capital"))
                .factions(Set.of(Faction.ASPECTS, Faction.KIN))
                .techCoords(new TechCoords(10.0, 20.0))
                .build();

        Tech agricultureTech = Tech.builder()
                .name("Agriculture")
                .techKey("Agriculture_X")
                .era(1)
                .type(TechType.DISCOVERY)
                .descriptionLines(List.of("Unlocks Farms"))
                .factions(Set.of(Faction.LORDS))
                .techCoords(new TechCoords(30.0, 40.0))
                .build();

        techRepository.save(stoneworkTech);
        techRepository.save(agricultureTech);
        entityManager.flush();

        List<TechDto> techDtoList = techFacade.getAllTechs();

        assertThat(techDtoList).hasSize(2);

        TechDto stoneworkTechDto = techDtoList.stream()
                .filter(techDto -> "Stonework_X".equals(techDto.techKey()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Stonework DTO not found"));

        assertThat(stoneworkTechDto.name()).isEqualTo("Stonework");
        assertThat(stoneworkTechDto.era()).isEqualTo(1);
        assertThat(stoneworkTechDto.type()).isEqualTo("Defense");
        assertThat(stoneworkTechDto.descriptionLines())
                .containsExactly("+100 Fortification on Capital");
        assertThat(stoneworkTechDto.factions())
                .containsExactly("Aspects", "Kin");
        assertThat(stoneworkTechDto.coords()).isNotNull();
        assertThat(stoneworkTechDto.coords().xPct()).isEqualTo(10.0);
        assertThat(stoneworkTechDto.coords().yPct()).isEqualTo(20.0);

        TechDto agricultureTechDto = techDtoList.stream()
                .filter(techDto -> "Agriculture_X".equals(techDto.techKey()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Agriculture DTO not found"));

        assertThat(agricultureTechDto.name()).isEqualTo("Agriculture");
        assertThat(agricultureTechDto.era()).isEqualTo(1);
        assertThat(agricultureTechDto.type()).isEqualTo("Discovery");
        assertThat(agricultureTechDto.descriptionLines())
                .containsExactly("Unlocks Farms");
        assertThat(agricultureTechDto.factions())
                .containsExactly("Lords");
        assertThat(agricultureTechDto.coords()).isNotNull();
        assertThat(agricultureTechDto.coords().xPct()).isEqualTo(30.0);
        assertThat(agricultureTechDto.coords().yPct()).isEqualTo(40.0);
    }
}