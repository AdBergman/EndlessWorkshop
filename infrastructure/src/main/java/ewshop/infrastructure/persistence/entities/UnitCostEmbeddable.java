package ewshop.infrastructure.persistence.entities;

import ewshop.domain.model.enums.FIDSI;
import ewshop.domain.model.enums.StrategicResourceType;
import jakarta.persistence.*;

import java.util.Objects;

@Embeddable
public class UnitCostEmbeddable {

    @Column(nullable = false)
    private int amount;

    @Enumerated(EnumType.STRING)
    @Column()
    private FIDSI resource;

    @Enumerated(EnumType.STRING)
    @Column()
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UnitCostEmbeddable that = (UnitCostEmbeddable) o;
        return amount == that.amount && resource == that.resource && strategic == that.strategic;
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, resource, strategic);
    }
}
