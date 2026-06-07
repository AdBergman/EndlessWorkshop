package ewshop.app.seo;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.PageCandidateBuilder;
import ewshop.domain.model.Codex;
import ewshop.domain.service.CodexFilterResult;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PageCandidateBuilderTest {

    private final PageCandidateBuilder pageCandidateBuilder = new PageCandidateBuilder();

    @Test
    void buildsStableCandidateRoutesPerKindAndSlug() {
        CodexFilterResult filterResult = new CodexFilterResult(
                List.of(
                        filteredEntry("units", "Unit_Sentinel", "Sentinel", "sentinel"),
                        filteredEntry("tech", "Technology_Workshop", "Workshop", "workshop")
                ),
                List.of(),
                0,
                java.util.Map.of()
        );

        List<PageCandidate> candidates = pageCandidateBuilder.buildPageCandidates(filterResult);

        assertThat(candidates)
                .extracting(PageCandidate::route)
                .containsExactly(
                        "/encyclopedia/tech/workshop",
                        "/encyclopedia/units/sentinel"
                );
    }

    @Test
    void canonicalizesPureDuplicateVariantsAndAttachesAliasToRepresentative() {
        CodexFilterResult filterResult = new CodexFilterResult(
                List.of(
                        filteredEntry("abilities", "UnitAbility_FlightBase", "Flight", "flight"),
                        filteredEntry("abilities", "UnitAbility_Fly", "Flight", "flight")
                ),
                List.of(),
                0,
                java.util.Map.of()
        );

        List<PageCandidate> candidates = pageCandidateBuilder.buildPageCandidates(filterResult);

        PageCandidate representative = candidates.getFirst();
        PageCandidate variant = candidates.get(1);
        assertThat(representative.indexable()).isTrue();
        assertThat(representative.canonicalizedVariants())
                .extracting(alias -> alias.entryKey() + "@" + alias.route())
                .containsExactly("UnitAbility_Fly@/encyclopedia/abilities/flight/unitability-fly");
        assertThat(variant.indexable()).isFalse();
        assertThat(variant.route()).isEqualTo("/encyclopedia/abilities/flight/unitability-fly");
        assertThat(variant.canonicalRoute()).isEqualTo("/encyclopedia/abilities/flight");
    }

    @Test
    void keepsDistinctDuplicateDisplayNamesIndexableWhenContentDiffers() {
        CodexFilterResult filterResult = new CodexFilterResult(
                List.of(
                        filteredEntry("tech", "Technology_City_Tier3_Defense", "Stonework", "stonework",
                                List.of("Improves masonry logistics."), List.of("City_Defense")),
                        filteredEntry("tech", "Technology_District_Tier1_Defense", "Stonework", "stonework",
                                List.of("Unlocks fortified district construction."), List.of("District_Rampart"))
                ),
                List.of(),
                0,
                java.util.Map.of()
        );

        List<PageCandidate> candidates = pageCandidateBuilder.buildPageCandidates(filterResult);

        assertThat(candidates).extracting(PageCandidate::route).containsExactly(
                "/encyclopedia/tech/stonework",
                "/encyclopedia/tech/stonework/technology-district-tier1-defense"
        );
        assertThat(candidates).allMatch(PageCandidate::indexable);
        assertThat(candidates).extracting(PageCandidate::canonicalRoute).containsExactly(
                "/encyclopedia/tech/stonework",
                "/encyclopedia/tech/stonework/technology-district-tier1-defense"
        );
    }

    private static CodexFilterResult.FilteredCodexEntry filteredEntry(
            String exportKind,
            String entryKey,
            String displayName,
            String slug
    ) {
        return filteredEntry(exportKind, entryKey, displayName, slug, List.of("Reference description."), List.of());
    }

    private static CodexFilterResult.FilteredCodexEntry filteredEntry(
            String exportKind,
            String entryKey,
            String displayName,
            String slug,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        Codex codex = Codex.builder()
                .exportKind(exportKind)
                .entryKey(entryKey)
                .displayName(displayName)
                .descriptionLines(descriptionLines)
                .referenceKeys(referenceKeys)
                .build();
        return new CodexFilterResult.FilteredCodexEntry(
                codex,
                exportKind,
                displayName,
                descriptionLines,
                referenceKeys,
                slug
        );
    }
}
