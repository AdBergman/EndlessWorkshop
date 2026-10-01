package ewshop.domain.model.enums;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FactionNamePolicyTest {

    @Test
    void acceptsNewMajorMinorAndAlternateNamesWithoutEnumMembership() {
        assertThat(FactionNamePolicy.canonicalMajorDisplayName("Faction_SandShaper")).isEqualTo("Sand Shaper");
        assertThat(FactionNamePolicy.canonicalMajorDisplayName("Faction_KinOfSheredyn02")).isEqualTo("Kin Of Sheredyn02");
        assertThat(FactionNamePolicy.canonicalMinorDisplayName("MinorFaction_NewPeople")).isEqualTo("New People");
        assertThat(FactionNamePolicy.canonicalMajorDisplayName("Faction_Placeholder")).isNull();
        assertThat(FactionNamePolicy.canonicalSavedFactionOrSelf("Faction_KinOfSheredyn02"))
                .isEqualTo("Faction_KinOfSheredyn02");
    }

    @Test
    void canonicalizesExporterAndPersistedNecrophageFactionKeys() {
        assertThat(FactionNamePolicy.canonicalMajorDisplayNameOrSelf("Faction_Necrophage"))
                .isEqualTo("Necrophages");
        assertThat(FactionNamePolicy.canonicalMajorDisplayNameOrSelf("Faction Necrophage"))
                .isEqualTo("Necrophages");
        assertThat(FactionNamePolicy.parseImportedMajorFaction("Faction_Necrophage"))
                .isEqualTo(MajorFaction.NECROPHAGES);
    }
}
