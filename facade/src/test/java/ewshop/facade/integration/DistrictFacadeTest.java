package ewshop.facade.integration;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.repository.DistrictRepository;
import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictFacadeTest extends BaseIT {

    @Autowired
    private DistrictFacade districtFacade;

    @Autowired
    private DistrictRepository districtRepository;

    @Test
    void contextLoads() {
        assertThat(districtFacade).isNotNull();
        assertThat(districtRepository).isNotNull();
    }

    @Test
    void shouldReturnAllDistricts() {
        // Given (import-style persistence)
        var s1 = new DistrictImportSnapshot(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science per District Level")
        );

        var s2 = new DistrictImportSnapshot(
                "Aspect_District_Tier1_Industry",
                "Workshop",
                "Industry",
                List.of("+2 Industry per District Level")
        );

        districtRepository.importDistrictSnapshot(List.of(s1, s2));

        // When
        List<DistrictDto> result = districtFacade.getAllDistricts();

        // Then
        assertThat(result).hasSize(2);

        DistrictDto lab = result.stream()
                .filter(d -> "Aspect_District_Tier1_Science".equals(d.districtKey()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Laboratory DTO not found"));

        assertThat(lab.displayName()).isEqualTo("Laboratory");
        assertThat(lab.category()).isEqualTo("Science");
        assertThat(lab.descriptionLines()).containsExactly("+2 Science per District Level");

        DistrictDto workshop = result.stream()
                .filter(d -> "Aspect_District_Tier1_Industry".equals(d.districtKey()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Workshop DTO not found"));

        assertThat(workshop.displayName()).isEqualTo("Workshop");
        assertThat(workshop.category()).isEqualTo("Industry");
        assertThat(workshop.descriptionLines()).containsExactly("+2 Industry per District Level");
    }
}