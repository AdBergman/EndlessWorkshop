package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "districts",
        uniqueConstraints = @UniqueConstraint(name = "uq_district_key", columnNames = "district_key")
)
public class DistrictEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "district_key", nullable = false, unique = true, length = 220)
    private String districtKey;

    @Column(name = "display_name", nullable = false, length = 400)
    private String displayName;

    @Column(name = "category", length = 200)
    private String category;

    @Column(name = "tier")
    private Integer tier;

    @Column(name = "constructible_level")
    private Integer constructibleLevel;

    @ElementCollection
    @CollectionTable(name = "district_description_lines", joinColumns = @JoinColumn(name = "district_id"))
    @OrderColumn(name = "line_index")
    @Column(name = "line", nullable = false, length = 800)
    private List<String> descriptionLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "construction_cost", columnDefinition = "text")
    private List<String> constructionCost = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "descriptor_keys", columnDefinition = "text")
    private List<String> descriptorKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "unlock_technology_keys", columnDefinition = "text")
    private List<String> unlockTechnologyKeys = new ArrayList<>();

    @Column(name = "is_faction_specific")
    private Boolean factionSpecific;

    @Column(name = "faction_key", length = 220)
    private String factionKey;

    @Column(name = "is_variant")
    private Boolean variant;

    @Column(name = "is_player_facing")
    private Boolean playerFacing;

    @Column(name = "level_up_target_district_key")
    private String levelUpTargetDistrictKey;

    @Column(name = "level_up_required_adjacent_district_count")
    private Integer levelUpRequiredAdjacentDistrictCount;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "level_up_valid_neighbour_descriptor_keys", columnDefinition = "text")
    private List<String> levelUpValidNeighbourDescriptorKeys = new ArrayList<>();

    @Column(name = "level_up_valid_neighbour_ui_mapper_key")
    private String levelUpValidNeighbourUiMapperKey;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "level_up_required_faction_trait_keys", columnDefinition = "text")
    private List<String> levelUpRequiredFactionTraitKeys = new ArrayList<>();

    @Column(name = "placement_neighbour_operator")
    private String placementNeighbourOperator;

    @Column(name = "placement_neighbour_territory_constraint")
    private String placementNeighbourTerritoryConstraint;

    @Column(name = "placement_neighbour_ignore_cliff")
    private Boolean placementNeighbourIgnoreCliff;

    @Column(name = "placement_terrain_constraint")
    private String placementTerrainConstraint;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "placement_terrain_type_keys", columnDefinition = "text")
    private List<String> placementTerrainTypeKeys = new ArrayList<>();

    @Column(name = "placement_terrain_can_build_on_wasteland")
    private Boolean placementTerrainCanBuildOnWasteland;

    @Column(name = "placement_terrain_can_build_on_mud")
    private Boolean placementTerrainCanBuildOnMud;

    @Column(name = "placement_river_constraint")
    private String placementRiverConstraint;

    @Column(name = "placement_point_of_interest_constraint")
    private String placementPointOfInterestConstraint;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "placement_point_of_interest_keys", columnDefinition = "text")
    private List<String> placementPointOfInterestKeys = new ArrayList<>();

    public DistrictEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDistrictKey() { return districtKey; }
    public void setDistrictKey(String districtKey) { this.districtKey = districtKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTier() { return tier; }
    public void setTier(Integer tier) { this.tier = tier; }

    public Integer getConstructibleLevel() { return constructibleLevel; }
    public void setConstructibleLevel(Integer constructibleLevel) { this.constructibleLevel = constructibleLevel; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> descriptionLines) {
        this.descriptionLines = (descriptionLines == null) ? new ArrayList<>() : new ArrayList<>(descriptionLines);
    }

    public List<String> getConstructionCost() { return constructionCost; }
    public void setConstructionCost(List<String> constructionCost) {
        this.constructionCost = (constructionCost == null) ? new ArrayList<>() : new ArrayList<>(constructionCost);
    }

    public List<String> getDescriptorKeys() { return descriptorKeys; }
    public void setDescriptorKeys(List<String> descriptorKeys) {
        this.descriptorKeys = (descriptorKeys == null) ? new ArrayList<>() : new ArrayList<>(descriptorKeys);
    }

    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> referenceKeys) {
        this.referenceKeys = (referenceKeys == null) ? new ArrayList<>() : new ArrayList<>(referenceKeys);
    }

    public List<String> getUnlockTechnologyKeys() { return unlockTechnologyKeys; }
    public void setUnlockTechnologyKeys(List<String> unlockTechnologyKeys) {
        this.unlockTechnologyKeys = (unlockTechnologyKeys == null)
                ? new ArrayList<>()
                : new ArrayList<>(unlockTechnologyKeys);
    }

    public Boolean getFactionSpecific() { return factionSpecific; }
    public void setFactionSpecific(Boolean factionSpecific) { this.factionSpecific = factionSpecific; }

    public String getFactionKey() { return factionKey; }
    public void setFactionKey(String factionKey) { this.factionKey = factionKey; }

    public Boolean getVariant() { return variant; }
    public void setVariant(Boolean variant) { this.variant = variant; }

    public Boolean getPlayerFacing() { return playerFacing; }
    public void setPlayerFacing(Boolean playerFacing) { this.playerFacing = playerFacing; }

    public String getLevelUpTargetDistrictKey() { return levelUpTargetDistrictKey; }
    public void setLevelUpTargetDistrictKey(String levelUpTargetDistrictKey) {
        this.levelUpTargetDistrictKey = levelUpTargetDistrictKey;
    }

    public Integer getLevelUpRequiredAdjacentDistrictCount() { return levelUpRequiredAdjacentDistrictCount; }
    public void setLevelUpRequiredAdjacentDistrictCount(Integer levelUpRequiredAdjacentDistrictCount) {
        this.levelUpRequiredAdjacentDistrictCount = levelUpRequiredAdjacentDistrictCount;
    }

    public List<String> getLevelUpValidNeighbourDescriptorKeys() { return levelUpValidNeighbourDescriptorKeys; }
    public void setLevelUpValidNeighbourDescriptorKeys(List<String> levelUpValidNeighbourDescriptorKeys) {
        this.levelUpValidNeighbourDescriptorKeys = levelUpValidNeighbourDescriptorKeys == null
                ? new ArrayList<>()
                : new ArrayList<>(levelUpValidNeighbourDescriptorKeys);
    }

    public String getLevelUpValidNeighbourUiMapperKey() { return levelUpValidNeighbourUiMapperKey; }
    public void setLevelUpValidNeighbourUiMapperKey(String levelUpValidNeighbourUiMapperKey) {
        this.levelUpValidNeighbourUiMapperKey = levelUpValidNeighbourUiMapperKey;
    }

    public List<String> getLevelUpRequiredFactionTraitKeys() { return levelUpRequiredFactionTraitKeys; }
    public void setLevelUpRequiredFactionTraitKeys(List<String> levelUpRequiredFactionTraitKeys) {
        this.levelUpRequiredFactionTraitKeys = levelUpRequiredFactionTraitKeys == null
                ? new ArrayList<>()
                : new ArrayList<>(levelUpRequiredFactionTraitKeys);
    }

    public String getPlacementNeighbourOperator() { return placementNeighbourOperator; }
    public void setPlacementNeighbourOperator(String placementNeighbourOperator) {
        this.placementNeighbourOperator = placementNeighbourOperator;
    }

    public String getPlacementNeighbourTerritoryConstraint() { return placementNeighbourTerritoryConstraint; }
    public void setPlacementNeighbourTerritoryConstraint(String placementNeighbourTerritoryConstraint) {
        this.placementNeighbourTerritoryConstraint = placementNeighbourTerritoryConstraint;
    }

    public Boolean getPlacementNeighbourIgnoreCliff() { return placementNeighbourIgnoreCliff; }
    public void setPlacementNeighbourIgnoreCliff(Boolean placementNeighbourIgnoreCliff) {
        this.placementNeighbourIgnoreCliff = placementNeighbourIgnoreCliff;
    }

    public String getPlacementTerrainConstraint() { return placementTerrainConstraint; }
    public void setPlacementTerrainConstraint(String placementTerrainConstraint) {
        this.placementTerrainConstraint = placementTerrainConstraint;
    }

    public List<String> getPlacementTerrainTypeKeys() { return placementTerrainTypeKeys; }
    public void setPlacementTerrainTypeKeys(List<String> placementTerrainTypeKeys) {
        this.placementTerrainTypeKeys = placementTerrainTypeKeys == null
                ? new ArrayList<>()
                : new ArrayList<>(placementTerrainTypeKeys);
    }

    public Boolean getPlacementTerrainCanBuildOnWasteland() { return placementTerrainCanBuildOnWasteland; }
    public void setPlacementTerrainCanBuildOnWasteland(Boolean placementTerrainCanBuildOnWasteland) {
        this.placementTerrainCanBuildOnWasteland = placementTerrainCanBuildOnWasteland;
    }

    public Boolean getPlacementTerrainCanBuildOnMud() { return placementTerrainCanBuildOnMud; }
    public void setPlacementTerrainCanBuildOnMud(Boolean placementTerrainCanBuildOnMud) {
        this.placementTerrainCanBuildOnMud = placementTerrainCanBuildOnMud;
    }

    public String getPlacementRiverConstraint() { return placementRiverConstraint; }
    public void setPlacementRiverConstraint(String placementRiverConstraint) {
        this.placementRiverConstraint = placementRiverConstraint;
    }

    public String getPlacementPointOfInterestConstraint() { return placementPointOfInterestConstraint; }
    public void setPlacementPointOfInterestConstraint(String placementPointOfInterestConstraint) {
        this.placementPointOfInterestConstraint = placementPointOfInterestConstraint;
    }

    public List<String> getPlacementPointOfInterestKeys() { return placementPointOfInterestKeys; }
    public void setPlacementPointOfInterestKeys(List<String> placementPointOfInterestKeys) {
        this.placementPointOfInterestKeys = placementPointOfInterestKeys == null
                ? new ArrayList<>()
                : new ArrayList<>(placementPointOfInterestKeys);
    }
}
