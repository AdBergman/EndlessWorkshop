package ewshop.facade.integration;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.Unit;
import ewshop.domain.repository.UnitRepository;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import ewshop.facade.interfaces.UnitFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitFacadeTest extends BaseIT {

    @Autowired
    private UnitFacade unitFacade;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UnitImportAdminFacade unitImportAdminFacade;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(unitFacade).isNotNull();
        assertThat(unitRepository).isNotNull();
    }

    @Test
    void getAllUnits_integration() {
        UnitImportSnapshot unit1 = new UnitImportSnapshot(
                "Unit_Test_1",
                "Test Unit 1",
                "Aspect",
                true,
                false,
                false,
                "Land",
                null,
                List.of("Unit_Test_1_Upgraded"),
                1,
                "UnitClass_Infantry",
                "Infantry",
                "Skill_Attack_1",
                List.of("UnitAbility_A", "UnitAbility_B"),
                List.of("Line 1", "Line 2")
        );

        UnitImportSnapshot unit2 = new UnitImportSnapshot(
                "Unit_Test_2",
                "Test Unit 2",
                "KinOfSheredyn",
                true,
                false,
                false,
                "Land",
                "Unit_Test_1",
                List.of(),
                2,
                "UnitClass_Cavalry",
                "Cavalry",
                "Skill_Attack_2",
                List.of("UnitAbility_C"),
                List.of("Only line")
        );

        unitRepository.importUnitSnapshot(List.of(unit1, unit2));
        entityManager.flush();

        List<UnitDto> result = unitFacade.getAllUnits();

        assertThat(result).hasSize(2);

        UnitDto dto = result.stream()
                .filter(u -> "Unit_Test_1".equals(u.unitKey()))
                .findFirst()
                .orElseThrow();

        assertThat(dto.displayName()).isEqualTo("Test Unit 1");
        assertThat(dto.faction()).isEqualTo("Aspect");
        assertThat(dto.isMajorFaction()).isTrue();

        assertThat(dto.isHero()).isFalse();
        assertThat(dto.isChosen()).isFalse();
        assertThat(dto.spawnType()).isEqualTo("Land");
        assertThat(dto.previousUnitKey()).isNull();
        assertThat(dto.nextEvolutionUnitKeys()).containsExactly("Unit_Test_1_Upgraded");
        assertThat(dto.evolutionTierIndex()).isEqualTo(1);
        assertThat(dto.unitClassKey()).isEqualTo("UnitClass_Infantry");
        assertThat(dto.unitClassDisplayName()).isEqualTo("Infantry");
        assertThat(dto.attackSkillKey()).isEqualTo("Skill_Attack_1");
        assertThat(dto.abilityKeys()).containsExactly("UnitAbility_A", "UnitAbility_B");
        assertThat(dto.descriptionLines()).containsExactly("Line 1", "Line 2");
    }

    @Test
    void importUnitsThroughFacade_persistsPublicRowsAndReadDtoShape() {
        UnitImportBatchDto file = new UnitImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-06T00:00:00Z",
                "units",
                List.of(
                        importUnit(
                                "Unit_Kin_Root",
                                "Pathfinder",
                                "Kin",
                                true,
                                null,
                                List.of("Unit_Kin_Root_Upgrade01", "Unit_Kin_Root_Upgrade02"),
                                0,
                                "UnitClass_Ranged",
                                "Skill_Attack_1",
                                List.of("UnitAbility_A", "UnitAbility_B"),
                                List.of("Line 1", "Line 2"),
                                true
                        ),
                        importUnit(
                                "Unit_MinorFaction_MangroveOfHarmony",
                                "Rootstalk",
                                "MangroveOfHarmony",
                                false,
                                null,
                                List.of(),
                                0,
                                "UnitClass_Juggernaught",
                                null,
                                List.of("UnitAbility_C"),
                                List.of("Minor line"),
                                true
                        ),
                        importUnit(
                                "Unit_Kin_Hidden",
                                "Hidden",
                                "Kin",
                                true,
                                null,
                                List.of(),
                                0,
                                "UnitClass_Ranged",
                                null,
                                List.of(),
                                List.of(),
                                false
                        ),
                        importUnit(
                                "Unit_Kin_Prototype",
                                "Prototype",
                                "Kin",
                                true,
                                null,
                                List.of(),
                                0,
                                "UnitClass_Prototype_LandUnit",
                                null,
                                List.of(),
                                List.of(),
                                true
                        ),
                        importUnit(
                                "Unit_FutureFaction_Scout",
                                "Future Scout",
                                "FutureFaction",
                                true,
                                null,
                                List.of(),
                                0,
                                "UnitClass_Ranged",
                                null,
                                List.of(),
                                List.of("Future line"),
                                true
                        )
                )
        );

        ImportSummaryDto firstImport = unitImportAdminFacade.importUnits(file);
        entityManager.flush();

        assertThat(firstImport.counts().inserted()).isEqualTo(2);
        assertThat(firstImport.counts().failed()).isEqualTo(1);
        assertThat(firstImport.diagnostics().warnings())
                .anySatisfy(warning -> assertThat(warning.code()).isEqualTo("EMPTY_DESCRIPTION_LINES_IN_FILE"));

        unitRepository.save(Unit.builder()
                .unitKey("Unit_Kin_Root")
                .displayName("Pathfinder")
                .artId("pathfinder-art")
                .faction("Kin")
                .isMajorFaction(true)
                .spawnType("Land")
                .nextEvolutionUnitKeys(List.of("Unit_Kin_Root_Upgrade01", "Unit_Kin_Root_Upgrade02"))
                .evolutionTierIndex(0)
                .unitClassKey("UnitClass_Ranged")
                .unitClassDisplayName("Ranged")
                .attackSkillKey("Skill_Attack_1")
                .abilityKeys(List.of("UnitAbility_A", "UnitAbility_B"))
                .descriptionLines(List.of("Line 1", "Line 2"))
                .build());

        unitImportAdminFacade.importUnits(file);
        entityManager.flush();

        List<UnitDto> result = unitFacade.getAllUnits();

        assertThat(result).extracting(UnitDto::unitKey)
                .containsExactlyInAnyOrder(
                        "Unit_Kin_Root",
                        "Unit_MinorFaction_MangroveOfHarmony"
                );

        UnitDto kin = findUnit(result, "Unit_Kin_Root");
        assertThat(kin.displayName()).isEqualTo("Pathfinder");
        assertThat(kin.artId()).isEqualTo("pathfinder-art");
        assertThat(kin.faction()).isEqualTo("Kin");
        assertThat(kin.isMajorFaction()).isTrue();
        assertThat(kin.nextEvolutionUnitKeys()).containsExactly("Unit_Kin_Root_Upgrade01", "Unit_Kin_Root_Upgrade02");
        assertThat(kin.evolutionTierIndex()).isZero();
        assertThat(kin.unitClassKey()).isEqualTo("UnitClass_Ranged");
        assertThat(kin.unitClassDisplayName()).isEqualTo("Ranged");
        assertThat(kin.attackSkillKey()).isEqualTo("Skill_Attack_1");
        assertThat(kin.abilityKeys()).containsExactly("UnitAbility_A", "UnitAbility_B");
        assertThat(kin.descriptionLines()).containsExactly("Line 1", "Line 2");

        UnitDto mangrove = findUnit(result, "Unit_MinorFaction_MangroveOfHarmony");
        assertThat(mangrove.faction()).isEqualTo("Mangrove of Harmony");
        assertThat(mangrove.isMajorFaction()).isFalse();
    }

    private static UnitDto findUnit(List<UnitDto> units, String unitKey) {
        return units.stream()
                .filter(unit -> unitKey.equals(unit.unitKey()))
                .findFirst()
                .orElseThrow();
    }

    private static UnitImportUnitDto importUnit(
            String unitKey,
            String displayName,
            String faction,
            boolean majorFaction,
            String previousUnitKey,
            List<String> nextEvolutionUnitKeys,
            Integer evolutionTierIndex,
            String unitClassKey,
            String attackSkillKey,
            List<String> abilityKeys,
            List<String> descriptionLines,
            Boolean isPlayerFacing
    ) {
        return new UnitImportUnitDto(
                unitKey,
                displayName,
                faction,
                majorFaction,
                false,
                false,
                "Land",
                previousUnitKey,
                nextEvolutionUnitKeys,
                evolutionTierIndex,
                unitClassKey,
                attackSkillKey,
                abilityKeys,
                abilityKeys,
                descriptionLines,
                List.of(),
                List.of(),
                false,
                isPlayerFacing,
                false,
                false,
                false,
                false
        );
    }
}
