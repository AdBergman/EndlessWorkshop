package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "improvements",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_improvement_constructible_key",
                columnNames = "constructible_key"
        )
)
public class ImprovementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "constructible_key", nullable = false)
    private String constructibleKey;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "category")
    private String category;

    @ElementCollection
    @CollectionTable(
            name = "improvement_description_lines",
            joinColumns = @JoinColumn(
                    name = "improvement_id",
                    foreignKey = @ForeignKey(name = "fk_improvement_desc_lines_improvement")
            )
    )
    @OrderColumn(name = "line_index")
    @Column(name = "line", nullable = false, columnDefinition = "text")
    private List<String> descriptionLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "unlock_technology_keys", columnDefinition = "text")
    private List<String> unlockTechnologyKeys = new ArrayList<>();

    @Column(name = "placement_neighbour_operator")
    private String placementNeighbourOperator;

    @Column(name = "placement_neighbour_territory_constraint")
    private String placementNeighbourTerritoryConstraint;

    @Column(name = "placement_neighbour_ignore_cliff")
    private Boolean placementNeighbourIgnoreCliff;

    public ImprovementEntity() {}

    public Long getId() {
        return id;
    }

    public String getConstructibleKey() {
        return constructibleKey;
    }

    public void setConstructibleKey(String constructibleKey) {
        this.constructibleKey = constructibleKey;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getDescriptionLines() {
        return descriptionLines;
    }

    public void setDescriptionLines(List<String> descriptionLines) {
        this.descriptionLines = (descriptionLines == null)
                ? new ArrayList<>()
                : new ArrayList<>(descriptionLines);
    }

    public List<String> getUnlockTechnologyKeys() {
        return unlockTechnologyKeys;
    }

    public void setUnlockTechnologyKeys(List<String> unlockTechnologyKeys) {
        this.unlockTechnologyKeys = (unlockTechnologyKeys == null)
                ? new ArrayList<>()
                : new ArrayList<>(unlockTechnologyKeys);
    }

    public String getPlacementNeighbourOperator() {
        return placementNeighbourOperator;
    }

    public void setPlacementNeighbourOperator(String placementNeighbourOperator) {
        this.placementNeighbourOperator = placementNeighbourOperator;
    }

    public String getPlacementNeighbourTerritoryConstraint() {
        return placementNeighbourTerritoryConstraint;
    }

    public void setPlacementNeighbourTerritoryConstraint(String placementNeighbourTerritoryConstraint) {
        this.placementNeighbourTerritoryConstraint = placementNeighbourTerritoryConstraint;
    }

    public Boolean getPlacementNeighbourIgnoreCliff() {
        return placementNeighbourIgnoreCliff;
    }

    public void setPlacementNeighbourIgnoreCliff(Boolean placementNeighbourIgnoreCliff) {
        this.placementNeighbourIgnoreCliff = placementNeighbourIgnoreCliff;
    }
}
