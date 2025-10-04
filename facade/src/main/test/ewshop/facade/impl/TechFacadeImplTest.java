package ewshop.facade.impl;

import ewshop.domain.entity.Tech;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.service.TechService;
import ewshop.facade.dto.TechDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TechFacadeImplTest {

    private TechService techService;
    private TechFacadeImpl techFacade;

    @BeforeEach
    void setUp() {
        techService = mock(TechService.class);
        techFacade = new TechFacadeImpl(techService);
    }

    @Test
    void getAllTechs_returnsCorrectDtos() {
        Tech t1 = Tech.builder()
                .name("Stonework")
                .era(1)
                .type(TechType.DEFENSE)
                .effects(List.of("+100 Fortification on Capital"))
                .factions(Set.of())
                .build();

        Tech t2 = Tech.builder()
                .name("Agriculture")
                .era(1)
                .type(TechType.DISCOVERY)
                .effects(List.of())
                .factions(Set.of())
                .build();

        when(techService.getAllTechs()).thenReturn(List.of(t1, t2));

        List<TechDto> dtos = techFacade.getAllTechs();

        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getName()).isEqualTo("Stonework");
        assertThat(dtos.get(0).getEffects()).contains("+100 Fortification on Capital");
        assertThat(dtos.get(1).getName()).isEqualTo("Agriculture");
    }
}
