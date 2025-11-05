package ewshop.facade.impl;

import ewshop.domain.service.UnitSpecializationService;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import ewshop.facade.mapper.UnitMapper;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class UnitFacadeImpl implements UnitFacade {

    private final UnitSpecializationService unitService;

    public UnitFacadeImpl(UnitSpecializationService unitService) {
        this.unitService = unitService;
    }

    @Override
    public List<UnitDto> getAllUnits() {
        List<UnitDto> dtos = unitService.getAllUnits().stream()
                .map(UnitMapper::toDto)
                .toList();

        return attachUpdatesFrom(dtos);
    }

    private static List<UnitDto> attachUpdatesFrom(List<UnitDto> dtos) {
        // --- Step 1: Build reverse lookup (target -> source) ---
        Map<String, String> reverseMap = dtos.stream()
                .flatMap(dto -> dto.upgradesTo().stream()
                        .map(target -> Map.entry(target, dto.name())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a));

        // --- Step 2: Attach upgradesFrom dynamically ---
        return dtos.stream()
                .map(dto -> UnitDto.builder()
                        .name(dto.name())
                        .description(dto.description())
                        .type(dto.type())
                        .health(dto.health())
                        .defense(dto.defense())
                        .minDamage(dto.minDamage())
                        .maxDamage(dto.maxDamage())
                        .movementPoints(dto.movementPoints())
                        .tier(dto.tier())
                        .upkeep(dto.upkeep())
                        .costs(dto.costs())
                        .skills(dto.skills())
                        .faction(dto.faction())
                        .upgradesTo(dto.upgradesTo())
                        .upgradesFrom(reverseMap.get(dto.name()))
                        .artId(dto.artId())
                        .build())
                .toList();
    }
}
