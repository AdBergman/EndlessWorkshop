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
}