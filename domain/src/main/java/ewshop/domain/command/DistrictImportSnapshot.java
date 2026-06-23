package ewshop.domain.command;

import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.DistrictLevelUp;

import java.util.List;

public final class DistrictImportSnapshot {

    private final String districtKey;
    private final String displayName;
    private final String category;
    private final List<String> descriptionLines;
    private final List<String> unlockTechnologyKeys;
    private final DistrictLevelUp levelUp;
    private final ConstructiblePlacementPrerequisites placementPrerequisites;

    public DistrictImportSnapshot(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(districtKey, displayName, category, descriptionLines, List.of(), null, null);
    }

    public DistrictImportSnapshot(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines,
            List<String> unlockTechnologyKeys,
            DistrictLevelUp levelUp,
            ConstructiblePlacementPrerequisites placementPrerequisites
    ) {
        this.districtKey = districtKey;
        this.displayName = displayName;
        this.category = category;
        this.descriptionLines = descriptionLines == null ? List.of() : List.copyOf(descriptionLines);
        this.unlockTechnologyKeys = unlockTechnologyKeys == null ? List.of() : List.copyOf(unlockTechnologyKeys);
        this.levelUp = levelUp != null && levelUp.isEmpty() ? null : levelUp;
        this.placementPrerequisites = placementPrerequisites != null && placementPrerequisites.isEmpty()
                ? null
                : placementPrerequisites;
    }

    public String districtKey() { return districtKey; }
    public String displayName() { return displayName; }
    public String category() { return category; }
    public List<String> descriptionLines() { return descriptionLines; }
    public List<String> unlockTechnologyKeys() { return unlockTechnologyKeys; }
    public DistrictLevelUp levelUp() { return levelUp; }
    public ConstructiblePlacementPrerequisites placementPrerequisites() { return placementPrerequisites; }
}
