package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.District;
import ewshop.domain.repository.DistrictRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DistrictRepositoryAdapterIT {

    @Autowired
    private DistrictRepository districtRepository;

    @AfterEach
    void tearDown() {
        districtRepository.deleteAll();
    }

    @Test
    void shouldSaveAndFindAllDistricts() {
        // given
        var district1 = District.builder().name("Industrial Zone").build();
        var district2 = District.builder().name("Commercial Hub").build();

        // when
        districtRepository.save(district1);
        districtRepository.save(district2);

        // then
        List<District> districts = districtRepository.findAll();
        assertThat(districts).hasSize(2);
        assertThat(districts).extracting(District::getName).contains("Industrial Zone", "Commercial Hub");
    }
}
