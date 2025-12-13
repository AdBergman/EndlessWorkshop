package ewshop.facade.mapper;

import ewshop.facade.dto.response.UnitDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitDtoPostProcessorTest {

    private final UnitDtoPostProcessor postProcessor = new UnitDtoPostProcessor();

    @Test
    void attachUpgradesFrom_shouldSetUpgradesFromCorrectly() {
        // Given
        UnitDto dtoA = UnitDto.builder().name("A").upgradesTo(List.of("B")).build();
        UnitDto dtoB = UnitDto.builder().name("B").upgradesTo(List.of("C")).build();
        UnitDto dtoC = UnitDto.builder().name("C").upgradesTo(List.of()).build();

        List<UnitDto> initialDtos = List.of(dtoA, dtoB, dtoC);

        // When
        List<UnitDto> processedDtos = postProcessor.attachUpgradesFrom(initialDtos);

        // Then
        assertThat(processedDtos).hasSize(3);

        UnitDto resultA = processedDtos.stream().filter(dto -> dto.name().equals("A")).findFirst().orElseThrow();
        UnitDto resultB = processedDtos.stream().filter(dto -> dto.name().equals("B")).findFirst().orElseThrow();
        UnitDto resultC = processedDtos.stream().filter(dto -> dto.name().equals("C")).findFirst().orElseThrow();

        // Assert upgradesFrom
        assertThat(resultA.upgradesFrom()).isNull();
        assertThat(resultB.upgradesFrom()).isEqualTo("A");
        assertThat(resultC.upgradesFrom()).isEqualTo("B");

        // Assert original fields remain unchanged
        assertThat(resultA.name()).isEqualTo("A");
        assertThat(resultA.upgradesTo()).containsExactly("B");
        assertThat(resultB.name()).isEqualTo("B");
        assertThat(resultB.upgradesTo()).containsExactly("C");
        assertThat(resultC.name()).isEqualTo("C");
        assertThat(resultC.upgradesTo()).isEmpty();
    }

    @Test
    void attachUpgradesFrom_shouldHandleDuplicateTargetsByKeepingFirst() {
        // Given
        UnitDto dtoA = UnitDto.builder().name("A").upgradesTo(List.of("B")).build();
        UnitDto dtoX = UnitDto.builder().name("X").upgradesTo(List.of("B")).build();
        UnitDto dtoB = UnitDto.builder().name("B").upgradesTo(List.of()).build();

        List<UnitDto> initialDtos = List.of(dtoA, dtoX, dtoB);

        // When
        List<UnitDto> processedDtos = postProcessor.attachUpgradesFrom(initialDtos);

        // Then
        assertThat(processedDtos).hasSize(3);

        UnitDto resultB = processedDtos.stream().filter(dto -> dto.name().equals("B")).findFirst().orElseThrow();

        // Assert B.upgradesFrom is "A" because A appeared first in the list
        assertThat(resultB.upgradesFrom()).isEqualTo("A");
    }
}
