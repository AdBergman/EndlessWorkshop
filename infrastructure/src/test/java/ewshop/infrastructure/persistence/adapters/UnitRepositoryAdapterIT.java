package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.Unit;
import ewshop.domain.repository.UnitRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "ewshop.cache-preload.enabled=false")
@Transactional
class UnitRepositoryAdapterIT {

    @Autowired
    private UnitRepository unitRepository;

    @Test
    void importUnitSnapshot_doesNotDeleteExistingUnitsWhenInputHasNoKeepKeys() {
        unitRepository.importUnitSnapshot(List.of(unit("Unit_A", List.of("Unit_B"))));

        unitRepository.importUnitSnapshot(List.of());
        unitRepository.importUnitSnapshot(null);
        unitRepository.importUnitSnapshot(java.util.Collections.singletonList(null));

        assertThat(unitRepository.findAll()).extracting(Unit::getUnitKey)
                .containsExactly("Unit_A");
    }

    @Test
    void importUnitSnapshot_preservesManualArtIdOnReimport() {
        unitRepository.importUnitSnapshot(List.of(unit("Unit_A", List.of("Unit_B"))));
        unitRepository.save(Unit.builder()
                .unitKey("Unit_A")
                .displayName("Unit A")
                .artId("unit-a-art")
                .faction("Kin")
                .isMajorFaction(true)
                .spawnType("Land")
                .nextEvolutionUnitKeys(List.of("Unit_B"))
                .evolutionTierIndex(0)
                .unitClassKey("UnitClass_Ranged")
                .unitClassDisplayName("Ranged")
                .abilityKeys(List.of("Ability_A"))
                .descriptionLines(List.of("Line A"))
                .build());

        unitRepository.importUnitSnapshot(List.of(unit("Unit_A", List.of("Unit_C"))));

        Unit reimported = unitRepository.findAll().getFirst();
        assertThat(reimported.getUnitKey()).isEqualTo("Unit_A");
        assertThat(reimported.getArtId()).isEqualTo("unit-a-art");
        assertThat(reimported.getNextEvolutionUnitKeys()).containsExactly("Unit_C");
    }

    private static UnitImportSnapshot unit(String unitKey, List<String> nextEvolutionUnitKeys) {
        return new UnitImportSnapshot(
                unitKey,
                "Unit A",
                "Kin",
                true,
                false,
                false,
                "Land",
                null,
                nextEvolutionUnitKeys,
                0,
                "UnitClass_Ranged",
                "Ranged",
                "Skill_Attack_1",
                List.of("Ability_A"),
                List.of("Line A")
        );
    }
}
