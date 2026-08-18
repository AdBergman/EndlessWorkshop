package ewshop.facade.mapper;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePointOfInterestPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.ConstructibleRiverPlacement;
import ewshop.domain.model.ConstructibleTerrainPlacement;
import ewshop.domain.model.DistrictLevelUp;
import ewshop.facade.dto.importing.constructibles.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructiblePointOfInterestPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.importing.constructibles.ConstructibleRiverPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructibleTerrainPlacementDto;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;
import ewshop.facade.dto.importing.districts.DistrictLevelUpDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
                dto.tier(),
                dto.constructibleLevel(),
                descriptionLines,
                cleanConstructionCost(dto.constructionCost()),
                cleanLines(dto.descriptorKeys()),
                cleanLines(dto.referenceKeys()),
                cleanLines(dto.unlockTechnologyKeys()),
                dto.isFactionSpecific(),
                trimToNull(dto.factionKey()),
                dto.isVariant(),
                dto.isPlayerFacing(),
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

    private static List<String> cleanConstructionCost(Object value) {
        if (value == null) return List.of();

        if (value instanceof List<?> list) {
            List<String> out = new ArrayList<>(list.size());
            for (Object item : list) {
                addTrimmedString(out, item);
            }
            return out;
        }

        if (value instanceof Map<?, ?> map) {
            List<String> out = new ArrayList<>();
            addTrimmedString(out, map.get("productionCostType"));

            Object resourcePrerequisites = map.get("resourcePrerequisites");
            if (resourcePrerequisites instanceof List<?> resources) {
                for (Object resource : resources) {
                    if (resource instanceof Map<?, ?> resourceMap) {
                        String resourceType = trimToNull(asString(resourceMap.get("resourceType")));
                        String amount = formatAmount(resourceMap.get("amount"));
                        if (resourceType != null && amount != null) {
                            out.add(amount + " " + resourceType);
                        } else {
                            addTrimmedString(out, resourceType);
                        }
                    }
                }
            }

            return out;
        }

        String singleValue = trimToNull(asString(value));
        return singleValue == null ? List.of() : List.of(singleValue);
    }

    private static void addTrimmedString(List<String> out, Object value) {
        String stringValue = trimToNull(asString(value));
        if (stringValue != null) {
            out.add(stringValue);
        }
    }

    private static String asString(Object value) {
        return value instanceof String stringValue ? stringValue : null;
    }

    private static String formatAmount(Object value) {
        if (value instanceof Number number) {
            double amount = number.doubleValue();
            if (amount == Math.rint(amount)) {
                return Long.toString(Math.round(amount));
            }
            return Double.toString(amount);
        }

        return trimToNull(asString(value));
    }

    private static DistrictLevelUp toLevelUp(DistrictLevelUpDto dto) {
        if (dto == null) return null;

        DistrictLevelUp levelUp = new DistrictLevelUp(
                trimToNull(dto.targetDistrictKey()),
                dto.requiredAdjacentDistrictCount(),
                cleanLines(dto.validNeighbourDescriptorKeys()),
                trimToNull(dto.validNeighbourUiMapperKey()),
                cleanLines(dto.requiredFactionTraitKeys())
        );
        return levelUp.isEmpty() ? null : levelUp;
    }

    private static ConstructiblePlacementPrerequisites toPlacement(ConstructiblePlacementPrerequisitesDto dto) {
        if (dto == null) return null;

        ConstructiblePlacementPrerequisites placement = new ConstructiblePlacementPrerequisites(
                toNeighbourPlacement(dto.neighbourTiles()),
                toTerrainPlacement(dto.terrain()),
                toRiverPlacement(dto.river()),
                toPointOfInterestPlacement(dto.pointOfInterest())
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

    private static ConstructibleTerrainPlacement toTerrainPlacement(ConstructibleTerrainPlacementDto dto) {
        if (dto == null) return null;

        ConstructibleTerrainPlacement placement = new ConstructibleTerrainPlacement(
                trimToNull(dto.constraint()),
                cleanLines(dto.terrainTypeKeys()),
                dto.canBuildOnWasteland(),
                dto.canBuildOnMud()
        );
        return placement.isEmpty() ? null : placement;
    }

    private static ConstructibleRiverPlacement toRiverPlacement(ConstructibleRiverPlacementDto dto) {
        if (dto == null) return null;

        ConstructibleRiverPlacement placement = new ConstructibleRiverPlacement(trimToNull(dto.constraint()));
        return placement.isEmpty() ? null : placement;
    }

    private static ConstructiblePointOfInterestPlacement toPointOfInterestPlacement(
            ConstructiblePointOfInterestPlacementDto dto
    ) {
        if (dto == null) return null;

        ConstructiblePointOfInterestPlacement placement = new ConstructiblePointOfInterestPlacement(
                trimToNull(dto.constraint()),
                cleanLines(dto.pointOfInterestKeys())
        );
        return placement.isEmpty() ? null : placement;
    }
}
