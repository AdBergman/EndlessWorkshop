package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "rich_heroes",
        uniqueConstraints = @UniqueConstraint(name = "uq_rich_heroes_unit_key", columnNames = "unit_key")
)
public class RichHeroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unit_key", nullable = false)
    private String unitKey;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "faction")
    private String faction;

    @Column(name = "faction_key")
    private String factionKey;

    @Column(name = "is_major_faction")
    private Boolean isMajorFaction;

    @Column(name = "hero_key")
    private String heroKey;

    @Column(name = "hero_class_key")
    private String heroClassKey;

    @Column(name = "origin_kind")
    private String originKind;

    @Column(name = "origin_faction_key")
    private String originFactionKey;

    @Column(name = "minor_faction_key")
    private String minorFactionKey;

    @Column(name = "unit_class_key")
    private String unitClassKey;

    @Column(name = "attack_skill_key")
    private String attackSkillKey;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "own_ability_keys", columnDefinition = "text")
    private List<String> ownAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "ability_keys", columnDefinition = "text")
    private List<String> abilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "combat_ability_keys", columnDefinition = "text")
    private List<String> combatAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "tactical_ability_keys", columnDefinition = "text")
    private List<String> tacticalAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "passive_ability_keys", columnDefinition = "text")
    private List<String> passiveAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "mechanical_ability_keys", columnDefinition = "text")
    private List<String> mechanicalAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "class_rule_ability_keys", columnDefinition = "text")
    private List<String> classRuleAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "hidden_helper_ability_keys", columnDefinition = "text")
    private List<String> hiddenHelperAbilityKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "default_skill_keys", columnDefinition = "text")
    private List<String> defaultSkillKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "applicable_skill_tree_keys", columnDefinition = "text")
    private List<String> applicableSkillTreeKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "description_lines", columnDefinition = "text")
    private List<String> descriptionLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    public Long getId() { return id; }
    public String getUnitKey() { return unitKey; }
    public void setUnitKey(String unitKey) { this.unitKey = unitKey; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getFaction() { return faction; }
    public void setFaction(String faction) { this.faction = faction; }
    public String getFactionKey() { return factionKey; }
    public void setFactionKey(String factionKey) { this.factionKey = factionKey; }
    public Boolean getIsMajorFaction() { return isMajorFaction; }
    public void setIsMajorFaction(Boolean majorFaction) { isMajorFaction = majorFaction; }
    public String getHeroKey() { return heroKey; }
    public void setHeroKey(String heroKey) { this.heroKey = heroKey; }
    public String getHeroClassKey() { return heroClassKey; }
    public void setHeroClassKey(String heroClassKey) { this.heroClassKey = heroClassKey; }
    public String getOriginKind() { return originKind; }
    public void setOriginKind(String originKind) { this.originKind = originKind; }
    public String getOriginFactionKey() { return originFactionKey; }
    public void setOriginFactionKey(String originFactionKey) { this.originFactionKey = originFactionKey; }
    public String getMinorFactionKey() { return minorFactionKey; }
    public void setMinorFactionKey(String minorFactionKey) { this.minorFactionKey = minorFactionKey; }
    public String getUnitClassKey() { return unitClassKey; }
    public void setUnitClassKey(String unitClassKey) { this.unitClassKey = unitClassKey; }
    public String getAttackSkillKey() { return attackSkillKey; }
    public void setAttackSkillKey(String attackSkillKey) { this.attackSkillKey = attackSkillKey; }
    public List<String> getOwnAbilityKeys() { return ownAbilityKeys; }
    public void setOwnAbilityKeys(List<String> values) { this.ownAbilityKeys = copy(values); }
    public List<String> getAbilityKeys() { return abilityKeys; }
    public void setAbilityKeys(List<String> values) { this.abilityKeys = copy(values); }
    public List<String> getCombatAbilityKeys() { return combatAbilityKeys; }
    public void setCombatAbilityKeys(List<String> values) { this.combatAbilityKeys = copy(values); }
    public List<String> getTacticalAbilityKeys() { return tacticalAbilityKeys; }
    public void setTacticalAbilityKeys(List<String> values) { this.tacticalAbilityKeys = copy(values); }
    public List<String> getPassiveAbilityKeys() { return passiveAbilityKeys; }
    public void setPassiveAbilityKeys(List<String> values) { this.passiveAbilityKeys = copy(values); }
    public List<String> getMechanicalAbilityKeys() { return mechanicalAbilityKeys; }
    public void setMechanicalAbilityKeys(List<String> values) { this.mechanicalAbilityKeys = copy(values); }
    public List<String> getClassRuleAbilityKeys() { return classRuleAbilityKeys; }
    public void setClassRuleAbilityKeys(List<String> values) { this.classRuleAbilityKeys = copy(values); }
    public List<String> getHiddenHelperAbilityKeys() { return hiddenHelperAbilityKeys; }
    public void setHiddenHelperAbilityKeys(List<String> values) { this.hiddenHelperAbilityKeys = copy(values); }
    public List<String> getDefaultSkillKeys() { return defaultSkillKeys; }
    public void setDefaultSkillKeys(List<String> values) { this.defaultSkillKeys = copy(values); }
    public List<String> getApplicableSkillTreeKeys() { return applicableSkillTreeKeys; }
    public void setApplicableSkillTreeKeys(List<String> values) { this.applicableSkillTreeKeys = copy(values); }
    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> values) { this.descriptionLines = copy(values); }
    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> values) { this.referenceKeys = copy(values); }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
