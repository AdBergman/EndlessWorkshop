package ewshop.facade.integration;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;
import ewshop.domain.repository.TechRepository;
import ewshop.facade.dto.request.TechAdminDto;
import ewshop.facade.dto.response.TechCoordsDto;
import ewshop.facade.interfaces.TechAdminFacade;
import ewshop.facade.interfaces.TechFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TechAdminFacadeTest extends BaseIT {

    @Autowired
    private TechAdminFacade techAdminFacade;

    @Autowired
    private TechFacade techFacade;

    @Autowired
    private TechRepository techRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(techAdminFacade).isNotNull();
        assertThat(techFacade).isNotNull();
        assertThat(techRepository).isNotNull();
    }

    @Test
    void applyPlacementUpdates_updatesEraAndCoords_andWarmsCache() {
        Tech stonework = Tech.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(1)
                .type(TechType.DEFENSE)
                .techCoords(new TechCoords(10.0, 20.0))
                .build();

        techRepository.save(stonework);
        entityManager.flush();

        var before = techFacade.getAllTechs();
        assertThat(before).hasSize(1);
        assertThat(before.get(0).era()).isEqualTo(1);
        assertThat(before.get(0).coords().xPct()).isEqualTo(10.0);

        TechAdminDto updateDto = new TechAdminDto(
                "Tech_Stonework",
                "Stonework",
                2,
                "Defense",
                new TechCoordsDto(55.5, 66.6)
        );

        techAdminFacade.applyPlacementUpdates(List.of(updateDto));
        entityManager.flush();
        entityManager.clear();

        var after = techFacade.getAllTechs();
        assertThat(after).hasSize(1);

        var stoneworkDto = after.get(0);
        assertThat(stoneworkDto.name()).isEqualTo("Stonework");
        assertThat(stoneworkDto.era()).isEqualTo(2);
        assertThat(stoneworkDto.coords().xPct()).isEqualTo(55.5);
        assertThat(stoneworkDto.coords().yPct()).isEqualTo(66.6);
    }

    @Test
    void applyPlacementUpdates_noopOnNullOrEmpty() {
        Tech stonework = Tech.builder()
                .techKey("Tech_Stonework")
                .name("Stonework")
                .era(1)
                .type(TechType.DEFENSE)
                .techCoords(new TechCoords(10.0, 20.0))
                .build();

        techRepository.save(stonework);
        entityManager.flush();
        entityManager.clear();

        techAdminFacade.applyPlacementUpdates(null);
        techAdminFacade.applyPlacementUpdates(List.of());

        var result = techFacade.getAllTechs();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).era()).isEqualTo(1);
        assertThat(result.get(0).coords().xPct()).isEqualTo(10.0);
        assertThat(result.get(0).coords().yPct()).isEqualTo(20.0);
    }
}