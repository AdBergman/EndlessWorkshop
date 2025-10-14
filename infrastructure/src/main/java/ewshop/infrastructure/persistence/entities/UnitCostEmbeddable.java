package ewshop.infrastructure.persistence.entities;

import ewshop.domain.entity.enums.FIDSI;
import ewshop.domain.entity.enums.StrategicResourceType;
import jakarta.persistence.*;

@Embeddable
public class UnitCostEmbeddable {

    @Column(nullable = false)
    private int amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private FIDSI resource;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private StrategicResourceType strategic;

    public UnitCostEmbeddable() {}

    public UnitCostEmbeddable(int amount, FIDSI resource, StrategicResourceType strategic) {
        this.amount = amount;
        this.resource = resource;
        this.strategic = strategic;
    }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public FIDSI getResource() { return resource; }
    public void setResource(FIDSI resource) { this.resource = resource; }

    public StrategicResourceType getStrategic() { return strategic; }
    public void setStrategic(StrategicResourceType strategic) { this.strategic = strategic; }
}
