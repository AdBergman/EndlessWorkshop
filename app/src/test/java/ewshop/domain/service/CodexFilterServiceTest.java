package ewshop.domain.service;

import ewshop.domain.model.Codex;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CodexFilterServiceTest {

    private final CodexFilterService codexFilterService = new CodexFilterService();

    @Test
    void filtersInvalidCodexEntriesUsingFrontendMirroredRules() {
        CodexFilterResult result = codexFilterService.filter(List.of(
                codexEntry("abilities", "Ability_ValidBracket", "[LuxuryResource01] Auric Coral", List.of("Should remain.")),
                codexEntry("abilities", "Ability_ValidText", "Advanced Auric Coral Extractor", List.of("Should remain.")),
                codexEntry("abilities", "Ability_Percent", " %Placeholder Name", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_Tbd", " TBD Internal", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_BracketTbd", "   [TBD] Internal", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_ThreeDigits", "Advanced Extractor 123", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_BlankName", "   ", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_WeakDescription", "Resolved Ability", List.of("TBD", "  "))
        ));

        assertThat(result.codexEntries()).extracting(Codex::getEntryKey)
                .containsExactly("Ability_ValidBracket", "Ability_ValidText");
        assertThat(result.skippedByReason()).containsEntry("invalid-display-name", 5);
        assertThat(result.skippedByReason()).containsEntry("weak-description-lines", 1);
        assertThat(result.skippedByReason()).containsEntry("filtered-out", 6);
    }

    @Test
    void skipsDuplicateSlugsPerExportKindWithoutOverwritingEarlierDeterministicEntry() {
        CodexFilterResult result = codexFilterService.filter(List.of(
                codexEntry("tech", "Technology_District_Tier1_Defense", "Stonework", List.of("District description.")),
                codexEntry("tech", "Technology_City_Tier3_Defense", "Stonework", List.of("City description.")),
                codexEntry("units", "Unit_Stonework", "Stonework", List.of("Unit description."))
        ));

        assertThat(result.codexEntries()).extracting(Codex::getEntryKey)
                .containsExactly("Technology_City_Tier3_Defense", "Unit_Stonework");
        assertThat(result.skippedEntries()).singleElement().satisfies(skip -> {
            assertThat(skip.reason()).isEqualTo("duplicate-slug");
            assertThat(skip.entryKey()).isEqualTo("Technology_District_Tier1_Defense");
            assertThat(skip.exportKind()).isEqualTo("tech");
        });
        assertThat(result.skippedByReason()).containsEntry("duplicate-slug", 1);
        assertThat(result.skippedByReason()).containsEntry("filtered-out", 1);
    }

    private static Codex codexEntry(String exportKind, String entryKey, String displayName, List<String> descriptionLines) {
        return Codex.builder()
                .exportKind(exportKind)
                .entryKey(entryKey)
                .displayName(displayName)
                .descriptionLines(descriptionLines)
                .referenceKeys(List.of())
                .build();
    }
}
