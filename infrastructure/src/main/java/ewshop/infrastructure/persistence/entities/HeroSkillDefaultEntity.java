package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "hero_skill_defaults",
        uniqueConstraints = @UniqueConstraint(name = "uq_hero_skill_defaults_hero_key", columnNames = "hero_key")
)
public class HeroSkillDefaultEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hero_key", nullable = false)
    private String heroKey;
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "default_skill_keys", columnDefinition = "text")
    private List<String> defaultSkillKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();
    @Column(name = "faction_key")
    private String factionKey;
    @Column(name = "class_key")
    private String classKey;

    public Long getId() { return id; }
    public String getHeroKey() { return heroKey; }
    public void setHeroKey(String heroKey) { this.heroKey = heroKey; }
    public List<String> getDefaultSkillKeys() { return defaultSkillKeys; }
    public void setDefaultSkillKeys(List<String> values) { this.defaultSkillKeys = copy(values); }
    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> values) { this.referenceKeys = copy(values); }
    public String getFactionKey() { return factionKey; }
    public void setFactionKey(String factionKey) { this.factionKey = factionKey; }
    public String getClassKey() { return classKey; }
    public void setClassKey(String classKey) { this.classKey = classKey; }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
