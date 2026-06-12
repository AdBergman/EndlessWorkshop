package ewshop.domain.service;

import ewshop.domain.model.Codex;
import ewshop.domain.model.CodexMetadataFact;
import ewshop.domain.model.CodexMetadataSection;
import ewshop.domain.model.CodexMetadataSectionItem;
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
                .containsExactlyInAnyOrder("Ability_ValidBracket", "Ability_ValidText");
        assertThat(result.skippedByReason()).containsEntry("invalid-display-name", 5);
        assertThat(result.skippedByReason()).containsEntry("weak-description-lines", 1);
        assertThat(result.skippedByReason()).containsEntry("filtered-out", 6);
    }

    @Test
    void normalizesDisplayNamesBeforeSluggingAndFiltering() {
        CodexFilterResult result = codexFilterService.filter(List.of(
                codexEntry("districts", "District_Klax", "[Luxury01] Klax Extractor", List.of("Useful district.")),
                codexEntry("units", "Unit_InvalidPercent", "%InvalidName", List.of("Should be filtered.")),
                codexEntry("units", "Unit_InvalidDigits", "Unit_1234_Test", List.of("Should be filtered.")),
                codexEntry("units", "Unit_Normal", "Sentinel", List.of("Normal unit."))
        ));

        assertThat(result.entries()).extracting(CodexFilterResult.FilteredCodexEntry::normalizedDisplayName)
                .containsExactly("Klax Extractor", "Sentinel");
        assertThat(result.entries()).extracting(CodexFilterResult.FilteredCodexEntry::slug)
                .containsExactly("klax-extractor", "sentinel");
        assertThat(result.skippedEntries()).extracting(CodexFilterResult.CodexFilterSkip::entryKey)
                .containsExactlyInAnyOrder("Unit_InvalidDigits", "Unit_InvalidPercent");
        assertThat(result.skippedByReason()).containsEntry("invalid-display-name", 2);
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
            assertThat(skip.relationTargetEntryKey()).isEqualTo("Technology_City_Tier3_Defense");
        });
        assertThat(result.skippedByReason()).containsEntry("duplicate-slug", 1);
        assertThat(result.skippedByReason()).containsEntry("filtered-out", 1);
    }

    @Test
    void codexApiFilterKeepsDuplicateSlugsSoSameTitleEntriesRemainKeyAddressable() {
        CodexFilterResult result = codexFilterService.filterForCodexApi(List.of(
                codexEntry("quests", "FactionQuest_LastLord_Chapter01_Step01", "A Haunted Path", List.of("First step.")),
                codexEntry("quests", "FactionQuest_LastLord_Chapter01_Step02", "A Haunted Path", List.of("Second step.")),
                codexEntry("quests", "FactionQuest_LastLord_Invalid", "%Placeholder", List.of("Invalid name."))
        ));

        assertThat(result.codexEntries()).extracting(Codex::getEntryKey)
                .containsExactly(
                        "FactionQuest_LastLord_Chapter01_Step01",
                        "FactionQuest_LastLord_Chapter01_Step02"
                );
        assertThat(result.skippedEntries()).extracting(CodexFilterResult.CodexFilterSkip::entryKey)
                .containsExactly("FactionQuest_LastLord_Invalid");
        assertThat(result.skippedByReason()).doesNotContainKey("duplicate-slug");
    }

    @Test
    void keepsMetadataRichEntriesWithoutDescriptionLines() {
        CodexFilterResult result = codexFilterService.filterForCodexApi(List.of(
                codexBuilder("actions", "Action_Facts", "Build Bridge", List.of())
                        .facts(List.of(new CodexMetadataFact("Category", "Constructible Action", null)))
                        .build(),
                codexBuilder("actions", "Action_Sections", "Harvest Klax", null)
                        .sections(List.of(new CodexMetadataSection(
                                "Cost modifiers",
                                List.of(),
                                List.of(new CodexMetadataSectionItem(
                                        "Influence cost multiplier",
                                        null,
                                        List.of(new CodexMetadataFact("Display value", "-50%", null)),
                                        List.of()
                                ))
                        )))
                        .build(),
                codexBuilder("actions", "Action_Context", "Vision Exchange", List.of())
                        .publicContextKeys(List.of("ActionTypeVisionExchange"))
                        .build()
        ));

        assertThat(result.codexEntries()).extracting(Codex::getEntryKey)
                .containsExactly("Action_Facts", "Action_Sections", "Action_Context");
        assertThat(result.skippedByReason()).doesNotContainKey("weak-description-lines");
    }

    @Test
    void stillSkipsEntriesWithOnlyEmptyOrPlaceholderMetadata() {
        CodexFilterResult result = codexFilterService.filterForCodexApi(List.of(
                codexBuilder("actions", "Action_Empty", "Empty Action", List.of())
                        .facts(List.of(new CodexMetadataFact("  ", "  ", null)))
                        .sections(List.of(new CodexMetadataSection("Cost modifiers", List.of("TBD"), List.of())))
                        .publicContextKeys(List.of("TBD"))
                        .build()
        ));

        assertThat(result.codexEntries()).isEmpty();
        assertThat(result.skippedByReason()).containsEntry("weak-description-lines", 1);
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

    private static Codex.Builder codexBuilder(String exportKind, String entryKey, String displayName, List<String> descriptionLines) {
        return Codex.builder()
                .exportKind(exportKind)
                .entryKey(entryKey)
                .displayName(displayName)
                .descriptionLines(descriptionLines)
                .referenceKeys(List.of());
    }
}
