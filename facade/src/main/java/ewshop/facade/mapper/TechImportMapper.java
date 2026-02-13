package ewshop.facade.mapper;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechTraitPrereq;
import ewshop.domain.command.TechUnlockTuple;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.importing.tech.TechImportTechDto;

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
            throw new IllegalArgumentException(
                    "Missing quadrant for techKey: " + dto.techKey()
            );
        }

        TechType type = mapQuadrantToTechType(dto.quadrant(), dto.techKey());
        int era = dto.eraIndex() == null ? 1 : dto.eraIndex();

        var prereqs = emptyIfNull(dto.technologyPrerequisiteTechKeys()).stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .toList();

        var exclusivePrereqs = emptyIfNull(dto.exclusiveTechnologyPrerequisiteTechKeys()).stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .toList();

        var traits = emptyIfNull(dto.factionTraitPrerequisites()).stream()
                .filter(t -> t != null && t.traitKey() != null && !t.traitKey().isBlank())
                .map(t -> TechTraitPrereq.builder()
                        .operator(t.operator())
                        .traitKey(t.traitKey())
                        .build())
                .toList();

        var unlocks = emptyIfNull(dto.unlocks()).stream()
                .filter(u -> u != null && u.unlockElementName() != null && !u.unlockElementName().isBlank())
                .map(u -> TechUnlockTuple.builder()
                        .unlockType(u.unlockType())
                        .unlockCategory(u.unlockCategory())
                        .unlockElementName(u.unlockElementName())
                        .build())
                .toList();

        return TechImportSnapshot.builder()
                .techKey(dto.techKey())
                .displayName(dto.displayName())
                .lore(dto.lore())
                .hidden(Boolean.TRUE.equals(dto.hidden()))
                .era(era)
                .type(type)
                .prereqTechKeys(prereqs)
                .exclusivePrereqTechKeys(exclusivePrereqs)
                .traitPrereqs(traits)
                .unlocks(unlocks)
                .build();
    }

    private static TechType mapQuadrantToTechType(String quadrantRaw, String techKey) {
        String q = quadrantRaw.trim().toUpperCase();

        if ("DEVELOPMENT".equals(q)) {
            return TechType.ECONOMY;
        }

        try {
            return TechType.valueOf(q);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid quadrant '" + quadrantRaw + "' for techKey: " + techKey
            );
        }
    }

    private static <T> List<T> emptyIfNull(List<T> list) {
        return list == null ? List.of() : list;
    }
}