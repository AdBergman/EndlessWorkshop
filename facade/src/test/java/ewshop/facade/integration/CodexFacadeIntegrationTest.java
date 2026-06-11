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

    @Test
    void importCodexThroughFacade_preservesNestedMetadataForArbitraryCodexKinds() {
        codexImportAdminFacade.importCodex(batch("actions", List.of(
                new CodexImportEntryDto(
                        "ActionTypeBuildBridge",
                        "Build Bridge",
                        "Constructible Action",
                        "Action",
                        List.of(),
                        List.of("ActionCostModifier_BuildBridge_Decrease_00"),
                        List.of(
                                new ewshop.facade.dto.importing.codex.CodexMetadataFactDto("Category", "Constructible Action", null),
                                new ewshop.facade.dto.importing.codex.CodexMetadataFactDto("Kind", "Action", null)
                        ),
                        List.of(new ewshop.facade.dto.importing.codex.CodexMetadataSectionDto(
                                "Cost modifiers",
                                List.of(),
                                List.of(new ewshop.facade.dto.importing.codex.CodexMetadataSectionItemDto(
                                        "Influence cost multiplier",
                                        List.of(
                                                new ewshop.facade.dto.importing.codex.CodexMetadataFactDto("Cost type", "Influence", null),
                                                new ewshop.facade.dto.importing.codex.CodexMetadataFactDto("Display value", "-50%", null)
                                        ),
                                        List.of("Applies to bridge construction.")
                                ))
                        )),
                        List.of("ActionTypeBuildBridge", "ActionCostModifier_BuildBridge_Decrease_00")
                )
        )));
        entityManager.flush();
        entityManager.clear();

        CodexDto action = findCodex(codexFacade.getAllCodexEntries(), "ActionTypeBuildBridge");

        assertThat(action.exportKind()).isEqualTo("actions");
        assertThat(action.descriptionLines()).isEmpty();
        assertThat(action.facts()).extracting(ewshop.facade.dto.response.CodexMetadataFactDto::label)
                .containsExactly("Category", "Kind");
        assertThat(action.sections()).hasSize(1);
        assertThat(action.sections().getFirst().title()).isEqualTo("Cost modifiers");
        assertThat(action.sections().getFirst().items()).hasSize(1);
        assertThat(action.sections().getFirst().items().getFirst().label()).isEqualTo("Influence cost multiplier");
        assertThat(action.sections().getFirst().items().getFirst().facts())
                .extracting(ewshop.facade.dto.response.CodexMetadataFactDto::label)
                .containsExactly("Cost type", "Display value");
        assertThat(action.sections().getFirst().items().getFirst().lines())
                .containsExactly("Applies to bridge construction.");
        assertThat(action.publicContextKeys())
                .containsExactly("ActionTypeBuildBridge", "ActionCostModifier_BuildBridge_Decrease_00");
    }

    @Test
    void importCodexThroughFacade_doesNotExposeUnavailableFactionActions() {
        codexImportAdminFacade.importCodex(batch("actions", List.of(
                entry("FactionActionTypeMukag_PublicAction", "Public Faction Action", "Faction Action", "Action", List.of("Line"), List.of()),
                entry("FactionActionTypeUnknown_TestAction", "Unknown Test Action", "Faction Action", "Action", List.of("Line"), List.of()),
                entry("FactionActionTypeFutureFaction_TestAction", "Future Test Action", "Faction Action", "Action", List.of("Line"), List.of()),
                entry("ActionTypeBuildBridge", "Build Bridge", "Action", "Action", List.of("Line"), List.of("FactionActionTypeUnknown_TestAction"))
        )));
        entityManager.flush();
        entityManager.clear();

        List<CodexDto> result = codexFacade.getAllCodexEntries();

        assertThat(result).extracting(CodexDto::entryKey)
                .contains("FactionActionTypeMukag_PublicAction", "ActionTypeBuildBridge")
                .doesNotContain(
                        "FactionActionTypeUnknown_TestAction",
                        "FactionActionTypeFutureFaction_TestAction"
                );
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
