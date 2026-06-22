package ewshop.facade.impl;

import ewshop.domain.command.RichSkillImportSnapshot;
import ewshop.domain.model.RichSkills;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.RichSkillImportService;
import ewshop.domain.service.RichSkillService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.skills.*;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RichSkillImportAdminFacadeImplTest {

    @Test
    void importSkillsPreservesPublicDisplayNameAndSkillRelationships() {
        RecordingImportService importService = new RecordingImportService();
        RecordingSkillService skillService = new RecordingSkillService();
        RichSkillImportAdminFacadeImpl facade = new RichSkillImportAdminFacadeImpl(importService, skillService);

        ImportSummaryDto summary = facade.importSkills(new SkillImportBatchDto(
                "Endless Legend 2",
                "0.82",
                "0.1.0",
                "2026-06-22T00:00:00Z",
                "skills",
                List.of(new SkillImportTreeDto(
                        "HeroSkillTree_Archer",
                        "Class",
                        false,
                        List.of("HeroSkillTree_Archer::HeroSkillTier_Archer_1"),
                        List.of("HeroSkillTier_Archer_1"),
                        List.of("HeroSkill_Archer02"),
                        List.of("HeroClass_Archer"),
                        "HeroClass_Archer",
                        null
                )),
                List.of(new SkillImportTierDto(
                        "HeroSkillTree_Archer::HeroSkillTier_Archer_1",
                        "HeroSkillTier_Archer_1",
                        "HeroSkillTree_Archer",
                        "Class",
                        0,
                        0,
                        List.of("HeroSkill_Archer02"),
                        List.of("HeroSkill_Archer02")
                )),
                List.of(new SkillImportSkillDto(
                        " HeroSkill_Archer02 ",
                        "HeroSkill_Archer02",
                        "HeroSkill",
                        "HeroSkill_Archer02",
                        " Terrain Logistics ",
                        " UnitAbility_Hero_Archer02 ",
                        List.of(),
                        "Terrain Logistics",
                        List.of("[DoubleArrow] Gain 5 [Experience] Experience"),
                        "reaction",
                        List.of("hero"),
                        false,
                        false,
                        true,
                        List.of(Map.of("treeKey", "HeroSkillTree_Archer", "tierIndex", 0)),
                        List.of(" HeroSkill_Prereq "),
                        List.of(" HeroSkill_Inhibited "),
                        List.of(" HeroSkill_Locked "),
                        List.of(Map.of("typeName", "SimulationEventEffect_ApplyUnitAbilityOnHero")),
                        List.of("UnitAbility_Hero_Archer02"),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of("UnitAbility_Hero_EventDefinition_Archer02"),
                        List.of(),
                        List.of(),
                        List.of("Hero_KinOfSheredyn_Archer_2"),
                        List.of("UnitAbility_Hero_Archer02")
                )),
                List.of(new SkillImportHeroDefaultDto(
                        "Hero_KinOfSheredyn_Archer_2",
                        List.of("HeroSkill_Archer02"),
                        List.of("Faction_KinOfSheredyn"),
                        "Faction_KinOfSheredyn",
                        "HeroClass_Archer"
                ))
        ));

        assertThat(summary.importKind()).isEqualTo("skills");
        assertThat(summary.counts().received()).isEqualTo(4);
        assertThat(importService.snapshots).hasSize(1);
        RichSkillImportSnapshot snapshot = importService.snapshots.getFirst();
        assertThat(snapshot.skillTrees()).hasSize(1);
        assertThat(snapshot.skillTiers()).hasSize(1);
        assertThat(snapshot.skills()).hasSize(1);
        assertThat(snapshot.heroSkillDefaults()).hasSize(1);
        assertThat(snapshot.skills().getFirst().skillKey()).isEqualTo("HeroSkill_Archer02");
        assertThat(snapshot.skills().getFirst().publicDisplayName()).isEqualTo("Terrain Logistics");
        assertThat(snapshot.skills().getFirst().primaryAbilityKey()).isEqualTo("UnitAbility_Hero_Archer02");
        assertThat(snapshot.skills().getFirst().prerequisiteSkillKeys()).containsExactly("HeroSkill_Prereq");
        assertThat(snapshot.skills().getFirst().placements().getFirst()).containsEntry("treeKey", "HeroSkillTree_Archer");
        assertThat(skillService.getAllCalls).isEqualTo(1);
    }

    private static final class RecordingImportService extends RichSkillImportService {
        private final List<RichSkillImportSnapshot> snapshots = new ArrayList<>();

        private RecordingImportService() {
            super(null);
        }

        @Override
        public ImportResult importSkills(RichSkillImportSnapshot snapshot) {
            snapshots.add(snapshot);
            ImportResult result = new ImportResult();
            result.incrementInserted();
            return result;
        }
    }

    private static final class RecordingSkillService extends RichSkillService {
        private int getAllCalls;

        private RecordingSkillService() {
            super(null);
        }

        @Override
        public RichSkills getAllSkills() {
            getAllCalls++;
            return new RichSkills(List.of(), List.of(), List.of(), List.of());
        }
    }
}
