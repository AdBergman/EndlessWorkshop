package ewshop.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(builder = UnitSkill.Builder.class)
public class UnitSkill {

    private final String name;  // required
    private final String target;
    private final Integer amount;
    private final String type;

    private UnitSkill(Builder builder) {
        this.name = builder.name;
        this.target = builder.target;
        this.amount = builder.amount;
        this.type = builder.type;
    }

    public String getName() { return name; }
    public String getTarget() { return target; }
    public Integer getAmount() { return amount; }
    public String getType() { return type; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;          // required
        private String target = "";   // default
        private Integer amount = 0;   // default
        private String type = "";     // default

        @JsonProperty("name")
        public Builder name(String name) {
            this.name = name;
            return this;
        }

        @JsonProperty("target")
        public Builder target(String target) {
            this.target = target != null ? target : "";
            return this;
        }

        @JsonProperty("amount")
        public Builder amount(Integer amount) {
            this.amount = amount != null ? amount : 0;
            return this;
        }

        @JsonProperty("type")
        public Builder type(String type) {
            this.type = type != null ? type : "";
            return this;
        }

        public UnitSkill build() {
            if (name == null || name.isBlank()) {
                throw new IllegalStateException("UnitSkill must have a name");
            }
            return new UnitSkill(this);
        }
    }
}
