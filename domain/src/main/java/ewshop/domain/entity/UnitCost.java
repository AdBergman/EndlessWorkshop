package ewshop.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import ewshop.domain.entity.enums.CostType;

import java.util.Objects;

@JsonDeserialize(builder = UnitCost.Builder.class)
public class UnitCost {
    private final int amount;
    private final CostType type;

    public UnitCost(Builder builder) {
        this.amount = builder.amount;
        this.type = builder.type;
    }

    public int getAmount() { return amount; }
    public CostType getType() { return type; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private int amount;
        private CostType type;

        @JsonProperty("amount")
        public Builder amount(int amount) { this.amount = amount; return this; }

        @JsonProperty("type")
        public Builder type(CostType type) { this.type = type; return this; }

        public UnitCost build() {
            if (type == null) throw new IllegalStateException("CostType must be set");
            return new UnitCost(this);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        UnitCost unitCost = (UnitCost) o;
        return amount == unitCost.amount && type == unitCost.type;
    }

    @Override
    public int hashCode() {
        int result = amount;
        result = 31 * result + Objects.hashCode(type);
        return result;
    }

    @Override
    public String toString() {
        return type + ": " + amount;
    }
}
