package ewshop.domain.service;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.Codex;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.CodexRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CodexImportServiceTest {

    @Test
    void preservesNewFactionContentAndExactRelationships() {
        RecordingCodexRepository repository = new RecordingCodexRepository();
        CodexImportService service = new CodexImportService(repository);
        List<String> keys = List.of("FactionActionTypeSandShaper_Wishes01", "EmpireActionTypeSandShaper_Wish01",
                "ActionTypeRaiseSandRuin", "ConstructibleAction_TerraformationBiomeSandBanks",
                "FactionTrait_Custom_Specific01", "FactionTrait_Common_StartingResources",
                "FactionTrait_KinOfSheredyn02_NewTrait", "FactionQuest_SandShaper_Chapter01",
                "FactionQuest_Mukag02_Chapter01", "ActionCostModifier_RaiseRuin_Decrease_00");
        List<CodexImportSnapshot> snapshots = new java.util.ArrayList<>();
        for (String key : keys) snapshots.add(snapshot("actions", key));
        snapshots.add(snapshot("factions", "Faction_SandShaper", keys, keys));

        service.importCodex(snapshots);

        assertThat(repository.capturedSnapshots).usingRecursiveComparison().isEqualTo(snapshots);
        assertThat(repository.capturedSnapshots.getLast().referenceKeys()).containsExactlyElementsOf(keys);
        assertThat(repository.capturedSnapshots.getLast().publicContextKeys()).containsExactlyElementsOf(keys);
    }

    @Test
    void filtersExplicitPrototypeAndPlaceholderKeysWithoutFactionAllowLists() {
        RecordingCodexRepository repository = new RecordingCodexRepository();
        CodexImportService service = new CodexImportService(repository);
        service.importCodex(List.of(
                snapshot("units", "Unit_Prototype_LandUnit"),
                snapshot("factions", "Faction_Placeholder"),
                snapshot("traits", "FactionTrait_Unknown_Public"),
                snapshot("factions", "Faction_SandShaper", List.of("Unit_Prototype_LandUnit", "Unit_SandShaper"),
                        List.of("Faction_Placeholder", "Faction_SandShaper"))));

        assertThat(repository.capturedSnapshots).extracting(CodexImportSnapshot::entryKey)
                .containsExactly("FactionTrait_Unknown_Public", "Faction_SandShaper");
        assertThat(repository.capturedSnapshots.getLast().referenceKeys()).containsExactly("Unit_SandShaper");
        assertThat(repository.capturedSnapshots.getLast().publicContextKeys()).containsExactly("Faction_SandShaper");
    }

    private static CodexImportSnapshot snapshot(String exportKind, String entryKey) {
        return snapshot(exportKind, entryKey, List.of(), List.of());
    }

    private static CodexImportSnapshot snapshot(
            String exportKind,
            String entryKey,
            List<String> referenceKeys,
            List<String> publicContextKeys
    ) {
        return new CodexImportSnapshot(
                entryKey,
                entryKey,
                exportKind,
                "Action",
                "Action",
                List.of("Line"),
                referenceKeys,
                List.of(),
                List.of(),
                publicContextKeys
        );
    }

    private static final class RecordingCodexRepository implements CodexRepository {
        private List<CodexImportSnapshot> capturedSnapshots = List.of();

        @Override
        public List<Codex> findAll() {
            return List.of();
        }

        @Override
        public ImportResult importCodexSnapshot(List<CodexImportSnapshot> snapshots) {
            capturedSnapshots = List.copyOf(snapshots);
            ImportResult result = new ImportResult();
            snapshots.forEach(ignored -> result.incrementInserted());
            return result;
        }
    }
}
