package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "hero_skill_trees",
        uniqueConstraints = @UniqueConstraint(name = "uq_hero_skill_trees_tree_key", columnNames = "tree_key")
)
public class HeroSkillTreeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tree_key", nullable = false)
    private String treeKey;
    @Column(name = "tree_type")
    private String treeType;
    @Column(name = "is_hidden")
    private Boolean isHidden;
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "tier_placement_keys", columnDefinition = "text")
    private List<String> tierPlacementKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "tier_keys", columnDefinition = "text")
    private List<String> tierKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "skill_keys", columnDefinition = "text")
    private List<String> skillKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();
    @Column(name = "class_prerequisite_key")
    private String classPrerequisiteKey;
    @Column(name = "faction_prerequisite_key")
    private String factionPrerequisiteKey;

    public Long getId() { return id; }
    public String getTreeKey() { return treeKey; }
    public void setTreeKey(String treeKey) { this.treeKey = treeKey; }
    public String getTreeType() { return treeType; }
    public void setTreeType(String treeType) { this.treeType = treeType; }
    public Boolean getIsHidden() { return isHidden; }
    public void setIsHidden(Boolean hidden) { isHidden = hidden; }
    public List<String> getTierPlacementKeys() { return tierPlacementKeys; }
    public void setTierPlacementKeys(List<String> values) { this.tierPlacementKeys = copy(values); }
    public List<String> getTierKeys() { return tierKeys; }
    public void setTierKeys(List<String> values) { this.tierKeys = copy(values); }
    public List<String> getSkillKeys() { return skillKeys; }
    public void setSkillKeys(List<String> values) { this.skillKeys = copy(values); }
    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> values) { this.referenceKeys = copy(values); }
    public String getClassPrerequisiteKey() { return classPrerequisiteKey; }
    public void setClassPrerequisiteKey(String classPrerequisiteKey) { this.classPrerequisiteKey = classPrerequisiteKey; }
    public String getFactionPrerequisiteKey() { return factionPrerequisiteKey; }
    public void setFactionPrerequisiteKey(String factionPrerequisiteKey) { this.factionPrerequisiteKey = factionPrerequisiteKey; }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
