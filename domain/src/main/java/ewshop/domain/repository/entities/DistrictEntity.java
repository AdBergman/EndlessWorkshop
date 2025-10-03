package ewshop.domain.repository.entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "districts")
public class DistrictEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name of the district (unique)
    @Column(nullable = false, unique = true)
    private String name;

    // General description or info for display purposes
    @ElementCollection
    @CollectionTable(name = "district_info", joinColumns = @JoinColumn(name = "district_id"))
    @Column(name = "info")
    private List<String> info;


    // Base effect, like "+2 Food"
    @Column(name = "effect")
    private String effect;

    // Tile bonuses: e.g., "+1 Food on tile producing Food"
    @ElementCollection
    @CollectionTable(name = "district_tile_bonuses", joinColumns = @JoinColumn(name = "district_id"))
    @Column(name = "tile_bonus")
    private List<String> tileBonus;

    // Adjacency bonuses: e.g., "+1 Industry for each adjacent Ridge"
    @ElementCollection
    @CollectionTable(name = "district_adjacency_bonuses", joinColumns = @JoinColumn(name = "district_id"))
    @Column(name = "adjacency_bonus")
    private List<String> adjacencyBonus;

    // Placement requirements for special districts (nullable)
    @Column(name = "placement_prereq")
    private String placementPrereq;

    public DistrictEntity() {}

    public DistrictEntity(String name, List<String> info, String effect,
                          List<String> tileBonus, List<String> adjacencyBonus, String placementPrereq) {
        this.name = name;
        this.info = info;
        this.effect = effect;
        this.tileBonus = tileBonus;
        this.adjacencyBonus = adjacencyBonus;
        this.placementPrereq = placementPrereq;
    }

    // --- Getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getInfo() { return info; }
    public void setInfo(List<String> info) { this.info = info; }

    public String getEffect() { return effect; }
    public void setEffect(String effect) { this.effect = effect; }

    public List<String> getTileBonus() { return tileBonus; }
    public void setTileBonus(List<String> tileBonus) { this.tileBonus = tileBonus; }

    public List<String> getAdjacencyBonus() { return adjacencyBonus; }
    public void setAdjacencyBonus(List<String> adjacencyBonus) { this.adjacencyBonus = adjacencyBonus; }

    public String getPlacementPrereq() { return placementPrereq; }
    public void setPlacementPrereq(String placementPrereq) { this.placementPrereq = placementPrereq; }
}
