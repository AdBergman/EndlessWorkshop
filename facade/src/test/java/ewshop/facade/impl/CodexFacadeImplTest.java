package ewshop.facade.impl;

import ewshop.domain.model.Codex;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import ewshop.facade.dto.response.CodexDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CodexFacadeImplTest {

    @Test
    void returnsFilteredCodexDtosFromBackendFilterService() {
        CodexService codexService = mock(CodexService.class);
        CodexFacadeImpl facade = new CodexFacadeImpl(codexService, new CodexFilterService());

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("abilities", "Ability_Valid", "Resolved Ability", "Combat", "Ability", List.of("Valid description."), List.of()),
                codexEntry("abilities", "Ability_Invalid", "% Placeholder", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_Weak", "Stone Reader", List.of("TBD"))
        ));

        List<CodexDto> result = facade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey).containsExactly("Ability_Valid");
        assertThat(result.getFirst().displayName()).isEqualTo("Resolved Ability");
        assertThat(result.getFirst().category()).isEqualTo("Combat");
        assertThat(result.getFirst().kind()).isEqualTo("Ability");
        assertThat(result.getFirst().descriptionLines()).containsExactly("Valid description.");
    }

    @Test
    void returnsDuplicateSlugEntriesAndPreservesKeyBasedReferencesForCodexApi() {
        CodexService codexService = mock(CodexService.class);
        CodexFacadeImpl facade = new CodexFacadeImpl(codexService, new CodexFilterService());

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("abilities", "UnitAbility_FlightBase", "Flight", List.of("Kept public target.")),
                codexEntry("abilities", "UnitAbility_Fly", "Flight", List.of("Duplicate target should stay filtered.")),
                codexEntry("abilities", "Ability_Invalid", "% Placeholder", List.of("Invalid target should stay unresolved.")),
                codexEntry(
                        "units",
                        "Unit_A",
                        "Alpha",
                        List.of("References duplicate and invalid targets."),
                        List.of("UnitAbility_Fly", "Ability_Invalid", "Missing_Key")
                )
        ));

        List<CodexDto> result = facade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey)
                .containsExactly("UnitAbility_FlightBase", "UnitAbility_Fly", "Unit_A");
        CodexDto unit = result.stream()
                .filter(dto -> "Unit_A".equals(dto.entryKey()))
                .findFirst()
                .orElseThrow();
        assertThat(unit.referenceKeys())
                .containsExactly("UnitAbility_Fly", "Ability_Invalid", "Missing_Key");
    }

    @Test
    void keepsSameTitleQuestStepsAvailableForRelatedEntryResolution() {
        CodexService codexService = mock(CodexService.class);
        CodexFacadeImpl facade = new CodexFacadeImpl(codexService, new CodexFilterService());

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry(
                        "quests",
                        "FactionQuest_LastLord_Chapter01_Step01",
                        "A Haunted Path",
                        List.of("First step."),
                        List.of("FactionQuest_LastLord_Chapter01_Step02")
                ),
                codexEntry(
                        "quests",
                        "FactionQuest_LastLord_Chapter01_Step02",
                        "A Haunted Path",
                        List.of("Second step.")
                )
        ));

        List<CodexDto> result = facade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey)
                .containsExactly(
                        "FactionQuest_LastLord_Chapter01_Step01",
                        "FactionQuest_LastLord_Chapter01_Step02"
                );
        assertThat(result.getFirst().referenceKeys()).containsExactly("FactionQuest_LastLord_Chapter01_Step02");
    }

    @Test
    void preservesDistinctFactionQuestDisplayNamesInCodexApi() {
        CodexService codexService = mock(CodexService.class);
        CodexFacadeImpl facade = new CodexFacadeImpl(codexService, new CodexFilterService());

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("quests", "FactionQuest_LastLord_Chapter01_Step01", "A Fragile Dawn", "MajorFaction", "Quest", List.of("First Last Lord step."), List.of()),
                codexEntry("quests", "FactionQuest_LastLord_Chapter02_Step01", "A Blighted Resurrection", "MajorFaction", "Quest", List.of("Second Last Lord step."), List.of()),
                codexEntry("quests", "FactionQuest_LastLord_Chapter03_Step01", "The Fork in the Road", "MajorFaction", "Quest", List.of("Third Last Lord step."), List.of()),
                codexEntry("quests", "FactionQuest_Necrophage_Chapter01_Step01", "Brave New World", "MajorFaction", "Quest", List.of("First Necrophage step."), List.of()),
                codexEntry("quests", "FactionQuest_Necrophage_Chapter04_Step01", "A Fresh Lead", "MajorFaction", "Quest", List.of("Fourth Necrophage step."), List.of())
        ));

        List<CodexDto> result = facade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey).containsExactlyInAnyOrder(
                "FactionQuest_LastLord_Chapter01_Step01",
                "FactionQuest_LastLord_Chapter02_Step01",
                "FactionQuest_LastLord_Chapter03_Step01",
                "FactionQuest_Necrophage_Chapter01_Step01",
                "FactionQuest_Necrophage_Chapter04_Step01"
        );
        assertThat(result)
                .extracting(dto -> dto.entryKey() + "=" + dto.displayName())
                .containsExactlyInAnyOrder(
                        "FactionQuest_LastLord_Chapter01_Step01=A Fragile Dawn",
                        "FactionQuest_LastLord_Chapter02_Step01=A Blighted Resurrection",
                        "FactionQuest_LastLord_Chapter03_Step01=The Fork in the Road",
                        "FactionQuest_Necrophage_Chapter01_Step01=Brave New World",
                        "FactionQuest_Necrophage_Chapter04_Step01=A Fresh Lead"
                );
    }

    private static Codex codexEntry(String exportKind, String entryKey, String displayName, List<String> descriptionLines) {
        return codexEntry(exportKind, entryKey, displayName, descriptionLines, List.of());
    }

    private static Codex codexEntry(
            String exportKind,
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        return codexEntry(exportKind, entryKey, displayName, null, null, descriptionLines, referenceKeys);
    }

    private static Codex codexEntry(
            String exportKind,
            String entryKey,
            String displayName,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        return Codex.builder()
                .exportKind(exportKind)
                .entryKey(entryKey)
                .displayName(displayName)
                .category(category)
                .kind(kind)
                .descriptionLines(descriptionLines)
                .referenceKeys(referenceKeys)
                .build();
    }
}
