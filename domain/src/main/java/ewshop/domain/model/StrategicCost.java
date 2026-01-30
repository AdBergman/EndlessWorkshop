package ewshop.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import ewshop.domain.model.enums.StrategicResourceType;

public record StrategicCost(StrategicResourceType type, int amount) {

    private static final StrategicResourceType DEFAULT_RESOURCE = StrategicResourceType.TITANIUM;

    @JsonCreator
    public static StrategicCost fromString(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("Cannot parse StrategicCost from null value");
        }

        if (value instanceof String s) {
            s = s.trim();
            if (s.isEmpty()) throw new IllegalArgumentException("Cannot parse StrategicCost from empty string");

            String[] parts = s.split(" ", 2);
            if (parts.length == 2) {
                int amount = Integer.parseInt(parts[0].trim());
                StrategicResourceType type = StrategicResourceType.valueOf(parts[1].trim().toUpperCase());
                return new StrategicCost(type, amount);
            } else if (parts.length == 1) {
                // Only amount provided → use default resource
                int amount = Integer.parseInt(parts[0].trim());
                return new StrategicCost(DEFAULT_RESOURCE, amount);
            } else {
                throw new IllegalArgumentException("Invalid StrategicCost format: " + s);
            }
        } else if (value instanceof Number n) {
            // JSON number → use default resource
            return new StrategicCost(DEFAULT_RESOURCE, n.intValue());
        } else {
            throw new IllegalArgumentException("Cannot parse StrategicCost from: " + value + " (" + value.getClass() + ")");
        }
    }

    @JsonValue
    public String toJson() {
        return amount + " " + capitalize(type.name().toLowerCase());
    }

    private static String capitalize(String s) {
        if (s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
