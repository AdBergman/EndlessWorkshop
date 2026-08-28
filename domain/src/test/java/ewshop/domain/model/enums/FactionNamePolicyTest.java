package ewshop.domain.model.enums;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FactionNamePolicyTest {

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
