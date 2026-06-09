package ewshop.facade.integration;

import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.interfaces.CodexFacade;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CodexFacadeIntegrationTest extends BaseIT {

    @Autowired
    private CodexImportAdminFacade codexImportAdminFacade;

    @Autowired
    private CodexFacade codexFacade;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void importCodexThroughFacade_deletesOnlyImportedKindAndReadDtoShapeIsStable() {
        codexImportAdminFacade.importCodex(batch("abilities", List.of(
                entry("Ability_Kept", "Battle Focus", "Combat", "Ability", List.of("A clear useful ability."), List.of()),
                entry("Ability_Obsolete", "Old Focus", "Combat", "Ability", List.of("An obsolete ability."), List.of())
        )));
        codexImportAdminFacade.importCodex(batch("units", List.of(
                entry("Unit_A", "Unit Alpha", "Unit", "Unit", List.of("A public unit entry."), List.of("Ability_Kept"))
        )));
        entityManager.flush();
        entityManager.clear();

        codexImportAdminFacade.importCodex(batch("abilities", List.of(
                entry("Ability_Kept", "Battle Focus Updated", "Combat", "Ability", List.of("Line 1", "Line 2"), List.of("Unit_A"))
        )));
        entityManager.flush();
        entityManager.clear();

        List<CodexDto> result = codexFacade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey)
                .contains("Ability_Kept", "Unit_A")
                .doesNotContain("Ability_Obsolete");

        CodexDto ability = findCodex(result, "Ability_Kept");
        assertThat(ability.exportKind()).isEqualTo("abilities");
        assertThat(ability.displayName()).isEqualTo("Battle Focus Updated");
        assertThat(ability.category()).isEqualTo("Combat");
        assertThat(ability.kind()).isEqualTo("Ability");
        assertThat(ability.descriptionLines()).containsExactly("Line 1", "Line 2");
        assertThat(ability.referenceKeys()).containsExactly("Unit_A");

        CodexDto unit = findCodex(result, "Unit_A");
        assertThat(unit.exportKind()).isEqualTo("units");
        assertThat(unit.referenceKeys()).containsExactly("Ability_Kept");
    }

    @Test
    void importCodexThroughFacade_preservesStructuredMetadata() {
        codexImportAdminFacade.importCodex(batch("populations", List.of(
                new CodexImportEntryDto(
                        "Population_Aspect",
                        "Aspect",
                        null,
                        null,
                        List.of("Faction: Faction_Aspect"),
                        List.of("Faction_Aspect"),
                        List.of(
                                new ewshop.facade.dto.importing.codex.CodexMetadataFactDto("Faction", "Faction_Aspect", "Faction_Aspect"),
                                new ewshop.facade.dto.importing.codex.CodexMetadataFactDto("Base food cost", "60", null)
                        ),
                        List.of(new ewshop.facade.dto.importing.codex.CodexMetadataSectionDto(
                                "Worker effects",
                                List.of("+1 [CultureColored] Influence"),
                                List.of()
                        )),
                        List.of("Population_Aspect", "Faction_Aspect")
                )
        )));
        entityManager.flush();
        entityManager.clear();

        CodexDto population = findCodex(codexFacade.getAllCodexEntries(), "Population_Aspect");

        assertThat(population.facts()).extracting(ewshop.facade.dto.response.CodexMetadataFactDto::label)
                .containsExactly("Faction", "Base food cost");
        assertThat(population.facts().getFirst().referenceKey()).isEqualTo("Faction_Aspect");
        assertThat(population.sections()).hasSize(1);
        assertThat(population.sections().getFirst().title()).isEqualTo("Worker effects");
        assertThat(population.sections().getFirst().lines()).containsExactly("+1 [CultureColored] Influence");
        assertThat(population.publicContextKeys()).containsExactly("Population_Aspect", "Faction_Aspect");
    }

    private static CodexDto findCodex(List<CodexDto> entries, String entryKey) {
        return entries.stream()
                .filter(entry -> entryKey.equals(entry.entryKey()))
                .findFirst()
                .orElseThrow();
    }

    private static CodexImportBatchDto batch(String exportKind, List<CodexImportEntryDto> entries) {
        return new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                exportKind,
                entries
        );
    }

    private static CodexImportEntryDto entry(
            String entryKey,
            String displayName,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        return new CodexImportEntryDto(
                entryKey,
                displayName,
                category,
                kind,
                descriptionLines,
                referenceKeys
        );
    }
}
