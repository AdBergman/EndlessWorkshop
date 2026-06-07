package ewshop.app.seo.rendering;

import ewshop.app.seo.generation.ReferenceTarget;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SeoRenderingPolicyTest {

    private final SeoDescriptionParser descriptionParser = new SeoDescriptionParser();
    private final RelatedLinkRenderer relatedLinkRenderer = new RelatedLinkRenderer();

    @Test
    void parsesDescriptionIntoIntroDetailsAndMetadataHighlights() {
        ParsedDescription description = descriptionParser.parse(List.of(
                "[Health] Health +20",
                "A frontline unit that anchors army formations.",
                "Faction: Kin",
                "Role: Vanguard",
                "Prototype: Unit_Prototype_Debug"
        ));

        assertThat(description.introLine()).isEqualTo("A frontline unit that anchors army formations.");
        assertThat(description.descriptionLines()).containsExactly(
                "Health +20",
                "Faction: Kin",
                "Role: Vanguard"
        );
        assertThat(description.metadataHighlights()).containsExactly("Faction: Kin", "Role: Vanguard");
    }

    @Test
    void rendersOnlyResolvedRelatedLinks() {
        String relatedSection = relatedLinkRenderer.renderRelatedSection(
                List.of("Unit_Sentinel", "Missing_Key", " "),
                Map.of("Unit_Sentinel", new ReferenceTarget("Sentinel", "/encyclopedia/units/sentinel"))
        );

        assertThat(relatedSection)
                .contains("<h2 class=\"seo-heading\">Related</h2>")
                .contains("href=\"/encyclopedia/units/sentinel\"")
                .contains("data-entry-key=\"Unit_Sentinel\"")
                .contains(">Sentinel<")
                .doesNotContain("Missing_Key");
    }

    @Test
    void omitsRelatedSectionWhenNoReferencesResolve() {
        String relatedSection = relatedLinkRenderer.renderRelatedSection(
                List.of("Missing_Key"),
                Map.of()
        );

        assertThat(relatedSection).isBlank();
    }
}
