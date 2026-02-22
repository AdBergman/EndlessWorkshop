package ewshop.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import ewshop.domain.model.enums.CostType;

import java.util.Objects;

@JsonDeserialize(builder = UnitCostLegacy.Builder.class)
public class UnitCostLegacy {
    private final int amount;
    private final CostType type;

    public UnitCostLegacy(Builder builder) {
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

        public UnitCostLegacy build() {
            if (type == null) throw new IllegalStateException("CostType must be set");
            return new UnitCostLegacy(this);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        UnitCostLegacy unitCostLegacy = (UnitCostLegacy) o;
        return amount == unitCostLegacy.amount && type == unitCostLegacy.type;
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
