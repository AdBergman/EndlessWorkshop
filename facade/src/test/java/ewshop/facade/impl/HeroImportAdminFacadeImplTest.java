package ewshop.facade.impl;

import ewshop.domain.command.HeroImportSnapshot;
import ewshop.domain.model.Hero;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.HeroImportService;
import ewshop.domain.service.HeroService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;
import ewshop.facade.dto.importing.heroes.HeroImportHeroDto;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HeroImportAdminFacadeImplTest {

    @Test
    void importHeroesPreservesUnitsCollectionShapeAndExactKeys() {
        RecordingImportService importService = new RecordingImportService();
        RecordingHeroService heroService = new RecordingHeroService();
        HeroImportAdminFacadeImpl facade = new HeroImportAdminFacadeImpl(importService, heroService);

        ImportSummaryDto summary = facade.importHeroes(new HeroImportBatchDto(
                "Endless Legend 2",
                "0.82",
                "0.1.0",
                "2026-06-22T00:00:00Z",
                "heroes",
                List.of(new HeroImportHeroDto(
                        "Hero_KinOfSheredyn_Archer_2",
                        " Hero_KinOfSheredyn_Archer_2 ",
                        " Lieutenant Brezvez ",
                        "Kin",
                        " Faction_KinOfSheredyn ",
                        true,
                        " Hero_KinOfSheredyn_Archer_2 ",
                        " HeroClass_Archer ",
                        "majorFaction",
                        " Faction_KinOfSheredyn ",
                        null,
                        " UnitClass_Ranged_Hero ",
                        null,
                        List.of(" UnitAbility_Hero_Archer02 "),
                        List.of(" UnitAbility_Prototype_HeroUnit "),
                        List.of(" CombatAbility_A "),
                        List.of(" TacticalAbility_A "),
                        List.of(" PassiveAbility_A "),
                        List.of(" MechanicalAbility_A "),
                        List.of(" ClassRuleAbility_A "),
                        List.of(" HiddenHelper_A "),
                        List.of(" HeroSkill_Archer02 "),
                        List.of(" HeroSkillTree_Archer "),
                        List.of(" +40 [Damage] Damage "),
                        List.of(" HeroSkill_Archer02 "),
                        false,
                        true,
                        false,
                        false,
                        false,
                        false
                ))
        ));

        assertThat(summary.importKind()).isEqualTo("heroes");
        assertThat(summary.counts().inserted()).isEqualTo(1);
        assertThat(importService.snapshots).hasSize(1);
        HeroImportSnapshot snapshot = importService.snapshots.getFirst();
        assertThat(snapshot.unitKey()).isEqualTo("Hero_KinOfSheredyn_Archer_2");
        assertThat(snapshot.displayName()).isEqualTo("Lieutenant Brezvez");
        assertThat(snapshot.factionKey()).isEqualTo("Faction_KinOfSheredyn");
        assertThat(snapshot.defaultSkillKeys()).containsExactly("HeroSkill_Archer02");
        assertThat(snapshot.applicableSkillTreeKeys()).containsExactly("HeroSkillTree_Archer");
        assertThat(snapshot.hiddenHelperAbilityKeys()).containsExactly("HiddenHelper_A");
        assertThat(snapshot.descriptionLines()).containsExactly("+40 [Damage] Damage");
        assertThat(heroService.getAllCalls).isEqualTo(1);
    }

    private static final class RecordingImportService extends HeroImportService {
        private List<HeroImportSnapshot> snapshots = List.of();

        private RecordingImportService() {
            super(null);
        }

        @Override
        public ImportResult importHeroes(List<HeroImportSnapshot> snapshots) {
            this.snapshots = new ArrayList<>(snapshots);
            ImportResult result = new ImportResult();
            result.incrementInserted();
            return result;
        }
    }

    private static final class RecordingHeroService extends HeroService {
        private int getAllCalls;

        private RecordingHeroService() {
            super(null);
        }

        @Override
        public List<Hero> getAllHeroes() {
            getAllCalls++;
            return List.of();
        }
    }
}
