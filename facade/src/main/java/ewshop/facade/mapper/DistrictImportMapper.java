package ewshop.facade.mapper;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.DistrictLevelUp;
import ewshop.facade.dto.importing.constructibles.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;
import ewshop.facade.dto.importing.districts.DistrictLevelUpDto;

import java.util.ArrayList;
import java.util.List;

public final class DistrictImportMapper {

    private DistrictImportMapper() {}

    public static DistrictImportSnapshot toSnapshot(DistrictImportDistrictDto dto) {
        if (dto == null) throw new IllegalArgumentException("District row is null");

        String key = trimToNull(dto.districtKey());
        if (key == null) throw new IllegalArgumentException("districtKey is missing");

        String name = trimToNull(dto.displayName());
        if (name == null) throw new IllegalArgumentException("displayName is missing for " + key);

        String category = trimToNull(dto.category());

        List<String> descriptionLines = cleanLines(dto.descriptionLines());

        return new DistrictImportSnapshot(
                key,
                name,
                category,
                descriptionLines,
                cleanLines(dto.unlockTechnologyKeys()),
                toLevelUp(dto.levelUp()),
                toPlacement(dto.placementPrerequisites())
        );
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static List<String> cleanLines(List<String> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<String> out = new ArrayList<>(in.size());
        for (String line : in) {
            if (line == null) continue;
            String t = line.trim();
            if (t.isBlank()) continue;
            out.add(t);
        }
        return out;
    }

    private static DistrictLevelUp toLevelUp(DistrictLevelUpDto dto) {
        if (dto == null) return null;

        DistrictLevelUp levelUp = new DistrictLevelUp(
                trimToNull(dto.targetDistrictKey()),
                dto.requiredAdjacentDistrictCount()
        );
        return levelUp.isEmpty() ? null : levelUp;
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
