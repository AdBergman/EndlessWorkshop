package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity
@Table(name = "unit_specialization_skills")
public class UnitSpecializationSkillEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitSpecializationEntity unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    @NotFound(action = NotFoundAction.IGNORE)
    private UnitSkillEntity skill;

    // optional metadata, e.g., skill level
    @Column()
    private Integer level;

    // --- Constructors ---
    public UnitSpecializationSkillEntity() {}

    public UnitSpecializationSkillEntity(UnitSpecializationEntity unit, UnitSkillEntity skill, Integer level) {
        this.unit = unit;
        this.skill = skill;
        this.level = level;
    }

    // --- Getters / Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UnitSpecializationEntity getUnit() {
        return unit;
    }

    public void setUnit(UnitSpecializationEntity unit) {
        this.unit = unit;
    }

    public UnitSkillEntity getSkill() {
        return skill;
    }

    public void setSkill(UnitSkillEntity skill) {
        this.skill = skill;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
