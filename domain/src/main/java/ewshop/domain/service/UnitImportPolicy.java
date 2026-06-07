package ewshop.domain.service;

import ewshop.domain.command.UnitImportSnapshot;

public final class UnitImportPolicy {

    private static final String PROTOTYPE_UNIT_CLASS_KEY = "UnitClass_Prototype_LandUnit";

    private UnitImportPolicy() {}

    public static boolean isImportable(UnitImportSnapshot snapshot) {
        return snapshot != null
                && snapshot.faction() != null
                && !isPrototypeUnitClass(snapshot.unitClassKey());
    }

    public static boolean isMissingAllowedFaction(UnitImportSnapshot snapshot) {
        return snapshot != null && snapshot.faction() == null;
    }

    public static boolean isPrototypeUnitClass(UnitImportSnapshot snapshot) {
        return snapshot != null
                && snapshot.faction() != null
                && isPrototypeUnitClass(snapshot.unitClassKey());
    }

    private static boolean isPrototypeUnitClass(String unitClassKey) {
        return unitClassKey != null && unitClassKey.trim().equals(PROTOTYPE_UNIT_CLASS_KEY);
    }
}
