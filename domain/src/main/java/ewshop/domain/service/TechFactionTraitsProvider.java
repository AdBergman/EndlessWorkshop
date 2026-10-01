package ewshop.domain.service;

import org.springframework.stereotype.Component;
import ewshop.domain.repository.FactionRepository;
import ewshop.domain.model.enums.FactionNamePolicy;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;

import java.util.Map;
import java.util.Set;

@Component
public class TechFactionTraitsProvider {

    private final FactionRepository factionRepository;

    public TechFactionTraitsProvider(FactionRepository factionRepository) {
        this.factionRepository = factionRepository;
    }

    public Map<String, Set<String>> getFactionTraits() {
        Map<String, Set<String>> imported = new LinkedHashMap<>();
        for (var faction : factionRepository.findAll()) {
            if ("minor".equalsIgnoreCase(faction.getFactionKind())
                    || faction.getFactionKey().startsWith("MinorFaction_")) continue;
            String name = FactionNamePolicy.canonicalMajorDisplayNameOrSelf(faction.getFactionKey());
            if (name == null || name.isBlank()) continue;
            Set<String> traits = new LinkedHashSet<>(faction.getTraitKeys());
            if (faction.getAffinityKey() != null && !faction.getAffinityKey().isBlank()) {
                traits.add(faction.getAffinityKey());
            }
            imported.put(name, traits);
        }
        // Older installations can import tech before the rich faction dataset exists.
        return imported.isEmpty() ? legacyFactionTraits() : imported;
    }

    /**
     * - Keep this limited to *trait/affinity* keys used in prereqs.
     * - Quest-related trait keys intentionally omitted.
     * - Includes a few aliases (old vs new naming) to avoid exporter naming drift causing missing techs.
     */
    private static Map<String, Set<String>> legacyFactionTraits() {
        return Map.of(
                "Kin", Set.of(
                        "FactionAffinity_KinOfSheredyn",
                        "FactionTrait_KinOfSheredyn_Units",
                        "FactionTrait_KinOfSheredyn_Chosen"
                ),
                "Aspects", Set.of(
                        "FactionAffinity_Aspect",
                        "FactionTrait_Aspects_Units",
                        "FactionTrait_Aspects_Hippie",
                        "FactionTrait_Aspects_UnlockTech_ForceDiplomacy",

                        // alias (older naming seen in some earlier data)
                        "FactionTrait_Aspect_Units"
                ),
                "Lords", Set.of(
                        "FactionAffinity_LastLord",
                        "FactionTrait_LastLord_Units",

                        // alias (older naming seen in some earlier data)
                        "FactionAffinity_Lords",
                        "FactionTrait_Lords_Units"
                ),
                "Necrophages", Set.of(
                        "FactionAffinity_Necrophage",
                        "FactionTrait_Necrophage_Units",
                        "FactionTrait_Necrophage_NoDiplomacy"
                ),
                "Tahuk", Set.of(
                        "FactionAffinity_Mukag",
                        "FactionTrait_Mukag_Units"

                        // (Quest-related Mukag/Tahuk traits intentionally omitted)
                )
        );
    }
}
