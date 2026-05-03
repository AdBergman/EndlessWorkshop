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
                codexEntry("abilities", "Ability_Valid", "Resolved Ability", List.of("Valid description.")),
                codexEntry("abilities", "Ability_Invalid", "% Placeholder", List.of("Should be filtered.")),
                codexEntry("abilities", "Ability_Weak", "Stone Reader", List.of("TBD"))
        ));

        List<CodexDto> result = facade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey).containsExactly("Ability_Valid");
        assertThat(result.getFirst().displayName()).isEqualTo("Resolved Ability");
        assertThat(result.getFirst().descriptionLines()).containsExactly("Valid description.");
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
