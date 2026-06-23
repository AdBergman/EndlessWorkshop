package ewshop.facade.mapper;

import ewshop.domain.command.ImprovementImportSnapshot;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.facade.dto.importing.constructibles.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportImprovementDto;

import java.util.List;

import static java.util.Collections.emptyList;

public class ImprovementImportMapper {

    public static ImprovementImportSnapshot toSnapshot(ImprovementImportImprovementDto dto) {
        if (dto == null) throw new IllegalArgumentException("Row is required");

        return new ImprovementImportSnapshot(
                req(dto.constructibleKey(), "constructibleKey"),
                req(dto.displayName(), "displayName"),
                trimToNull(dto.category()),
                cleanLines(dto.descriptionLines()),
                cleanLines(dto.unlockTechnologyKeys()),
                toPlacement(dto.placementPrerequisites())
        );
    }

    private static String req(String v, String field) {
        var t = v == null ? null : v.trim();
        if (t == null || t.isEmpty()) throw new IllegalArgumentException("Missing required field: " + field);
        return t;
    }

    private static String trimToNull(String v) {
        if (v == null) return null;
        var t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private static List<String> cleanLines(List<String> lines) {
        if (lines == null) return emptyList();
        return lines.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .toList();
    }

    private static ConstructiblePlacementPrerequisites toPlacement(ConstructiblePlacementPrerequisitesDto dto) {
        if (dto == null) return null;

        ConstructiblePlacementPrerequisites placement = new ConstructiblePlacementPrerequisites(
                toNeighbourPlacement(dto.neighbourTiles())
        );
        return placement.isEmpty() ? null : placement;
    }

    private static ConstructibleNeighbourPlacement toNeighbourPlacement(ConstructibleNeighbourPlacementDto dto) {
        if (dto == null) return null;

        ConstructibleNeighbourPlacement placement = new ConstructibleNeighbourPlacement(
                trimToNull(dto.operator()),
                trimToNull(dto.territoryConstraint()),
                dto.ignoreCliff()
        );
        return placement.isEmpty() ? null : placement;
    }
}
