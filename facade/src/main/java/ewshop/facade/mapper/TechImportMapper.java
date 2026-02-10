package ewshop.facade.mapper;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechTraitPrereq;
import ewshop.domain.command.TechUnlockTuple;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.importing.tech.TechImportTechDto;

import java.util.List;

public class TechImportMapper {

    public static TechImportSnapshot toDomain(TechImportTechDto dto) {
        if (dto == null) return null;

        if (dto.techKey() == null || dto.techKey().isBlank()) {
            throw new IllegalArgumentException("Import techKey is required");
        }

        if (dto.quadrant() == null || dto.quadrant().isBlank()) {
            throw new IllegalArgumentException(
                    "Missing quadrant for techKey: " + dto.techKey()
            );
        }

        TechType type;
        try {
            type = TechType.valueOf(dto.quadrant().trim().toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid quadrant '" + dto.quadrant() + "' for techKey: " + dto.techKey()
            );
        }

        int era = dto.eraIndex() == null ? 1 : dto.eraIndex();

        var prereqs = safeList(dto.technologyPrerequisiteTechKeys()).stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .toList();

        var exclusivePrereqs = safeList(dto.exclusiveTechnologyPrerequisiteTechKeys()).stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .toList();

        var traits = safeList(dto.factionTraitPrerequisites()).stream()
                .filter(t -> t != null && t.traitKey() != null && !t.traitKey().isBlank())
                .map(t -> TechTraitPrereq.builder()
                        .operator(t.operator())
                        .traitKey(t.traitKey())
                        .build())
                .toList();

        var unlocks = safeList(dto.unlocks()).stream()
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
                .hidden(dto.hidden() != null && dto.hidden())
                .era(era)
                .type(type)
                .prereqTechKeys(prereqs)
                .exclusivePrereqTechKeys(exclusivePrereqs)
                .traitPrereqs(traits)
                .unlocks(unlocks)
                .build();
    }

    private static <T> List<T> safeList(List<T> list) {
        return list == null ? List.of() : list;
    }
}