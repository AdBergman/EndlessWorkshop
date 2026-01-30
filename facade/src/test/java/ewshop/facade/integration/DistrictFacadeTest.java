package ewshop.facade.integration;

import ewshop.domain.model.District;
import ewshop.domain.repository.DistrictRepository;
import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DistrictFacadeTest extends BaseIT  {

    @Autowired
    private DistrictFacade districtFacade;

    @Autowired
    private DistrictRepository districtRepository;

    @BeforeEach
    void cleanDatabase() {
        districtRepository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertThat(districtFacade).isNotNull();
        assertThat(districtRepository).isNotNull();
    }

    @Test
    void shouldReturnAllDistricts() {
        // Given
        District farm = District.builder()
                .name("Farm")
                .effect("+2 Food")
                .tileBonus(List.of("+1 Food on tile producing Food"))
                .adjacencyBonus(List.of("+1 Food for each adjacent River"))
                .build();

        District forum = District.builder()
                .name("Forum")
                .effect("+2 Influence")
                .tileBonus(List.of("+1 Food on tile producing Food"))
                .adjacencyBonus(List.of("+1 Influence for each adjacent River"))
                .build();

        districtRepository.save(farm);
        districtRepository.save(forum);

        // When
        List<DistrictDto> result = districtFacade.getAllDistricts();

        // Then
        assertThat(result).hasSize(2);

        // Verify Farm DTO
        DistrictDto farmDto = result.stream()
                .filter(d -> "Farm".equals(d.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Farm DTO not found"));
        assertThat(farmDto.effect()).isEqualTo("+2 Food");
        assertThat(farmDto.tileBonus()).containsExactly("+1 Food on tile producing Food");
        assertThat(farmDto.adjacencyBonus()).containsExactly("+1 Food for each adjacent River");

        // Verify Forum DTO
        DistrictDto forumDto = result.stream()
                .filter(d -> "Forum".equals(d.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Forum DTO not found"));
        assertThat(forumDto.effect()).isEqualTo("+2 Influence");
        assertThat(forumDto.tileBonus()).containsExactly("+1 Food on tile producing Food");
        assertThat(forumDto.adjacencyBonus()).containsExactly("+1 Influence for each adjacent River");
    }
}
