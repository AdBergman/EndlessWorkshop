package ewshop.facade.impl;

import ewshop.domain.command.FactionImportSnapshot;
import ewshop.domain.model.Faction;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.FactionImportService;
import ewshop.domain.service.FactionService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportFactionDto;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FactionImportAdminFacadeImplTest {

    @Test
    void importFactions_preservesExactRichFactionKeys() {
        RecordingFactionImportService importService = new RecordingFactionImportService(importResultWithInsert());
        RecordingFactionService factionService = new RecordingFactionService();
        FactionImportAdminFacadeImpl facade = new FactionImportAdminFacadeImpl(importService, factionService);

        ImportSummaryDto summary = facade.importFactions(new FactionImportBatchDto(
                "Endless Legend 2",
                "0.82",
                "0.1.0",
                "2026-06-22T00:00:00Z",
                "factions",
                List.of(new FactionImportFactionDto(
                        "Faction_Aspect",
                        " Faction_Aspect ",
                        " major ",
                        "Aspect",
                        " Aspects ",
                        "Harmony through coral.",
                        " FactionAffinity_Aspect ",
                        "Coral",
                        List.of(" Trait_Aspect_Cohabitation ", ""),
                        List.of(" Population_Aspect "),
                        List.of(" Unit_Aspect_Scout "),
                        List.of(" Unit_Aspect_Scout "),
                        List.of(" Hero_Aspect_Archer_0 "),
                        List.of(" Aspect_Technology_00 "),
                        " FactionQuest_Aspect_Chapter01_Step01 ",
                        List.of(" FactionQuest_Aspect_Chapter02_Step01 "),
                        List.of(" Trait_Protectorate_Coral "),
                        false,
                        true,
                        false,
                        false,
                        false,
                        false
                ))
        ));

        assertThat(summary.importKind()).isEqualTo("factions");
        assertThat(summary.counts().received()).isEqualTo(1);
        assertThat(summary.counts().inserted()).isEqualTo(1);
        assertThat(summary.diagnostics().errors()).isEmpty();
        assertThat(importService.snapshots).hasSize(1);
        FactionImportSnapshot snapshot = importService.snapshots.getFirst();
        assertThat(snapshot.factionKey()).isEqualTo("Faction_Aspect");
        assertThat(snapshot.publicDisplayName()).isEqualTo("Aspects");
        assertThat(snapshot.factionKind()).isEqualTo("major");
        assertThat(snapshot.affinityKey()).isEqualTo("FactionAffinity_Aspect");
        assertThat(snapshot.traitKeys()).containsExactly("Trait_Aspect_Cohabitation");
        assertThat(snapshot.populationKeys()).containsExactly("Population_Aspect");
        assertThat(snapshot.unitKeys()).containsExactly("Unit_Aspect_Scout");
        assertThat(snapshot.baseUnitKeys()).containsExactly("Unit_Aspect_Scout");
        assertThat(snapshot.heroKeys()).containsExactly("Hero_Aspect_Archer_0");
        assertThat(snapshot.gatedTechnologyKeys()).containsExactly("Aspect_Technology_00");
        assertThat(snapshot.startingFactionQuestKey()).isEqualTo("FactionQuest_Aspect_Chapter01_Step01");
        assertThat(snapshot.specificQuestKeys()).containsExactly("FactionQuest_Aspect_Chapter02_Step01");
        assertThat(snapshot.protectorateTraitKeys()).containsExactly("Trait_Protectorate_Coral");
        assertThat(factionService.getAllCalls).isEqualTo(1);
    }

    @Test
    void importFactions_reportsFilteredAndInvalidRowsWithoutInferringMissingData() {
        RecordingFactionImportService importService = new RecordingFactionImportService(importResultWithInsert());
        RecordingFactionService factionService = new RecordingFactionService();
        FactionImportAdminFacadeImpl facade = new FactionImportAdminFacadeImpl(importService, factionService);

        ImportSummaryDto summary = facade.importFactions(new FactionImportBatchDto(
                "Endless Legend 2",
                "0.82",
                null,
                "",
                "factions",
                List.of(
                        faction("Faction_Public", "Public Faction", false, true),
                        faction("Faction_Hidden", "Hidden Faction", true, true),
                        faction(null, "Missing Key", false, true)
                )
        ));

        assertThat(summary.counts().received()).isEqualTo(3);
        assertThat(summary.counts().inserted()).isEqualTo(1);
        assertThat(summary.counts().failed()).isEqualTo(1);
        assertThat(summary.diagnostics().warnings()).extracting("code")
                .contains(
                        "FILTERED_FACTION_ROWS",
                        "EMPTY_LORE_IN_FILE",
                        "MISSING_EXPORTER_VERSION",
                        "MISSING_EXPORTED_AT_UTC"
                );
        assertThat(summary.diagnostics().errors()).hasSize(1);
        assertThat(summary.diagnostics().errors().getFirst().code()).isEqualTo("FACTION_IMPORT_INVALID_ROW");
        assertThat(importService.snapshots).extracting(FactionImportSnapshot::factionKey)
                .containsExactly("Faction_Public");
    }

    @Test
    void importFactions_rejectsDuplicateFactionKeys() {
        FactionImportAdminFacadeImpl facade = new FactionImportAdminFacadeImpl(
                new RecordingFactionImportService(importResultWithInsert()),
                new RecordingFactionService()
        );

        FactionImportBatchDto file = new FactionImportBatchDto(
                "Endless Legend 2",
                "0.82",
                "0.1.0",
                "2026-06-22T00:00:00Z",
                "factions",
                List.of(
                        faction("Faction_Duplicate", "First", false, true),
                        faction("Faction_Duplicate", "Second", false, true)
                )
        );

        assertThatThrownBy(() -> facade.importFactions(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Duplicate factionKey in import file: Faction_Duplicate");
    }

    private static ImportResult importResultWithInsert() {
        ImportResult result = new ImportResult();
        result.incrementInserted();
        return result;
    }

    private static FactionImportFactionDto faction(
            String factionKey,
            String publicDisplayName,
            Boolean isHidden,
            Boolean isPlayerFacing
    ) {
        return new FactionImportFactionDto(
                null,
                factionKey,
                "major",
                null,
                publicDisplayName,
                null,
                null,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                List.of(),
                List.of(),
                isHidden,
                isPlayerFacing,
                false,
                false,
                false,
                false
        );
    }

    private static final class RecordingFactionImportService extends FactionImportService {
        private final ImportResult result;
        private List<FactionImportSnapshot> snapshots = List.of();

        private RecordingFactionImportService(ImportResult result) {
            super(null);
            this.result = result;
        }

        @Override
        public ImportResult importFactions(List<FactionImportSnapshot> snapshots) {
            this.snapshots = new ArrayList<>(snapshots);
            return result;
        }
    }

    private static final class RecordingFactionService extends FactionService {
        private int getAllCalls;

        private RecordingFactionService() {
            super(null);
        }

        @Override
        public List<Faction> getAllFactions() {
            getAllCalls++;
            return List.of();
        }
    }
}
