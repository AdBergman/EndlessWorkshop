package ewshop.domain.service;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.domain.repository.ImprovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ImprovementServiceTest {

    private ImprovementRepository improvementRepository;
    private ImprovementService improvementService;

    @BeforeEach
    void setUp() {
        improvementRepository = mock(ImprovementRepository.class);
        improvementService = new ImprovementService(improvementRepository);
    }

    @Test
    void getAllImprovements_returnsAllImprovementEntities() {
        Improvement i1 = Improvement.builder()
                .name("Traveler's Shrine")
                .effects(List.of("+15 Approval"))
                .unique(UniqueType.CITY)
                .era(1)
                .build();

        Improvement i2 = Improvement.builder()
                .name("Garrison")
                .effects(List.of("+500 District Fortification"))
                .unique(UniqueType.CITY)
                .era(2)
                .build();

        when(improvementRepository.findAll()).thenReturn(List.of(i1, i2));

        List<Improvement> result = improvementService.getAllImprovements();

        assertThat(result).containsExactly(i1, i2);
        verify(improvementRepository, times(1)).findAll();
    }
}
