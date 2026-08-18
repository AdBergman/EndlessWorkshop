package ewshop.domain.command;

import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.DistrictLevelUp;

import java.util.List;

public final class DistrictImportSnapshot {

    private final String districtKey;
    private final String displayName;
    private final String category;
    private final Integer tier;
    private final Integer constructibleLevel;
    private final List<String> descriptionLines;
    private final List<String> constructionCost;
    private final List<String> descriptorKeys;
    private final List<String> referenceKeys;
    private final List<String> unlockTechnologyKeys;
    private final Boolean factionSpecific;
    private final String factionKey;
    private final Boolean variant;
    private final Boolean playerFacing;
    private final DistrictLevelUp levelUp;
    private final ConstructiblePlacementPrerequisites placementPrerequisites;

    public DistrictImportSnapshot(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines,
            List<String> unlockTechnologyKeys,
            DistrictLevelUp levelUp,
            ConstructiblePlacementPrerequisites placementPrerequisites
    ) {
        this(
                districtKey,
                displayName,
                category,
                null,
                null,
                descriptionLines,
                List.of(),
                List.of(),
                List.of(),
                unlockTechnologyKeys,
                null,
                null,
                null,
                null,
                levelUp,
                placementPrerequisites
        );
    }

    public DistrictImportSnapshot(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(
                districtKey,
                displayName,
                category,
                null,
                null,
                descriptionLines,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    public DistrictImportSnapshot(
            String districtKey,
            String displayName,
            String category,
            Integer tier,
            Integer constructibleLevel,
            List<String> descriptionLines,
            List<String> constructionCost,
            List<String> descriptorKeys,
            List<String> referenceKeys,
            List<String> unlockTechnologyKeys,
            Boolean factionSpecific,
            String factionKey,
            Boolean variant,
            Boolean playerFacing,
            DistrictLevelUp levelUp,
            ConstructiblePlacementPrerequisites placementPrerequisites
    ) {
        this.districtKey = districtKey;
        this.displayName = displayName;
        this.category = category;
        this.tier = tier;
        this.constructibleLevel = constructibleLevel;
        this.descriptionLines = descriptionLines == null ? List.of() : List.copyOf(descriptionLines);
        this.constructionCost = constructionCost == null ? List.of() : List.copyOf(constructionCost);
        this.descriptorKeys = descriptorKeys == null ? List.of() : List.copyOf(descriptorKeys);
        this.referenceKeys = referenceKeys == null ? List.of() : List.copyOf(referenceKeys);
        this.unlockTechnologyKeys = unlockTechnologyKeys == null ? List.of() : List.copyOf(unlockTechnologyKeys);
        this.factionSpecific = factionSpecific;
        this.factionKey = trimToNull(factionKey);
        this.variant = variant;
        this.playerFacing = playerFacing;
        this.levelUp = levelUp != null && levelUp.isEmpty() ? null : levelUp;
        this.placementPrerequisites = placementPrerequisites != null && placementPrerequisites.isEmpty()
                ? null
                : placementPrerequisites;
    }

    public String districtKey() { return districtKey; }
    public String displayName() { return displayName; }
    public String category() { return category; }
    public Integer tier() { return tier; }
    public Integer constructibleLevel() { return constructibleLevel; }
    public List<String> descriptionLines() { return descriptionLines; }
    public List<String> constructionCost() { return constructionCost; }
    public List<String> descriptorKeys() { return descriptorKeys; }
    public List<String> referenceKeys() { return referenceKeys; }
    public List<String> unlockTechnologyKeys() { return unlockTechnologyKeys; }
    public Boolean factionSpecific() { return factionSpecific; }
    public String factionKey() { return factionKey; }
    public Boolean variant() { return variant; }
    public Boolean playerFacing() { return playerFacing; }
    public DistrictLevelUp levelUp() { return levelUp; }
    public ConstructiblePlacementPrerequisites placementPrerequisites() { return placementPrerequisites; }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }
}
