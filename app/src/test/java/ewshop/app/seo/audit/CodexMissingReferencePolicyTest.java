package ewshop.app.seo.audit;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CodexMissingReferencePolicyTest {

    @Test
    void classifiesKnownAndUnknownReferencePrefixes() {
        assertThat(CodexMissingReferencePolicy.classifyCategory("District_Workshop")).isEqualTo("District");
        assertThat(CodexMissingReferencePolicy.classifyCategory("UnitAbility_Flight")).isEqualTo("UnitAbility");
        assertThat(CodexMissingReferencePolicy.classifyCategory("UnknownThing_Value")).isEqualTo("UnknownThing");
        assertThat(CodexMissingReferencePolicy.classifyCategory("LooseReference")).isEqualTo("Unclassified");
    }

    @Test
    void scoresHighValuePublicSeoCategoriesAheadOfMetadataOnlyCategories() {
        var district = category("District", 5, "High impact.", "public SEO/indexable pages");
        var descriptor = category("Descriptor", 5, "Low impact.", "metadata-only/non-public entities");

        assertThat(CodexMissingReferencePolicy.priorityScore(district))
                .isGreaterThan(CodexMissingReferencePolicy.priorityScore(descriptor));
        assertThat(CodexMissingReferencePolicy.priorityRationale(district))
                .contains("District would restore about 5 hidden related-link pillbox(es)")
                .contains("public SEO/indexable pages");
    }

    @Test
    void recognizesInternalNoiseAndNearMatchIdentities() {
        assertThat(CodexMissingReferencePolicy.isInternalNoiseReference("UnitAbility_LandMovement")).isTrue();
        assertThat(CodexMissingReferencePolicy.isInternalNoiseReference("District_Workshop")).isFalse();
        assertThat(CodexMissingReferencePolicy.nearMatchIdentity("UnitAbility_Flight")).isEqualTo("flight");
        assertThat(CodexMissingReferencePolicy.nearMatchIdentity("Effect_Burning")).isEqualTo("burning");
    }

    private static CodexMissingReferenceAuditService.CodexMissingReferenceCategory category(
            String prefix,
            int unresolvedCount,
            String impact,
            String recommendation
    ) {
        return new CodexMissingReferenceAuditService.CodexMissingReferenceCategory(
                prefix,
                unresolvedCount,
                100.0,
                List.of(prefix + "_Example"),
                List.of("/encyclopedia/units/sentinel"),
                impact,
                recommendation,
                unresolvedCount,
                "Medium reduction.",
                Map.of("units", unresolvedCount)
        );
    }
}
