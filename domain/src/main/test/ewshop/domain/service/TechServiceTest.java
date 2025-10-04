package ewshop.domain.service;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.repository.TechRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
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
    void getAllTechs_returnsAllTechEntities() {
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

        List<Tech> result = techService.getAllTechs();

        assertThat(result).containsExactly(t1, t2);
        verify(techRepository, times(1)).findAll();
    }
}
