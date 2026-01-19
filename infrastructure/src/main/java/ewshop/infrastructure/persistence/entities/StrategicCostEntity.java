package ewshop.infrastructure.persistence.entities;

import ewshop.domain.entity.enums.StrategicResourceType;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Column;

@Embeddable
public class StrategicCostEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private StrategicResourceType type;

    @Column(name = "amount", nullable = false)
    private int amount;

    public StrategicCostEntity() {}

    public StrategicCostEntity(StrategicResourceType type, int amount) {
        this.type = type;
        this.amount = amount;
    }

    public StrategicResourceType getType() {
        return type;
    }

    public void setType(StrategicResourceType type) {
        this.type = type;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }
}
