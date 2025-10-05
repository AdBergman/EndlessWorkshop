package ewshop.domain.entity;

import java.util.List;

public class TechUnlock {
    private final Convertor convertor;
    private final UnitSpecialization unitSpecialization;
    private final Treaty treaty;
    private final District district;
    private final Improvement improvement;
    private final String unlockText;

    private TechUnlock(Builder builder) {
        this.convertor = builder.convertor;
        this.unitSpecialization = builder.unitSpecialization;
        this.treaty = builder.treaty;
        this.district = builder.district;
        this.improvement = builder.improvement;
        this.unlockText = builder.unlockText;
    }

    public Convertor getConvertor() { return convertor; }
    public UnitSpecialization getUnitSpecialization() { return unitSpecialization; }
    public Treaty getTreaty() { return treaty; }
    public District getDistrict() { return district; }
    public Improvement getImprovement() { return improvement; }
    public String getUnlockText() { return unlockText; }

    public static List<String> convertUnlocks(List<TechUnlock> unlocks) {
        if (unlocks == null || unlocks.isEmpty()) return List.of();

        return unlocks.stream()
                .map(TechUnlock::describe)
                .toList();
    }

    private String describe() {
        return switch (this) {
            case TechUnlock t when t.convertor != null ->
                    "Convertor: " + t.convertor.getName();
            case TechUnlock t when t.unitSpecialization != null ->
                    "Unit: " + t.unitSpecialization.getName();
            case TechUnlock t when t.treaty != null ->
                    "Treaty: " + t.treaty.getName();
            case TechUnlock t when t.district != null ->
                    "District: " + t.district.getName();
            case TechUnlock t when t.improvement != null ->
                    "Improvement: " + t.improvement.getName();
            case TechUnlock t when t.unlockText != null ->
                    t.unlockText;
            default -> "(unknown unlock)";
        };
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Convertor convertor;
        private UnitSpecialization unitSpecialization;
        private Treaty treaty;
        private District district;
        private Improvement improvement;
        private String unlockText;

        public Builder convertor(Convertor convertor) { this.convertor = convertor; return this; }
        public Builder unitSpecialization(UnitSpecialization unitSpecialization) { this.unitSpecialization = unitSpecialization; return this; }
        public Builder treaty(Treaty treaty) { this.treaty = treaty; return this; }
        public Builder district(District district) { this.district = district; return this; }
        public Builder improvement(Improvement improvement) { this.improvement = improvement; return this; }
        public Builder unlockText(String unlockText) { this.unlockText = unlockText; return this; }

        public TechUnlock build() { return new TechUnlock(this); }
    }
}
