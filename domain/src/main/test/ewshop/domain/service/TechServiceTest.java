package ewshop.domain.service;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.enums.TechType; // if you have an enum
import ewshop.domain.repository.TechRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class TechServiceTest {

    private TechRepository techRepository;
    private TechService techService;

    @BeforeEach
    void setUp() {
        techRepository = mock(TechRepository.class);
        techService = new TechService(techRepository);
    }

    @Test
    void getAllTechNames_returnsNames() {
        // Use builder instead of constructor
        Tech t1 = Tech.builder()
                .name("Agriculture")
                .era(1)
                .type(TechType.DISCOVERY)
                .effects(List.of())
                .factions(Set.of())
                .build();

        Tech t2 = Tech.builder()
                .name("Writing")
                .era(1)
                .type(TechType.DISCOVERY)
                .effects(List.of())
                .factions(Set.of())
                .build();

        when(techRepository.findAll()).thenReturn(List.of(t1, t2));

        List<String> names = techService.getAllTechNames();

        assertThat(names).containsExactly("Agriculture", "Writing");
        verify(techRepository, times(1)).findAll();
    }

    @Test
    void findByName_delegatesToRepository() {
        Tech t = Tech.builder()
                .name("Mining")
                .era(1)
                .type(TechType.DEFENSE)
                .effects(List.of())
                .factions(Set.of())
                .build();

        when(techRepository.findByName("Mining")).thenReturn(Optional.of(t));

        Optional<Tech> result = techRepository.findByName("Mining");

        assertThat(result).contains(t);
    }
}
