package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "hero_skill_tiers",
        uniqueConstraints = @UniqueConstraint(name = "uq_hero_skill_tiers_placement", columnNames = "tier_placement_key")
)
public class HeroSkillTierEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier_placement_key", nullable = false)
    private String tierPlacementKey;
    @Column(name = "tier_key")
    private String tierKey;
    @Column(name = "tree_key")
    private String treeKey;
    @Column(name = "tree_type")
    private String treeType;
    @Column(name = "tier_index")
    private Integer tierIndex;
    @Column(name = "level_prerequisite")
    private Integer levelPrerequisite;
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "skill_keys", columnDefinition = "text")
    private List<String> skillKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    public Long getId() { return id; }
    public String getTierPlacementKey() { return tierPlacementKey; }
    public void setTierPlacementKey(String tierPlacementKey) { this.tierPlacementKey = tierPlacementKey; }
    public String getTierKey() { return tierKey; }
    public void setTierKey(String tierKey) { this.tierKey = tierKey; }
    public String getTreeKey() { return treeKey; }
    public void setTreeKey(String treeKey) { this.treeKey = treeKey; }
    public String getTreeType() { return treeType; }
    public void setTreeType(String treeType) { this.treeType = treeType; }
    public Integer getTierIndex() { return tierIndex; }
    public void setTierIndex(Integer tierIndex) { this.tierIndex = tierIndex; }
    public Integer getLevelPrerequisite() { return levelPrerequisite; }
    public void setLevelPrerequisite(Integer levelPrerequisite) { this.levelPrerequisite = levelPrerequisite; }
    public List<String> getSkillKeys() { return skillKeys; }
    public void setSkillKeys(List<String> values) { this.skillKeys = copy(values); }
    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> values) { this.referenceKeys = copy(values); }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
