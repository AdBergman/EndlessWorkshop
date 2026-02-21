package ewshop.domain.service;

import ewshop.domain.model.enums.Faction;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class TechFactionTraitsProvider {

    public EnumSet<Faction> getAllowedFactions() {
        return EnumSet.of(
                Faction.KIN,
                Faction.ASPECTS,
                Faction.LORDS,
                Faction.NECROPHAGES,
                Faction.TAHUK
        );
    }

    /**
     * - Keep this limited to *trait/affinity* keys used in prereqs.
     * - Quest-related trait keys intentionally omitted.
     * - Includes a few aliases (old vs new naming) to avoid exporter naming drift causing missing techs.
     */
    public Map<Faction, Set<String>> getFactionTraits() {
        return Map.of(
                Faction.KIN, Set.of(
                        "FactionAffinity_KinOfSheredyn",
                        "FactionTrait_KinOfSheredyn_Units",
                        "FactionTrait_KinOfSheredyn_Chosen"
                ),
                Faction.ASPECTS, Set.of(
                        "FactionAffinity_Aspect",
                        "FactionTrait_Aspects_Units",
                        "FactionTrait_Aspects_Hippie",
                        "FactionTrait_Aspects_UnlockTech_ForceDiplomacy",

                        // alias (older naming seen in some earlier data)
                        "FactionTrait_Aspect_Units"
                ),
                Faction.LORDS, Set.of(
                        "FactionAffinity_LastLord",
                        "FactionTrait_LastLord_Units",

                        // alias (older naming seen in some earlier data)
                        "FactionAffinity_Lords",
                        "FactionTrait_Lords_Units"
                ),
                Faction.NECROPHAGES, Set.of(
                        "FactionAffinity_Necrophage",
                        "FactionTrait_Necrophage_Units",
                        "FactionTrait_Necrophage_NoDiplomacy"
                ),
                Faction.TAHUK, Set.of(
                        "FactionAffinity_Mukag",
                        "FactionTrait_Mukag_Units"

                        // (Quest-related Mukag/Tahuk traits intentionally omitted)
                )
        );
    }
}