package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechTraitPrereq;
import ewshop.domain.model.Faction;
import ewshop.domain.model.enums.TechType;
import ewshop.domain.repository.FactionRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TechFactionRegistryTest {

    @Test
    void readsImportedFactionsOnEachImportAndIncludesFactionsWithoutUniqueTechs() {
        FactionRepository repository = mock(FactionRepository.class);
        when(repository.findAll()).thenReturn(List.of(faction("Faction_SandShaper", "FactionAffinity_SandShaper")));
        TechFactionGateEvaluator evaluator = new TechFactionGateEvaluator(new TechFactionTraitsProvider(repository));
        TechImportSnapshot generic = tech("Technology_Common", null);

        assertThat(evaluator.withDerivedAvailableFactions(generic).availableMajorFactions()).containsExactly("Sand Shaper");
        when(repository.findAll()).thenReturn(List.of(faction("Faction_KinOfSheredyn02", "FactionAffinity_KinOfSheredyn")));
        assertThat(evaluator.withDerivedAvailableFactions(generic).availableMajorFactions()).containsExactly("Kin Of Sheredyn02");
    }

    @Test
    void evaluatesAnyAndNoneAgainstImportedTraitsAndAffinity() {
        FactionRepository repository = mock(FactionRepository.class);
        when(repository.findAll()).thenReturn(List.of(faction("Faction_SandShaper", "FactionAffinity_SandShaper"),
                faction("Faction_KinOfSheredyn02", "FactionAffinity_KinOfSheredyn")));
        TechFactionGateEvaluator evaluator = new TechFactionGateEvaluator(new TechFactionTraitsProvider(repository));
        TechImportSnapshot any = tech("Technology_Affinity", "Any");
        TechImportSnapshot none = tech("Technology_WithoutAffinity", "None");

        assertThat(evaluator.withDerivedAvailableFactions(any).availableMajorFactions()).containsExactly("Sand Shaper");
        assertThat(evaluator.withDerivedAvailableFactions(none).availableMajorFactions()).containsExactly("Kin Of Sheredyn02");
    }

    @Test
    void keepsFactionSpecificTechScopedEvenWhenAnotherFactionHasTheSameAffinity() {
        FactionRepository repository = mock(FactionRepository.class);
        when(repository.findAll()).thenReturn(List.of(faction("Faction_SandShaper", "FactionAffinity_SandShaper"),
                faction("Faction_SandShaper02", "FactionAffinity_SandShaper")));
        TechFactionGateEvaluator evaluator = new TechFactionGateEvaluator(new TechFactionTraitsProvider(repository));
        TechImportSnapshot specific = TechImportSnapshot.builder().techKey("Technology_Specific")
                .factionDisplayName("Sand Shaper02").type(TechType.SOCIETY).era(1)
                .traitPrereqs(List.of(TechTraitPrereq.builder().operator("Any").traitKey("FactionAffinity_SandShaper").build()))
                .build();
        assertThat(evaluator.withDerivedAvailableFactions(specific).availableMajorFactions()).containsExactly("Sand Shaper02");
    }

    private static Faction faction(String key, String affinity) {
        return Faction.builder().factionKey(key).publicDisplayName("Same public label")
                .factionKind("major").affinityKey(affinity).traitKeys(List.of("FactionTrait_Public")).build();
    }

    private static TechImportSnapshot tech(String key, String operator) {
        return TechImportSnapshot.builder().techKey(key).type(TechType.SOCIETY).era(1)
                .traitPrereqs(operator == null ? List.of() : List.of(TechTraitPrereq.builder()
                        .operator(operator).traitKey("FactionAffinity_SandShaper").build())).build();
    }
}
