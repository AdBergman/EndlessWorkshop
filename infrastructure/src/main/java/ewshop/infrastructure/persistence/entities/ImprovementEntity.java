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
}