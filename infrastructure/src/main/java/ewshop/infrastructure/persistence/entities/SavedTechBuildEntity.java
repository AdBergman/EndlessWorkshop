package ewshop.infrastructure.persistence.entities;

import ewshop.domain.model.enums.Faction;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "shared_tech_builds")
public class SavedTechBuildEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "uuid")
    private UUID uuid;

    @Column(name = "name")
    private String name;

    @Column(name = "faction", nullable = false)
    @Enumerated(EnumType.STRING)
    private Faction faction;

    @ElementCollection
    @CollectionTable(name = "shared_tech_build_techs", joinColumns = @JoinColumn(name = "build_id"))
    @Column(name = "tech_id")
    private List<String> techIds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SavedTechBuildEntity() {}

    public SavedTechBuildEntity(UUID uuid, String name, Faction faction, List<String> techIds) {
        this.uuid = uuid;
        this.name = name;
        this.faction = faction;
        this.techIds = techIds;
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters and setters ---

    public Faction getFaction() {
        return faction;
    }

    public void setFaction(Faction faction) {
        this.faction = faction;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getTechIds() { return techIds; }
    public void setTechIds(List<String> techIds) { this.techIds = techIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
