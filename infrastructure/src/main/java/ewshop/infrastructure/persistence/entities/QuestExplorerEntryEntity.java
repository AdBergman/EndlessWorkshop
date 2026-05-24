package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "QuestExplorerEntryEntity")
@Access(AccessType.FIELD)
@Table(
        name = "quest_explorer_entries",
        uniqueConstraints = @UniqueConstraint(name = "uq_quest_explorer_entries_entry_key", columnNames = "entry_key")
)
public class QuestExplorerEntryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "entry_key", nullable = false, length = 300)
    public String entryKey;

    @Column(name = "title", nullable = false, length = 500)
    public String title;

    @Column(name = "quest_type", length = 160)
    public String questType;

    @Column(name = "is_mandatory")
    public Boolean isMandatory;

    @Column(name = "is_key_narrative_beat")
    public Boolean isKeyNarrativeBeat;

    @ElementCollection
    @CollectionTable(name = "quest_explorer_entry_summary_lines", joinColumns = @JoinColumn(name = "entry_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line", nullable = false, columnDefinition = "TEXT")
    public List<String> summaryLines = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "quest_explorer_aliases", joinColumns = @JoinColumn(name = "entry_id"))
    @OrderColumn(name = "alias_order")
    @Column(name = "alias", nullable = false, length = 300)
    public List<String> aliases = new ArrayList<>();

    @OneToOne(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true, optional = false)
    public NavigationEntity navigation;

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "section_order")
    public List<LoreSectionEntity> loreSections = new ArrayList<>();

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "objective_order")
    public List<ObjectiveEntity> objectives = new ArrayList<>();

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "branch_row_order")
    public List<BranchEntity> branches = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "quest_explorer_quality_warnings", joinColumns = @JoinColumn(name = "entry_id"))
    @OrderColumn(name = "warning_order")
    @Column(name = "warning", nullable = false, columnDefinition = "TEXT")
    public List<String> qualityWarnings = new ArrayList<>();

    public QuestExplorerEntryEntity() {}

    @Entity(name = "QuestExplorerNavigationEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_navigation")
    public static class NavigationEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @OneToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "entry_id", nullable = false, unique = true)
        public QuestExplorerEntryEntity entry;

        @Column(name = "faction_key", length = 260)
        public String factionKey;
        @Column(name = "faction_name", length = 260)
        public String factionName;
        @Column(name = "quest_line_key", length = 260)
        public String questLineKey;
        @Column(name = "quest_line_name", length = 260)
        public String questLineName;
        @Column(name = "chapter")
        public Integer chapter;
        @Column(name = "chapter_label", length = 160)
        public String chapterLabel;
        @Column(name = "step")
        public Integer step;
        @Column(name = "step_label", length = 160)
        public String stepLabel;
        @Column(name = "sequence_index", nullable = false)
        public int sequenceIndex;
        @Column(name = "chapter_order")
        public Integer chapterOrder;
        @Column(name = "step_order")
        public Integer stepOrder;
        @Column(name = "branch_group_key", length = 300)
        public String branchGroupKey;
        @Column(name = "branch_label", length = 260)
        public String branchLabel;
        @Column(name = "branch_order")
        public Integer branchOrder;
        @Column(name = "is_branch_start")
        public Boolean isBranchStart;
        @Column(name = "is_branch_end")
        public Boolean isBranchEnd;

        @ElementCollection
        @CollectionTable(name = "quest_explorer_navigation_previous_entries", joinColumns = @JoinColumn(name = "navigation_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> previousEntryKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_navigation_next_entries", joinColumns = @JoinColumn(name = "navigation_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> nextEntryKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_navigation_failure_entries", joinColumns = @JoinColumn(name = "navigation_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> failureEntryKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_navigation_convergence_entries", joinColumns = @JoinColumn(name = "navigation_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> convergesIntoEntryKeys = new ArrayList<>();

        public NavigationEntity() {}
    }

    @Entity(name = "QuestExplorerLoreSectionEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_lore_sections")
    public static class LoreSectionEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "entry_id", nullable = false)
        public QuestExplorerEntryEntity entry;

        @Column(name = "section_key", nullable = false, length = 360)
        public String sectionKey;
        @Column(name = "phase", nullable = false, length = 80)
        public String phase;
        @Column(name = "choice_key", length = 300)
        public String choiceKey;
        @Column(name = "step_index")
        public Integer stepIndex;
        @Column(name = "objective_key", length = 360)
        public String objectiveKey;

        @Convert(converter = StringListJsonConverter.class)
        @Column(name = "revealed_by_branch_keys", columnDefinition = "TEXT")
        public List<String> revealedByBranchKeys = new ArrayList<>();

        @Convert(converter = StringListJsonConverter.class)
        @Column(name = "revealed_by_choice_keys", columnDefinition = "TEXT")
        public List<String> revealedByChoiceKeys = new ArrayList<>();

        @Convert(converter = StringMatrixJsonConverter.class)
        @Column(name = "revealed_by_branch_path_alternatives", columnDefinition = "TEXT")
        public List<List<String>> revealedByBranchPathAlternatives = new ArrayList<>();

        @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
        @OrderColumn(name = "line_order")
        public List<LoreLineEntity> lines = new ArrayList<>();

        public LoreSectionEntity() {}
    }

    @Entity(name = "QuestExplorerLoreLineEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_lore_lines")
    public static class LoreLineEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "section_id", nullable = false)
        public LoreSectionEntity section;

        @Column(name = "speaker_label", length = 260)
        public String speakerLabel;
        @Column(name = "role", nullable = false, length = 80)
        public String role;
        @Column(name = "text", nullable = false, columnDefinition = "TEXT")
        public String text;

        public LoreLineEntity() {}
    }

    @Entity(name = "QuestExplorerObjectiveEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_objectives")
    public static class ObjectiveEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "entry_id", nullable = false)
        public QuestExplorerEntryEntity entry;

        @Column(name = "objective_key", length = 360)
        public String objectiveKey;
        @Column(name = "text", nullable = false, columnDefinition = "TEXT")
        public String text;
        @Column(name = "phase", length = 120)
        public String phase;

        @Convert(converter = StringListJsonConverter.class)
        @Column(name = "revealed_by_branch_keys", columnDefinition = "TEXT")
        public List<String> revealedByBranchKeys = new ArrayList<>();

        @Convert(converter = StringListJsonConverter.class)
        @Column(name = "revealed_by_choice_keys", columnDefinition = "TEXT")
        public List<String> revealedByChoiceKeys = new ArrayList<>();

        @Convert(converter = StringMatrixJsonConverter.class)
        @Column(name = "revealed_by_branch_path_alternatives", columnDefinition = "TEXT")
        public List<List<String>> revealedByBranchPathAlternatives = new ArrayList<>();

        @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
        @OrderColumn(name = "requirement_order")
        public List<ObjectiveRequirementEntity> requirements = new ArrayList<>();

        @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
        @OrderColumn(name = "reward_order")
        public List<ObjectiveRewardEntity> rewards = new ArrayList<>();

        public ObjectiveEntity() {}
    }

    @Entity(name = "QuestExplorerBranchEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_branches")
    public static class BranchEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "entry_id", nullable = false)
        public QuestExplorerEntryEntity entry;

        @Column(name = "branch_key", nullable = false, length = 360)
        public String branchKey;
        @Column(name = "choice_key", length = 300)
        public String choiceKey;
        @Column(name = "label", nullable = false, length = 500)
        public String label;
        @Column(name = "order_index")
        public Integer orderIndex;
        @Column(name = "group_key", length = 300)
        public String groupKey;
        @Column(name = "group_label", length = 260)
        public String groupLabel;
        @Column(name = "branch_step_order")
        public Integer branchStepOrder;
        @Column(name = "parent_branch_key", length = 360)
        public String parentBranchKey;
        @Column(name = "parent_choice_key", length = 300)
        public String parentChoiceKey;
        @Column(name = "choice_group_key", length = 360)
        public String choiceGroupKey;
        @Column(name = "convergence_group_key", length = 360)
        public String convergenceGroupKey;
        @Column(name = "section_role", length = 80)
        public String sectionRole;

        @Convert(converter = StringListJsonConverter.class)
        @Column(name = "revealed_by_branch_keys", columnDefinition = "TEXT")
        public List<String> revealedByBranchKeys = new ArrayList<>();

        @Convert(converter = StringListJsonConverter.class)
        @Column(name = "revealed_by_choice_keys", columnDefinition = "TEXT")
        public List<String> revealedByChoiceKeys = new ArrayList<>();

        @Convert(converter = StringMatrixJsonConverter.class)
        @Column(name = "revealed_by_branch_path_alternatives", columnDefinition = "TEXT")
        public List<List<String>> revealedByBranchPathAlternatives = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_prerequisite_keys", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "key_order")
        @Column(name = "branch_key", nullable = false, length = 360)
        public List<String> prerequisiteBranchKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_prerequisite_path", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "path_order")
        @Column(name = "branch_key", nullable = false, length = 360)
        public List<String> prerequisiteBranchPath = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_next_entries", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> nextEntryKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_failure_entries", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> failureEntryKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_convergence_entries", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "link_order")
        @Column(name = "entry_key", nullable = false, length = 300)
        public List<String> convergesIntoEntryKeys = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_outcome_preview_lines", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "line_order")
        @Column(name = "line", nullable = false, columnDefinition = "TEXT")
        public List<String> outcomePreviewLines = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "quest_explorer_branch_conditions", joinColumns = @JoinColumn(name = "branch_id"))
        @OrderColumn(name = "condition_order")
        @Column(name = "condition_text", nullable = false, columnDefinition = "TEXT")
        public List<String> conditions = new ArrayList<>();

        @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
        @OrderColumn(name = "requirement_order")
        public List<BranchRequirementEntity> requirements = new ArrayList<>();

        @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
        @OrderColumn(name = "reward_order")
        public List<BranchRewardEntity> rewards = new ArrayList<>();

        public BranchEntity() {}
    }

    @MappedSuperclass
    @Access(AccessType.FIELD)
    public abstract static class RequirementFields {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;
        @Column(name = "requirement_key", nullable = false, columnDefinition = "TEXT")
        public String requirementKey;
        @Column(name = "kind", nullable = false, length = 160)
        public String kind;
        @Column(name = "display_text", nullable = false, columnDefinition = "TEXT")
        public String displayText;
        @Column(name = "polarity", length = 80)
        public String polarity;
        @Column(name = "group_label", length = 160)
        public String groupLabel;
        @Column(name = "group_order")
        public Integer groupOrder;
        @Column(name = "target_role", length = 160)
        public String targetRole;
        @Column(name = "target_label", length = 500)
        public String targetLabel;
        @Column(name = "required_count")
        public Integer requiredCount;
        @Column(name = "duration_turns")
        public Integer durationTurns;
        @Column(name = "state", length = 160)
        public String state;
        @Column(name = "reference_kind", length = 160)
        public String referenceKind;
        @Column(name = "reference_key", length = 300)
        public String referenceKey;
        @Column(name = "reference_display_name", length = 500)
        public String referenceDisplayName;
        @Column(name = "codex_entry_key", length = 300)
        public String codexEntryKey;
    }

    @MappedSuperclass
    @Access(AccessType.FIELD)
    public abstract static class RewardFields {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;
        @Column(name = "reward_key", nullable = false, columnDefinition = "TEXT")
        public String rewardKey;
        @Column(name = "kind", nullable = false, length = 160)
        public String kind;
        @Column(name = "display_text", nullable = false, columnDefinition = "TEXT")
        public String displayText;
        @Column(name = "amount", precision = 18, scale = 4)
        public BigDecimal amount;
        @Column(name = "group_label", length = 160)
        public String groupLabel;
        @Column(name = "group_order")
        public Integer groupOrder;
        @Column(name = "formula_text", columnDefinition = "TEXT")
        public String formulaText;
        @Column(name = "asset_kind", length = 160)
        public String assetKind;
        @Column(name = "asset_key", length = 300)
        public String assetKey;
        @Column(name = "asset_display_name", length = 500)
        public String assetDisplayName;
        @Column(name = "reference_kind", length = 160)
        public String referenceKind;
        @Column(name = "reference_key", length = 300)
        public String referenceKey;
        @Column(name = "reference_display_name", length = 500)
        public String referenceDisplayName;
        @Column(name = "codex_entry_key", length = 300)
        public String codexEntryKey;
        @Column(name = "target_scope_label", length = 260)
        public String targetScopeLabel;
    }

    @Entity(name = "QuestExplorerObjectiveRequirementEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_objective_requirements")
    public static class ObjectiveRequirementEntity extends RequirementFields {
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "objective_id", nullable = false)
        public ObjectiveEntity objective;
        public ObjectiveRequirementEntity() {}
    }

    @Entity(name = "QuestExplorerBranchRequirementEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_branch_requirements")
    public static class BranchRequirementEntity extends RequirementFields {
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "branch_id", nullable = false)
        public BranchEntity branch;
        public BranchRequirementEntity() {}
    }

    @Entity(name = "QuestExplorerObjectiveRewardEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_objective_rewards")
    public static class ObjectiveRewardEntity extends RewardFields {
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "objective_id", nullable = false)
        public ObjectiveEntity objective;
        public ObjectiveRewardEntity() {}
    }

    @Entity(name = "QuestExplorerBranchRewardEntity")
    @Access(AccessType.FIELD)
    @Table(name = "quest_explorer_branch_rewards")
    public static class BranchRewardEntity extends RewardFields {
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "branch_id", nullable = false)
        public BranchEntity branch;
        public BranchRewardEntity() {}
    }
}
