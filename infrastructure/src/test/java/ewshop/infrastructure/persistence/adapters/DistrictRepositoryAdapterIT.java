package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.District;
import ewshop.domain.repository.DistrictRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DistrictRepositoryAdapterIT {

    @Autowired
    private DistrictRepository districtRepository;

    @Test
    void importSnapshot_shouldInsertAndReturnAll() {
        // given
        var snapshot1 = new DistrictImportSnapshot(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science")
        );

        var snapshot2 = new DistrictImportSnapshot(
                "Aspect_District_Tier1_Industry",
                "Workshop",
                "Industry",
                List.of("+2 Industry")
        );

        // when
        districtRepository.importDistrictSnapshot(List.of(snapshot1, snapshot2));

        // then
        List<District> districts = districtRepository.findAll();

        assertThat(districts).hasSize(2);
        assertThat(districts)
                .extracting(District::getDistrictKey)
                .containsExactlyInAnyOrder(
                        "Aspect_District_Tier1_Science",
                        "Aspect_District_Tier1_Industry"
                );
    }

    @Test
    void importSnapshot_shouldDeleteObsolete() {
        // initial import
        var snapshot1 = new DistrictImportSnapshot(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science")
        );

        districtRepository.importDistrictSnapshot(List.of(snapshot1));

        assertThat(districtRepository.findAll()).hasSize(1);

        // second import removes previous and adds new
        var snapshot2 = new DistrictImportSnapshot(
                "Aspect_District_Tier1_Industry",
                "Workshop",
                "Industry",
                List.of("+2 Industry")
        );

        districtRepository.importDistrictSnapshot(List.of(snapshot2));

        List<District> districts = districtRepository.findAll();

        assertThat(districts).hasSize(1);
        assertThat(districts.get(0).getDistrictKey())
                .isEqualTo("Aspect_District_Tier1_Industry");
    }
}