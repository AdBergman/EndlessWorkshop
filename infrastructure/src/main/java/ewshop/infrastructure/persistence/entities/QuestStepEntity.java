package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quest_steps",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_quest_steps_choice_step_index",
                columnNames = {"choice_id", "step_index"}
        )
)
public class QuestStepEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "choice_id", nullable = false, foreignKey = @ForeignKey(name = "fk_quest_steps_choice"))
    private QuestChoiceEntity choice;

    @Column(name = "step_index", nullable = false)
    private int stepIndex;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    @Column(name = "objective_text", columnDefinition = "text")
    private String objectiveText;

    @Column(name = "next_quest_key", length = 220)
    private String nextQuestKey;

    @Column(name = "fail_quest_key", length = 220)
    private String failQuestKey;

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
    @Column(name = "forbidden_prerequisite_lines", columnDefinition = "text")
    private List<String> forbiddenPrerequisiteLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "selection_prerequisite_lines", columnDefinition = "text")
    private List<String> selectionPrerequisiteLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reward_display_lines", columnDefinition = "text")
    private List<String> rewardDisplayLines = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    public Long getId() { return id; }

    public QuestChoiceEntity getChoice() { return choice; }
    public void setChoice(QuestChoiceEntity choice) { this.choice = choice; }

    public int getStepIndex() { return stepIndex; }
    public void setStepIndex(int stepIndex) { this.stepIndex = stepIndex; }

    public int getStepOrder() { return stepOrder; }
    public void setStepOrder(int stepOrder) { this.stepOrder = stepOrder; }

    public String getObjectiveText() { return objectiveText; }
    public void setObjectiveText(String objectiveText) { this.objectiveText = objectiveText; }

    public String getNextQuestKey() { return nextQuestKey; }
    public void setNextQuestKey(String nextQuestKey) { this.nextQuestKey = nextQuestKey; }

    public String getFailQuestKey() { return failQuestKey; }
    public void setFailQuestKey(String failQuestKey) { this.failQuestKey = failQuestKey; }

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

    public List<String> getForbiddenPrerequisiteLines() { return forbiddenPrerequisiteLines; }
    public void setForbiddenPrerequisiteLines(List<String> forbiddenPrerequisiteLines) {
        this.forbiddenPrerequisiteLines = forbiddenPrerequisiteLines == null ? new ArrayList<>() : new ArrayList<>(forbiddenPrerequisiteLines);
    }

    public List<String> getSelectionPrerequisiteLines() { return selectionPrerequisiteLines; }
    public void setSelectionPrerequisiteLines(List<String> selectionPrerequisiteLines) {
        this.selectionPrerequisiteLines = selectionPrerequisiteLines == null ? new ArrayList<>() : new ArrayList<>(selectionPrerequisiteLines);
    }

    public List<String> getRewardDisplayLines() { return rewardDisplayLines; }
    public void setRewardDisplayLines(List<String> rewardDisplayLines) {
        this.rewardDisplayLines = rewardDisplayLines == null ? new ArrayList<>() : new ArrayList<>(rewardDisplayLines);
    }

    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> referenceKeys) {
        this.referenceKeys = referenceKeys == null ? new ArrayList<>() : new ArrayList<>(referenceKeys);
    }
}
