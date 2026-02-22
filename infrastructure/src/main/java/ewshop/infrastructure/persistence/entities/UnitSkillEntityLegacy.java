package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "unit_skills")
public class UnitSkillEntityLegacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB PK

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "target")
    private String target;

    @Column(name = "amount")
    private Integer amount;

    @Column(name = "type")
    private String type;

    // === NEW SCALING FIELDS ===
    @Column(name = "scaling_might")
    private Integer scalingMight;

    @Column(name = "scaling_resilience")
    private Integer scalingResilience;

    @Column(name = "scaling_intuition")
    private Integer scalingIntuition;

    @Column(name = "scaling_determination")
    private Integer scalingDetermination;

    // --- Constructors ---
    public UnitSkillEntityLegacy() {}

    public UnitSkillEntityLegacy(
            String name,
            String target,
            Integer amount,
            String type,
            Integer scalingMight,
            Integer scalingResilience,
            Integer scalingIntuition,
            Integer scalingDetermination
    ) {
        this.name = name;
        this.target = target;
        this.amount = amount;
        this.type = type;
        this.scalingMight = scalingMight;
        this.scalingResilience = scalingResilience;
        this.scalingIntuition = scalingIntuition;
        this.scalingDetermination = scalingDetermination;
    }

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getScalingMight() { return scalingMight; }
    public void setScalingMight(Integer scalingMight) { this.scalingMight = scalingMight; }

    public Integer getScalingResilience() { return scalingResilience; }
    public void setScalingResilience(Integer scalingResilience) { this.scalingResilience = scalingResilience; }

    public Integer getScalingIntuition() { return scalingIntuition; }
    public void setScalingIntuition(Integer scalingIntuition) { this.scalingIntuition = scalingIntuition; }

    public Integer getScalingDetermination() { return scalingDetermination; }
    public void setScalingDetermination(Integer scalingDetermination) { this.scalingDetermination = scalingDetermination; }
}
