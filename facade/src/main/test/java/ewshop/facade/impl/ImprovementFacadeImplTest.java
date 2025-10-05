package ewshop.facade.impl;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.domain.entity.StrategicCost;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.domain.service.ImprovementService;
import ewshop.facade.dto.ImprovementDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ImprovementFacadeImplTest {

    private ImprovementService improvementService;
    private ImprovementFacadeImpl improvementFacade;

    @BeforeEach
    void setUp() {
        improvementService = mock(ImprovementService.class);
        improvementFacade = new ImprovementFacadeImpl(improvementService);
    }

    @Test
    void getAllImprovements_returnsCorrectDtos() {
        Improvement i1 = Improvement.builder()
                .name("Traveler's Shrine")
                .effects(List.of("+15 Approval"))
                .unique(UniqueType.CITY)
                .cost(List.of())
                .era(1)
                .build();

        Improvement i2 = Improvement.builder()
                .name("Laborer's Hut")
                .effects(List.of("+5 Food", "+5 Food on Farms Districts"))
                .unique(UniqueType.CITY)
                .cost(List.of(new StrategicCost(StrategicResourceType.GLASSTEEL, 5)))
                .era(2)
                .build();

        when(improvementService.getAllImprovements()).thenReturn(List.of(i1, i2));

        List<ImprovementDto> dtos = improvementFacade.getAllImprovements();

        assertThat(dtos).hasSize(2);

        assertThat(dtos.get(0).name()).isEqualTo("Traveler's Shrine");
        assertThat(dtos.get(0).effects()).containsExactly("+15 Approval");
        assertThat(dtos.get(0).unique()).isEqualTo("CITY");
        assertThat(dtos.get(0).cost()).isEmpty();

        assertThat(dtos.get(1).name()).isEqualTo("Laborer's Hut");
        assertThat(dtos.get(1).effects()).containsExactly("+5 Food", "+5 Food on Farms Districts");
        assertThat(dtos.get(1).unique()).isEqualTo("CITY");
        assertThat(dtos.get(1).cost()).hasSize(1);
    }
}
