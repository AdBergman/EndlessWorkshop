package ewshop.api.controller;

import ewshop.domain.model.enums.MajorFaction;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MajorFactionRequestContractTest {

    @Test
    void fromDisplayName_acceptsFrontendEnumValue() {
        assertThat(MajorFaction.fromDisplayName("KIN")).isEqualTo(MajorFaction.KIN);
    }

    @Test
    void fromDisplayName_keepsAcceptingDisplayName() {
        assertThat(MajorFaction.fromDisplayName("Kin")).isEqualTo(MajorFaction.KIN);
    }
}
