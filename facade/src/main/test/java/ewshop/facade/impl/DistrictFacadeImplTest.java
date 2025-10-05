package ewshop.facade.impl;

import ewshop.domain.entity.District;
import ewshop.domain.service.DistrictService;
import ewshop.facade.dto.DistrictDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DistrictFacadeImplTest {

    private DistrictService districtService;
    private DistrictFacadeImpl districtFacade;

    @BeforeEach
    void setUp() {
        districtService = mock(DistrictService.class);
        districtFacade = new DistrictFacadeImpl(districtService);
    }

    @Test
    void getAllDistricts_returnsCorrectDtos() {
        District d1 = District.builder()
                .name("Farm")
                .effect("+2 Food")
                .tileBonus(List.of("+1 Food on tile producing Food"))
                .adjacencyBonus(List.of("+1 Food for each adjacent River"))
                .info(List.of())
                .placementPrereq(null)
                .build();

        District d2 = District.builder()
                .name("Communal Habitations")
                .info(List.of("+1 Population slot on Population Vocations"))
                .build();

        when(districtService.getAllDistricts()).thenReturn(List.of(d1, d2));

        List<DistrictDto> dtos = districtFacade.getAllDistricts();

        assertThat(dtos).hasSize(2);

        assertThat(dtos.get(0).name()).isEqualTo("Farm");
        assertThat(dtos.get(0).effect()).isEqualTo("+2 Food");
        assertThat(dtos.get(0).tileBonus()).containsExactly("+1 Food on tile producing Food");
        assertThat(dtos.get(0).adjacencyBonus()).containsExactly("+1 Food for each adjacent River");

        assertThat(dtos.get(1).name()).isEqualTo("Communal Habitations");
        assertThat(dtos.get(1).info()).containsExactly("+1 Population slot on Population Vocations");
    }
}
