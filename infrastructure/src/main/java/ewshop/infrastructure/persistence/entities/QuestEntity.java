package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quests",
        uniqueConstraints = @UniqueConstraint(name = "uq_quests_quest_key", columnNames = "quest_key")
)
public class QuestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quest_key", nullable = false, length = 220)
    private String questKey;

    @Column(name = "display_name", length = 400)
    private String displayName;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "description_lines", columnDefinition = "text")
    private List<String> descriptionLines = new ArrayList<>();

    @Column(name = "category_key", length = 220)
    private String categoryKey;

    @Column(name = "category_type", length = 120)
    private String categoryType;

    @Column(name = "is_branch_start", nullable = false)
    private boolean branchStart;

    @Column(name = "is_branch_end", nullable = false)
    private boolean branchEnd;

    @Column(name = "is_mandatory", nullable = false)
    private boolean mandatory;

    @Column(name = "is_key_narrative_beat", nullable = false)
    private boolean keyNarrativeBeat;

    @Column(name = "is_narrative_victory_path_choice", nullable = false)
    private boolean narrativeVictoryPathChoice;

    @Column(name = "chapter_key", length = 220)
    private String chapterKey;

    @Column(name = "chapter_index")
    private Integer chapterIndex;

    @Column(name = "chapter_number")
    private Integer chapterNumber;

    @Column(name = "quest_sequence_index")
    private Integer questSequenceIndex;

    @Column(name = "branch_group_key", length = 220)
    private String branchGroupKey;

    @Column(name = "branch_label", length = 220)
    private String branchLabel;

    @Column(name = "inferred_faction_key", length = 220)
    private String inferredFactionKey;

    @Column(name = "inferred_quest_line_key", length = 220)
    private String inferredQuestLineKey;

    @Column(name = "converges_into_quest_key", length = 220)
    private String convergesIntoQuestKey;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "previous_quest_keys", columnDefinition = "text")
    private List<String> previousQuestKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "next_quest_keys", columnDefinition = "text")
    private List<String> nextQuestKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "reference_keys", columnDefinition = "text")
    private List<String> referenceKeys = new ArrayList<>();

    @OneToMany(mappedBy = "quest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("choiceOrder ASC")
    private List<QuestChoiceEntity> choices = new ArrayList<>();

    @OneToMany(mappedBy = "quest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("blockOrder ASC")
    private List<QuestDialogBlockEntity> dialogBlocks = new ArrayList<>();

    public Long getId() { return id; }

    public String getQuestKey() { return questKey; }
    public void setQuestKey(String questKey) { this.questKey = questKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> descriptionLines) {
        this.descriptionLines = descriptionLines == null ? new ArrayList<>() : new ArrayList<>(descriptionLines);
    }

    public String getCategoryKey() { return categoryKey; }
    public void setCategoryKey(String categoryKey) { this.categoryKey = categoryKey; }

    public String getCategoryType() { return categoryType; }
    public void setCategoryType(String categoryType) { this.categoryType = categoryType; }

    public boolean isBranchStart() { return branchStart; }
    public void setBranchStart(boolean branchStart) { this.branchStart = branchStart; }

    public boolean isBranchEnd() { return branchEnd; }
    public void setBranchEnd(boolean branchEnd) { this.branchEnd = branchEnd; }

    public boolean isMandatory() { return mandatory; }
    public void setMandatory(boolean mandatory) { this.mandatory = mandatory; }

    public boolean isKeyNarrativeBeat() { return keyNarrativeBeat; }
    public void setKeyNarrativeBeat(boolean keyNarrativeBeat) { this.keyNarrativeBeat = keyNarrativeBeat; }

    public boolean isNarrativeVictoryPathChoice() { return narrativeVictoryPathChoice; }
    public void setNarrativeVictoryPathChoice(boolean narrativeVictoryPathChoice) {
        this.narrativeVictoryPathChoice = narrativeVictoryPathChoice;
    }

    public String getChapterKey() { return chapterKey; }
    public void setChapterKey(String chapterKey) { this.chapterKey = chapterKey; }

    public Integer getChapterIndex() { return chapterIndex; }
    public void setChapterIndex(Integer chapterIndex) { this.chapterIndex = chapterIndex; }

    public Integer getChapterNumber() { return chapterNumber; }
    public void setChapterNumber(Integer chapterNumber) { this.chapterNumber = chapterNumber; }

    public Integer getQuestSequenceIndex() { return questSequenceIndex; }
    public void setQuestSequenceIndex(Integer questSequenceIndex) { this.questSequenceIndex = questSequenceIndex; }

    public String getBranchGroupKey() { return branchGroupKey; }
    public void setBranchGroupKey(String branchGroupKey) { this.branchGroupKey = branchGroupKey; }

    public String getBranchLabel() { return branchLabel; }
    public void setBranchLabel(String branchLabel) { this.branchLabel = branchLabel; }

    public String getInferredFactionKey() { return inferredFactionKey; }
    public void setInferredFactionKey(String inferredFactionKey) { this.inferredFactionKey = inferredFactionKey; }

    public String getInferredQuestLineKey() { return inferredQuestLineKey; }
    public void setInferredQuestLineKey(String inferredQuestLineKey) { this.inferredQuestLineKey = inferredQuestLineKey; }

    public String getConvergesIntoQuestKey() { return convergesIntoQuestKey; }
    public void setConvergesIntoQuestKey(String convergesIntoQuestKey) { this.convergesIntoQuestKey = convergesIntoQuestKey; }

    public List<String> getPreviousQuestKeys() { return previousQuestKeys; }
    public void setPreviousQuestKeys(List<String> previousQuestKeys) {
        this.previousQuestKeys = previousQuestKeys == null ? new ArrayList<>() : new ArrayList<>(previousQuestKeys);
    }

    public List<String> getNextQuestKeys() { return nextQuestKeys; }
    public void setNextQuestKeys(List<String> nextQuestKeys) {
        this.nextQuestKeys = nextQuestKeys == null ? new ArrayList<>() : new ArrayList<>(nextQuestKeys);
    }

    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> referenceKeys) {
        this.referenceKeys = referenceKeys == null ? new ArrayList<>() : new ArrayList<>(referenceKeys);
    }

    public List<QuestChoiceEntity> getChoices() { return choices; }
    public void setChoices(List<QuestChoiceEntity> choices) {
        this.choices.clear();
        if (choices != null) {
            choices.forEach(this::addChoice);
        }
    }

    public void addChoice(QuestChoiceEntity choice) {
        if (choice == null) return;
        choice.setQuest(this);
        choices.add(choice);
    }

    public List<QuestDialogBlockEntity> getDialogBlocks() { return dialogBlocks; }
    public void setDialogBlocks(List<QuestDialogBlockEntity> dialogBlocks) {
        this.dialogBlocks.clear();
        if (dialogBlocks != null) {
            dialogBlocks.forEach(this::addDialogBlock);
        }
    }

    public void addDialogBlock(QuestDialogBlockEntity dialogBlock) {
        if (dialogBlock == null) return;
        dialogBlock.setQuest(this);
        dialogBlocks.add(dialogBlock);
    }
}
