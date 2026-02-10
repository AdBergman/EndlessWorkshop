package ewshop.domain.command;

public record TechTraitPrereq(
        String operator,
        String traitKey
) {
    public TechTraitPrereq {
        operator = operator == null ? "" : operator.trim();
        String trimmedTrait = traitKey == null ? null : traitKey.trim();
        if (trimmedTrait == null || trimmedTrait.isEmpty()) {
            throw new IllegalArgumentException("TechTraitPrereq.traitKey is required");
        }
        traitKey = trimmedTrait;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String operator = "";
        private String traitKey = "";

        public Builder operator(String operator) { this.operator = operator; return this; }
        public Builder traitKey(String traitKey) { this.traitKey = traitKey; return this; }

        public TechTraitPrereq build() {
            return new TechTraitPrereq(operator, traitKey);
        }
    }
}