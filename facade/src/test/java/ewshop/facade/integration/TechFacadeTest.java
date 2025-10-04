package ewshop.facade.integration;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.repository.TechRepository;
import ewshop.facade.config.FacadeConfig;
import ewshop.facade.dto.TechDto;
import ewshop.facade.interfaces.TechFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = TechFacadeTest.TestConfig.class)
@Import(FacadeConfig.class)
@Transactional
class TechFacadeTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @EntityScan("ewshop.infrastructure.persistence.entities")
    @EnableJpaRepositories("ewshop.infrastructure.persistence.repositories")
    @ComponentScan(basePackages = {"ewshop.domain", "ewshop.infrastructure"})
    static class TestConfig {
    }

    @Autowired
    private TechFacade techFacade;

    @Autowired
    private TechRepository techRepository;

    @Test
    void contextLoads() {
        assertThat(techFacade).isNotNull();
        assertThat(techRepository).isNotNull();
    }

    @BeforeEach
    void cleanDatabase() {
        techRepository.deleteAll();
    }

    @Test
    void getAllTechs_integration() {
        // Given
        Tech stonework = Tech.builder()
                .name("Stonework")
                .era(1)
                .type(TechType.DEFENSE)
                .effects(List.of("+100 Fortification on Capital"))
                .factions(Set.of(Faction.ASPECT, Faction.KIN))
                .techCoords(new TechCoords(10.0, 20.0))
                .build();

        Tech agriculture = Tech.builder()
                .name("Agriculture")
                .era(1)
                .type(TechType.DISCOVERY)
                .effects(List.of("Unlocks Farms"))
                .factions(Set.of(Faction.LOST_LORDS))
                .techCoords(new TechCoords(30.0, 40.0))
                .build();

        techRepository.save(stonework);
        techRepository.save(agriculture);

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
        assertThat(stoneworkDto.type()).isEqualTo("DEFENSE");
        assertThat(stoneworkDto.effects()).isEqualTo("+100 Fortification on Capital"); // String now
        assertThat(stoneworkDto.factions()).isEqualTo("ASPECT, KIN"); // String now

// Verify Agriculture DTO
        TechDto agricultureDto = result.stream()
                .filter(t -> "Agriculture".equals(t.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Agriculture DTO not found"));
        assertThat(agricultureDto.era()).isEqualTo(1);
        assertThat(agricultureDto.type()).isEqualTo("DISCOVERY");
        assertThat(agricultureDto.effects()).isEqualTo("Unlocks Farms");
        assertThat(agricultureDto.factions()).isEqualTo("LOST_LORDS");

    }
}
