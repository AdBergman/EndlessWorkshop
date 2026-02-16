package ewshop.facade.mapper;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechTraitPrereq;
import ewshop.domain.command.TechUnlockTuple;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.dto.importing.tech.TechImportUnlockDto;

import java.util.ArrayList;
import java.util.List;

public final class TechImportMapper {

    private TechImportMapper() {}

    public static TechImportSnapshot toDomain(TechImportTechDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Import tech entry is null");
        }

        if (dto.techKey() == null || dto.techKey().isBlank()) {
            throw new IllegalArgumentException("Import techKey is required");
        }

        if (dto.quadrant() == null || dto.quadrant().isBlank()) {
            throw new IllegalArgumentException("Missing quadrant for techKey: " + dto.techKey());
        }

        TechType type = mapQuadrantToTechType(dto.quadrant(), dto.techKey());
        int era = dto.eraIndex() == null ? 1 : dto.eraIndex();

        List<String> prereqTechKeys = emptyIfNull(dto.technologyPrerequisiteTechKeys()).stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList();

        List<String> exclusivePrereqTechKeys = emptyIfNull(dto.exclusiveTechnologyPrerequisiteTechKeys()).stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList();

        List<TechTraitPrereq> traitPrereqs = emptyIfNull(dto.factionTraitPrerequisites()).stream()
                .filter(trait -> trait != null && trait.traitKey() != null && !trait.traitKey().isBlank())
                .map(trait -> TechTraitPrereq.builder()
                        .operator(trait.operator())
                        .traitKey(trait.traitKey())
                        .build())
                .toList();

        List<TechImportUnlockDto> unlockDtos = emptyIfNull(dto.unlocks());

        List<String> descriptionLines = collectDescriptorLines(unlockDtos);

        List<TechUnlockTuple> unlocks = unlockDtos.stream()
                .filter(unlockDto -> unlockDto != null)
                .filter(unlockDto -> unlockDto.unlockType() != null && !unlockDto.unlockType().isBlank())
                .filter(unlockDto -> !"Descriptor".equalsIgnoreCase(unlockDto.unlockType()))
                .filter(unlockDto -> unlockDto.unlockElementName() != null && !unlockDto.unlockElementName().isBlank())
                .map(unlockDto -> TechUnlockTuple.builder()
                        .unlockType(unlockDto.unlockType())
                        .unlockCategory(unlockDto.unlockCategory())
                        .unlockElementName(unlockDto.unlockElementName())
                        .build())
                .toList();

        return TechImportSnapshot.builder()
                .techKey(dto.techKey())
                .displayName(dto.displayName())
                .lore(dto.lore())
                .hidden(Boolean.TRUE.equals(dto.hidden()))
                .era(era)
                .type(type)
                .prereqTechKeys(prereqTechKeys)
                .exclusivePrereqTechKeys(exclusivePrereqTechKeys)
                .traitPrereqs(traitPrereqs)
                .descriptionLines(descriptionLines)
                .unlocks(unlocks)
                .build();
    }

    private static List<String> collectDescriptorLines(List<TechImportUnlockDto> unlockDtos) {
        if (unlockDtos == null || unlockDtos.isEmpty()) {
            return List.of();
        }

        List<String> lines = new ArrayList<>();
        for (TechImportUnlockDto unlockDto : unlockDtos) {
            if (unlockDto == null) continue;

            List<String> descriptorLines = unlockDto.descriptorLines();
            if (descriptorLines == null || descriptorLines.isEmpty()) continue;

            for (String line : descriptorLines) {
                if (line == null) continue;
                String trimmed = line.trim();
                if (!trimmed.isEmpty()) {
                    lines.add(trimmed);
                }
            }
        }
        return lines;
    }

    private static TechType mapQuadrantToTechType(String quadrantRaw, String techKey) {
        String quadrant = quadrantRaw.trim().toUpperCase();

        if ("DEVELOPMENT".equals(quadrant)) {
            return TechType.ECONOMY;
        }

        try {
            return TechType.valueOf(quadrant);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid quadrant '" + quadrantRaw + "' for techKey: " + techKey
            );
        }
    }

    private static <T> List<T> emptyIfNull(List<T> list) {
        return list == null ? List.of() : list;
    }
}