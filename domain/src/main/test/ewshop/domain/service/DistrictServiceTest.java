package ewshop.domain.service;

import ewshop.domain.entity.District;
import ewshop.domain.repository.DistrictRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.Mockito.*;

class DistrictServiceTest {

    private DistrictRepository districtRepository;
    private DistrictService districtService;

    @BeforeEach
    void setUp() {
        districtRepository = mock(DistrictRepository.class);
        districtService = new DistrictService(districtRepository);
    }

    @Test
    void getAllDistricts_returnsAllDistrictEntities() {
        District d1 = District.builder()
                .name("Farm")
                .build();

        District d2 = District.builder()
                .name("Forum")
                .build();

        when(districtRepository.findAll()).thenReturn(List.of(d1, d2));

        List<District> result = districtService.getAllDistricts();

        assertThat(result).containsExactly(d1, d2);
        verify(districtRepository, times(1)).findAll();
    }
}
