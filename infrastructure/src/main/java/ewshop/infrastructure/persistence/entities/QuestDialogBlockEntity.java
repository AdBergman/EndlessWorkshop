package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quest_dialog_blocks",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_quest_dialog_blocks_identity",
                columnNames = "dialog_identity"
        )
)
public class QuestDialogBlockEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quest_id", nullable = false, foreignKey = @ForeignKey(name = "fk_quest_dialog_blocks_quest"))
    private QuestEntity quest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id", foreignKey = @ForeignKey(name = "fk_quest_dialog_blocks_choice"))
    private QuestChoiceEntity choice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", foreignKey = @ForeignKey(name = "fk_quest_dialog_blocks_step"))
    private QuestStepEntity step;

    @Column(name = "dialog_identity", nullable = false, length = 700)
    private String dialogIdentity;

    @Column(name = "parent_scope", nullable = false, length = 24)
    private String parentScope;

    @Column(name = "block_order", nullable = false)
    private int blockOrder;

    @Column(name = "source_quest_key", nullable = false, length = 220)
    private String sourceQuestKey;

    @Column(name = "source_choice_key", length = 220)
    private String sourceChoiceKey;

    @Column(name = "source_step_index")
    private Integer sourceStepIndex;

    @Column(name = "dialog_key", nullable = false, length = 220)
    private String dialogKey;

    @Column(name = "phase", nullable = false, length = 80)
    private String phase;

    @Column(name = "expected_line_count", nullable = false)
    private int expectedLineCount;

    @OneToMany(mappedBy = "dialogBlock", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineOrder ASC")
    private List<QuestDialogLineEntity> lines = new ArrayList<>();

    public Long getId() { return id; }

    public QuestEntity getQuest() { return quest; }
    public void setQuest(QuestEntity quest) { this.quest = quest; }

    public QuestChoiceEntity getChoice() { return choice; }
    public void setChoice(QuestChoiceEntity choice) { this.choice = choice; }

    public QuestStepEntity getStep() { return step; }
    public void setStep(QuestStepEntity step) { this.step = step; }

    public String getDialogIdentity() { return dialogIdentity; }
    public void setDialogIdentity(String dialogIdentity) { this.dialogIdentity = dialogIdentity; }

    public String getParentScope() { return parentScope; }
    public void setParentScope(String parentScope) { this.parentScope = parentScope; }

    public int getBlockOrder() { return blockOrder; }
    public void setBlockOrder(int blockOrder) { this.blockOrder = blockOrder; }

    public String getSourceQuestKey() { return sourceQuestKey; }
    public void setSourceQuestKey(String sourceQuestKey) { this.sourceQuestKey = sourceQuestKey; }

    public String getSourceChoiceKey() { return sourceChoiceKey; }
    public void setSourceChoiceKey(String sourceChoiceKey) { this.sourceChoiceKey = sourceChoiceKey; }

    public Integer getSourceStepIndex() { return sourceStepIndex; }
    public void setSourceStepIndex(Integer sourceStepIndex) { this.sourceStepIndex = sourceStepIndex; }

    public String getDialogKey() { return dialogKey; }
    public void setDialogKey(String dialogKey) { this.dialogKey = dialogKey; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public int getExpectedLineCount() { return expectedLineCount; }
    public void setExpectedLineCount(int expectedLineCount) { this.expectedLineCount = expectedLineCount; }

    public List<QuestDialogLineEntity> getLines() { return lines; }
    public void setLines(List<QuestDialogLineEntity> lines) {
        this.lines.clear();
        if (lines != null) {
            lines.forEach(this::addLine);
        }
    }

    public void addLine(QuestDialogLineEntity line) {
        if (line == null) return;
        line.setDialogBlock(this);
        lines.add(line);
    }
}
