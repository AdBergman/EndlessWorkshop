package ewshop.domain.entity.enums;

import ewshop.domain.entity.enums.FIDSI;
import ewshop.domain.entity.enums.StrategicResourceType;

public enum CostType {
    // FIDSI types
    INDUSTRY(FIDSI.INDUSTRY),
    FOOD(FIDSI.FOOD),
    DUST(FIDSI.DUST),
    SCIENCE(FIDSI.SCIENCE),
    INFLUENCE(FIDSI.INFLUENCE),
    CORPSES(FIDSI.CORPSES),

    // Strategic resources
    TITANIUM(StrategicResourceType.TITANIUM),
    GLASSTEEL(StrategicResourceType.GLASSTEEL),
    LAZUALIN(StrategicResourceType.LAZUALIN),
    HYPERIUM(StrategicResourceType.HYPERIUM),
    ERADIONE(StrategicResourceType.ERADIONE),
    THALITINE(StrategicResourceType.THALITINE);

    private final Object value; // can be either FIDSI or StrategicResourceType

    CostType(FIDSI fid) {
        this.value = fid;
    }

    CostType(StrategicResourceType strat) {
        this.value = strat;
    }

    public boolean isFIDSI() { return value instanceof FIDSI; }
    public boolean isStrategic() { return value instanceof StrategicResourceType; }

    public FIDSI asFIDSI() { return (FIDSI) value; }
    public StrategicResourceType asStrategic() { return (StrategicResourceType) value; }

    @Override
    public String toString() {
        return value.toString();
    }
}
