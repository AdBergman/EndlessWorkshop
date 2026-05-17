package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(
        name = "quest_dialog_lines",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_quest_dialog_lines_block_line_order",
                columnNames = {"dialog_block_id", "line_order"}
        )
)
public class QuestDialogLineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dialog_block_id", nullable = false, foreignKey = @ForeignKey(name = "fk_quest_dialog_lines_block"))
    private QuestDialogBlockEntity dialogBlock;

    @Column(name = "line_order", nullable = false)
    private int lineOrder;

    @Column(name = "source_line_index")
    private Integer sourceLineIndex;

    @Column(name = "role", length = 80)
    private String role;

    @Column(name = "speaker_label", length = 220)
    private String speakerLabel;

    @Column(name = "text", nullable = false, columnDefinition = "text")
    private String text;

    public Long getId() { return id; }

    public QuestDialogBlockEntity getDialogBlock() { return dialogBlock; }
    public void setDialogBlock(QuestDialogBlockEntity dialogBlock) { this.dialogBlock = dialogBlock; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }

    public Integer getSourceLineIndex() { return sourceLineIndex; }
    public void setSourceLineIndex(Integer sourceLineIndex) { this.sourceLineIndex = sourceLineIndex; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSpeakerLabel() { return speakerLabel; }
    public void setSpeakerLabel(String speakerLabel) { this.speakerLabel = speakerLabel; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
