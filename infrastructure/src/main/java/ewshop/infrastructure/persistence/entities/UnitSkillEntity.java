package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "unit_skills")
public class UnitSkillEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB PK

    // Logical skill name (or code) — unique in domain
    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "target")
    private String target;

    @Column(name = "amount")
    private Integer amount;

    @Column(name = "type")
    private String type;

    // --- Constructors ---
    public UnitSkillEntity() {}

    public UnitSkillEntity(String name, String target, Integer amount, String type) {
        this.name = name;
        this.target = target;
        this.amount = amount;
        this.type = type;
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
}
