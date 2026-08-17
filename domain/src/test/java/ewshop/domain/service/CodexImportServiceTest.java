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
    void importCodexFiltersUnavailableFactionAndEmpireActionsBeforePersistence() {
        RecordingCodexRepository repository = new RecordingCodexRepository();
        CodexImportService service = new CodexImportService(repository);

        service.importCodex(List.of(
                snapshot("actions", "FactionActionTypeMukag_PublicAction"),
                snapshot("actions", "FactionActionTypeUnknown_TestAction"),
                snapshot("actions", "FactionActionTypeFutureFaction_TestAction"),
                snapshot("actions", "EmpireActionTypeMukag_PublicAction"),
                snapshot("actions", "EmpireActionTypeUnknown_TestAction"),
                snapshot("actions", "EmpireActionTypeFutureFaction_TestAction"),
                snapshot("actions", "ActionTypeBuildBridge"),
                snapshot("actions", "ActionTypeRaiseSandRuin"),
                snapshot("actions", "ConstructibleAction_TerraformationBiomeSandBanks"),
                snapshot("bonuses", "ActionCostModifier_RaiseRuin_Decrease_00"),
                snapshot("tech", "FactionActionTypeUnknown_TestAction")
        ));

        assertThat(repository.capturedSnapshots)
                .extracting(CodexImportSnapshot::entryKey)
                .containsExactly(
                        "FactionActionTypeMukag_PublicAction",
                        "EmpireActionTypeMukag_PublicAction",
                        "ActionTypeBuildBridge",
                        "FactionActionTypeUnknown_TestAction"
                );
        assertThat(repository.capturedSnapshots)
                .filteredOn(snapshot -> "actions".equals(snapshot.exportKind()))
                .extracting(CodexImportSnapshot::entryKey)
                .doesNotContain(
                        "FactionActionTypeUnknown_TestAction",
                        "FactionActionTypeFutureFaction_TestAction",
                        "EmpireActionTypeUnknown_TestAction",
                        "EmpireActionTypeFutureFaction_TestAction",
                        "ActionTypeRaiseSandRuin",
                        "ConstructibleAction_TerraformationBiomeSandBanks"
                );
        assertThat(repository.capturedSnapshots)
                .extracting(CodexImportSnapshot::entryKey)
                .doesNotContain("ActionCostModifier_RaiseRuin_Decrease_00");
    }

    @Test
    void importCodexAllowsReleasedFactionAndEmpireActionPrefixes() {
        RecordingCodexRepository repository = new RecordingCodexRepository();
        CodexImportService service = new CodexImportService(repository);

        service.importCodex(List.of(
                snapshot("actions", "FactionActionTypeKinOfSheredyn_TestAction"),
                snapshot("actions", "FactionActionTypeMukag_TestAction"),
                snapshot("actions", "FactionActionTypeAspect_TestAction"),
                snapshot("actions", "FactionActionTypeLastLord_TestAction"),
                snapshot("actions", "FactionActionTypeNecrophage_TestAction"),
                snapshot("actions", "EmpireActionTypeKinOfSheredyn_TestAction"),
                snapshot("actions", "EmpireActionTypeMukag_TestAction"),
                snapshot("actions", "EmpireActionTypeAspect_TestAction"),
                snapshot("actions", "EmpireActionTypeLastLord_TestAction"),
                snapshot("actions", "EmpireActionTypeNecrophage_TestAction")
        ));

        assertThat(repository.capturedSnapshots)
                .extracting(CodexImportSnapshot::entryKey)
                .containsExactly(
                        "FactionActionTypeKinOfSheredyn_TestAction",
                        "FactionActionTypeMukag_TestAction",
                        "FactionActionTypeAspect_TestAction",
                        "FactionActionTypeLastLord_TestAction",
                        "FactionActionTypeNecrophage_TestAction",
                        "EmpireActionTypeKinOfSheredyn_TestAction",
                        "EmpireActionTypeMukag_TestAction",
                        "EmpireActionTypeAspect_TestAction",
                        "EmpireActionTypeLastLord_TestAction",
                        "EmpireActionTypeNecrophage_TestAction"
                );
    }

    @Test
    void importCodexFiltersUnavailableFactionTraitsQuestsAndBonusesBeforePersistence() {
        RecordingCodexRepository repository = new RecordingCodexRepository();
        CodexImportService service = new CodexImportService(repository);

        service.importCodex(List.of(
                snapshot("traits", "FactionTrait_Mukag_PublicTrait"),
                snapshot("traits", "FactionTrait_Aspects_PublicTrait"),
                snapshot("traits", "FactionTrait_Custom_Specific_MukagPublicTrait"),
                snapshot("traits", "FactionTrait_StartingTech_Technology_Necrophage_PublicTrait"),
                snapshot("traits", "FactionTrait_VictoryCondition_GlorifyReward02_LastLord"),
                snapshot("traits", "FactionTrait_FutureFaction_Test"),
                snapshot("traits", "ProtectorateTrait_Public_Test"),
                snapshot("quests", "FactionQuest_Mukag_PublicQuest"),
                snapshot("quests", "FactionQuest_KinOfSheredyn02_PublicQuest"),
                snapshot("quests", "FactionQuest_Necrophage02_PublicQuest"),
                snapshot("quests", "FactionQuest_FutureFaction_Test"),
                snapshot("quests", "MinorFaction_GenericQuest_Test"),
                snapshot("bonuses", "FactionTrait_Mukag_PublicBonus"),
                snapshot("bonuses", "FactionTrait_FutureFaction_TestBonus"),
                snapshot("bonuses", "ActionCostModifier_FactionActionTypeMukag_PublicAction"),
                snapshot("bonuses", "ActionCostModifier_FactionActionTypeFutureFaction_TestAction"),
                snapshot("bonuses", "Status_Empire_PublicStatus"),
                snapshot("units", "Unit_FutureFaction_Test"),
                snapshot("heroes", "Hero_FutureFaction_Test"),
                snapshot("populations", "Population_FutureFaction_Test")
        ));

        assertThat(repository.capturedSnapshots)
                .extracting(CodexImportSnapshot::entryKey)
                .containsExactly(
                        "FactionTrait_Mukag_PublicTrait",
                        "FactionTrait_Aspects_PublicTrait",
                        "FactionTrait_Custom_Specific_MukagPublicTrait",
                        "FactionTrait_StartingTech_Technology_Necrophage_PublicTrait",
                        "FactionTrait_VictoryCondition_GlorifyReward02_LastLord",
                        "ProtectorateTrait_Public_Test",
                        "FactionQuest_Mukag_PublicQuest",
                        "FactionQuest_KinOfSheredyn02_PublicQuest",
                        "FactionQuest_Necrophage02_PublicQuest",
                        "MinorFaction_GenericQuest_Test",
                        "FactionTrait_Mukag_PublicBonus",
                        "ActionCostModifier_FactionActionTypeMukag_PublicAction",
                        "Status_Empire_PublicStatus",
                        "Unit_FutureFaction_Test",
                        "Hero_FutureFaction_Test",
                        "Population_FutureFaction_Test"
                );
    }

    @Test
    void importCodexRemovesHiddenReferencesWithoutGatingMixedKeyspaces() {
        RecordingCodexRepository repository = new RecordingCodexRepository();
        CodexImportService service = new CodexImportService(repository);

        service.importCodex(List.of(snapshot(
                "actions",
                "ActionTypeBuildBridge",
                List.of(
                        "FactionActionTypeFutureFaction_TestAction",
                        "EmpireActionTypeFutureFaction_TestAction",
                        "ActionTypeRaiseSandRuin",
                        "ConstructibleAction_TerraformationBiomeSandBanks",
                        "FactionTrait_FutureFaction_Test",
                        "FactionQuest_FutureFaction_Test",
                        "FactionQuest_FutureFaction",
                        "ActionCostModifier_FactionActionTypeFutureFaction_TestAction",
                        "ActionCostModifier_RaiseRuin_Decrease_00",
                        "FactionActionTypeMukag_PublicAction",
                        "FactionTrait_Mukag_PublicTrait",
                        "FactionQuest_Mukag_PublicQuest",
                        "FactionQuest_Mukag",
                        "Unit_FutureFaction_Test",
                        "Hero_FutureFaction_Test",
                        "Population_FutureFaction_Test"
                ),
                List.of(
                        "FactionActionTypeFutureFaction_TestAction",
                        "ActionTypeRaiseSandRuin",
                        "ConstructibleAction_TerraformationBiomeSandBanks",
                        "FactionTrait_FutureFaction_Test",
                        "FactionQuest_FutureFaction_Test",
                        "FactionQuest_FutureFaction",
                        "ActionCostModifier_RaiseRuin_Decrease_00",
                        "FactionActionTypeMukag_PublicAction",
                        "FactionTrait_Mukag_PublicTrait",
                        "FactionQuest_Mukag_PublicQuest",
                        "FactionQuest_Mukag",
                        "Unit_FutureFaction_Test",
                        "Hero_FutureFaction_Test",
                        "Population_FutureFaction_Test"
                )
        )));

        CodexImportSnapshot snapshot = repository.capturedSnapshots.getFirst();
        assertThat(snapshot.referenceKeys())
                .containsExactly(
                        "FactionActionTypeMukag_PublicAction",
                        "FactionTrait_Mukag_PublicTrait",
                        "FactionQuest_Mukag_PublicQuest",
                        "FactionQuest_Mukag",
                        "Unit_FutureFaction_Test",
                        "Hero_FutureFaction_Test",
                        "Population_FutureFaction_Test"
                );
        assertThat(snapshot.publicContextKeys())
                .containsExactly(
                        "FactionActionTypeMukag_PublicAction",
                        "FactionTrait_Mukag_PublicTrait",
                        "FactionQuest_Mukag_PublicQuest",
                        "FactionQuest_Mukag",
                        "Unit_FutureFaction_Test",
                        "Hero_FutureFaction_Test",
                        "Population_FutureFaction_Test"
                );
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
