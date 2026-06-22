package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(
        name = "hero_skills",
        uniqueConstraints = @UniqueConstraint(name = "uq_hero_skills_skill_key", columnNames = "skill_key")
)
public class HeroSkillEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_key", nullable = false)
    private String skillKey;
    @Column(name = "entry_key")
    private String entryKey;
    @Column(name = "kind")
    private String kind;
    @Column(name = "display_name")
    private String displayName;
    @Column(name = "public_display_name")
    private String publicDisplayName;
    @Column(name = "primary_ability_key")
    private String primaryAbilityKey;
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "description_lines", columnDefinition = "text")
    private List<String> descriptionLines = new ArrayList<>();
    @Column(name = "resolved_display_name")
    private String resolvedDisplayName;
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "resolved_summary_lines", columnDefinition = "text")
    private List<String> resolvedSummaryLines = new ArrayList<>();
    @Column(name = "resolved_mechanic_kind")
    private String resolvedMechanicKind;
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "resolved_mechanic_tags", columnDefinition = "text")
    private List<String> resolvedMechanicTags = new ArrayList<>();
    @Column(name = "is_obsolete")
    private Boolean isObsolete;
    @Column(name = "is_active")
    private Boolean isActive;
    @Column(name = "is_passive")
    private Boolean isPassive;
    @Convert(converter = JsonMapListConverter.class)
    @Column(name = "placements", columnDefinition = "text")
    private List<Map<String, Object>> placements = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "prerequisite_skill_keys", columnDefinition = "text")
    private List<String> prerequisiteSkillKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "inhibited_by_skill_keys", columnDefinition = "text")
    private List<String> inhibitedBySkillKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "locked_by_skill_keys", columnDefinition = "text")
    private List<String> lockedBySkillKeys = new ArrayList<>();
    @Convert(converter = JsonMapListConverter.class)
    @Column(name = "effects", columnDefinition = "text")
    private List<Map<String, Object>> effects = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "unit_ability_keys", columnDefinition = "text")
    private List<String> unitAbilityKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "battle_skill_keys", columnDefinition = "text")
    private List<String> battleSkillKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "battle_ability_keys", columnDefinition = "text")
    private List<String> battleAbilityKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "descriptor_keys", columnDefinition = "text")
    private List<String> descriptorKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "unit_ability_event_keys", columnDefinition = "text")
    private List<String> unitAbilityEventKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reward_per_kill_in_battle_effect_keys", columnDefinition = "text")
    private List<String> rewardPerKillInBattleEffectKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "stat_affinity_names", columnDefinition = "text")
    private List<String> statAffinityNames = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "default_for_hero_keys", columnDefinition = "text")
    private List<String> defaultForHeroKeys = new ArrayList<>();
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    public Long getId() { return id; }
    public String getSkillKey() { return skillKey; }
    public void setSkillKey(String skillKey) { this.skillKey = skillKey; }
    public String getEntryKey() { return entryKey; }
    public void setEntryKey(String entryKey) { this.entryKey = entryKey; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getPublicDisplayName() { return publicDisplayName; }
    public void setPublicDisplayName(String publicDisplayName) { this.publicDisplayName = publicDisplayName; }
    public String getPrimaryAbilityKey() { return primaryAbilityKey; }
    public void setPrimaryAbilityKey(String primaryAbilityKey) { this.primaryAbilityKey = primaryAbilityKey; }
    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> values) { this.descriptionLines = copy(values); }
    public String getResolvedDisplayName() { return resolvedDisplayName; }
    public void setResolvedDisplayName(String resolvedDisplayName) { this.resolvedDisplayName = resolvedDisplayName; }
    public List<String> getResolvedSummaryLines() { return resolvedSummaryLines; }
    public void setResolvedSummaryLines(List<String> values) { this.resolvedSummaryLines = copy(values); }
    public String getResolvedMechanicKind() { return resolvedMechanicKind; }
    public void setResolvedMechanicKind(String resolvedMechanicKind) { this.resolvedMechanicKind = resolvedMechanicKind; }
    public List<String> getResolvedMechanicTags() { return resolvedMechanicTags; }
    public void setResolvedMechanicTags(List<String> values) { this.resolvedMechanicTags = copy(values); }
    public Boolean getIsObsolete() { return isObsolete; }
    public void setIsObsolete(Boolean obsolete) { isObsolete = obsolete; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Boolean getIsPassive() { return isPassive; }
    public void setIsPassive(Boolean passive) { isPassive = passive; }
    public List<Map<String, Object>> getPlacements() { return placements; }
    public void setPlacements(List<Map<String, Object>> values) { this.placements = copyMaps(values); }
    public List<String> getPrerequisiteSkillKeys() { return prerequisiteSkillKeys; }
    public void setPrerequisiteSkillKeys(List<String> values) { this.prerequisiteSkillKeys = copy(values); }
    public List<String> getInhibitedBySkillKeys() { return inhibitedBySkillKeys; }
    public void setInhibitedBySkillKeys(List<String> values) { this.inhibitedBySkillKeys = copy(values); }
    public List<String> getLockedBySkillKeys() { return lockedBySkillKeys; }
    public void setLockedBySkillKeys(List<String> values) { this.lockedBySkillKeys = copy(values); }
    public List<Map<String, Object>> getEffects() { return effects; }
    public void setEffects(List<Map<String, Object>> values) { this.effects = copyMaps(values); }
    public List<String> getUnitAbilityKeys() { return unitAbilityKeys; }
    public void setUnitAbilityKeys(List<String> values) { this.unitAbilityKeys = copy(values); }
    public List<String> getBattleSkillKeys() { return battleSkillKeys; }
    public void setBattleSkillKeys(List<String> values) { this.battleSkillKeys = copy(values); }
    public List<String> getBattleAbilityKeys() { return battleAbilityKeys; }
    public void setBattleAbilityKeys(List<String> values) { this.battleAbilityKeys = copy(values); }
    public List<String> getDescriptorKeys() { return descriptorKeys; }
    public void setDescriptorKeys(List<String> values) { this.descriptorKeys = copy(values); }
    public List<String> getUnitAbilityEventKeys() { return unitAbilityEventKeys; }
    public void setUnitAbilityEventKeys(List<String> values) { this.unitAbilityEventKeys = copy(values); }
    public List<String> getRewardPerKillInBattleEffectKeys() { return rewardPerKillInBattleEffectKeys; }
    public void setRewardPerKillInBattleEffectKeys(List<String> values) { this.rewardPerKillInBattleEffectKeys = copy(values); }
    public List<String> getStatAffinityNames() { return statAffinityNames; }
    public void setStatAffinityNames(List<String> values) { this.statAffinityNames = copy(values); }
    public List<String> getDefaultForHeroKeys() { return defaultForHeroKeys; }
    public void setDefaultForHeroKeys(List<String> values) { this.defaultForHeroKeys = copy(values); }
    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> values) { this.referenceKeys = copy(values); }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }

    private static List<Map<String, Object>> copyMaps(List<Map<String, Object>> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
