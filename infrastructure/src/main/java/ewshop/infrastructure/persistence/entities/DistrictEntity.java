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

    @ElementCollection
    @CollectionTable(name = "district_description_lines", joinColumns = @JoinColumn(name = "district_id"))
    @OrderColumn(name = "line_index")
    @Column(name = "line", nullable = false, length = 800)
    private List<String> descriptionLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "unlock_technology_keys", columnDefinition = "text")
    private List<String> unlockTechnologyKeys = new ArrayList<>();

    @Column(name = "level_up_target_district_key")
    private String levelUpTargetDistrictKey;

    @Column(name = "level_up_required_adjacent_district_count")
    private Integer levelUpRequiredAdjacentDistrictCount;

    @Column(name = "placement_neighbour_operator")
    private String placementNeighbourOperator;

    @Column(name = "placement_neighbour_territory_constraint")
    private String placementNeighbourTerritoryConstraint;

    @Column(name = "placement_neighbour_ignore_cliff")
    private Boolean placementNeighbourIgnoreCliff;

    public DistrictEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDistrictKey() { return districtKey; }
    public void setDistrictKey(String districtKey) { this.districtKey = districtKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> descriptionLines) {
        this.descriptionLines = (descriptionLines == null) ? new ArrayList<>() : new ArrayList<>(descriptionLines);
    }

    public List<String> getUnlockTechnologyKeys() { return unlockTechnologyKeys; }
    public void setUnlockTechnologyKeys(List<String> unlockTechnologyKeys) {
        this.unlockTechnologyKeys = (unlockTechnologyKeys == null)
                ? new ArrayList<>()
                : new ArrayList<>(unlockTechnologyKeys);
    }

    public String getLevelUpTargetDistrictKey() { return levelUpTargetDistrictKey; }
    public void setLevelUpTargetDistrictKey(String levelUpTargetDistrictKey) {
        this.levelUpTargetDistrictKey = levelUpTargetDistrictKey;
    }

    public Integer getLevelUpRequiredAdjacentDistrictCount() { return levelUpRequiredAdjacentDistrictCount; }
    public void setLevelUpRequiredAdjacentDistrictCount(Integer levelUpRequiredAdjacentDistrictCount) {
        this.levelUpRequiredAdjacentDistrictCount = levelUpRequiredAdjacentDistrictCount;
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
}
