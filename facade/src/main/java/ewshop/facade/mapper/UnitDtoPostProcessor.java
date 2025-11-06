package ewshop.facade.mapper;

import ewshop.facade.dto.response.UnitDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class UnitDtoPostProcessor {

    public List<UnitDto> attachUpgradesFrom(List<UnitDto> dtos) {
        // Step 1: Build reverse lookup (target -> source)
        Map<String, String> reverseMap = dtos.stream()
                .flatMap(dto -> dto.upgradesTo().stream()
                        .map(target -> Map.entry(target, dto.name())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));

        // Step 2: Use the DTO's copy builder to safely attach the new field
        return dtos.stream()
                .map(dto -> new UnitDto.Builder(dto) // Use the new copy constructor
                        .upgradesFrom(reverseMap.get(dto.name()))
                        .build())
                .toList();
    }
}
