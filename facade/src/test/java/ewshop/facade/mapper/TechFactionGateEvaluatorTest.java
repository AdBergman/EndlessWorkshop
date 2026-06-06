package ewshop.facade.mapper;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechTraitPrereq;
import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;
import ewshop.domain.service.TechFactionGateEvaluator;
import ewshop.domain.service.TechFactionTraitsProvider;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TechFactionGateEvaluatorTest {

    private final TechFactionGateEvaluator evaluator = new TechFactionGateEvaluator(new TechFactionTraitsProvider());

    @Test
    void derivesVisibleFactionSpecificTechFromFactionKeyWhenTraitIsNotInStaticMap() {
        TechImportSnapshot snapshot = TechImportSnapshot.builder()
                .techKey("Mukag_Technology_FactionQuest_Chapter06A")
                .displayName("Beings of Aether")
                .hidden(false)
                .factionDisplayName("Tahuk")
                .era(5)
                .type(TechType.DISCOVERY)
                .techCoords(new TechCoords(0, 0))
                .traitPrereqs(List.of(TechTraitPrereq.builder()
                        .operator("Any")
                        .traitKey("FactionTrait_Mukag_Chapter06AChoice01_FactionQuest")
                        .build()))
                .build();

        TechImportSnapshot enriched = evaluator.withDerivedAvailableFactions(snapshot, Set.of("Tahuk"));

        assertThat(enriched.availableMajorFactions()).containsExactly("Tahuk");
    }

    @Test
    void includesImportedFutureFactionsForGlobalVisibleTechs() {
        TechImportSnapshot snapshot = TechImportSnapshot.builder()
                .techKey("Technology_DistrictImprovement_Influence_00")
                .displayName("Common Rights")
                .hidden(false)
                .era(1)
                .type(TechType.SOCIETY)
                .techCoords(new TechCoords(0, 0))
                .build();

        TechImportSnapshot enriched = evaluator.withDerivedAvailableFactions(snapshot, Set.of("New Major Faction"));

        assertThat(enriched.availableMajorFactions()).contains("Kin", "Aspects", "Lords", "Necrophages", "Tahuk", "New Major Faction");
    }
}
