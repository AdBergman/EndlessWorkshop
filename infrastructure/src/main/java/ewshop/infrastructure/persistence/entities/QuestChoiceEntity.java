package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quest_choices",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_quest_choices_quest_choice_key",
                columnNames = {"quest_id", "choice_key"}
        )
)
public class QuestChoiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quest_id", nullable = false, foreignKey = @ForeignKey(name = "fk_quest_choices_quest"))
    private QuestEntity quest;

    @Column(name = "choice_key", nullable = false, length = 220)
    private String choiceKey;

    @Column(name = "choice_order", nullable = false)
    private int choiceOrder;

    @Column(name = "display_name", length = 400)
    private String displayName;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "description_lines", columnDefinition = "text")
    private List<String> descriptionLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "completion_prerequisite_lines", columnDefinition = "text")
    private List<String> completionPrerequisiteLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "failure_prerequisite_lines", columnDefinition = "text")
    private List<String> failurePrerequisiteLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reward_display_lines", columnDefinition = "text")
    private List<String> rewardDisplayLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "next_quest_keys", columnDefinition = "text")
    private List<String> nextQuestKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    @OneToMany(mappedBy = "choice", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<QuestStepEntity> steps = new ArrayList<>();

    public Long getId() { return id; }

    public QuestEntity getQuest() { return quest; }
    public void setQuest(QuestEntity quest) { this.quest = quest; }

    public String getChoiceKey() { return choiceKey; }
    public void setChoiceKey(String choiceKey) { this.choiceKey = choiceKey; }

    public int getChoiceOrder() { return choiceOrder; }
    public void setChoiceOrder(int choiceOrder) { this.choiceOrder = choiceOrder; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> descriptionLines) {
        this.descriptionLines = descriptionLines == null ? new ArrayList<>() : new ArrayList<>(descriptionLines);
    }

    public List<String> getCompletionPrerequisiteLines() { return completionPrerequisiteLines; }
    public void setCompletionPrerequisiteLines(List<String> completionPrerequisiteLines) {
        this.completionPrerequisiteLines = completionPrerequisiteLines == null ? new ArrayList<>() : new ArrayList<>(completionPrerequisiteLines);
    }

    public List<String> getFailurePrerequisiteLines() { return failurePrerequisiteLines; }
    public void setFailurePrerequisiteLines(List<String> failurePrerequisiteLines) {
        this.failurePrerequisiteLines = failurePrerequisiteLines == null ? new ArrayList<>() : new ArrayList<>(failurePrerequisiteLines);
    }

    public List<String> getRewardDisplayLines() { return rewardDisplayLines; }
    public void setRewardDisplayLines(List<String> rewardDisplayLines) {
        this.rewardDisplayLines = rewardDisplayLines == null ? new ArrayList<>() : new ArrayList<>(rewardDisplayLines);
    }

    public List<String> getNextQuestKeys() { return nextQuestKeys; }
    public void setNextQuestKeys(List<String> nextQuestKeys) {
        this.nextQuestKeys = nextQuestKeys == null ? new ArrayList<>() : new ArrayList<>(nextQuestKeys);
    }

    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> referenceKeys) {
        this.referenceKeys = referenceKeys == null ? new ArrayList<>() : new ArrayList<>(referenceKeys);
    }

    public List<QuestStepEntity> getSteps() { return steps; }
    public void setSteps(List<QuestStepEntity> steps) {
        this.steps.clear();
        if (steps != null) {
            steps.forEach(this::addStep);
        }
    }

    public void addStep(QuestStepEntity step) {
        if (step == null) return;
        step.setChoice(this);
        steps.add(step);
    }
}
